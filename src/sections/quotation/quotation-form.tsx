import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Stack,
    Typography,
    IconButton,
    Box,
    MenuItem,
    Divider,
    Tooltip,
    Grid,
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { Field, Form } from "src/components/hook-form";
import { useGetCustomers } from "src/actions/customer";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect, useState, useMemo } from "react";
import { ICustomerItem } from "src/types/customer";
import {
    IProductFormEdit,
    IQuotationDao,
    IQuotationDetailDto,
    IQuotationDetails,
    IQuotationDto,
    IQuotationItem
} from "src/types/quotation";
import { QuotationItemsTable } from "./quotation-product-table";
import { QuotationFormValues, quotationSchema } from "./schema/quotation-schema";
import {
    addMoreProducts,
    createOrUpdateQuotation,
    editProductForm,
    useGetQuotation,

} from "src/actions/quotation";
import { editAllQuotationDetails } from "./helper/mapQuotationProduct";
import { toast } from "sonner";
import { generateQuotationNo } from "src/utils/random-func";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { QuotationCustomerForm } from "./quotation-customer-form";
import { useAuthContext } from "src/auth/hooks";
import { mapProductsToItems } from "./helper/mapProductsToItems";
import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";
import { useWatch } from "react-hook-form";

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
    - Giá trên <strong>đã bao gồm thuế GTGT</strong><br>
    - Báo giá có giá trị trong 30 ngày<br>
    - Tạm ứng 50% giá trị hợp đồng, ngay khi ký hợp đồng<br>
    <strong>Ngân hàng Á Châu (ACB) - PGD Thảo Điền - TP.HCM</strong><br>
    <strong>Tên tài khoản: Công ty TNHH GIẢI PHÁP DCS</strong><br>
    <strong>Tài khoản số: 8100868</strong>
