import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    Typography,
    Tooltip,
} from "@mui/material";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Field, Form } from "src/components/hook-form";
import { Iconify } from "src/components/iconify";
import {
    IContractDao,
    IContractDetailDto,
    IContractDetails,
    IContractDto,
    IContractItem,
    IContractProduct,
    IProductFormEdit
} from "src/types/contract";
import { ContractFormValues, contractSchema } from "./schema/contract-schema";
import { useGetCustomers } from "src/actions/customer";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect, useRef, useState } from "react";
import { ICustomerItem } from "src/types/customer";
import { ContractItemsTable } from "./contract-product-table";
import { ContractCustomerForm } from "./contract-customer-form";
import { generateContractNo } from "src/utils/random-func";
import { addMoreProducts, createOrUpdateContract, editProductForm, useGetContract } from "src/actions/contract";
import { mapProductsToItems } from "./helper/mapProductToItems";
import { endpoints } from "src/lib/axios";
import { mutate } from "swr";
import { toast } from "sonner";
import { editAllContractDetails } from "./helper/mapContractProducts";
import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";
import { createSupplierContract } from "src/actions/contractSupplier";
import { IContractSupplyDto, IContractSupplyProductDto } from "src/types/contractSupplier";
import { useGetSuppliers } from "src/actions/suppliers";
import { ISuppliersItem } from "src/types/suppliers";
import { useNavigate } from "react-router";
import { paths } from "src/routes/paths";
import { useGetEmployees } from "src/actions/employee";
import axiosInstance from "src/lib/axios";

type ContractFormProps = {
    open: boolean;
    onClose: () => void;
    selectedContract: IContractItem | null;
    detailsFromQuotation: any[];
    customerIdFromQuotation?: number | null;
    creatingSupplierContract: boolean;
    CopiedContract: IContractItem | null;
};

async function loadProductDetails(products: any[]): Promise<IContractProduct[]> {
    return products;
}

