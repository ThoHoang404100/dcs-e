import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Stack,
    Typography,
    Box,
    MenuItem,
    Divider,
    InputAdornment,
    Slider,
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { Field, Form } from "src/components/hook-form";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect, useState } from "react";
import { IProductFormEdit, IQuotationDao, IQuotationDetailDto, IQuotationDetails, IQuotationDto, IQuotationItem } from "src/types/quotation";
import { addMoreProducts, createOrUpdateQuotation, editProductForm, useGetQuotation } from "src/actions/quotation";
import { toast } from "sonner";
import { generateOrderNo, generateQuotationNo } from "src/utils/random-func";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { useAuthContext } from "src/auth/hooks";
import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";
import { QuotationFormValues, quotationSchema } from "../schema/quotation-schema";
import { mapProductsToItems } from "../helper/mapProductsToItems";
import { editAllQuotationDetails } from "../helper/mapQuotationProduct";
import { DetailItem } from "../helper/DetailItem";
import { QuotationItemsTable } from "../quotation-product-table";
import { fDate } from "src/utils/format-time-vi";
import { useGetSuppliers } from "src/actions/suppliers";
import { ISuppliersItem } from "src/types/suppliers";

export type QuotationFormProps = {
    selectedQuotation: IQuotationItem | null;
    openForm: boolean;
    onClose: () => void;
    CopiedQuotation: IQuotationItem | null;
};

