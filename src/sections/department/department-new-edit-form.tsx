import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CardActions, CardContent, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOrUpdateDepartment } from "src/actions/department";
import { Field, Form } from "src/components/hook-form";
import { endpoints } from "src/lib/axios";
import { IDepartmentItem } from "src/types/department";
import { mutate } from "swr";
import { z as zod } from 'zod';

type Props = {
    currentDepartment?: IDepartmentItem;
    open: boolean;
    onClose: () => void;
    selectedId?: number;
};

export const NewDepartmentSchema = zod.object({
    name: zod.string().min(1, "Tên phòng ban là trường bắt buộc"),
});

export type NewDepartmentSchemaType = zod.infer<typeof NewDepartmentSchema>;


export function DepartmentNewEditForm({ currentDepartment, open, onClose, selectedId }: Props) {
    const defaultValues: NewDepartmentSchemaType = {
        name: "",
    };

    const methods = useForm<NewDepartmentSchemaType>({
        resolver: zodResolver(NewDepartmentSchema),
        defaultValues: currentDepartment ? {
            ...defaultValues,
            name: currentDepartment.name,
        } : defaultValues,
    });

    useEffect(() => {
        if (currentDepartment) {
            methods.reset({
                ...defaultValues,
                name: currentDepartment.name,
            });
        } else {
            methods.reset(defaultValues);
        }
    }, [currentDepartment, methods.reset]);

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
            await createOrUpdateDepartment(selectedId ?? 0, payloadData);
            // mutate(endpoints.department.list(`?pageNumber=${page + 1}&pageSize=${rowsPerPage}&Status=1`));
            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/departments/departments"),
                undefined,
                { revalidate: true }
            );
            toast.success(currentDepartment ? 'Dữ liệu phòng ban đã được thay đổi!' : 'Tạo mới dữ liệu phòng ban thành công!');
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
                label="Tên phòng ban"
                helperText="Nhập tên phòng ban"
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
                    {!currentDepartment ? 'Tạo mới' : 'Lưu thay đổi'}
                </Button>
            </Stack>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"sm"} scroll={'paper'}>
            <DialogTitle>
                {currentDepartment ? 'Chỉnh sửa phòng ban' : 'Tạo phòng ban'}
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