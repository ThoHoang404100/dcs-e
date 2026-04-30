import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CardActions, CardContent, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOrUpdateEmployeeType } from "src/actions/employeeType";
import { Field, Form } from "src/components/hook-form";
import { endpoints } from "src/lib/axios";
import { IEmployeeTypeItem } from "src/types/employeeType";
import { mutate } from "swr";
import { z as zod } from 'zod';

type Props = {
    currentEmployeeType?: IEmployeeTypeItem;
    open: boolean;
    onClose: () => void;
    selectedId?: number;
};

export const NewEmployeeTypeSchema = zod.object({
    name: zod.string().min(1, "Tên chức vụ là trường bắt buộc"),
});

export type NewEmployeeTypeSchemaType = zod.infer<typeof NewEmployeeTypeSchema>;

export function EmployeeTypeNewEditForm({ currentEmployeeType, open, onClose, selectedId }: Props) {
    const defaultValues: NewEmployeeTypeSchemaType = {
        name: "",
    };
    const methods = useForm<NewEmployeeTypeSchemaType>({
        resolver: zodResolver(NewEmployeeTypeSchema),
        defaultValues: currentEmployeeType ? {
            ...defaultValues,
            name: currentEmployeeType.name,
        } : defaultValues,
    });

    useEffect(() => {
        if (currentEmployeeType) {
            methods.reset({
                ...defaultValues,
                name: currentEmployeeType.name,
            });
        } else {
            methods.reset(defaultValues);
        }
    }, [currentEmployeeType, methods.reset]);

    const {
        reset,
        watch,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            const payloadData =
            {
                name: data.name,
            };
            await createOrUpdateEmployeeType(selectedId ?? 0, payloadData);
            // mutate(endpoints.employeeType.list(`?pageNumber=${page + 1}&pageSize=${rowsPerPage}&Status=1`));
            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/employee-type/employee-types"),
                undefined,
                { revalidate: true }
            );
            toast.success(currentEmployeeType ? 'Chức vụ đã được thay đổi!' : 'Tạo mới chức vụ thành công!');
            onClose();
            reset();
        } catch (error: any) {
            console.error(error);
            if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Đã có lỗi xảy ra!");
            }
        }
    });

    const renderDetails = () => (
        <Stack spacing={3} pt={1}>
            <Field.Text
                name="name"
                label="Tên chức vụ"
                helperText="Nhập tên chức vụ"
                required
            />
        </Stack>
    );
    const renderActions = () => (
        <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={2} width="100%">
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onClose}
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
                    {!currentEmployeeType ? 'Tạo mới' : 'Lưu thay đổi'}
                </Button>
            </Stack>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"sm"} scroll={'paper'}>
            <DialogTitle>
                {currentEmployeeType ? 'Chỉnh sửa chức vụ' : 'Tạo chức vụ'}
            </DialogTitle>
            <DialogContent dividers={true}>
                <Form methods={methods} onSubmit={onSubmit}>
                    <CardContent sx={{ pt: 0, px: 0 }}>
                        <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
                            {renderDetails()}
                        </Stack>
                    </CardContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }} />
                    <CardActions>
                        {renderActions()}
                    </CardActions>
                </Form>
            </DialogContent>
        </Dialog >
    )
}