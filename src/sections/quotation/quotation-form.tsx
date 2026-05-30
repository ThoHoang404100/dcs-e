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
    Divider,
    Tooltip,
    Grid,
    MenuItem,
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { Field, Form } from "src/components/hook-form";
import { useGetCustomers } from "src/actions/customer";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect, useState, useRef } from "react";
import { ICustomerItem } from "src/types/customer";
import {
    IQuotationItem,
    IQuotationDetails,
    IQuotationDetailDto,
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
import { useAuthContext } from "src/auth/hooks";
import { mapProductsToItems } from "./helper/mapProductsToItems";
import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";
import { QuotationCustomerForm } from "./quotation-customer-form";
import axiosInstance from "src/lib/axios";

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
    const nextMonth = new Date(today);
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

    // ==================== DEFAULT SETTINGS ====================
    const [defaultSettings, setDefaultSettings] = useState({
        quotationVat: 8,
        quotationQuantity: 1,
    });

    const hasAppliedDefault = useRef(false); // ← Ngăn infinite loop

    // Fetch default settings
    useEffect(() => {
        const fetchDefaultSettings = async () => {
            try {
                const res = await axiosInstance.post('/api/v1/defaultKey/Get');
                if (res.data) {
                    setDefaultSettings({
                        quotationVat: res.data.quotationVat ?? 8,
                        quotationQuantity: res.data.quotationQuantity ?? 1,
                    });
                }
            } catch (error) {
                console.error("Không lấy được cấu hình mặc định:", error);
            }
        };

        fetchDefaultSettings();
    }, []);

    // ==================== DEFAULT VALUES ====================
    const getDefaultValues = () => ({
        customer: 0,
        quotationNo: generateQuotationNo(),
        date: today.toISOString(),
        validUntil: nextMonth.toISOString(),
        status: 1,
        discount: 0,
        items: [{
            id: undefined,
            product: "",
            unit: "",
            unitName: "",
            qty: defaultSettings.quotationQuantity,
            price: 0,
            vat: defaultSettings.quotationVat,
        }],
        notes: sampleNote,
        paid: 0,
        cusName: "",
        companyName: "",
        taxCode: "",
        phone: "",
        address: "",
        nickName: "",
    });

    const methods = useForm<QuotationFormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(quotationSchema),
        defaultValues: getDefaultValues(),
    });

    const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;
    const customerId = watch('customer');

    const [originalItems, setOriginalItems] = useState<IQuotationDetailDto[]>([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [quotationProductDetail, setQuotationProductDetail] = useState<IQuotationDetails>();
    const [grandTotal, setGrandTotal] = useState(0);

    const { quotation: CurrentQuotation, quotationLoading } = useGetQuotation({
        quotationId,
        pageNumber: 1,
        pageSize: 999,
        options: { enabled: !!quotationId }
    });

    const { customers, customersLoading, mutation: refetchCustomers } = useGetCustomers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: openForm || !!selectedQuotation?.customerId
    });

    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

    // ==================== APPLY DEFAULT QTY & VAT ====================
    useEffect(() => {
        if (!openForm || hasAppliedDefault.current) return;

        // Chỉ áp dụng khi defaultSettings đã thay đổi và là form mới
        const currentItems = methods.getValues('items');
        if (currentItems.length > 0 &&
            (defaultSettings.quotationQuantity !== 1 || defaultSettings.quotationVat !== 8)) {

            reset({
                ...methods.getValues(),
                items: currentItems.map(item => ({
                    ...item,
                    qty: item.qty ?? defaultSettings.quotationQuantity,
                    vat: item.vat !== undefined ? item.vat : defaultSettings.quotationVat,
                }))
            });
            hasAppliedDefault.current = true;
        }
    }, [defaultSettings, openForm, reset, methods]);

    // Reset hasAppliedDefault khi đóng form
    useEffect(() => {
        if (!openForm) {
            hasAppliedDefault.current = false;
        }
    }, [openForm]);

    // ==================== LOAD DATA ====================
    useEffect(() => {
        if (!openForm) {
            setSelectedCustomer(null);
            setCustomerKeyword('');
            setQuotationProductDetail(undefined);
            setOriginalItems([]);
            return;
        }

        const refreshData = async () => {
            if (quotationId) await mutate(`/api/v1/quotation/${quotationId}`);
        };
        refreshData();

        if (!selectedQuotation && !CopiedQuotation) {
            reset(getDefaultValues());
            return;
        }

        if (CopiedQuotation && CurrentQuotation) {
            const currentDetails = CurrentQuotation.items.find(q => q.quotationID === CopiedQuotation.id);
            setQuotationProductDetail(currentDetails);
            const mappedItems = mapProductsToItems(currentDetails?.products || []);

            reset({
                ...getDefaultValues(),
                customer: CopiedQuotation.customerId ?? 0,
                quotationNo: generateQuotationNo(),
                date: today.toISOString(),
                validUntil: nextMonth.toISOString(),
                status: 1,
                discount: CopiedQuotation.discount ?? 0,
                items: mappedItems,
                notes: CopiedQuotation.note ?? sampleNote,
                paid: CopiedQuotation.paid ?? 0,
                nickName: CopiedQuotation.nickName || "",
            });
            return;
        }

        if (selectedQuotation && CurrentQuotation) {
            const currentDetails = CurrentQuotation.items.find(q => q.quotationID === selectedQuotation.id);
            if (currentDetails) {
                setQuotationProductDetail(currentDetails);
                setOriginalItems((currentDetails.products || []).map((p, index) => ({
                    productID: p.productID,
                    quantity: p.quantity,
                    row: index + 1,
                    Unit: p.unit || "",
                    Price: p.price || 0,
                })));
            }

            const mappedItems = mapProductsToItems(currentDetails?.products || []);

            reset({
                customer: selectedQuotation.customerId ?? 0,
                quotationNo: selectedQuotation.quotationNo,
                date: selectedQuotation.createdDate ?? today.toISOString(),
                validUntil: selectedQuotation.expiryDate ?? nextMonth.toISOString(),
                status: selectedQuotation.status ?? 1,
                discount: selectedQuotation.discount ?? 0,
                items: mappedItems,
                notes: selectedQuotation.note ?? sampleNote,
                paid: selectedQuotation.paid ?? 0,
                cusName: "",
                companyName: "",
                taxCode: "",
                phone: "",
                address: "",
                nickName: selectedQuotation.nickName || "",
            });
        }
    }, [openForm, selectedQuotation?.id, CopiedQuotation?.id, CurrentQuotation, reset]);

    // ==================== CUSTOMER ====================
    useEffect(() => {
        if (!customerId) {
            setSelectedCustomer(null);
            return;
        }
        const found = customers.find((cus) => Number(cus.id) === Number(customerId));
        setSelectedCustomer(found || null);
    }, [customerId, customers]);

    useEffect(() => {
        if (!selectedCustomer) {
            setValue("cusName", "");
            setValue("companyName", "");
            setValue("taxCode", "");
            setValue("phone", "");
            setValue("address", "");
            setValue("nickName", "");
            return;
        }

        setValue("cusName", selectedCustomer.name || "");
        setValue("companyName", selectedCustomer.companyName || "");
        setValue("taxCode", selectedCustomer.taxCode || "");
        setValue("phone", selectedCustomer.phone || "");
        setValue("address", selectedCustomer.address || "");

        const isCreating = !selectedQuotation && !CopiedQuotation;
        const currentNickName = methods.getValues("nickName");

        if (isCreating || !currentNickName?.trim()) {
            setValue("nickName", selectedCustomer.nickName || "");
        }
    }, [selectedCustomer, setValue, selectedQuotation, CopiedQuotation, methods]);

    useEffect(() => {
        if (openForm && quotationId) {
            mutate(`/api/v1/quotation/${quotationId}`);
        }
    }, [openForm, quotationId]);

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    // ==================== SUBMIT ====================
    const onSubmit = handleSubmit(async (data: QuotationFormValues) => {
        try {
            const validItems = data.items.filter((item) => item.product && item.product !== "");

            const quotationDetails = validItems.map((item, i) => ({
                productID: String(item.product),
                quantity: item.qty ?? 0,
                row: i + 1,
                Unit: item.unitName || "",
                Price: item.price || 0,
                vat: item.vat ?? defaultSettings.quotationVat,
            }));

            const basePayload = {
                quotationNo: data.quotationNo,
                customerID: data.customer,
                createDate: data.date,
                expiryDate: data.validUntil,
                discount: data.discount || 0,
                note: data.notes || '',
                paid: data.paid || 0,
                Type: 'Quotation',
                Status: data.status,
                nickName: data.nickName || '',
            };

            if (!selectedQuotation) {
                await createOrUpdateQuotation(null, { ...basePayload, quotationDetails }, { ...basePayload, seller: user?.accessToken || "" });
            } else {
                await createOrUpdateQuotation(selectedQuotation.id, { ...basePayload, quotationDetails: [] }, { ...basePayload, seller: user?.accessToken || "" });

                const existingItems = validItems.filter((x) => x.id);
                for (const item of existingItems) {
                    await editProductForm(item.id!, {
                        rowId: item.id!,
                        productId: Number(item.product),
                        price: item.price || 0,
                        quantity: item.qty || 0,
                        unit: item.unitName ?? "",
                        vat: item.vat ?? defaultSettings.quotationVat,
                    });
                }

                const newItems = validItems.filter((x) => !x.id).map((item, i) => ({
                    productID: String(item.product),
                    quantity: item.qty ?? 0,
                    row: i + 1,
                    Unit: item.unitName || "",
                    Price: item.price || 0,
                    vat: item.vat ?? defaultSettings.quotationVat,
                }));

                if (newItems.length > 0) await addMoreProducts(selectedQuotation.id, newItems);
            }

            await mutate((key) => typeof key === "string" && key.includes("/api/v1/quotation"), undefined, { revalidate: true });
            await mutate("/api/v1/quotation/quotations");
            if (selectedQuotation?.id) await mutate(`/api/v1/quotation/${selectedQuotation.id}`);

            toast.success(selectedQuotation ? "Cập nhật thành công!" : "Tạo báo giá thành công!");
            onClose();
            reset(getDefaultValues());
            setSelectedCustomer(null);
            setCustomerKeyword('');
            setQuotationProductDetail(undefined);
            hasAppliedDefault.current = false;

        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra!");
        }
    });

    const formattedTotal = new Intl.NumberFormat('vi-VN').format(grandTotal) + 'đ';

    const renderDetails = () => (
        <Stack spacing={2.5}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
                        Thông tin khách hàng
                    </Typography>
                    <Stack direction="row" gap={1} alignItems="flex-start" sx={{ mb: 1.5 }}>
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

                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 6 }}><Field.Text name="cusName" label="Tên KH" size="small" fullWidth /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><Field.Text name="companyName" label="Tên công ty" size="small" fullWidth /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><Field.Text name="taxCode" label="Mã số thuế" size="small" fullWidth /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><Field.Text name="phone" label="Điện thoại" size="small" fullWidth /></Grid>
                        <Grid size={12}><Field.Text name="nickName" label="Tên gợi nhớ" size="small" fullWidth /></Grid>
                        <Grid size={12}><Field.Text name="address" label="Địa chỉ" size="small" fullWidth multiline rows={2} /></Grid>
                    </Grid>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.95rem' }}>Ghi chú</Typography>
                    <Field.Editor name="notes" sx={{ height: 125, fontSize: '0.85rem' }} />
                </Grid>

                <Grid size={{ xs: 12, lg: 3 }}>
                    <Grid container spacing={1.5} sx={{ height: '100%' }}>
                        <Grid size={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.95rem', fontWeight: 600 }}>
                                Thông tin hợp đồng
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.Text name="quotationNo" label="Số hợp đồng" size="small" disabled={!!selectedQuotation && watch('status') !== 1} fullWidth />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.DatePicker name="validUntil" label="Hiệu lực đến" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.Select name="status" label="Trạng thái" size="small" fullWidth>
                                        <MenuItem value={1}>Nháp</MenuItem>
                                        <MenuItem value={2}>Đang thực hiện</MenuItem>
                                        <MenuItem value={3}>Hoàn thành</MenuItem>
                                    </Field.Select>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field.DatePicker name="date" label="Ngày báo giá" />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid size={12}>
                            <Box sx={{ bgcolor: '#FFF7E6', border: '2px solid #FFE7BA', borderRadius: 2, p: 2, textAlign: 'center', minHeight: 82 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                                    Tổng tiền thanh toán
                                </Typography>
                                <Typography sx={{ color: '#D97706', fontWeight: 800, fontSize: '1.45rem' }}>
                                    {formattedTotal}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Divider />

            <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Hàng tiền</Typography>
                <QuotationItemsTable
                    idQuotation={selectedQuotation?.id}
                    quotationProductDetail={quotationProductDetail}
                    methods={methods}
                    fields={fields}
                    append={append}
                    remove={remove}
                    defaultSettings={defaultSettings}
                    setPaid={setTotalPaid}
                    setGrandTotal={setGrandTotal}
                />
            </Box>
        </Stack>
    );

    return (
        <Dialog open={openForm} onClose={onClose} fullScreen>
            <Box sx={{ zoom: 0.8 }}>
                <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%' }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', py: 1.5, px: 3 }}>
                        <Typography variant="h6" fontSize="1.1rem">
                            {selectedQuotation ? "CHỈNH SỬA BÁO GIÁ" : "TẠO BÁO GIÁ"}
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            <Button variant="outlined" onClick={onClose} size="small">Hủy</Button>
                            <Button sx={(theme) => ({ bgcolor: theme.palette.primary.main })} type="submit" variant="contained" loading={isSubmitting} size="small">Lưu</Button>
                        </Stack>
                    </DialogTitle>

                    <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
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
            </Box>
        </Dialog>
    );
}