export function ContractForm({
    open,
    onClose,
    selectedContract,
    detailsFromQuotation,
    customerIdFromQuotation,
    creatingSupplierContract,
    CopiedContract
}: ContractFormProps) {
    const contractId = selectedContract?.id ?? CopiedContract?.id ?? 0;
    const navigate = useNavigate();
    const today = new Date();

    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);
    const [originalItems, setOriginalItems] = useState<IContractDetailDto[]>([]);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [totalPaid, setTotalPaid] = useState(0);

    const [defaultSettings, setDefaultSettings] = useState({
        contractQuantity: 1,
        contractVat: 0,
    });

    const hasAppliedDefault = useRef(false);

    useEffect(() => {
        if (!open) {
            hasAppliedDefault.current = false;
        }
    }, [open]);

    const { employees, employeesLoading } = useGetEmployees({
        pageNumber: 1,
        pageSize: 999,
        key: '',
        filter: '',
    });

    const { contract: CurrentContract, contractLoading } = useGetContract({
        contractId: contractId,
        pageNumber: 1,
        pageSize: 999,
        options: { enabled: !!selectedContract?.id || !!CopiedContract?.id }
    });

    const { suppliers, suppliersLoading } = useGetSuppliers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: creatingSupplierContract
    });

    const { customers, customersLoading } = useGetCustomers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: true
    });

    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [contractProductDetail, setContractProductDetail] = useState<IContractDetails>();
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<ISuppliersItem | null>(null);

    const defaultValues: ContractFormValues = {
        contractNo: generateContractNo(creatingSupplierContract ? 'NCC' : 'KH'),
        customerId: 0,
        supplierId: 0,
        editorId: 0,
        createDate: today.toISOString(),
        signatureDate: today.toISOString(),
        deliveryAddress: "",
        deliveryTime: today.toISOString(),
        downPayment: 0,
        nextPayment: 0,
        lastPayment: 0,
        copiesNo: 2,
        keptNo: 1,
        status: 1,
        note: "",
        discount: 0,
        products: [{
            id: 0,
            product: "",
            unit: "",
            unitName: "",
            qty: 1,
            price: 0,
            vat: 0,
        }],
    };

    const methods = useForm<ContractFormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(contractSchema),
        defaultValues,
    });

    const {
        reset,
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = methods;

    const currentLoadRef = useRef<Promise<IContractProduct[]> | null>(null);
    const customerId = methods.watch('customerId');
    const supplierId = methods.watch('supplierId');

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products",
    });

    const products = useWatch({ control, name: "products" }) || [];
    const downPayment = useWatch({ control, name: "downPayment" });
    const nextPayment = useWatch({ control, name: "nextPayment" });
    const lastPayment = useWatch({ control, name: "lastPayment" });
    const currentStatus = useWatch({ control, name: "status" }) ?? 1;

    const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
        const qty = Number(item?.qty) || 0;
        const price = Number(item?.price) || 0;
        const vat = Number(item?.vat) || 0;
        return qty * price * (1 + vat / 100);
    };

    const total = Math.round((products || []).reduce((acc, i) => acc + calcAmount(i), 0));

    useEffect(() => {
        if (CopiedContract) {
            if (!CurrentContract) return;
            const currentDetails = CurrentContract.items.find(
                (c) => c.contractID === CopiedContract.id
            );
            setContractProductDetail(currentDetails);
            const mappedItems = mapProductsToItems(currentDetails?.products || []);
            methods.reset({
                customerId: CopiedContract.customerID,
                editorId: CopiedContract.editorId ?? currentDetails?.employeeID ?? 0,
                contractNo: generateContractNo('KH'),
                createDate: CopiedContract.createDate,
                signatureDate: CopiedContract.signatureDate,
                deliveryAddress: CopiedContract.deliveryAddress,
                deliveryTime: CopiedContract.deliveryTime,
                downPayment: CopiedContract.downPayment,
                nextPayment: CopiedContract.nextPayment,
                lastPayment: CopiedContract.lastPayment,
                copiesNo: CopiedContract.copiesNo,
                keptNo: CopiedContract.keptNo,
                status: CopiedContract.status,
                note: CopiedContract.note,
                discount: CopiedContract.discount,
                products: mappedItems
            });
            return;
        }

        if (detailsFromQuotation?.length > 0 && customerIdFromQuotation) {
            const mapped = mapProductsToItems(detailsFromQuotation);
            methods.setValue("products", mapped);
            methods.setValue("customerId", customerIdFromQuotation);
            methods.setValue("editorId", 0);
            return;
        }

        if (!selectedContract) {
            methods.reset(defaultValues);
            setOriginalItems(
                defaultValues.products.map((item) => ({
                    productID: item.product ?? "",
                    quantity: item.qty ?? 0,
                    unit: item.unitName || "",
                    price: item.price || 0
                }))
            );
            return;
        }




        if (!CurrentContract) return;
        const currentDetails = CurrentContract.items.find(
            (q) => q.contractID === selectedContract.id
        );
        if (currentDetails) setContractProductDetail(currentDetails);

        if (creatingSupplierContract) {
            methods.setValue("supplierId", defaultValues.supplierId);
            methods.setValue("customerId", defaultValues.customerId);
            methods.setValue("editorId", defaultValues.editorId);
            methods.setValue("contractNo", defaultValues.contractNo);
            methods.setValue("deliveryAddress", defaultValues.deliveryAddress);
            methods.setValue("copiesNo", defaultValues.copiesNo);
            methods.setValue("keptNo", defaultValues.keptNo);
            methods.setValue("status", defaultValues.status);
            methods.setValue("note", defaultValues.note);
            methods.setValue("discount", defaultValues.discount);
            methods.setValue("downPayment", defaultValues.downPayment);
            methods.setValue("nextPayment", defaultValues.nextPayment);
            methods.setValue("lastPayment", defaultValues.lastPayment);

            const loadPromise = loadProductDetails(currentDetails?.products || []);
            currentLoadRef.current = loadPromise;
            loadPromise.then((dataToMap) => {
                if (currentLoadRef.current !== loadPromise || !creatingSupplierContract) return;
                const mItems = mapProductsToItems(dataToMap);
                methods.setValue("products", mItems);
            });
        } else {
            const dataToMap = currentDetails?.products || [];
            const mItems = mapProductsToItems(dataToMap);
            methods.setValue("supplierId", defaultValues.supplierId);
            methods.setValue("customerId", selectedContract.customerID ?? 0);
            methods.setValue("editorId", selectedContract.editorId ?? currentDetails?.employeeID ?? 0);
            methods.setValue("contractNo", selectedContract.contractNo);
            methods.setValue("products", mItems);
            methods.setValue("signatureDate", selectedContract.signatureDate ?? null);
            methods.setValue("createDate", selectedContract.createDate ?? null);
            methods.setValue("deliveryAddress", selectedContract.deliveryAddress ?? '');
            methods.setValue("deliveryTime", selectedContract.deliveryTime ?? null);
            methods.setValue("copiesNo", selectedContract.copiesNo);
            methods.setValue("keptNo", selectedContract.keptNo);
            methods.setValue("status", selectedContract.status ?? 1);
            methods.setValue("note", selectedContract.note ?? "");
            methods.setValue("discount", selectedContract.discount);
            methods.setValue("downPayment", selectedContract.downPayment);
            methods.setValue("nextPayment", selectedContract.nextPayment);
            methods.setValue("lastPayment", selectedContract.lastPayment);
        }

        const mappedProducts = mapProductsToItems(currentDetails?.products || []);
        setOriginalItems(
            mappedProducts.map((item) => ({
                productID: item.product ?? "",
                quantity: item.qty ?? 0,
                unit: item.unitName || "",
                price: item.price || 0,
            }))
        );
    }, [detailsFromQuotation, CopiedContract, selectedContract, CurrentContract, creatingSupplierContract]);



    useEffect(() => {
        const fetchDefaultSettings = async () => {
            try {
                const res = await axiosInstance.post('/api/v1/defaultKey/Get');
                if (res.data) {
                    const newSettings = {
                        contractQuantity: res.data.quotationQuantity ?? 1,
                        contractVat: res.data.quotationVat ?? 0,
                    };
                    setDefaultSettings(newSettings);

                    if (!selectedContract && !CopiedContract && open) {
                        const currentItems = methods.getValues('products');
                        if (currentItems?.length > 0) {
                            const updated = currentItems.map((item: any, idx: number) => ({
                                ...item,
                                qty: idx === 0 ? newSettings.contractQuantity : (item.qty || 1),
                                vat: idx === 0 ? newSettings.contractVat : (item.vat || 0),
                            }));
                            methods.setValue('products', updated, {
                                shouldValidate: true,
                                shouldDirty: true
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Không lấy được cấu hình mặc định:", error);
            }
        };

        fetchDefaultSettings();
    }, [methods, selectedContract, CopiedContract, open]);


    useEffect(() => {
        if (!open || hasAppliedDefault.current) return;

        if (!selectedContract && !CopiedContract) {
            hasAppliedDefault.current = true;
        }
    }, [open, selectedContract, CopiedContract]);

    useEffect(() => {
        if (!customerId) {
            setSelectedCustomer(null);
            return;
        }
        const found = customers.find((cus) => Number(cus.id) === Number(customerId));
        if (found) setSelectedCustomer(found);
    }, [customerId, customers]);

    useEffect(() => {
        if (!supplierId) {
            setSelectedSupplier(null);
            return;
        }
        const found = suppliers.find((cus) => Number(cus.id) === Number(supplierId));
        if (found) setSelectedSupplier(found);
    }, [supplierId, suppliers]);

    useEffect(() => {
        if (isEditingPayment) return;

        if (total === 0) {
            setValue("downPayment", 0, { shouldValidate: false });
            setValue("nextPayment", 0, { shouldValidate: false });
            setValue("lastPayment", 0, { shouldValidate: false });
            return;
        }

        const down = Number(downPayment) || 0;
        const next = Number(nextPayment) || 0;

        if (down === 0 && next === 0) {
            setValue("downPayment", total, { shouldValidate: false });
            setValue("nextPayment", 0, { shouldValidate: false });
            setValue("lastPayment", 0, { shouldValidate: false });
            clearErrors(["downPayment", "nextPayment"]);
            return;
        }

        const lastDefault = Math.max(0, total - down - next);

        if (down + next > total) {
            setError("downPayment", { type: "manual", message: "Tổng các đợt vượt quá giá trị hợp đồng" });
            setError("nextPayment", { type: "manual", message: "Tổng các đợt vượt quá giá trị hợp đồng" });
            setValue("lastPayment", 0);
        } else {
            clearErrors(["downPayment", "nextPayment"]);
            setValue("lastPayment", lastDefault, { shouldValidate: true });
        }
    }, [total, downPayment, nextPayment, isEditingPayment, setValue, setError, clearErrors]);

    const onSubmit = handleSubmit(async (data: ContractFormValues) => {
        try {
            const basePayload = {
                ContractNo: data.contractNo,
                customerId: data.customerId,
                editorId: data.editorId,
                signatureDate: data.signatureDate,
                deliveryAddress: data.deliveryAddress || "",
                deliveryTime: data.deliveryTime,
                downPayment: data.downPayment,
                nextPayment: data.nextPayment,
                lastPayment: data.lastPayment,
                copiesNo: data.copiesNo,
                keptNo: data.keptNo,
                status: data.status,
                note: data.note ?? '',
                discount: data.discount,
                seller: data.editorId,
            };

            const bodyPayload: IContractDto = {
                ...basePayload,
                products: data.products
                    .filter((item) => item.product && item.product !== "")
                    .map((item): IContractDetailDto => ({
                        productID: item.product ?? "",
                        quantity: item.qty ?? 0,
                        unit: item.unitName || "",
                        price: item.price || 0
                    })),
            };

            const updatePayload: IContractDao = { ...basePayload };

            const productPayload: IProductFormEdit[] = data.products.map((item) => ({
                rowId: item.id,
                productID: Number(item.product),
                price: item.price || 0,
                quantity: item.qty || 0,
                vat: item.vat || 0,
                unit: item.unitName ?? "",
            }));

            const supplierCreatePayload: IContractSupplyDto = {
                ContractNo: bodyPayload.ContractNo,
                copiesNo: bodyPayload.copiesNo,
                customerContractNo: selectedContract?.contractNo || "",
                deliveryAddress: bodyPayload.deliveryAddress,
                deliveryTime: bodyPayload.deliveryTime,
                discount: bodyPayload.discount,
                keptNo: bodyPayload.keptNo,
                note: bodyPayload.note,
                parentContractId: selectedContract?.id || 0,
                products: bodyPayload.products.map((item): IContractSupplyProductDto => ({
                    productID: typeof item.productID === 'string' ? parseInt(item.productID, 10) : item.productID,
                    quantity: item.quantity,
                    imported: item.quantity,
                    price: item.price,
                    unit: item.unit
                })),
                signatureDate: bodyPayload.signatureDate,
                status: bodyPayload.status,
                supplierId: data.supplierId
            };

            if (creatingSupplierContract) {
                await createSupplierContract(supplierCreatePayload);
            } else {
                await createOrUpdateContract(selectedContract?.id ?? null, bodyPayload, updatePayload);
                if (selectedContract) {
                    for (const item of productPayload) {
                        await editProductForm(item.rowId, item);
                    }
                    const newItems = bodyPayload.products.filter(
                        (item) => !originalItems.some((o) => o.productID === item.productID)
                    );
                    if (newItems.length > 0) {
                        await addMoreProducts(selectedContract.id, newItems);
                    } else {
                        await editAllContractDetails(bodyPayload, selectedContract.id);
                    }
                }
            }

            toast.success(creatingSupplierContract ? "Lập hợp đồng nhà cung cấp thành công!" : selectedContract ? "Dữ liệu hợp đồng đã được thay đổi!" : "Tạo hợp đồng thành công!");
            if (creatingSupplierContract) navigate(paths.dashboard.supplierServices.contractSupplier);

            mutate((k) => typeof k === "string" && k.startsWith("/api/v1/contracts/contracts"), undefined, { revalidate: true });
            if (selectedContract?.id) {
                mutate(endpoints.contract.detail(`?pageNumber=1&pageSize=999&ContractId=${selectedContract?.id}`));
            }
            onClose();
            reset(defaultValues);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Đã có lỗi xảy ra!");
        }
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{ sx: { bgcolor: '#fffff' } }}
        >
            <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <DialogTitle sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', py: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700} color="#111827">
                        {creatingSupplierContract ? 'LẬP HỢP ĐỒNG NHÀ CUNG CẤP' : selectedContract ? 'CẬP NHẬT HỢP ĐỒNG KHÁCH HÀNG' : 'TẠO HỢP ĐỒNG KHÁCH HÀNG'}
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => { onClose(); reset(defaultValues); }}
                            disabled={isSubmitting}
                            sx={{ borderRadius: 1, px: 3 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isCreatingCustomer}
                            loading={isSubmitting}
                            sx={{ bgcolor: "#00a76f", "&:hover": { bgcolor: "#008f5d" }, borderRadius: 1, px: 3 }}
                        >
                            {creatingSupplierContract ? 'Lập hợp đồng' : selectedContract ? 'Lưu hợp đồng' : 'Tạo hợp đồng'}
                        </Button>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: 0, overflowX: 'hidden', overflowY: 'auto', flexGrow: 1 }}>
                    <Box sx={{ zoom: 0.8, width: '100%', maxWidth: '100%', p: 3, boxSizing: 'border-box' }}>
                        {contractLoading ? (
                            renderSkeleton()
                        ) : (
                            <Stack spacing={3} sx={{ width: '100%' }}>

                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '2.8fr 3.8fr 2.6fr 2.8fr' },
                                        gap: 2.5,
                                        bgcolor: '#fff',
                                        p: 3,
                                        borderRadius: 1,
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                        boxSizing: 'border-box',
                                        alignItems: 'start'
                                    }}
                                >
                                    <Stack spacing={2} sx={{ pr: { md: 1.5 } }}>
                                        <Stack direction="row" alignItems="flex-end" gap={1}>
                                            {creatingSupplierContract ? (
                                                <Field.Autocomplete
                                                    name="supplierId"
                                                    label="Mã nhà cung cấp có sẵn *"
                                                    options={suppliers}
                                                    loading={suppliersLoading}
                                                    getOptionLabel={(opt) => opt?.companyName || ''}
                                                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                                                    value={selectedSupplier}
                                                    onChange={(e: any, newValue: any) => {
                                                        methods.setValue('supplierId', newValue?.id || 0, { shouldValidate: true });
                                                        setSelectedSupplier(newValue);
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                />
                                            ) : (
                                                <Field.Autocomplete
                                                    name="customerId"
                                                    label="Mã khách hàng có sẵn *"
                                                    options={customers}
                                                    loading={customersLoading}
                                                    getOptionLabel={(opt) => opt?.name || opt?.companyName || ''}
                                                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                                                    value={selectedCustomer}
                                                    onChange={(e: any, newValue: any) => {
                                                        methods.setValue('customerId', newValue?.id || 0, { shouldValidate: true });
                                                        setSelectedCustomer(newValue);
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                />
                                            )}
                                            {!creatingSupplierContract && (
                                                <Tooltip title="Tạo khách hàng mới">
                                                    <IconButton color="primary" onClick={() => setIsCreatingCustomer(true)} size="small" sx={{ mb: 0.5 }}>
                                                        <Iconify icon="line-md:person-add" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>

                                        <Field.Text
                                            name="taxCode"
                                            label={creatingSupplierContract ? "Mã số thuế NCC" : "Mã số thuế/CCCD khách hàng"}
                                            value={creatingSupplierContract ? (selectedSupplier?.taxCode || "") : (selectedCustomer?.taxCode || "")}
                                            size="small"
                                            fullWidth
                                        />

                                        <Field.Text
                                            name="phone"
                                            label="Số điện thoại"
                                            value={creatingSupplierContract ? (selectedSupplier?.phone || "") : (selectedCustomer?.phone || "")}
                                            size="small"
                                            fullWidth
                                        />

                                        <Field.Text
                                            name="email"
                                            label="Email"
                                            value={creatingSupplierContract ? (selectedSupplier?.email || "") : (selectedCustomer?.email || "")}
                                            size="small"
                                            fullWidth
                                        />

                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', gap: 1, alignItems: 'end' }}>
                                            <Field.Select label="Nhân viên bán hàng" name="editorId" size="small" fullWidth disabled={employeesLoading}>
                                                <MenuItem value={0}>-- Chọn --</MenuItem>
                                                {employees?.map((emp: any) => (
                                                    <MenuItem key={emp.id} value={emp.id}>{emp.fullName || emp.name}</MenuItem>
                                                ))}
                                            </Field.Select>
                                            <Field.Text label="Số bản sao" name="copiesNo" type="number" size="small" />
                                            <Field.Text label="Số bản lưu" name="keptNo" type="number" size="small" />
                                        </Box>
                                    </Stack>

                                    <Stack spacing={2} sx={{ px: { md: 1.5 } }}>
                                        <Field.Text
                                            name="companyName"
                                            label={creatingSupplierContract ? "Tên nhà cung cấp" : "Tên khách hàng"}
                                            value={creatingSupplierContract ? (selectedSupplier?.companyName || "") : (selectedCustomer?.companyName || selectedCustomer?.name || "")}
                                            size="small"
                                            fullWidth
                                        />

                                        <Field.Text
                                            name="address"
                                            label="Địa chỉ"
                                            value={creatingSupplierContract ? (selectedSupplier?.address || "") : (selectedCustomer?.address || "")}
                                            size="small"
                                            fullWidth
                                        />

                                        <Field.Text name="deliveryAddress" label="Địa chỉ giao hàng" size="small" fullWidth />

                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                                Thông tin thanh toán
                                            </Typography>

                                            {(() => {
                                                const showDown = Number(downPayment) !== 0;
                                                const showNext = Number(nextPayment) !== 0;
                                                const showLast = Number(lastPayment) !== 0;
                                                const activeColumns = [showDown, showNext, showLast].filter(Boolean).length;

                                                if (activeColumns === 0) return null;

                                                return (
                                                    <Box
                                                        sx={{
                                                            display: 'grid',
                                                            gridTemplateColumns: `repeat(${activeColumns}, 1fr)`,
                                                            gap: 1
                                                        }}
                                                    >
                                                        {showDown && (
                                                            <Field.VNCurrencyInput
                                                                label="Lần 1 (Tạm ứng)"
                                                                name="downPayment"
                                                                onFocus={() => setIsEditingPayment(true)}
                                                                onBlur={() => setIsEditingPayment(false)}
                                                            />
                                                        )}
                                                        {showNext && (
                                                            <Field.VNCurrencyInput
                                                                label="Lần 2"
                                                                name="nextPayment"
                                                                onFocus={() => setIsEditingPayment(true)}
                                                                onBlur={() => setIsEditingPayment(false)}
                                                            />
                                                        )}
                                                        {showLast && (
                                                            <Field.VNCurrencyInput
                                                                label="Lần 3"
                                                                name="lastPayment"
                                                                disabled
                                                            />
                                                        )}
                                                    </Box>
                                                );
                                            })()}
                                        </Stack>
                                    </Stack>

                                    <Stack spacing={2} sx={{ px: { md: 1.5 } }}>
                                        <Field.Text
                                            label="Số hợp đồng"
                                            name="contractNo"
                                            disabled={Number(currentStatus) !== 1}
                                            size="small"
                                            fullWidth
                                        />

                                        <Field.DatePicker name="createDate" label="Ngày tạo" slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                                        <Field.DatePicker name="signatureDate" label="Ngày ký" slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                                        <Field.DatePicker name="deliveryTime" label="Ngày giao hàng" slotProps={{ textField: { size: 'small', fullWidth: true } }} />

                                        <Field.Select label="Trạng thái" name="status" size="small" fullWidth>
                                            <MenuItem value={1}>Nháp</MenuItem>
                                            <MenuItem value={2}>Chờ duyệt</MenuItem>
                                            <MenuItem value={3}>Đang chạy</MenuItem>
                                            <MenuItem value={4}>Xong</MenuItem>
                                        </Field.Select>
                                    </Stack>

                                    <Stack
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{
                                            height: '100%',
                                            minHeight: 200,
                                            pl: { md: 1.5 },
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                                            Tổng tiền dự toán
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            fontWeight={800}
                                            sx={{
                                                color: '#d4a373',
                                                letterSpacing: '0.5px',
                                                fontSize: { md: '1.75rem', lg: '2.25rem' }
                                            }}
                                        >
                                            {new Intl.NumberFormat('vi-VN').format(total)}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <ContractItemsTable
                                    fields={fields}
                                    append={append}
                                    remove={remove}
                                    methods={methods}
                                    idContract={contractId}
                                    contractProductDetail={contractProductDetail}
                                    setPaid={setTotalPaid}
                                    defaultSettings={defaultSettings}
                                />

                                <ContractCustomerForm
                                    openChild={isCreatingCustomer}
                                    setOpenChild={setIsCreatingCustomer}
                                    methodsContract={methods}
                                    setCustomerKeyword={setCustomerKeyword}
                                    setSelectedCustomer={setSelectedCustomer}
                                />

                            </Stack>
                        )}
                    </Box>
                </DialogContent>
            </Form>


        </Dialog>
    );
}