export function QuotationForm({ openForm, selectedQuotation, onClose, CopiedQuotation }: QuotationFormProps) {
    const quotationId = selectedQuotation?.id ?? CopiedQuotation?.id ?? 0;
    const { user } = useAuthContext();
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    const sampleNote = `
<p data-pm-slice="0 0 []">
    <strong>- Thời gian giao hàng:</strong> ${fDate(today)}<br>
    <strong>- Địa điểm giao hàng:</strong> .................<br>
    <strong>- Phương thức thanh toán:&nbsp;</strong><br>
    + Thanh toán bằng tiền mặt hoặc chuyển khoản<br>
    + Thanh toán trước 50% giá trị hợp đồng, 50% còn lại thanh toán sau khi giao hàng
</p>
`;
    const sampleDiscount = [0, 10, 20, 30];
    const [originalItems, setOriginalItems] = useState<IQuotationDetailDto[]>([]);

    const [totalPaid, setTotalPaid] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);

    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    const [quotationProductDetail, setQuotationProductDetail] = useState<IQuotationDetails>();

    const { quotation: CurrentQuotation, quotationLoading } = useGetQuotation({
        quotationId: quotationId,
        pageNumber: 1,
        pageSize: 999,
        options: { enabled: !!selectedQuotation?.id }
    });

    const { suppliers, suppliersLoading, pagination: CustomerRecords } = useGetSuppliers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: openForm || !!selectedQuotation?.supplierID
    });

    const [selectedCustomer, setSelectedCustomer] = useState<ISuppliersItem | null>(null);

    const defaultValues: QuotationFormValues = {
        customer: 0,
        quotationNo: generateOrderNo(),
        date: today.toISOString(),
        validUntil: nextMonth.toISOString(),
        status: 1,
        discount: 0,
        items: [{
            id: undefined,
            product: "",
            unit: "0",
            unitName: "",
            qty: 1,
            price: 0,
            vat: 0
        }],
        notes: sampleNote,
        paid: 0
    };

    const methods = useForm<QuotationFormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(quotationSchema),
        defaultValues,
    });

    useEffect(() => {
        //copy case
        if (CopiedQuotation) {
            if (!CurrentQuotation) return;
            const currentDetails = CurrentQuotation.items.find(
                (q) => q.quotationID === CopiedQuotation.id
            );

            setQuotationProductDetail(currentDetails);

            const mappedItems = mapProductsToItems(currentDetails?.products || []);

            methods.reset({
                customer: CopiedQuotation.customerId ?? 0,
                quotationNo: generateOrderNo(),
                date: today.toISOString(),
                validUntil: nextMonth.toISOString(),
                status: 1,
                discount: CopiedQuotation.discount,
                items: mappedItems,
                notes: CopiedQuotation.note ?? sampleNote,
                paid: CopiedQuotation.paid ?? 0
            });

            // setOriginalItems(
            //     mappedItems.map((item, i) => ({
            //         productID: item.product ?? "",
            //         quantity: item.qty,
            //         row: i + 1,
            //         Unit: item.unitName || "",
            //         Price: item.price || 0,
            //     }))
            // );

            return;
        }
        //end copy case

        //create case
        if (!selectedQuotation) {
            methods.reset(defaultValues);
            setOriginalItems(
                defaultValues.items.map((item, i) => ({
                    productID: item.product ?? "",
                    quantity: item.qty ?? 0,
                    row: i + 1,
                    Unit: item.unitName || "",
                    Price: item.price || 0
                }))
            );
            return;
        }
        //end create case

        //update case
        if (!CurrentQuotation) return;

        const currentDetails = CurrentQuotation.items.find(
            (q) => q.quotationID === selectedQuotation.id
        );

        if (currentDetails) {
            setQuotationProductDetail(currentDetails);
        }

        const mappedItems = mapProductsToItems(currentDetails?.products || []);

        methods.setValue("customer", selectedQuotation.supplierID ?? 0);
        methods.setValue("quotationNo", selectedQuotation.quotationNo);
        methods.setValue("date", selectedQuotation.createdDate ?? null);
        methods.setValue("validUntil", selectedQuotation.expiryDate ?? null);
        methods.setValue("status", selectedQuotation.status ?? 1);
        methods.setValue("items", mappedItems);
        methods.setValue("notes", selectedQuotation.note ?? "");
        methods.setValue("discount", selectedQuotation.discount);
        methods.setValue("paid", selectedQuotation.paid);

        setOriginalItems(
            mappedItems.map((item, i) => ({
                productID: item.product ?? "",
                quantity: item.qty ?? 0,
                row: i + 1,
                Unit: item.unitName || "",
                Price: item.price || 0
            }))
        );
        //end update case

    }, [selectedQuotation, CopiedQuotation, CurrentQuotation, methods.reset]);

    const customerId = methods.watch('customer');

    useEffect(() => {
        if (!customerId) {
            setSelectedCustomer(null);
            return;
        }

        const found = suppliers.find((cus) => Number(cus.id) === Number(customerId));
        if (found) {
            setSelectedCustomer(found);
        }
    }, [customerId, suppliers]);

    const {
        reset,
        watch,
        setValue,
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const onSubmit = handleSubmit(async (data: QuotationFormValues) => {
        try {
            const basePayload = {
                quotationNo: data.quotationNo,
                createDate: data.date,
                SupplierID: data.customer,
                expiryDate: data.validUntil,
                discount: data.discount || 0,
                note: data.notes || '',
                paid: data.paid || 0,
                Type: 'Order',
                Status: data.status
            };

            const bodyPayload: IQuotationDto = {
                ...basePayload,
                quotationDetails: data.items
                    .filter((item) => item.product && item.product !== "")
                    .map((item, i): IQuotationDetailDto => ({
                        productID: item.product ?? "",
                        quantity: item.qty ?? 0,
                        row: i + 1,
                        Unit: item.unitName || "",
                        Price: item.price || 0,
                    })),

            };

            const updatePayload: IQuotationDao = {
                ...basePayload,
                seller: user?.accessToken || "",
            };

            const productPayload: IProductFormEdit[] = data.items
                .map((item, idx) => ({
                    rowId: item.id,
                    productId: Number(item.product),
                    price: item.price || 0,
                    quantity: item.qty || 0,
                    unit: item.unitName ?? "",
                }));

            await createOrUpdateQuotation(
                selectedQuotation?.id ?? null,
                bodyPayload,
                updatePayload
            );

            if (selectedQuotation) {
                if (!productPayload) return;

                for (const item of productPayload) {
                    await editProductForm(item.rowId, item);
                }

                const newItems = bodyPayload.quotationDetails.filter(
                    (item) => !originalItems.some((o) => o.productID === item.productID)
                );

                if (newItems.length > 0) {
                    await addMoreProducts(selectedQuotation.id, newItems);
                }
                else {
                    await editAllQuotationDetails(bodyPayload, selectedQuotation.id);
                }
            }

            toast.success(
                selectedQuotation
                    ? "Dữ liệu đơn đặt hàng đã được thay đổi!"
                    : "Tạo đơn đặt hàng thành công!"
            );

            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"),
                undefined,
                { revalidate: true }
            );

            if (selectedQuotation?.id) {
                mutate(endpoints.quotation.detail(selectedQuotation.id, `?pageNumber=1&pageSize=999`));
            }

            onClose();
            reset(defaultValues);
        } catch (error: any) {
            console.error(error);
            if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Đã có lỗi xảy ra!");
            }
        }
    });

    const renderLeftColumn = () => (
        <Stack width={{ xs: "100%", sm: "100%", md: "100%", lg: "30%" }} spacing={3}>
            {/* Section Thông tin khách hàng */}
            <Box>
                <Stack direction={{ xs: "column", md: "column", lg: "column", xl: "row" }} gap={2} justifyContent="space-between">
                    <Typography variant="subtitle2">Thông tin nhà cung cấp</Typography>
                    <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                        <Field.Autocomplete
                            name="customer"
                            label="Chọn nhà cung cấp"
                            options={suppliers}
                            loading={suppliersLoading}
                            getOptionLabel={(opt) => opt?.companyName ? opt.companyName : ''}
                            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                            onInputChange={(_, value) => setCustomerKeyword(value)}
                            value={selectedCustomer}
                            fullWidth
                            onChange={(_, newValue) => {
                                methods.setValue('customer', newValue?.id ?? 0, { shouldValidate: true });
                                setCustomerKeyword(newValue?.name ?? '');
                            }}
                            noOptionsText="Không có dữ liệu"
                            sx={{ flex: 1, minWidth: 200 }}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.companyName ? option.companyName : ''}
                                </li>
                            )}
                        />
                    </Stack>
                </Stack>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Stack direction="row" gap={2}>
                        <DetailItem label="Tên khách hàng" value={selectedCustomer?.name ?? ""} />
                        <DetailItem label="Tên công ty" value={selectedCustomer?.companyName ?? ""} />
                    </Stack>
                    <Stack direction="row" gap={2}>
                        <DetailItem label="Email khách hàng" value={selectedCustomer?.email ?? ""} />
                        <DetailItem label="Số điện thoại" value={selectedCustomer?.phone ?? ""} />
                    </Stack>
                </Stack>
            </Box>

            {/* Section Phiếu */}
            <Box>
                <Typography variant="subtitle2">
                    Phiếu
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.Text
                        label="Mã đơn đặt hàng"
                        name="quotationNo"
                        disabled={selectedQuotation ? true : false}
                    />
                    <Field.Select label="Trạng thái" name="status">
                        <MenuItem key={0} value={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Bỏ qua</span>
                                <Iconify icon="fluent-color:dismiss-circle-16" />
                            </Box>
                        </MenuItem>
                        <MenuItem key={1} value={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Nháp</span>
                                <Iconify icon="material-symbols:draft" />
                            </Box>
                        </MenuItem>
                        <MenuItem key={2} value={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Đang thực hiện</span>
                                <Iconify icon="line-md:uploading-loop" />
                            </Box>
                        </MenuItem>
                        <MenuItem key={3} value={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Đã hoàn thành</span>
                                <Iconify icon="fluent-color:checkmark-circle-16" />
                            </Box>
                        </MenuItem>
                    </Field.Select>
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.DatePicker name="date" label="Ngày đơn đặt hàng" />
                    <Field.DatePicker name="validUntil" label="Hiệu lực đến" />
                </Stack>
                <Stack display="none" direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.Text
                        name="discount"
                        label="Khuyến mãi (%)"
                        placeholder="0.00"
                        type="number"
                        sx={{ width: 150 }}
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            %
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Controller
                        name="discount"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <Slider
                                {...field}
                                step={null}
                                min={0}
                                max={30}
                                marks={sampleDiscount.map((val) => ({
                                    value: val,
                                    label: `${val}%`,
                                }))}
                                value={field.value ?? 0}
                                onChange={(_, val) => field.onChange(val)}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                                sx={{ alignSelf: "center", width: "calc(100% - 24px)" }}
                            />
                        )}
                    />
                </Stack>
                <Stack spacing={1.5} my={2}>
                    <Typography variant="subtitle2">Ghi chú</Typography>
                    <Field.Editor
                        name="notes"
                        sx={{
                            height: { xs: 'auto', sm: 'auto', md: 'auto', lg: 'auto', xl: 330 }
                        }}
                    />
                </Stack>
                <Field.VNCurrencyInput name="paid" label="Số tiền tạm ứng" required sx={{ mt: 2, maxWidth: 200, display: 'none' }} />
            </Box>
        </Stack>
    );

    const renderDetails = () => (
        <Stack direction={{ xs: "column", sm: "column", md: "column", lg: "row", xl: "row" }} height="100%" spacing={3} sx={{ mt: 1 }}>
            {renderLeftColumn()}
            <Divider
                flexItem
                orientation="vertical"
                sx={{
                    display: { xs: "none", md: "block" },
                }}
            />
            <Divider
                flexItem
                orientation="horizontal"
                sx={{
                    display: { xs: "block", md: "none" },
                }}
            />
            <QuotationItemsTable
                idQuotation={selectedQuotation?.id}
                quotationProductDetail={quotationProductDetail}
                methods={methods}
                fields={fields}
                append={append}
                remove={remove}
                setPaid={setTotalPaid}
                setGrandTotal={setGrandTotal}
            />
        </Stack>
    );

    const renderActions = () => (
        <Box display="flex" flexDirection="row" gap={2}>
            <Button
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ flex: 1 }}
                onClick={() => {
                    onClose();
                    reset(defaultValues);
                }}
                disabled={isSubmitting}
            >
                Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                size="medium"
                sx={{ flex: 1, whiteSpace: 'nowrap', px: 4 }}
                disabled={isCreatingCustomer}
                loading={isSubmitting}
            >
                {selectedQuotation ? `Lưu đơn đặt hàng` : 'Tạo đơn đặt hàng'}
            </Button>
        </Box>
    );

    return (
        <Dialog
            open={openForm}
            onClose={
                () => {
                    onClose();
                    reset(defaultValues);
                }
            }
            fullScreen>
            <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%' }}>
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        py: 2,
                        px: 3,
                    }}
                >
                    {selectedQuotation ? `Chỉnh sửa - ${selectedQuotation.quotationNo}` : 'Tạo đơn đặt hàng'}
                    {renderActions()}
                </DialogTitle>
                <DialogContent
                    sx={{
                        pb: 0,
                        pt: '10px !important',
                        overflowY: "auto",
                    }}
                >
                    {quotationLoading ? renderSkeleton() : renderDetails()}
                </DialogContent>
            </Form>
        </Dialog>
    );
}