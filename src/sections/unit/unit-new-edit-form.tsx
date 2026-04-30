import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CardActions, CardContent, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOrUpdateUnit } from "src/actions/unit";
import { Field, Form } from "src/components/hook-form";
import { IUnitItem } from "src/types/unit";
import { mutate } from "swr";
import { z as zod } from 'zod';

type Props = {
    currentUnit?: IUnitItem;
    open: boolean;
    onClose: () => void;
    selectedId?: number;
};

export const NewUnitSchema = zod.object({
    name: zod.string().min(1, "Tên đơn vị tính là trường bắt buộc"),
});

export type NewUnitSchemaType = zod.infer<typeof NewUnitSchema>;

export function UnitNewEditForm({ currentUnit, open, onClose, selectedId }: Props) {
    const defaultValues: NewUnitSchemaType = {
        name: "",
    };

    const methods = useForm<NewUnitSchemaType>({
        resolver: zodResolver(NewUnitSchema),
        defaultValues: currentUnit ? {
            ...defaultValues,
            name: currentUnit.name,
        } : defaultValues,
    });

    useEffect(() => {
        if (currentUnit) {
            methods.reset({
                ...defaultValues,
                name: currentUnit.name,
            });
        } else {
            methods.reset(defaultValues);
        }
    }, [currentUnit, methods.reset]);

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
            await createOrUpdateUnit(selectedId ?? 0, payloadData);
            // mutate(endpoints.unit.list(`?pageNumber=${page + 1}&pageSize=${rowsPerPage}&Status=1`));
            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/units/units"),
                undefined,
                { revalidate: true }
            );
            toast.success(currentUnit ? 'Đơn vị tính đã được thay đổi!' : 'Tạo mới đơn vị tính thành công!');
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
                label="Tên đơn vị tính"
                helperText="Nhập tên đơn vị tính"
                required
                sx={{ flex: 1 }}
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
                    {!currentUnit ? 'Tạo mới' : 'Lưu thay đổi'}
                </Button>
            </Stack>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"sm"} scroll={'paper'}>
            <DialogTitle>
                {currentUnit ? 'Chỉnh sửa đơn vị tính' : 'Tạo đơn vị tính'}
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