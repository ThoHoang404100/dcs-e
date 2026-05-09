// import { UseFieldArrayRemove, UseFormReturn, useWatch } from "react-hook-form";
// import { useEffect, useState, useMemo } from "react";
// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
// import { Field } from "src/components/hook-form";
// import { fCurrency, fRenderTextNumber } from "src/utils/format-number";
// import { Iconify } from "src/components/iconify";
// import { useGetProducts } from "src/actions/product";
// import { QuotationFormValues } from "./schema/quotation-schema";
// import { useGetUnits } from "src/actions/unit";
// import { capitalizeFirstLetter } from "src/utils/format-string";
// import { toast } from "sonner";
// import { deleteProductSelected } from "src/actions/quotation";
// import { useBoolean } from "minimal-shared/hooks";
// import { mutate } from "swr";
// import { endpoints } from "src/lib/axios";
// import { IQuotationDetails } from "src/types/quotation";
// import { ProductQuickNewForm } from "./ProductQuickNewForm";
// import { ProductItem } from "src/types/product";

// type QuotationItemsTableProps = {
//     idQuotation: number | undefined;
//     quotationProductDetail: IQuotationDetails | undefined;
//     methods: UseFormReturn<QuotationFormValues>;
//     fields: any[];
//     remove: UseFieldArrayRemove;
//     append: (value: any) => void;
//     setPaid: (value: any) => void;
// };

// export function QuotationItemsTable({
//     idQuotation,
//     quotationProductDetail,
//     methods,
//     fields,
//     remove,
//     append,
//     setPaid
// }: QuotationItemsTableProps) {
//     const items = useWatch({
//         control: methods.control,
//         name: "items",
//     }) as QuotationFormValues["items"];

//     const discount = useWatch({
//         control: methods.control,
//         name: "discount",
//     }) as number | undefined;

//     const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
//         const qty = Number(item?.qty) || 0;
//         const price = Number(item?.price) || 0;
//         const vat = Number(item?.vat) || 0;
//         return Math.round(qty * price * (1 + vat / 100));
//     };

//     const total = (items || []).reduce((acc, i) => acc + calcAmount(i), 0);
//     const roundedTotal = Math.round(total);

//     const openDel = useBoolean();
//     const [indexField, setIndexField] = useState(0);
//     const [productIDSelected, setProductIDSelected] = useState<number[]>([]);

//     useEffect(() => {
//         setPaid(roundedTotal);
//     }, [roundedTotal, setPaid]);

//     const deleteEachProduct = async () => {
//         try {
//             if (!idQuotation) return;
//             if (fields.length <= 1) {
//                 toast.warning("Phiếu báo giá phải có ít nhất 1 sản phẩm");
//                 openDel.onFalse();
//                 return;
//             }

//             await deleteProductSelected({
//                 productID: productIDSelected,
//                 quotationID: String(idQuotation)
//             });
//             remove(indexField);
//             toast.success("Đã xóa sản phẩm");
//             openDel.onFalse();

//             mutate((k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"));
//             mutate(endpoints.quotation.detail(idQuotation, `?pageNumber=1&pageSize=999`));
//         } catch (error: any) {
//             toast.error(error.message || "Đã có lỗi xảy ra!");
//         }
//     };

//     const confirmDeleteUpdateProduct = () => (
//         <Dialog open={openDel.value} onClose={openDel.onFalse} maxWidth="sm" fullWidth>
//             <DialogTitle>Xác nhận xóa sản phẩm?</DialogTitle>
//             <DialogContent>
//                 <Stack direction="row" spacing={1} alignItems="center">
//                     <Iconify icon="gridicons:notice" color="#4dd217" />
//                     <Stack>
//                         <Typography variant="body2" color="warning">- Sản phẩm sẽ bị xóa khỏi phiếu báo giá này</Typography>
//                         <Typography variant="overline" color="error">- Không thể hoàn tác</Typography>
//                     </Stack>
//                 </Stack>
//             </DialogContent>
//             <DialogActions>
//                 <Stack direction="row" spacing={2} width="100%">
//                     <Button variant="outlined" onClick={openDel.onFalse} fullWidth>Hủy</Button>
//                     <Button variant="contained" color="error" onClick={deleteEachProduct} fullWidth>Xóa</Button>
//                 </Stack>
//             </DialogActions>
//         </Dialog>
//     );