</p>
`;

    const [originalItems, setOriginalItems] = useState<IQuotationDetailDto[]>([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [quotationProductDetail, setQuotationProductDetail] = useState<IQuotationDetails>();

    const { quotation: CurrentQuotation, quotationLoading } = useGetQuotation({
        quotationId,
        pageNumber: 1,
        pageSize: 999,
        options: { enabled: !!selectedQuotation?.id }
    });

    const { customers, customersLoading, mutation: refetchCustomers } = useGetCustomers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: openForm || !!selectedQuotation?.customerId
    });

    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

    const defaultValues: QuotationFormValues = {
        customer: 0,
        quotationNo: generateQuotationNo(),
        date: today.toISOString(),
        validUntil: nextMonth.toISOString(),
        status: 1,
        discount: 0,
        items: [{ id: undefined, product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 }],
        notes: sampleNote,
        paid: 0,
        cusName: "",
        companyName: "",
        taxCode: "",
        phone: "",
        address: "",
    };

    const methods = useForm<QuotationFormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(quotationSchema),
        defaultValues,
    });

    const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;
    const customerId = watch('customer');
    const watchItems = useWatch({
        control,
        name: "items",
    });

    const grandTotal = useMemo(() => {
        return watchItems?.reduce((acc, item) => {
            const qty = Number(item.qty) || 0;
            const price = Number(item.price) || 0;
            const vat = Number(item.vat) || 0;
            return acc + Math.round(qty * price * (1 + vat / 100));
        }, 0) || 0;
    }, [watchItems]);


    const formattedTotal = new Intl.NumberFormat('vi-VN').format(grandTotal) + 'đ';
    const isLong = formattedTotal.length > 10;

    useEffect(() => {
        if (!selectedCustomer) return;
        setValue("cusName", selectedCustomer.name || "");
        setValue("companyName", selectedCustomer.companyName || "");
        setValue("taxCode", selectedCustomer.taxCode || "");
        setValue("phone", selectedCustomer.phone || "");
        setValue("address", selectedCustomer.address || "");
    }, [selectedCustomer, setValue]);

    useEffect(() => {
        if (CopiedQuotation) {
            if (!CurrentQuotation) return;
            const currentDetails = CurrentQuotation.items.find(q => q.quotationID === CopiedQuotation.id);
            setQuotationProductDetail(currentDetails);
            const mappedItems = mapProductsToItems(currentDetails?.products || []);
            methods.reset({
                ...defaultValues,
                customer: CopiedQuotation.customerId ?? 0,
                quotationNo: generateQuotationNo(),
                date: today.toISOString(),
                validUntil: nextMonth.toISOString(),
                status: 1,
                discount: CopiedQuotation.discount,
                items: mappedItems,
                notes: CopiedQuotation.note ?? sampleNote,
                paid: CopiedQuotation.paid ?? 0,
            });
            return;
        }

        if (!selectedQuotation) {
            methods.reset(defaultValues);
            return;
        }

        if (!CurrentQuotation) return;

        const currentDetails = CurrentQuotation.items.find(q => q.quotationID === selectedQuotation.id);
        if (currentDetails) setQuotationProductDetail(currentDetails);

        const mappedItems = mapProductsToItems(currentDetails?.products || []);
        methods.setValue("customer", selectedQuotation.customerId ?? 0);
        methods.setValue("quotationNo", selectedQuotation.quotationNo);
        methods.setValue("date", selectedQuotation.createdDate ?? null);
        methods.setValue("validUntil", selectedQuotation.expiryDate ?? null);
        methods.setValue("status", selectedQuotation.status ?? 1);
        methods.setValue("items", mappedItems);
        methods.setValue("notes", selectedQuotation.note ?? "");
        methods.setValue("discount", selectedQuotation.discount);
        methods.setValue("paid", selectedQuotation.paid);
    }, [selectedQuotation, CopiedQuotation, CurrentQuotation, methods]);

    useEffect(() => {
        if (!customerId) {
            setSelectedCustomer(null);
            return;
        }
        const found = customers.find((cus) => Number(cus.id) === Number(customerId));
        setSelectedCustomer(found || null);
    }, [customerId, customers]);

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const onSubmit = handleSubmit(async (data: QuotationFormValues) => {
        try {
            const basePayload = {
                quotationNo: data.quotationNo,
                customerID: data.customer,
                createDate: data.date,
                expiryDate: data.validUntil,
                discount: data.discount || 0,
                note: data.notes || '',
                paid: data.paid || 0,
                Type: 'Quotation',
                Status: data.status
            };

            const bodyPayload: IQuotationDto = {
                ...basePayload,
                quotationDetails: data.items
                    .filter((item) => item.product && item.product !== "")
                    .map((item, i) => ({
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

            await createOrUpdateQuotation(
                selectedQuotation?.id ?? null,
                bodyPayload,
                updatePayload
            );

            if (selectedQuotation) {
                const productPayload: IProductFormEdit[] = data.items.map((item) => ({
                    rowId: item.id,
                    productId: Number(item.product),
                    price: item.price || 0,
                    quantity: item.qty || 0,
                    unit: item.unitName ?? "",
                }));

                for (const item of productPayload) {
                    await editProductForm(item.rowId, item);
                }

                const newItems = bodyPayload.quotationDetails.filter(
                    (item) => !originalItems.some((o) => o.productID === item.productID)
                );

                if (newItems.length > 0) {
                    await addMoreProducts(selectedQuotation.id, newItems);
                } else {
                    await editAllQuotationDetails(bodyPayload, selectedQuotation.id);
                }
            }

            mutate((key) =>
                typeof key === "string" &&
                key.includes("/api/v1/quotation")
            );

            toast.success(
                selectedQuotation
                    ? "Dữ liệu đã được thay đổi!"
                    : "Tạo hợp đồng thành công!"
            );

            onClose();
            reset(defaultValues);

        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra!");
        }
    });


    const renderDetails = () => (
        <Stack spacing={3}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Thông tin khách hàng</Typography>

                    <Stack direction="row" gap={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                        <Field.Autocomplete
                            name="customer"
                            label="Mã khách hàng có sẵn *"
                            size="small"
                            options={customers}
                            loading={customersLoading}
                            getOptionLabel={(opt) => opt?.name || opt?.companyName || ''}
                            onInputChange={(_, value) => setCustomerKeyword(value)}
                            value={selectedCustomer}
                            fullWidth
                            onChange={(_, newValue) => {
                                methods.setValue('customer', newValue?.id ?? 0, { shouldValidate: true });
                                setCustomerKeyword(newValue?.name ?? '');
                            }}
                        />
                        <Tooltip title="Tạo khách hàng mới">
                            <IconButton color="primary" size="small" onClick={() => setIsCreatingCustomer(true)}>
                                <Iconify icon="line-md:person-add" />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="cusName" label="Tên khách hàng" size="small" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="companyName" label="Tên công ty" size="small" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="taxCode" label="Mã số thuế" size="small" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="phone" label="Số điện thoại" size="small" fullWidth />
                        </Grid>
                        <Grid size={12}>
                            <Field.Text name="address" label="Địa chỉ" size="small" fullWidth multiline rows={2} />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Ghi chú</Typography>
                    <Field.Editor
                        name="notes"
                        sx={{ height: 145, fontSize: '0.875rem' }}
                    />
                </Grid>



                <Grid size={{ xs: 12, lg: 3 }}>
                    <Grid container spacing={2} sx={{ height: '100%' }}>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                Thông tin hợp đồng
                            </Typography>

                            <Grid container spacing={1.2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.Text
                                        name="quotationNo"
                                        label="Số hợp đồng"
                                        size="small"
                                        disabled={!!selectedQuotation}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.DatePicker
                                        name="validUntil"
                                        label="Ngày ký"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.Select
                                        name="status"
                                        label="Trạng thái"
                                        size="small"
                                        fullWidth
                                    >
                                        <MenuItem value={1}>Nháp</MenuItem>
                                        <MenuItem value={2}>Đang thực hiện</MenuItem>
                                        <MenuItem value={3}>Hoàn thành</MenuItem>
                                    </Field.Select>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.DatePicker
                                        name="date"
                                        label="Ngày tạo"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    minHeight: 80,
                                    bgcolor: '#FFF7E6',
                                    border: '2px solid #FFE7BA',
                                    borderRadius: 2,
                                    p: 2.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1, fontSize: '0.85rem' }}
                                >
                                    Tổng tiền thanh toán
                                </Typography>

                                <Typography
                                    sx={{
                                        color: '#D97706',
                                        fontWeight: 800,
                                        fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%',
                                    }}
                                >
                                    {formattedTotal}
                                </Typography>
                            </Box>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>

            <Divider />

            <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Hàng tiền</Typography>
                <QuotationItemsTable
                    quotationProductDetail={quotationProductDetail}
                    idQuotation={selectedQuotation?.id}
                    methods={methods}
                    fields={fields}
                    append={append}
                    remove={remove}
                    setPaid={setTotalPaid}
                />
            </Box>
        </Stack>
    );

    return (
        <Dialog open={openForm} onClose={onClose} fullScreen>
            <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%' }}>
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ddd',
                    py: 2,
                    px: 3
                }}>
                    <Typography variant="h6">TẠO HỢP ĐỒNG</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={onClose} size="small">Hủy</Button>
                        <Button sx={{ backgroundColor: (Theme) => Theme.palette.primary.main }} type="submit" variant="contained" loading={isSubmitting} size="small">Lưu</Button>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                    {quotationLoading ? renderSkeleton() : renderDetails()}
                </DialogContent>
            </Form>

            <QuotationCustomerForm
                openChild={isCreatingCustomer}
                setOpenChild={setIsCreatingCustomer}
                methodsQuotation={methods}
                setCustomerKeyword={setCustomerKeyword}
                setSelectedCustomer={setSelectedCustomer}
                refetchCustomers={refetchCustomers}
            />
        </Dialog>
    );
}