import { UseFieldArrayRemove, UseFormReturn, useWatch } from "react-hook-form";
import { ChangeEvent, useEffect, useState } from "react";
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

    const discountRate = discount ? discount / 100 : 0;

    const subtotal = total * (1 - discountRate);

    const roundedTotal = Math.round(total);

    const openDel = useBoolean();

    const [indexField, setIndexField] = useState(0);

    const [productIDSelected, setProductIDSelected] = useState<number[]>([]);

    const deleteEachProduct = async () => {
        try {
            if (!idQuotation) return;
            if (fields.length <= 1) {
                toast.warning("Phiếu báo giá đã tạo phải có ít nhất 1 sản phẩm");
                toast.warning("Không thể xóa sản phẩm này");
                openDel.onFalse();
                return;
            }

            await deleteProductSelected({
                productID: productIDSelected,
                quotationID: String(idQuotation)
            });
            remove(indexField);
            toast.success("Đã xóa sản phẩm ra khỏi danh sách");
            openDel.onFalse();

            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"),
                undefined,
                { revalidate: true }
            );

            mutate(endpoints.quotation.detail(idQuotation, `?pageNumber=1&pageSize=999`));
        } catch (error: any) {
            console.error(error);
            if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Đã có lỗi xảy ra!");
            }
        }
    };

    const confirmDeleteUpdateProduct = () => (
        <Dialog open={openDel.value} onClose={openDel.onFalse} maxWidth="sm" fullWidth>
            <DialogTitle>Xác nhận xóa sản phẩm ra khỏi báo giá này?</DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={1} alignItems={"center"}>
                    <Iconify icon="gridicons:notice" color="#4dd217" />
                    <Stack direction="column">
                        <Typography variant="body2" color="warning">- Sản phẩm sẽ được xóa ra khỏi dữ liệu của phiếu báo giá này</Typography>
                        <Typography variant="overline" color="error">- Hành động này không thể hoàn tác</Typography>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" spacing={2} width="100%" minHeight={40}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => openDel.onFalse()}
                        fullWidth
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ ml: 1 }}
                        fullWidth
                        onClick={deleteEachProduct}
                    >
                        Xóa
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );

    // const fixedTotal = Number(total.toFixed(2));

    const stickyRightCell = {
        position: 'sticky',
        right: 0,
        backgroundColor: 'background.paper',
        '@media (max-width:1848px)': {
            boxShadow: '-6px 0 8px -4px rgba(0,0,0,0.15)',
        },
    };

    useEffect(() => {
        setPaid(roundedTotal);
    }, [roundedTotal]);

    return (
        <>
            <Stack width={{ xs: "100%", sm: "100%", md: "100%", lg: "100%" }} spacing={2} sx={{ height: "100%" }}>
                <Typography variant="subtitle2">Sản phẩm</Typography>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: 'column', overflowY: "hidden" }}>
                        <TableContainer component={Paper} sx={{
                            maxWidth: "100%",
                            maxHeight: 600,
                            overflowX: "auto",
                            flex: 1
                        }}>
                            <Table size="small" stickyHeader sx={{ minWidth: 600, overflowY: "auto" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="50">STT</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>Tên SP</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="150">Số lượng</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="150">Đơn giá</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="150">Đơn vị tính</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="100">VAT</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="150">Thành tiền</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} width="80"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>{index + 1}</TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                <ProductAutocomplete index={index} methods={methods} append={append} />
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                <Field.NumberInput name={`items.${index}.qty`} sx={{ width: 100 }} />
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                <Field.VNCUrrenInputResizable name={`items.${index}.price`}
                                                    sx={{ width: 100 }} />
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                <UnitSelection index={index} methods={methods} />
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                <Typography variant="body2">
                                                    {items?.[index]?.vat != null ? `${items[index].vat}%` : ""}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                <Typography fontWeight="bold">
                                                    {fCurrency(calcAmount(items[index]))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ ...stickyRightCell }}>
                                                <Stack direction="row">
                                                    <Tooltip title="Xóa sản phẩm" placement="top" arrow>
                                                        <IconButton onClick={() => {
                                                            if (idQuotation) {
                                                                const idPro = Number(methods.getValues(`items.${index}.product`));
                                                                const exists = quotationProductDetail?.products?.some(p => Number(p.productID) === idPro);
                                                                if (exists) {
                                                                    openDel.onTrue();
                                                                    setProductIDSelected([
                                                                        Number(idPro)
                                                                    ]);
                                                                    setIndexField(index);
                                                                } else {
                                                                    remove(index);
                                                                }
                                                            } else {
                                                                remove(index);
                                                            }
                                                        }}>
                                                            <Iconify icon="material-symbols:scan-delete-outline-sharp" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Stack
                            direction="row"
                            gap={2}
                            my={1}
                            justifyContent="space-between"
                            pt={1}
                            sx={{
                                borderTop: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<Iconify icon="gridicons:add" />}
                                onClick={() =>
                                    append({
                                        name: "",
                                        unit: "",
                                        qty: 1,
                                        price: 0,
                                        vat: 0,
                                    })
                                }
                            >
                                Thêm sản phẩm
                            </Button>
                        </Stack>
                        <Box
                            sx={{
                                position: "sticky",
                                bottom: -50,
                                borderTop: "1px solid",
                                borderColor: "divider",
                                pt: 1,
                                pb: 2,
                                bgcolor: "background.paper",
                                zIndex: 1,
                                display: 'flex',
                                flexDirection: "row",
                                gap: '50px',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Stack direction="column" justifyContent="flex-start" textAlign={'start'}>
                                <Typography fontWeight={600}>Bằng chữ</Typography>
                                <Typography fontSize={15}>
                                    {capitalizeFirstLetter(fRenderTextNumber(roundedTotal))}
                                </Typography>
                            </Stack>
                            <Stack direction="column" justifyContent="flex-end" textAlign={'end'}>
                                <Typography fontWeight={600}>Tổng cộng</Typography>
                                <Typography fontWeight="bold" whiteSpace="nowrap">
                                    {fCurrency(roundedTotal)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </Stack>
            {confirmDeleteUpdateProduct()}
        </>
    );
}

function ProductAutocomplete({
    index,
    methods,
    append
}: {
    index: number;
    methods: UseFormReturn<any>;
    append: (value: any) => void;
}) {
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");

    const { products = [], productsLoading } = useGetProducts({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedKeyword,
    });

    return (
        <Field.Autocomplete
            name={`items.${index}.product`}
            placeholder="Chọn sản phẩm"
            options={products}
            loading={productsLoading}
            getOptionLabel={(opt) => opt?.name ?? ""}
            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
            // onInputChange={(_, value) => setKeyword(value)}
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
                    {option.name}
                </li>
            )}
            value={
                products.find(
                    (p) => String(p.id) === String(methods.getValues(`items.${index}.product`))
                ) || null
            }
            onChange={(_, newValue) => {
                if (newValue) {
                    const rowId = methods.getValues(`items.${index}.id`);

                    methods.setValue(`items.${index}.product`, String(newValue.id), {
                        shouldValidate: true,
                    });
                    methods.setValue(`items.${index}.id`, rowId);
                    methods.setValue(
                        `items.${index}.unit`,
                        newValue.unitID != null ? String(newValue.unitID) : ""
                    );
                    methods.setValue(`items.${index}.unitName`, newValue.unit != null ? newValue.unit : "");
                    methods.setValue(`items.${index}.price`, newValue.price ?? 0);
                    methods.setValue(`items.${index}.vat`, newValue.vat ?? 0);
                }
                const productsArr = methods.getValues('items') || [];
                const lastIndex = productsArr.length - 1;
                if (index === lastIndex) {
                    append({
                        name: "",
                        unit: "",
                        qty: 1,
                        price: 0,
                        vat: 0,
                    });
                }
            }}
            noOptionsText="Không có dữ liệu"
            fullWidth
            sx={{ width: 500 }}
        />
    );
}

function UnitSelection({
    index,
    methods,
}: {
    index: number;
    methods: UseFormReturn<any>;
}) {
    const { units = [], unitsLoading } = useGetUnits({
        pageNumber: 1,
        pageSize: 999
    });

    return (
        <Field.Select
            name={`items.${index}.unit`}
            placeholder="Đơn vị tính"
            onChange={(e) => {
                const selectedId = e.target.value;
                methods.setValue(`items.${index}.unit`, selectedId);

                const selectedUnit = units.find((u) => String(u.id) === selectedId);
                const unitName = selectedUnit?.name ?? "";
                methods.setValue(`items.${index}.unitName`, unitName);
                // console.log(
                //     methods.watch(`items.${index}.unitName`)
                // );
            }}
            fullWidth
            sx={{ width: 100 }}
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