//     return (
//         <>
//             <Stack spacing={2}>
//                 <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto" }}>
//                     <Table size="small" stickyHeader>
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell width={50}>STT</TableCell>
//                                 <TableCell>Tên SP</TableCell>
//                                 <TableCell width={150}>Số lượng</TableCell>
//                                 <TableCell width={150}>Đơn giá</TableCell>
//                                 <TableCell width={150}>Đơn vị tính</TableCell>
//                                 <TableCell width={100}>VAT</TableCell>
//                                 <TableCell width={150}>Thành tiền</TableCell>
//                                 <TableCell width={80}></TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {fields.map((field, index) => (
//                                 <TableRow key={field.id}>
//                                     <TableCell>{index + 1}</TableCell>
//                                     <TableCell>
//                                         <ProductAutocomplete index={index} methods={methods} append={append} />
//                                     </TableCell>
//                                     <TableCell>
//                                         <Field.NumberInput name={`items.${index}.qty`} sx={{ width: 100 }} />
//                                     </TableCell>
//                                     <TableCell>
//                                         <Field.VNCUrrenInputResizable name={`items.${index}.price`} sx={{ width: 100 }} />
//                                     </TableCell>
//                                     <TableCell>
//                                         <UnitSelection index={index} methods={methods} />
//                                     </TableCell>
//                                     <TableCell>
//                                         <Typography variant="body2">
//                                             {items?.[index]?.vat != null ? `${items[index].vat}%` : ""}
//                                         </Typography>
//                                     </TableCell>
//                                     <TableCell>
//                                         <Typography fontWeight="bold">
//                                             {fCurrency(calcAmount(items[index]))}
//                                         </Typography>
//                                     </TableCell>
//                                     <TableCell>
//                                         <Tooltip title="Xóa" arrow>
//                                             <IconButton 
//                                                 color="error"
//                                                 onClick={() => {
//                                                     if (idQuotation) {
//                                                         const prodId = Number(methods.getValues(`items.${index}.product`));
//                                                         const exists = quotationProductDetail?.products?.some(
//                                                             p => Number(p.productID) === prodId
//                                                         );
//                                                         if (exists) {
//                                                             setProductIDSelected([prodId]);
//                                                             setIndexField(index);
//                                                             openDel.onTrue();
//                                                         } else {
//                                                             remove(index);
//                                                         }
//                                                     } else {
//                                                         remove(index);
//                                                     }
//                                                 }}
//                                             >
//                                                 <Iconify icon="material-symbols:scan-delete-outline-sharp" />
//                                             </IconButton>
//                                         </Tooltip>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>

//                 <Button
//                     variant="outlined"
//                     startIcon={<Iconify icon="gridicons:add" />}
//                     onClick={() => append({ product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 })}
//                 >
//                     Thêm sản phẩm
//                 </Button>
//             </Stack>

//             {confirmDeleteUpdateProduct()}
//         </>
//     );
// }

// // ==================== PRODUCT AUTOCOMPLETE - FIXED ====================
// function ProductAutocomplete({
//     index,
//     methods,
//     append,
// }: {
//     index: number;
//     methods: UseFormReturn<any>;
//     append: (value: any) => void;
// }) {
//     const [inputValue, setInputValue] = useState("");
//     const [openQuickForm, setOpenQuickForm] = useState(false);
//     const [defaultName, setDefaultName] = useState("");

//     const {
//         products = [],
//         productsLoading,
//         mutation: mutateProducts,
//     } = useGetProducts({
//         pageNumber: 1,
//         pageSize: 999,
//         key: inputValue,
//     });

//     const currentProductId = methods.watch(`items.${index}.product`);

//     const currentProduct = useMemo(() => {
//         if (!currentProductId) return null;
//         return products.find((p) => String(p.id) === String(currentProductId)) || null;
//     }, [products, currentProductId]);

//     // Fix hiển thị tên sản phẩm khi load/edit
//     useEffect(() => {
//         if (currentProduct?.name) {
//             setInputValue(currentProduct.name);
//         }
//     }, [currentProduct]);

//     const updateFormValues = (product: ProductItem) => {
//         methods.setValue(`items.${index}.product`, String(product.id), { shouldValidate: true });
//         methods.setValue(`items.${index}.unit`, String(product.unitID || ""));
//         methods.setValue(`items.${index}.unitName`, product.unit || "");
//         methods.setValue(`items.${index}.price`, product.price ?? 0);
//         methods.setValue(`items.${index}.vat`, product.vat ?? 0);

