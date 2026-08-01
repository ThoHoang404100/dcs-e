import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, MenuItem, Stack, Typography } from "@mui/material";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Field, Form } from "src/components/hook-form";
import { Iconify } from "src/components/iconify";
import { IContractDetailDto, IProductFormEdit } from "src/types/contract";
import { ContractFormValues, contractSchema } from "./schema/contract-schema";
import { DetailItem } from "../quotation/helper/DetailItem";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect, useState } from "react";
import { ContractItemsTable } from "./contract-product-table";
import { generateContractNo } from "src/utils/random-func";
import { mapProductsToItems } from "./helper/mapProductToItems";
import { toast } from "sonner";
import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";
import {
    IContractSupDetailDto,
    IContractSupplyDto,
    IContractSupplyForDetail,
    IContractSupplyItem,
    IContractSupplyProductDto,
    IContractSupplyUpdateDto,
    IProductFromSup
} from "src/types/contractSupplier";
import { addMoreSupProducts, editProductSupplierForm, updateSupplierContract, useGetSupplierContract } from "src/actions/contractSupplier";
import { useGetSuppliers } from "src/actions/suppliers";
import { ISuppliersItem } from "src/types/suppliers";
import { editAllContractDetails } from "./helper/mapContractProducts";
import { useAuthContext } from "src/auth/hooks";
import { mapProductFromOrderToItems } from "./helper/mapProductFromOrderToItems";

type ContractFormProps = {
    open: boolean;
    onClose: () => void;
    selectedContract: IContractSupplyItem | null;
    CopiedContract: IContractSupplyItem | null;
    customerIdFromQuotation?: number | null;
    detailsFromQuotation: any[];
    mutation: () => void;
};

