import { UseFormReturn, useWatch } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Divider,
} from "@mui/material";

import { Field } from "src/components/hook-form";
import { fCurrency, fRenderTextNumber } from "src/utils/format-number";
import { Iconify } from "src/components/iconify";
import { capitalizeFirstLetter } from "src/utils/format-string";
import { toast } from "sonner";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { deleteProductSelected } from "src/actions/contract";
import { ContractFormValues } from "./schema/contract-schema";
import { ContractItemsTableProps } from "./helper/ContractItemsTableProps";
import { useGetProducts } from "src/actions/product";
import { useGetUnits } from "src/actions/unit";
import axiosInstance from "src/lib/axios";
import { ProductItem } from "src/types/product";
import { ProductQuickNewForm } from "../../sections/quotation/ProductQuickNewForm";

type DefaultContractSettings = {
    contractQuantity: number;
    contractVat: number;
};

export function ContractItemsTable({
    idContract,
    contractProductDetail,
    methods,
    fields,
    remove,
    append,
    setPaid,
    isCreateSupplierContract,
    defaultSettings = { contractQuantity: 1, contractVat: 0 },
}: ContractItemsTableProps & { defaultSettings?: DefaultContractSettings }) {

    const items = useWatch({
        control: methods.control,
        name: "products",
    }) as ContractFormValues["products"];

    const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
        const qty = Number(item?.qty) || 0;
        const price = Number(item?.price) || 0;
        let vat = Number(item?.vat) || 0;
        if (vat === 255) vat = 0;

        return Math.round(qty * price * (1 + vat / 100));
    };

    const totalAmount = useMemo(() => {
        return (items || []).reduce((acc, item) => acc + calcAmount(item), 0);
    }, [items]);

    const subTotal = useMemo(() => {
        return (items || []).reduce((acc, item) => {
            const qty = Number(item?.qty) || 0;
            const price = Number(item?.price) || 0;
            return acc + qty * price;
        }, 0);
    }, [items]);

    const totalVat = useMemo(() => {
        return (items || []).reduce((acc, item) => {
            const qty = Number(item?.qty) || 0;
            const price = Number(item?.price) || 0;
            let vat = Number(item?.vat) || 0;
            if (vat === 255) vat = 0;
            return acc + (qty * price * vat) / 100;
        }, 0);
    }, [items]);

    useEffect(() => {
        setPaid(totalAmount);
    }, [totalAmount, setPaid]);

    const handleAddProduct = () => {
        append({
            product: "",
            unit: "",
            unitName: "",
            qty: defaultSettings.contractQuantity,
            price: 0,
            vat: defaultSettings.contractVat,
        });
        console.log("Default Settings loaded:", JSON.stringify(defaultSettings));
    };



    const handleDeleteProduct = async (index: number) => {
        try {
            if (fields.length <= 1) {
                toast.warning("Phiếu hợp đồng phải có ít nhất 1 sản phẩm");
                return;
            }

            const item = methods.getValues(`products.${index}`);
            const prodId = String(item.product || item.id);

            if (!idContract || !prodId || prodId === "0") {
                remove(index);
                return;
            }

            const isProductInDatabase = contractProductDetail?.products?.some(
                (p) => String(p.productID) === prodId
            );

            if (!isProductInDatabase) {
                remove(index);
                return;
            }

            await deleteProductSelected({
                productID: prodId,
                contractId: String(idContract),
            });

            remove(index);
            toast.success("Đã xóa sản phẩm");

            mutate((k) => typeof k === "string" && k.startsWith("/api/v1/contracts/contracts"));
            mutate(endpoints.contract.detail(`?pageNumber=1&pageSize=999&ContractId=${idContract}`));
        } catch (error: any) {
            console.error(error);
            toast.error("Đã có lỗi xảy ra khi xóa sản phẩm!");
        }
    };

    return (
        <Stack spacing={2}>
            <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto" }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell width={50}>STT</TableCell>
                            <TableCell>Tên sản phẩm</TableCell>
                            <TableCell width={130}>Số lượng</TableCell>
                            <TableCell width={150}>Đơn giá</TableCell>
                            <TableCell width={150}>Đơn vị tính</TableCell>
                            <TableCell width={140}>VAT</TableCell>
                            <TableCell width={180}>Thành tiền</TableCell>
                            <TableCell width={80}></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id} hover>
                                <TableCell>{index + 1}</TableCell>

                                <TableCell>
                                    <ProductAutocomplete index={index} methods={methods} />
                                </TableCell>

                                <TableCell>
                                    <Field.NumberInput
                                        name={`products.${index}.qty`}
                                        sx={{ width: 100 }}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Field.VNCUrrenInputResizable
                                        name={`products.${index}.price`}
                                        sx={{ width: 120 }}
                                    />
                                </TableCell>

                                <TableCell>
                                    <UnitSelection index={index} methods={methods} />
                                </TableCell>

                                <TableCell>
                                    <Field.Select
                                        name={`products.${index}.vat`}
                                        size="small"
                                        fullWidth
                                        sx={{ width: 140 }}
                                    >
                                        <MenuItem value={255}>Không chịu thuế</MenuItem>
                                        {Array.from({ length: 101 }, (_, i) => (
                                            <MenuItem key={i} value={i}>
                                                {i}%
                                            </MenuItem>
                                        ))}
                                    </Field.Select>
                                </TableCell>

                                <TableCell>
                                    <Typography fontWeight={700} color="primary.main">
                                        {fCurrency(calcAmount(items?.[index]))}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Tooltip title="Xóa sản phẩm">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteProduct(index)}
                                        >
                                            <Iconify icon="material-symbols:delete-outline" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack
                direction="row"
                pt={2}
                sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    mb: 2
                }}
            >
                <Button
                    variant="outlined"
                    startIcon={<Iconify icon="gridicons:add" />}
                    onClick={handleAddProduct}
                >
                    Thêm sản phẩm
                </Button>
            </Stack>
        </Stack>
    );
}