//         setInputValue(product.name || "");

//         const currentItems = methods.getValues("items") || [];
//         if (index === currentItems.length - 1) {
//             append({ product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 });
//         }
//     };

//     const handleCreateNew = () => {
//         if (!inputValue.trim()) return;
//         setDefaultName(inputValue.trim());
//         setOpenQuickForm(true);
//     };

//     const handleProductSuccess = async () => {
//         await mutateProducts?.();
//         setOpenQuickForm(false);
//         setDefaultName("");
//     };

//     return (
//         <Stack spacing={0.5}>
//             <Field.Autocomplete
//                 name={`items.${index}.product`}
//                 options={products}
//                 loading={productsLoading}
//                 freeSolo
//                 value={currentProduct}
//                 inputValue={inputValue}
//                 getOptionLabel={(opt: any) => (typeof opt === "string" ? opt : opt?.name ?? "")}
//                 isOptionEqualToValue={(option: any, value: any) => 
//                     String(option?.id) === String(value?.id)
//                 }
//                 onInputChange={(_, newInputValue) => setInputValue(newInputValue || "")}
//                 onChange={(_, newValue: any) => {
//                     if (newValue && typeof newValue === "object") {
//                         updateFormValues(newValue as ProductItem);
//                     } else if (typeof newValue === "string") {
//                         setInputValue(newValue);
//                     } else {
//                         setInputValue("");
//                         methods.setValue(`items.${index}.product`, "");
//                     }
//                 }}
//                 placeholder="Nhập hoặc chọn sản phẩm"
//                 fullWidth
//                 size="small"
//             />

//             {inputValue.length > 1 && 
//              !products.some((p) => p.name.toLowerCase().includes(inputValue.toLowerCase())) && (
//                 <Typography variant="caption" color="error" sx={{ pl: 1 }}>
//                     Sản phẩm chưa tồn tại.{" "}
//                     <Button 
//                         size="small" 
//                         onClick={handleCreateNew}
//                         sx={{ fontSize: "13px", p: 0, textDecoration: "underline" }}
//                     >
//                         Thêm mới ngay
//                     </Button>
//                 </Typography>
//             )}

//             <ProductQuickNewForm
//                 open={openQuickForm}
//                 onClose={() => {
//                     setOpenQuickForm(false);
//                     setDefaultName("");
//                 }}
//                 defaultName={defaultName}
//                 onSuccess={handleProductSuccess}
//             />
//         </Stack>
//     );
// }

// // ==================== UNIT SELECTION ====================
// function UnitSelection({
//     index,
//     methods,
// }: {
//     index: number;
//     methods: UseFormReturn<any>;
// }) {
//     const { units = [], unitsLoading } = useGetUnits({ pageNumber: 1, pageSize: 999 });

//     return (
//         <Field.Select
//             name={`items.${index}.unit`}
//             size="small"
//             fullWidth
//             sx={{ width: 120 }}
//         >
//             {unitsLoading ? (
//                 <MenuItem disabled>Đang tải...</MenuItem>
//             ) : (
//                 units.map((u) => (
//                     <MenuItem key={u.id} value={String(u.id)}>
//                         {u.name}
//                     </MenuItem>
//                 ))
//             )}
//         </Field.Select>
//     );
// }


import { UseFieldArrayRemove, UseFormReturn, useWatch } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { Field } from "src/components/hook-form";
import { fCurrency, fRenderTextNumber } from "src/utils/format-number";
import { Iconify } from "src/components/iconify";
import { useGetProducts } from "src/actions/product";
import { QuotationFormValues } from "./schema/quotation-schema";
import { useGetUnits } from "src/actions/unit";
import { capitalizeFirstLetter } from "src/utils/format-string";
import { toast } from "sonner";
import { deleteProductSelected } from "src/actions/quotation";
import { useBoolean } from "minimal-shared/hooks";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { IQuotationDetails } from "src/types/quotation";
import { ProductQuickNewForm } from "./ProductQuickNewForm";
import { ProductItem } from "src/types/product";

type QuotationItemsTableProps = {
    idQuotation: number | undefined;
    quotationProductDetail: IQuotationDetails | undefined;
    methods: UseFormReturn<QuotationFormValues>;
    fields: any[];
    remove: UseFieldArrayRemove;
    append: (value: any) => void;
    setPaid: (value: any) => void;
};

