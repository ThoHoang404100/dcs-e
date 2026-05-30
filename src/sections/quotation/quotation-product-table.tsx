import { UseFieldArrayRemove, UseFormReturn, useWatch } from "react-hook-form";
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
import { fCurrency } from "src/utils/format-number";
import { Iconify } from "src/components/iconify";
import { useGetProducts } from "src/actions/product";
import { QuotationFormValues } from "./schema/quotation-schema";
import { useGetUnits } from "src/actions/unit";
import { toast } from "sonner";
import { deleteProductSelected } from "src/actions/quotation";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { IQuotationDetails } from "src/types/quotation";
import { ProductQuickNewForm } from "./ProductQuickNewForm";
import { ProductItem } from "src/types/product";
import axiosInstance from "src/lib/axios";

type QuotationItemsTableProps = {
    idQuotation: number | undefined;
    quotationProductDetail: IQuotationDetails | undefined;
    methods: UseFormReturn<QuotationFormValues>;
    fields: any[];
    remove: UseFieldArrayRemove;
    append: (value: any) => void;
    setPaid: (value: number) => void;
    setGrandTotal: (value: number) => void;
    defaultSettings: { quotationVat: number; quotationQuantity: number };
};

export function QuotationItemsTable({
    idQuotation,
    quotationProductDetail,
    methods,
    fields,
    remove,
    append,
    setPaid,
    setGrandTotal,
    defaultSettings,           // ← Dùng props này
}: QuotationItemsTableProps) {

    // ==================== WATCH ITEMS ====================
    const items = useWatch({
        control: methods.control,
        name: "items",
    }) as QuotationFormValues["items"];

    const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
        const qty = Number(item?.qty) || 0;
        const price = Number(item?.price) || 0;
        let vat = Number(item?.vat) || 0;
        if (vat === -1) vat = 0;

        return Math.round(qty * price * (1 + vat / 100));
    };

    const totalAmount = useMemo(() => {
        return (items || []).reduce((acc, item) => acc + calcAmount(item), 0);
    }, [items]);

    useEffect(() => {
        setGrandTotal(totalAmount);
        setPaid(totalAmount);
    }, [totalAmount, setGrandTotal, setPaid]);

    // ==================== THÊM SẢN PHẨM MỚI ====================
    const handleAddProduct = () => {
        append({
            product: "",
            unit: "",
            unitName: "",
            qty: defaultSettings.quotationQuantity,
            price: 0,
            vat: defaultSettings.quotationVat,
        });
    };

    const handleDeleteProduct = async (index: number) => {
        try {
            if (fields.length <= 1) {
                toast.warning("Phiếu báo giá phải có ít nhất 1 sản phẩm");
                return;
            }

            const item = methods.getValues(`items.${index}`);
            const prodId = Number(item.product);

            if (!idQuotation || !prodId || prodId === 0) {
                remove(index);
                return;
            }

            const isProductInDatabase = quotationProductDetail?.products?.some(
                (p) => Number(p.productID) === prodId
            );

            if (!isProductInDatabase) {
                remove(index);
                return;
            }

            await deleteProductSelected({
                productID: [prodId],
                quotationID: String(idQuotation),
            });

            remove(index);
            toast.success("Đã xóa sản phẩm");

            mutate((k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"));
            mutate(endpoints.quotation.detail(idQuotation, `?pageNumber=1&pageSize=999`));
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
                                    <ProductAutocomplete
                                        index={index}
                                        methods={methods}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Field.NumberInput name={`items.${index}.qty`} sx={{ width: 100 }} />
                                </TableCell>

                                <TableCell>
                                    <Field.VNCUrrenInputResizable name={`items.${index}.price`} sx={{ width: 120 }} />
                                </TableCell>

                                <TableCell>
                                    <UnitSelection index={index} methods={methods} />
                                </TableCell>

                                <TableCell>
                                    <Field.Select
                                        name={`items.${index}.vat`}
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
                                        <IconButton color="error" onClick={() => handleDeleteProduct(index)}>
                                            <Iconify icon="material-symbols:delete-outline" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                variant="outlined"
                startIcon={<Iconify icon="gridicons:add" />}
                onClick={handleAddProduct}
            >
                Thêm sản phẩm
            </Button>

            <Paper variant="outlined" sx={{ p: 2, ml: "auto", width: 350, borderRadius: 2 }}>
                {(() => {
                    const subTotal = (items || []).reduce((acc, item) => {
                        const qty = Number(item?.qty) || 0;
                        const price = Number(item?.price) || 0;
                        return acc + qty * price;
                    }, 0);

                    const totalVat = (items || []).reduce((acc, item) => {
                        const qty = Number(item?.qty) || 0;
                        const price = Number(item?.price) || 0;
                        let vat = Number(item?.vat) || 0;
                        if (vat === -1) vat = 0;
                        return acc + (qty * price * vat) / 100;
                    }, 0);

                    const totalPayment = subTotal + totalVat;

                    return (
                        <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Tổng tiền hàng</Typography>
                                <Typography fontWeight={600}>{fCurrency(subTotal)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Tiền VAT</Typography>
                                <Typography color="warning.main" fontWeight={600}>
                                    {fCurrency(totalVat)}
                                </Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight={700}>Tiền phải trả</Typography>
                                <Typography variant="h6" color="primary.main" fontWeight={700}>
                                    {fCurrency(totalPayment)}
                                </Typography>
                            </Stack>
                        </Stack>
                    );
                })()}
            </Paper>
        </Stack>
    );
}

// ==================== PRODUCT AUTOCOMPLETE & UNIT SELECTION ====================
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

    const currentProductId = methods.watch(`items.${index}.product`);

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

        methods.setValue(`items.${index}.product`, String(normalized.id), options);
        methods.setValue(`items.${index}.unit`, String(normalized.unitID || ""), options);
        methods.setValue(`items.${index}.unitName`, normalized.unit || "", options);
        methods.setValue(`items.${index}.price`, normalized.price, options);
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
                name={`items.${index}.product`}
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
                        methods.setValue(`items.${index}.product`, "");
                        methods.setValue(`items.${index}.unit`, "");
                        methods.setValue(`items.${index}.unitName`, "");
                        methods.setValue(`items.${index}.price`, 0);
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
        <Field.Select name={`items.${index}.unit`} size="small" fullWidth sx={{ width: 120 }}>
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