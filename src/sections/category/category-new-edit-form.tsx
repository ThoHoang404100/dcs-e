import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, CardActions, CardContent, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOrUpdateCategory } from "src/actions/category";
import { Field, Form } from "src/components/hook-form";
import { Iconify } from "src/components/iconify";
import { endpoints } from "src/lib/axios";
import { ICategoryItem } from "src/types/category";
import { mutate } from "swr";
import { z as zod } from 'zod';

type Props = {
    currentCategory?: ICategoryItem;
    open: boolean;
    onClose: () => void;
}
export type NewCategorySchemaType = zod.infer<typeof NewCategorySchema>;

export const NewCategorySchema = zod.object({
    name: zod.string().min(1, { message: 'Tên nhóm sản phẩm là trường bắt buộc!' }),
    description: zod.string().optional(),
    vat: zod.number().optional(),
});

export function CategoryNewEditForm({ currentCategory, open, onClose }: Props) {
    const defaultValues: NewCategorySchemaType = {
        name: '',
        description: '',
        vat: 0
    };

    const methods = useForm<NewCategorySchemaType>({
        mode: 'onSubmit',
        resolver: zodResolver(NewCategorySchema),
        defaultValues: currentCategory
            ? {
                ...defaultValues,
                name: currentCategory.name,
                description: currentCategory.description,
                vat: currentCategory.vat
            }
            : defaultValues,
    });

    useEffect(() => {
        if (currentCategory) {
            methods.reset({
                ...defaultValues,
                name: currentCategory.name,
                description: currentCategory.description,
                vat: currentCategory.vat
            });
        } else {
            methods.reset(defaultValues);
        }
    }, [currentCategory, methods.reset]);

    const {
        reset,
        watch,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    const onSubmit = handleSubmit(async (data) => {
        try {
            const payloadData = {
                name: data.name,
                description: data.description || "",
                vat: data.vat ?? 0
            }

            const id = currentCategory ? currentCategory.id : 0;
            const extraFields = id
                ? {}
                : {
                    createdDate: new Date().toISOString(),
                    modifiedDate: new Date().toISOString(),
                    status: true
                };

            await createOrUpdateCategory(id, {
                ...payloadData,
                ...extraFields
            });

            mutate(
                (k) => typeof k === "string" && k.startsWith("/api/v1/product-categories/categories"),
                undefined,
                { revalidate: true }
            );
            // mutate(endpoints.category.list(`?pageNumber=${page + 1}&pageSize=${rowsPerPage}&Status=1`));
            toast.success(currentCategory ? 'Dữ liệu nhóm sản phẩm đã được thay đổi!' : 'Tạo mới dữ liệu nhóm sản phẩm thành công!');
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

    return (
        <Dialog
            fullWidth
            maxWidth={"sm"}
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                {
                    currentCategory
                        ? 'Chỉnh sửa dữ liệu nhóm sản phẩm'
                        : 'Tạo dữ liệu nhóm sản phẩm'
                }
            </DialogTitle>
            <DialogContent dividers={true}>
                <Form methods={methods} onSubmit={onSubmit}>
                    <Box sx={{ pt: 0 }}>
                        <CardContent sx={{ px: 0 }}>
                            <Stack spacing={2}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <Field.Text
                                        name="name"
                                        label="Tên nhóm sản phẩm"
                                        fullWidth
                                        required
                                    />

                                    <Field.Select label="VAT áp dụng" name="vat" required>
                                        <MenuItem key={0} value={0} sx={{ textTransform: 'capitalize' }}>0%</MenuItem>
                                        <MenuItem key={5} value={5} sx={{ textTransform: 'capitalize' }}>5%</MenuItem>
                                        <MenuItem key={8} value={8} sx={{ textTransform: 'capitalize' }}>8%</MenuItem>
                                        <MenuItem key={10} value={10} sx={{ textTransform: 'capitalize' }}>10%</MenuItem>
                                    </Field.Select>
                                </Stack>

                                <Field.Text
                                    name="description"
                                    label="Mô tả nhóm sản phẩm"
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            </Stack>
                        </CardContent>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }} />
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
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
                                    {!currentCategory ? 'Tạo mới' : 'Lưu thay đổi'}
                                </Button>
                            </Stack>
                        </CardActions>
                    </Box>
                </Form>
            </DialogContent>
        </Dialog>
    );
}