export function QuotationItemsTable({
    idQuotation,
    quotationProductDetail,
    methods,
    fields,
    remove,
    append,
    setPaid
}: QuotationItemsTableProps) {
    const items = useWatch({
        control: methods.control,
        name: "items",
    }) as QuotationFormValues["items"];

    const discount = useWatch({
        control: methods.control,
        name: "discount",
    }) as number | undefined;

    const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
        const qty = Number(item?.qty) || 0;
        const price = Number(item?.price) || 0;
        const vat = Number(item?.vat) || 0;
        return Math.round(qty * price * (1 + vat / 100));
    };

    const total = (items || []).reduce((acc, i) => acc + calcAmount(i), 0);
    const roundedTotal = Math.round(total);

    const openDel = useBoolean();
    const [indexField, setIndexField] = useState(0);
    const [productIDSelected, setProductIDSelected] = useState<number[]>([]);

    useEffect(() => {
        setPaid(roundedTotal);
    }, [roundedTotal, setPaid]);

    const deleteEachProduct = async () => {
        try {
            if (!idQuotation) return;
            if (fields.length <= 1) {
                toast.warning("Phiếu báo giá phải có ít nhất 1 sản phẩm");
                openDel.onFalse();
                return;
            }

            await deleteProductSelected({
                productID: productIDSelected,
                quotationID: String(idQuotation)
            });
            remove(indexField);
            toast.success("Đã xóa sản phẩm");
            openDel.onFalse();

            mutate((k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"));
            mutate(endpoints.quotation.detail(idQuotation, `?pageNumber=1&pageSize=999`));
        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra!");
        }
    };

    const confirmDeleteUpdateProduct = () => (
        <Dialog open={openDel.value} onClose={openDel.onFalse} maxWidth="sm" fullWidth>
            <DialogTitle>Xác nhận xóa sản phẩm?</DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="gridicons:notice" color="#4dd217" />
                    <Stack>
                        <Typography variant="body2" color="warning">- Sản phẩm sẽ bị xóa khỏi phiếu báo giá này</Typography>
                        <Typography variant="overline" color="error">- Không thể hoàn tác</Typography>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" spacing={2} width="100%">
                    <Button variant="outlined" onClick={openDel.onFalse} fullWidth>Hủy</Button>
                    <Button variant="contained" color="error" onClick={deleteEachProduct} fullWidth>Xóa</Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );

    return (
        <>
            <Stack spacing={2}>
                <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto" }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell width={50}>STT</TableCell>
                                <TableCell>Tên SP</TableCell>
                                <TableCell width={150}>Số lượng</TableCell>
                                <TableCell width={150}>Đơn giá</TableCell>
                                <TableCell width={150}>Đơn vị tính</TableCell>
                                <TableCell width={100}>VAT</TableCell>
                                <TableCell width={150}>Thành tiền</TableCell>
                                <TableCell width={80}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <ProductAutocomplete index={index} methods={methods} append={append} />
                                    </TableCell>
                                    <TableCell>
                                        <Field.NumberInput name={`items.${index}.qty`} sx={{ width: 100 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Field.VNCUrrenInputResizable name={`items.${index}.price`} sx={{ width: 100 }} />
                                    </TableCell>
                                    <TableCell>
                                        <UnitSelection index={index} methods={methods} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {items?.[index]?.vat != null ? `${items[index].vat}%` : ""}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold">
                                            {fCurrency(calcAmount(items[index]))}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Xóa" arrow>
                                            <IconButton
                                                color="error"
                                                onClick={() => {
                                                    if (idQuotation) {
                                                        const prodId = Number(methods.getValues(`items.${index}.product`));
                                                        const exists = quotationProductDetail?.products?.some(
                                                            p => Number(p.productID) === prodId
                                                        );
                                                        if (exists) {
                                                            setProductIDSelected([prodId]);
                                                            setIndexField(index);
                                                            openDel.onTrue();
                                                        } else {
                                                            remove(index);
                                                        }
                                                    } else {
                                                        remove(index);
                                                    }
                                                }}
                                            >
                                                <Iconify icon="material-symbols:scan-delete-outline-sharp" />
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
                    onClick={() => append({ product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 })}
                >
                    Thêm sản phẩm
                </Button>
            </Stack>

            {confirmDeleteUpdateProduct()}
        </>
    );
}

// ==================== PRODUCT AUTOCOMPLETE - ĐÃ TỐI ƯU (TỰ ĐỘNG CHỌN SAU KHI THÊM MỚI) ====================
function ProductAutocomplete({
    index,
    methods,
    append,
}: {
    index: number;
    methods: UseFormReturn<any>;
    append: (value: any) => void;
}) {
    const [inputValue, setInputValue] = useState("");
    const [openQuickForm, setOpenQuickForm] = useState(false);
    const [defaultName, setDefaultName] = useState("");

    const {
        products = [],
        productsLoading,
        mutation: mutateProducts,
    } = useGetProducts({
        pageNumber: 1,
        pageSize: 999,
        key: inputValue,
    });

    const currentProductId = methods.watch(`items.${index}.product`);

    const currentProduct = useMemo(() => {
        if (!currentProductId) return null;
        return products.find((p) => String(p.id) === String(currentProductId)) || null;
    }, [products, currentProductId]);

    useEffect(() => {
        if (currentProduct?.name) {
            setInputValue(currentProduct.name);
        }
    }, [currentProduct]);

    const updateFormValues = (product: ProductItem) => {
        if (!product) return;
        methods.setValue(`items.${index}.product`, String(product.id), { shouldValidate: true });
        methods.setValue(`items.${index}.unit`, String(product.unitID || ""));
        methods.setValue(`items.${index}.unitName`, product.unit || "");
        methods.setValue(`items.${index}.price`, product.price ?? 0);
        methods.setValue(`items.${index}.vat`, product.vat ?? 0);

        setInputValue(product.name || "");

        const currentItems = methods.getValues("items") || [];
        if (index === currentItems.length - 1) {
            append({ product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 });
        }
    };

    const handleCreateNew = () => {
        if (!inputValue.trim()) return;
        setDefaultName(inputValue.trim());
        setOpenQuickForm(true);
    };

    const handleProductSuccess = async () => {
        await mutateProducts?.();

        // Tự động tìm và chọn sản phẩm vừa thêm
        setTimeout(() => {
            const found = products.find(
                (p) => p.name && p.name.trim().toLowerCase() === defaultName.trim().toLowerCase()
            );

            if (found) {
                updateFormValues(found);
            } else {
                setTimeout(() => {
                    const retryFound = products.find(
                        (p) => p.name && p.name.trim().toLowerCase() === defaultName.trim().toLowerCase()
                    );
                    if (retryFound) updateFormValues(retryFound);
                }, 1000);
            }
        }, 700);

        setOpenQuickForm(false);
        setDefaultName("");
    };

    return (
        <Stack spacing={0.5}>
            <Field.Autocomplete
                name={`items.${index}.product`}
                options={products}
                loading={productsLoading}
                freeSolo
                value={currentProduct}
                inputValue={inputValue}
                getOptionLabel={(opt: any) => (typeof opt === "string" ? opt : opt?.name ?? "")}
                isOptionEqualToValue={(option: any, value: any) =>
                    String(option?.id) === String(value?.id)
                }
                onInputChange={(_, newInputValue) => setInputValue(newInputValue || "")}
                onChange={(_, newValue: any) => {
                    if (newValue && typeof newValue === "object") {
                        updateFormValues(newValue as ProductItem);
                    } else if (typeof newValue === "string") {
                        setInputValue(newValue);
                    } else {
                        setInputValue("");
                        methods.setValue(`items.${index}.product`, "");
                    }
                }}
                placeholder="Nhập hoặc chọn sản phẩm"
                fullWidth
                size="small"
            />

            {inputValue.length > 1 &&
                !products.some((p) => p.name?.toLowerCase().includes(inputValue.toLowerCase())) && (
                    <Typography variant="caption" color="error" sx={{ pl: 1 }}>
                        Sản phẩm chưa tồn tại.{" "}
                        <Button
                            size="small"
                            onClick={handleCreateNew}
                            sx={{ fontSize: "13px", p: 0, textDecoration: "underline", minWidth: "auto" }}
                        >
                            Thêm mới ngay
                        </Button>
                    </Typography>
                )}

            <ProductQuickNewForm
                open={openQuickForm}
                onClose={() => {
                    setOpenQuickForm(false);
                    setDefaultName("");
                }}
                defaultName={defaultName}
                onSuccess={handleProductSuccess}
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
        <Field.Select
            name={`items.${index}.unit`}
            size="small"
            fullWidth
            sx={{ width: 120 }}
        >
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