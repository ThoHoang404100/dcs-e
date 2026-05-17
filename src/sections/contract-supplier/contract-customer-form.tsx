import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack } from "@mui/material";
import { useForm, UseFormReturn } from "react-hook-form";
import { Field, Form } from "src/components/hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ICustomerDto, ICustomerItem } from "src/types/customer";
import { createOrUpdateCustomer } from "src/actions/customer";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { ContractFormValues } from "./schema/contract-schema";
import { CustomerFormValues, customerSchema } from "../quotation/schema/new-customer-schema";

type props = {
    openChild: boolean;
    setOpenChild: (value: any) => void;
    setCustomerKeyword: (c: string) => void;
    methodsContract: UseFormReturn<ContractFormValues>;
    setSelectedCustomer: (c: ICustomerItem | null) => void;
}

export function ContractCustomerForm({ openChild, setOpenChild, setCustomerKeyword, methodsContract, setSelectedCustomer }: props) {
    const defaultValues: CustomerFormValues =
    {
        customerType: "",
        name: "",
        phone: "",
        taxCode: "",
        companyName: "",
    };

    const methods = useForm<CustomerFormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(customerSchema),
        defaultValues,
    });


    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
        watch
    } = methods;

    const customerType = watch("customerType");

    const onSubmit = handleSubmit(async (data: CustomerFormValues) => {
        try {
            const payloadData: ICustomerDto = {
                phone: data.phone ? data.phone.replace(/\s+/g, "") : '',
                name: data.name ?? '',
                taxCode: data.taxCode ?? '',
                companyName: data.companyName ?? '',
                email: '',
                bankAccount: '',
                bankName: '',
                address: '',
                isPartner: false,
                rewardPoint: 0,
                balance: 0,
                position: ''
            };

            const { data: dataCreated } = await createOrUpdateCustomer(undefined, payloadData);
            reset();
            setOpenChild(false);
            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/customers/customers"),
                undefined,
                { revalidate: true }
            );
            const createdCustomer: ICustomerItem = {
                id: String(dataCreated.id),
                phone: dataCreated.phone ?? '',
                name: dataCreated.name ?? '',
                nickName: dataCreated.nickName ?? '',
                taxCode: dataCreated.taxCode ?? '',
                companyName: dataCreated.companyName ?? '',
                email: dataCreated.email ?? '',
                bankAccount: dataCreated.bankAccount ?? '',
                bankName: dataCreated.bankName ?? '',
                address: dataCreated.address ?? '',
                isPartner: dataCreated.isPartner ?? false,
                isBusiness: dataCreated.isBusiness ?? false,
                rewardPoint: dataCreated.rewardPoint ?? 0,
                createDate: dataCreated.createDate ?? null,
                createBy: dataCreated.createBy ?? '',
                modifyDate: dataCreated.modifyDate ?? null,
                modifyBy: dataCreated.modifyBy ?? '',
                status: dataCreated.status ?? true,
                balance: dataCreated.balance ?? 0,
                position: ''
            };

            methodsContract.setValue('supplierId', Number(createdCustomer.id) ?? 0, { shouldValidate: true });
            setCustomerKeyword(createdCustomer.name || createdCustomer.companyName || '');
            setSelectedCustomer(createdCustomer);
            toast.success('Tạo mới dữ liệu khách hàng thành công!');

        } catch (error: any) {
            console.error(error);
            if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Đã có lỗi xảy ra!");
            }
        }
    });

    return (
        <Dialog open={openChild} onClose={() => { setOpenChild(false); methods.reset(); }} fullWidth maxWidth="sm">
            <Form methods={methods} onSubmit={onSubmit}>
                <DialogTitle sx={{ p: 2 }}>Tạo khách hàng mới</DialogTitle>
                <DialogContent sx={{ py: '10px !important' }}>
                    <Field.Select sx={{ mb: 2 }} name="customerType" label="Loại khách hàng" required>
                        <MenuItem key={1} value="KHCN">
                            Khách hàng cá nhân
                        </MenuItem>
                        <MenuItem key={2} value="KHDN">
                            Khách hàng doanh nghiệp
                        </MenuItem>
                    </Field.Select>
                    {customerType === "KHDN" && (
                        <Stack direction="row" gap={2} mb={2}>
                            <Field.TaxCode name="taxCode" label="Mã số thuế" required />
                            <Field.Text name="companyName" label="Tên công ty" required />
                        </Stack>
                    )}
                    <Stack direction="row" gap={2}>
                        <Field.Text name="name" label="Tên khách hàng" required={customerType === "KHCN"} />
                        {customerType === "KHDN"
                            ?
                            <Field.Text name="address" label="Địa chỉ" required />
                            :
                            <Field.PhoneField name="phone" label="Số điện thoại" required />
                        }
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ width: '100%' }}>
                        <Stack direction="row" spacing={2} width="100%" minHeight={40}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => { setOpenChild(false); methods.reset(); }}
                                fullWidth
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ ml: 1 }}
                                loading={isSubmitting}
                                fullWidth
                            >
                                Tạo mới
                            </Button>
                        </Stack>
                    </Box>
                </DialogActions>
            </Form>
        </Dialog>
    );
}