export function ContractForm({
    open,
    onClose,
    selectedContract,
    CopiedContract,
    detailsFromQuotation,
    customerIdFromQuotation,
    mutation: listMutate }: ContractFormProps) {
    const contractId = selectedContract?.id ?? CopiedContract?.id ?? 0;
    const today = new Date();
    const { user } = useAuthContext();
    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);
    const [totalPaid, setTotalPaid] = useState(0);
    const [originalItems, setOriginalItems] = useState<IContractDetailDto[]>([]);

    const { contract: CurrentContract, contractLoading, mutation: detailMutate } = useGetSupplierContract({
        contractId: contractId,
        pageNumber: 1,
        pageSize: 999,
        options: { enabled: !!selectedContract?.id }
    });

    const { suppliers, suppliersLoading, pagination: SupplierRecords } = useGetSuppliers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: true
    });

    const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);

    const [contractProductDetail, setContractProductDetail] = useState<IContractSupplyForDetail[]>();

    const [selectedSupplier, setSelectedSupplier] = useState<ISuppliersItem | null>(null);

    const defaultValues: ContractFormValues = {
        contractNo: generateContractNo('NCC'),
        supplierId: 0,
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
            id: undefined,
            product: "",
            unit: "",
            unitName: "",
            qty: 1,
            price: 0,
            vat: 0
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products",
    });

    const onSubmit = handleSubmit(async (data: ContractFormValues) => {
        try {
            const basePayload: IContractSupplyUpdateDto = {
                supplierId: data.supplierId,
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
                seller: user?.token,
                discount: data.discount
            };

            const updateQuantityProduct = data.products
                .filter((item) => item.product && item.product !== "")
                .map((item, i): IContractSupplyProductDto => ({
                    productID: Number(item.product),
                    quantity: item.qty ?? 0,
                    imported: item.qty ?? 0,
                    unit: item.unitName || "",
                    price: item.price || 0
                }));

            const updatePayload: IContractSupplyUpdateDto = {
                ...basePayload,
            };

            const products = data.products
                .filter((item) => item.product && item.product !== "")
                .map((item, i): IContractSupDetailDto => ({
                    productID: item.product ?? "",
                    quantity: item.qty ?? 0,
                    imported: item.qty || 0
                }));

            const productPayload: IProductFromSup[] = data.products
                .map((item) => ({
                    rowId: item.id,
                    productId: Number(item.product),
                    price: item.price || 0,
                    quantity: item.qty || 0,
                    imported: item.qty || 0,
                    vat: item.vat || 0,
                    unit: item.unitName ?? "",
                }));

            if (!selectedContract?.id) {
                toast.warning('Cập nhật dữ liệu thất bại!');
                toast.warning('Không tìm thấy dữ liệu chi tiết của hợp đồng để cập nhật!');
                return;
            }

            await updateSupplierContract(selectedContract?.id, updatePayload);

            if (selectedContract) {
                if (!productPayload) return;

                for (const item of productPayload) {
                    await editProductSupplierForm(item.rowId, item);
                }

                const newItems = products.filter(
                    (item) => !originalItems.some((o) => o.productID === item.productID)
                );

                if (newItems.length > 0) {
                    await addMoreSupProducts(selectedContract.id, newItems);
                }
                else {
                    await editAllContractDetails(updateQuantityProduct, selectedContract.id);
                }
            } else {
                toast.warning("Đã có lỗi xảy ra trong quá trình cập nhật sản phẩm!");
                return;
            }

            toast.success("Dữ liệu hợp đồng đã được thay đổi!");

            listMutate();

            if (selectedContract.id) {
                detailMutate();
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

    const products = useWatch({
        control,
        name: "products",
    }) || [];

    const downPayment = useWatch({
        control,
        name: "downPayment"
    });

    const nextPayment = useWatch({
        control,
        name: "nextPayment"
    });

    const supplierId = methods.watch('supplierId');

    const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
        const qty = item?.qty || 0;
        const price = item?.price || 0;
        const vat = item?.vat || 0;
        return qty * price * (1 + vat / 100);
    };

    const total = Math.round((products || []).reduce((acc, i) => acc + calcAmount(i), 0));

    // useEffect(() => {
    //     if (total > 0) {
    //         const down = downPayment || 0;
    //         const next = nextPayment || 0;

    //         // Nếu cả 2 ô đều đang rỗng -> tính mặc định theo % 30/40/30
    //         if (!down && !next) {
    //             const downDefault = Math.round(total * 0.3);
    //             const nextDefault = Math.round(total * 0.4);
    //             const lastDefault = Math.max(total - downDefault - nextDefault, 0);

    //             setValue("downPayment", downDefault, { shouldValidate: true });
    //             setValue("nextPayment", nextDefault, { shouldValidate: true });
    //             setValue("lastPayment", lastDefault, { shouldValidate: true });
    //             clearErrors(["downPayment", "nextPayment"]);
    //             return;
    //         }

    //         // Nếu người dùng đã nhập (khác mặc định) cộng lại lớn hơn total thì auto tính lại theo % 30/40/30
    //         if (down + next > total) {
    //             setError("downPayment", {
    //                 type: "manual",
    //                 message: "Tổng tiền trả trước và trả sau không được vượt quá tổng tiền hợp đồng",
    //             });
    //             setError("nextPayment", {
    //                 type: "manual",
    //                 message: "Tổng tiền trả trước và trả sau không được vượt quá tổng tiền hợp đồng",
    //             });
    //         } else {
    //             clearErrors(["downPayment", "nextPayment"]);
    //             const last = Math.max(total - down - next, 0);
    //             const formattedLast = last;
    //             const formattedTotal = total;
    //             if (formattedLast < formattedTotal) {
    //                 setValue("lastPayment", formattedLast, { shouldValidate: true });
    //             }
    //         }
    //     }
    // }, [total, downPayment, nextPayment, setError, clearErrors, setValue]);

    useEffect(() => {
        if (total > 0) {
            const down = Number(downPayment) || 0;
            const next = Number(nextPayment) || 0;

            if (!down && !next) {
                const downDefault = Math.floor(total / 2);
                const nextDefault = total - downDefault; // Đảm bảo tổng chính xác
                const lastDefault = Math.max(total - downDefault - nextDefault, 0);

                setValue("downPayment", downDefault, { shouldValidate: true });
                setValue("nextPayment", nextDefault, { shouldValidate: true });
                setValue("lastPayment", lastDefault, { shouldValidate: true });
                clearErrors(["downPayment", "nextPayment"]);
                return;
            }

            const currentTotal = down + next;
            const isEvenSplit = Math.abs(down - next) <= 1 && currentTotal > 0;

            if (isEvenSplit && currentTotal !== total) {
                const downDefault = Math.floor(total / 2);
                const nextDefault = total - downDefault;

                const isStillEven = Math.abs(downDefault - nextDefault) <= 1;

                if (isStillEven) {
                    const lastDefault = Math.max(total - downDefault - nextDefault, 0);

                    setValue("downPayment", downDefault, { shouldValidate: true });
                    setValue("nextPayment", nextDefault, { shouldValidate: true });
                    setValue("lastPayment", lastDefault, { shouldValidate: true });
                } else {
                    // Chia không đều -> dùng tỷ lệ 30/40/30
                    const downDefault30 = Math.round(total * 0.3);
                    const nextDefault40 = Math.round(total * 0.4);
                    const lastDefault30 = Math.max(total - downDefault30 - nextDefault40, 0);

                    setValue("downPayment", downDefault30, { shouldValidate: true });
                    setValue("nextPayment", nextDefault40, { shouldValidate: true });
                    setValue("lastPayment", lastDefault30, { shouldValidate: true });
                }

                clearErrors(["downPayment", "nextPayment"]);
                return;
            }

            if (down + next > total) {
                setError("downPayment", {
                    type: "manual",
                    message: "Tổng tiền trả trước và trả sau không được vượt quá tổng tiền hợp đồng",
                });
                setError("nextPayment", {
                    type: "manual",
                    message: "Tổng tiền trả trước và trả sau không được vượt quá tổng tiền hợp đồng",
                });
                setValue("lastPayment", 0, { shouldValidate: true });
            } else {
                clearErrors(["downPayment", "nextPayment"]);

                const lastDefault = Math.max(total - down - next, 0);
                setValue("lastPayment", lastDefault, { shouldValidate: true });
            }
        }
    }, [total, downPayment, nextPayment, setError, clearErrors, setValue]);

    useEffect(() => {
        if (CopiedContract) {
            if (!CurrentContract) return;
            const currentDetails = CurrentContract.items.filter(
                (c) => c.contractSupID === CopiedContract.id
            );

            setContractProductDetail(currentDetails);

            const mappedItems = mapProductsToItems(currentDetails || []);

            methods.reset({
                supplierId: CopiedContract.supplierId,
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
        }

        if (detailsFromQuotation?.length > 0 && customerIdFromQuotation) {
            const mapped = mapProductFromOrderToItems(detailsFromQuotation);
            methods.setValue("products", mapped);
            methods.setValue("supplierId", customerIdFromQuotation);
            return;
        }

        if (!selectedContract) {
            methods.reset(defaultValues);
            setOriginalItems(
                defaultValues.products.map((item, i) => ({
                    productID: item.product ?? "",
                    quantity: item.qty ?? 0,
                    unit: item.unitName || "",
                    price: item.price || 0
                }))
            );
            return;
        }

        if (!CurrentContract) return;

        const currentDetails = CurrentContract.items.filter(
            (q) => q.contractSupID === selectedContract.id
        );

        if (currentDetails) {
            setContractProductDetail(currentDetails);
        }

        const mappedItems = mapProductsToItems(CurrentContract.items || []);
        methods.setValue("supplierId", selectedContract.supplierId ?? 0);
        methods.setValue("contractNo", selectedContract.contractNo);
        methods.setValue("signatureDate", selectedContract.signatureDate ?? null);
        methods.setValue("createDate", selectedContract.createDate ?? null);
        methods.setValue("deliveryAddress", selectedContract.deliveryAddress ?? '');
        methods.setValue("deliveryTime", selectedContract.deliveryTime ?? null);
        methods.setValue("downPayment", selectedContract.downPayment);
        methods.setValue("nextPayment", selectedContract.nextPayment);
        methods.setValue("lastPayment", selectedContract.lastPayment);
        methods.setValue("copiesNo", selectedContract.copiesNo);
        methods.setValue("keptNo", selectedContract.keptNo);
        methods.setValue("status", selectedContract.status ?? 1);
        methods.setValue("products", mappedItems);
        methods.setValue("note", selectedContract.note ?? "");
        methods.setValue("discount", selectedContract.discount);

        setOriginalItems(
            mappedItems.map((item, i) => ({
                productID: item.product ?? "",
                quantity: item.qty ?? 0,
                unit: item.unitName || "",
                price: item.price || 0
            }))
        );

    }, [detailsFromQuotation, selectedContract, CurrentContract, methods.reset]);

    useEffect(() => {
        if (!supplierId || supplierId === 0) {
            setSelectedSupplier(null);
            return;
        }
        const found = suppliers.find((cus) => Number(cus.id) === Number(supplierId));
        if (found) {
            setSelectedSupplier(found);
        }
    }, [supplierId, suppliers]);

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
                sx={{ flex: 1, whiteSpace: 'nowrap', px: 3 }}
                disabled={isCreatingSupplier}
                loading={isSubmitting}
            >
                {selectedContract ? `Lưu hợp đồng` : 'Tạo hợp đồng'}
            </Button>
        </Box>
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
            {/* Section Bảng sản phẩm */}
            <ContractItemsTable
                idContract={selectedContract?.id}
                contractProductDetail={contractProductDetail}
                methods={methods}
                fields={fields}
                append={append}
                remove={remove}
                setPaid={setTotalPaid}
                listMutate={listMutate}
                detailMutate={detailMutate}
            />
        </Stack>
    );

    const renderLeftColumn = () => (
        <Stack width={{ xs: "100%", sm: "100%", md: "100%", lg: "30%" }} spacing={3}>
            {/* Section Thông tin nhà cung cấp */}
            <Box>
                <Stack direction={{ xs: "column", md: "column", lg: "column", xl: "row" }} gap={2} justifyContent="space-between">
                    <Typography variant="subtitle2">Thông tin nhà cung cấp</Typography>
                    <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                        <Field.Autocomplete
                            name="supplierId"
                            label={`Chọn nhà cung cấp`}
                            options={suppliers}
                            loading={suppliersLoading}
                            getOptionLabel={(opt) =>
                                opt?.companyName ?
                                    opt.companyName : ''}
                            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                            onInputChange={(_, value) => setCustomerKeyword(value)}
                            value={selectedSupplier}
                            fullWidth
                            onChange={(_, newValue) => {
                                methods.setValue('supplierId', newValue?.id ?? 0, { shouldValidate: true });
                                setCustomerKeyword(newValue?.companyName ?? '');
                            }}
                            noOptionsText="Không có dữ liệu"
                            sx={{ flex: 1, minWidth: 200 }}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.companyName ? option.companyName : ""}
                                </li>
                            )}
                        />
                        {/* <Stack direction="row">
                            <Tooltip title="Tạo nhà cung cấp mới">
                                <IconButton
                                    color="inherit"
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'transparent'
                                        },
                                    }}
                                    onClick={() => setIsCreatingSupplier(true)}
                                >
                                    <Iconify
                                        icon="line-md:person-add"
                                    />
                                </IconButton>
                            </Tooltip>
                        </Stack> */}
                    </Stack>
                </Stack>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Stack direction="row" gap={2}>
                        <DetailItem label="Tên nhà cung cấp" value={selectedSupplier?.name ?? ""} />
                        <DetailItem label="Tên công ty" value={selectedSupplier?.companyName ?? ""} />
                    </Stack>
                    <Stack direction="row" gap={2}>
                        <DetailItem label="Email nhà cung cấp" value={selectedSupplier?.email ?? ""} />
                        <DetailItem label="Số điện thoại" value={selectedSupplier?.phone ?? ""} />
                    </Stack>
                </Stack>
            </Box>

            {/* Section Thông tin hợp đồng */}
            <Box>
                <Typography variant="subtitle2">
                    Thông tin hợp đồng
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.Text
                        label="Số hợp đồng"
                        name="contractNo"
                        disabled={!!selectedContract}
                    />
                    <Field.Select label="Trạng thái" name="status">
                        <MenuItem key={0} value={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Hủy bỏ</span>
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
                                <span>Chờ duyệt</span>
                                <Iconify icon="streamline-pixel:interface-essential-waiting-hourglass-loading" />
                            </Box>
                        </MenuItem>
                        <MenuItem key={3} value={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Đang thực hiện</span>
                                <Iconify icon="line-md:uploading-loop" />
                            </Box>
                        </MenuItem>
                        <MenuItem key={4} value={4}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                                <span>Đã hoàn thành</span>
                                <Iconify icon="fluent-color:checkmark-circle-16" />
                            </Box>
                        </MenuItem>
                    </Field.Select>
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.DatePicker name="createDate" label="Ngày tạo" />
                    <Field.DatePicker name="signatureDate" label="Ngày ký" />
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.Text
                        size="small"
                        label="Số bản sao"
                        name="copiesNo"
                        type="number"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Field.Text
                        size="small"
                        label="Số bản lưu lại"
                        name="keptNo"
                        type="number"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
                    <Field.DatePicker name="deliveryTime" label="Ngày giao hàng" />
                    <Field.Text name="deliveryAddress" label="Địa chỉ giao hàng" />
                </Stack>
                <Box mt={2}>
                    <Typography variant="subtitle2">
                        Thông tin thanh toán
                    </Typography>
                    <Stack direction="row" spacing={2} my={2}>
                        <Field.VNCurrencyInput
                            label="Lần 1"
                            name="downPayment"
                            sx={{ maxWidth: 150 }}
                        />
                        <Field.VNCurrencyInput
                            label="Lần 2"
                            name="nextPayment"
                            sx={{ maxWidth: 150 }}
                        />
                        <Field.VNCurrencyInput
                            label="Còn lại"
                            name="lastPayment"
                            sx={{
                                maxWidth: 150,
                                display: 'none'
                            }}
                            disabled
                        />
                    </Stack>
                </Box>
                <Field.Text
                    name="note"
                    label="Ghi chú"
                    multiline
                    fullWidth
                    minRows={5}
                    sx={{ pb: 2 }}
                />
            </Box>
        </Stack>
    );

    return (
        <Dialog
            open={open}
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
                    {selectedContract ? `Chỉnh sửa - ${selectedContract.contractNo}` : 'Tạo hợp đồng'}
                    {renderActions()}
                </DialogTitle>
                <DialogContent
                    sx={{
                        pb: 0,
                        pt: '10px !important',
                        overflowY: { xs: "auto", sm: "auto", md: "auto", lg: "auto", xl: "hidden" },
                    }}
                >
                    {contractLoading ? renderSkeleton() : renderDetails()}
                </DialogContent>
            </Form>
        </Dialog>
    );
}