function ProductAutocomplete({
    index,
    methods,
}: {
    index: number;
    methods: UseFormReturn<any>;
}) {
    const [inputValue, setInputValue] = useState("");
    const [openQuickForm, setOpenQuickForm] = useState(false);
    const [defaultName, setDefaultName] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

    const {
        products = [],
        productsLoading,
        mutation: mutateProducts,
    } = useGetProducts({
        pageNumber: 1,
        pageSize: 999,
        key: "",
    });

    const currentProductId = methods.watch(`products.${index}.product`);

    useEffect(() => {
        if (currentProductId && products.length > 0) {
            const found = products.find(
                (p) => String(p.id ?? (p as any).productID) === String(currentProductId)
            );
            if (found) setSelectedProduct(found);
        }
    }, [currentProductId, products]);

    const combinedOptions = useMemo(() => {
        const list = [...products];
        if (selectedProduct) {
            const exists = list.some(
                (p) => String(p.id ?? (p as any).productID) === String(selectedProduct.id ?? (selectedProduct as any).productID)
            );
            if (!exists) list.unshift(selectedProduct);
        }
        return list;
    }, [products, selectedProduct]);

    const currentProduct = useMemo(() => {
        if (!currentProductId) return null;
        return combinedOptions.find(
            (p) => String(p.id ?? (p as any).productID) === String(currentProductId)
        ) || null;
    }, [combinedOptions, currentProductId]);

    useEffect(() => {
        if (currentProduct?.name) {
            setInputValue(currentProduct.name);
        }
    }, [currentProduct]);

    const updateFormValues = (product: any) => {
        if (!product) return;

        const normalized: ProductItem = {
            ...product,
            id: product.id ?? product.productID,
            unitID: product.unitID ?? product.unitId,
            unit: product.unit ?? product.unitName,
            price: product.price ?? 0,
            name: product.name ?? product.productName ?? "",
        };

        setSelectedProduct(normalized);

        const options = { shouldValidate: true, shouldDirty: true, shouldTouch: true };

        methods.setValue(`products.${index}.product`, String(normalized.id), options);
        methods.setValue(`products.${index}.unit`, String(normalized.unitID || ""), options);
        methods.setValue(`products.${index}.unitName`, normalized.unit || "", options);
        methods.setValue(`products.${index}.price`, normalized.price, options);
    };

    const handleAddDefaultProduct = async () => {
        if (!inputValue.trim()) return;
        try {
            const response = await axiosInstance.post(
                `/api/v1/products/create-default?productName=${encodeURIComponent(inputValue.trim())}`
            );
            if (response.data.statusCode === 200 || response.status === 200) {
                toast.success("Tạo sản phẩm thành công");
                const newProduct = response.data.data || response.data;
                await mutateProducts?.();
                if (newProduct) updateFormValues(newProduct);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Tạo sản phẩm thất bại");
        }
    };

    return (
        <Stack spacing={0.5}>
            <Field.Autocomplete
                name={`products.${index}.product`}
                options={combinedOptions}
                loading={productsLoading}
                freeSolo
                value={currentProduct}
                inputValue={inputValue}
                fullWidth
                size="small"
                placeholder="Nhập hoặc chọn sản phẩm"
                getOptionLabel={(opt: any) =>
                    typeof opt === "string" ? opt : opt?.name ?? opt?.productName ?? ""
                }
                isOptionEqualToValue={(option: any, value: any) => {
                    const optionId = option?.id ?? option?.productID;
                    const valueId = value?.id ?? value?.productID ?? value;
                    return String(optionId) === String(valueId);
                }}
                onInputChange={(_, value) => setInputValue(value || "")}
                onChange={(_, value: any) => {
                    if (value && typeof value === "object") {
                        updateFormValues(value);
                    }
                    if (!value) {
                        setSelectedProduct(null);
                        methods.setValue(`products.${index}.product`, "");
                        methods.setValue(`products.${index}.unit`, "");
                        methods.setValue(`products.${index}.unitName`, "");
                        methods.setValue(`products.${index}.price`, 0);
                        setInputValue("");
                    }
                }}
            />

            {inputValue.length > 1 &&
                !combinedOptions.some((p) =>
                    (p.name || "").toLowerCase().includes(inputValue.toLowerCase())
                ) && (
                    <Box sx={{ pl: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="caption" color="error">Sản phẩm chưa tồn tại</Typography>
                        <Button size="small" variant="text" onClick={() => { setDefaultName(inputValue); setOpenQuickForm(true); }}>
                            Thêm mới ngay
                        </Button>
                        <Button size="small" variant="text" color="secondary" onClick={handleAddDefaultProduct}>
                            Thêm SP mặc định
                        </Button>
                    </Box>
                )}

            <ProductQuickNewForm
                open={openQuickForm}
                onClose={() => { setOpenQuickForm(false); setDefaultName(""); }}
                defaultName={defaultName}
                onSuccess={async (newProduct?: ProductItem) => {
                    setOpenQuickForm(false);
                    if (newProduct) {
                        await mutateProducts?.();
                        updateFormValues(newProduct);
                    }
                    setDefaultName("");
                }}
            />
        </Stack>
    );
}

function UnitSelection({
    index,
    methods,
}: {
    index: number;
    methods: UseFormReturn<any>;
}) {
    const { units = [], unitsLoading } = useGetUnits({ pageNumber: 1, pageSize: 999 });

    return (
        <Field.Select name={`products.${index}.unit`} size="small" fullWidth sx={{ width: 120 }}>
            {unitsLoading ? (
                <MenuItem disabled>Đang tải...</MenuItem>
            ) : (
                units.map((u) => (
                    <MenuItem key={u.id} value={String(u.id)}>
                        {u.name}
                    </MenuItem>
                ))
            )}
        </Field.Select>
    );
}