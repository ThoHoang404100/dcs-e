import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { fCurrency, fRenderTextNumber } from "src/utils/format-number";
import { Iconify } from "src/components/iconify";
import { capitalizeFirstLetter } from "src/utils/format-string";
import { toast } from "sonner";
import { useBoolean } from "minimal-shared/hooks";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { ContractFormValues } from "./schema/contract-schema";
import { deleteProductSelected } from "src/actions/contract";
import { ContractItemsTableProps } from "./helper/ContractItemsTableProps";
import ContractItemsTableContent from "./components/contractItemTable";
import { deleteSupProductSelected } from "src/actions/contractSupplier";

export function ContractItemsTable({
    idContract,
    contractProductDetail,
    methods,
    fields,
    remove,
    append,
    setPaid,
    detailMutate,
    listMutate
}: ContractItemsTableProps) {
    const items = useWatch({
        control: methods.control,
        name: "products",
    }) as ContractFormValues["products"];

    const discount = useWatch({
        control: methods.control,
        name: "discount",
    }) as number | undefined;

    const calcAmount = (item: { qty?: number; price?: number; vat?: number }) => {
        const qty = Number(item?.qty) || 0;
        const price = Number(item?.price) || 0;
        const rawVat = Number(item?.vat) || 0;
        const vat = rawVat === 255 ? 0 : rawVat;
        return Math.round(qty * price * (1 + vat / 100));
    };

    const subTotal = (items || []).reduce((acc, i) => {
        const qty = Number(i?.qty) || 0;
        const price = Number(i?.price) || 0;
        return acc + qty * price;
    }, 0);

    const totalVat = (items || []).reduce((acc, i) => {
        const qty = Number(i?.qty) || 0;
        const price = Number(i?.price) || 0;
        const rawVat = Number(i?.vat) || 0;
        const vat = rawVat === 255 ? 0 : rawVat;
        return acc + Math.round(qty * price * (vat / 100));
    }, 0);

    const roundedTotal = Math.round(subTotal + totalVat);

    const openDel = useBoolean();

    const [indexField, setIndexField] = useState(0);

    const [productIDSelected, setProductIDSelected] = useState('');

    const deleteEachProduct = async () => {
        try {
            if (!idContract) return;
            if (fields.length <= 1) {
                toast.warning("Phiếu hợp đồng đã tạo phải có ít nhất 1 sản phẩm");
                toast.warning("Không thể xóa sản phẩm này");
                openDel.onFalse();
                return;
            }

            await deleteSupProductSelected({
                productId: Number(productIDSelected),
                supplierContactId: idContract
            });
            remove(indexField);
            toast.success("Đã xóa sản phẩm ra khỏi danh sách");
            openDel.onFalse();
            detailMutate();
            listMutate();
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
            <DialogTitle>Xác nhận xóa sản phẩm ra khỏi hợp đồng này?</DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={1} alignItems={"center"}>
                    <Iconify icon="gridicons:notice" color="#4dd217" />
                    <Stack direction="column">
                        <Typography variant="body2" color="warning">- Sản phẩm sẽ được xóa ra khỏi dữ liệu của phiếu hợp đồng này</Typography>
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

    useEffect(() => {
        setPaid(roundedTotal);
    }, [roundedTotal]);

    return (
        <Stack spacing={2} sx={{ height: "100%" }}>
            <Typography variant="subtitle2">Sản phẩm</Typography>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <Box sx={{ flex: 1, display: "flex", flexDirection: 'column', overflowY: "hidden" }}>
                    <ContractItemsTableContent
                        fields={fields}
                        append={append}
                        calcAmount={calcAmount}
                        items={items}
                        methods={methods}
                        openDel={openDel}
                        remove={remove}
                        setIndexField={setIndexField}
                        setProductIDSelected={setProductIDSelected}
                        contractProductDetail={contractProductDetail}
                        idContract={idContract}
                    />
                    <Stack
                        direction="row"
                        pt={1}
                        sx={{
                            borderTop: "1px solid",
                            borderColor: "divider",
                            mb: 2
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
                </Box>
            </Box>
            {confirmDeleteUpdateProduct()}
        </Stack>
    );
}