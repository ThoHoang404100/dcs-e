import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  MenuItem, Tooltip, IconButton
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { Form, Field } from "src/components/hook-form";
import { toast } from "sonner";
import { createOrUpdateProduct } from "src/actions/product";
import { mutate } from "swr";

import { UnitNewEditForm } from "../unit/unit-new-edit-form";
import { CategoryNewEditForm } from "../category/category-new-edit-form";
import { useGetCategories } from "src/actions/category";
import { useGetUnits } from "src/actions/unit";

import { z as zod } from "zod";
import type { ProductDto } from "src/types/product";

const QuickProductSchema = zod.object({
  name: zod.string().min(1, "Tên sản phẩm là bắt buộc"),
  code: zod.string().optional(),
  price: zod.number().min(1, "Giá bán phải lớn hơn 0"),
  vat: zod.number().min(0).max(100, "VAT phải từ 0 đến 100"),
  categoryId: zod.number().min(1, "Vui lòng chọn loại sản phẩm"),
  unitId: zod.number().min(1, "Vui lòng chọn đơn vị tính"),
});

type QuickProductType = zod.infer<typeof QuickProductSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  onSuccess?: (newProduct: any) => void;
};

export function ProductQuickNewForm({ open, onClose, defaultName = "", onSuccess }: Props) {
  const [openUnitModal, setOpenUnitModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const methods = useForm<QuickProductType>({
    resolver: zodResolver(QuickProductSchema),
    defaultValues: {
      name: "",
      code: "",
      price: 0,
      vat: 10,
      categoryId: 0,
      unitId: 0,
    },
  });

  const { categories = [] } = useGetCategories({ pageNumber: 1, pageSize: 999 });
  const { units = [] } = useGetUnits({ pageNumber: 1, pageSize: 999 });

  const selectedCategoryId = useWatch({ control: methods.control, name: "categoryId" });
  const selectedUnitId = useWatch({ control: methods.control, name: "unitId" });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: defaultName || "",
        code: "",
        price: 0,
        vat: 10,
        categoryId: 0,
        unitId: 0,
      });
    }
  }, [open, defaultName, methods]);

  useEffect(() => {
    if (!openCategoryModal) {
      mutate((k) => typeof k === "string" && k.includes("product-categories"));
    }
    if (!openUnitModal) {
      mutate((k) => typeof k === "string" && k.includes("units"));
    }
  }, [openCategoryModal, openUnitModal]);

  //     const payload: ProductDto = {
  //       name: data.name,
  //       code: data.code || "",
  //       price: data.price,
  //       vat: data.vat,
  //       categoryId: data.categoryId,
  //       unitId: data.unitId,
  //       purchasePrice: data.price,
  //       stock: 0,
  //       warranty: 0,
  //       manufacturer: "",
  //       description: "",
  //       image: null,
  //     };

  //     const res = await createOrUpdateProduct(null, payload);
  //     mutate((k) => typeof k === "string" && k.startsWith("/api/v1/products"), undefined, { revalidate: true });
  //     mutate((k) => typeof k === "string" && k.includes("product")); // refresh tất cả liên quan

  //     mutate((k) => typeof k === "string" && k.startsWith("/api/v1/products"));
  //     mutate((k) => typeof k === "string" && k.includes("product-categories"));
  //     mutate((k) => typeof k === "string" && k.includes("units"));

  //     toast.success("Tạo sản phẩm mới thành công!");
  //     onSuccess?.(res?.data || res);
  //     onClose();
  //   } catch (error: any) {
  //     console.error(error);
  //     toast.error(error.message || "Có lỗi xảy ra khi tạo sản phẩm");
  //   }
  // };
  const onSubmit = async (data: QuickProductType) => {
    try {
      const payload: ProductDto = {
        name: data.name,
        code: data.code || "",
        price: data.price,
        vat: data.vat,
        categoryId: data.categoryId,
        unitId: data.unitId,
        purchasePrice: data.price,
        stock: 0,
        warranty: 0,
        manufacturer: "",
        description: "",
        image: null,
      };

      const res = await createOrUpdateProduct(null, payload);

      const newProduct = res?.data || res;

      const normalizedProduct = {
        ...newProduct,
        id: String(newProduct.id),
        unit: newProduct.unit || "",
        category: newProduct.category || "",
      };

      await mutate((k) => typeof k === "string" && k.startsWith("/api/v1/products"));

      toast.success("Tạo sản phẩm mới thành công!");

      onSuccess?.(normalizedProduct);

      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo sản phẩm");
    }
  };


  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        <DialogContent dividers>
          <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Field.Text name="name" label="Tên sản phẩm" required fullWidth />
                <Field.Text name="code" label="Mã sản phẩm" fullWidth />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Field.VNCurrencyInput name="price" label="Giá bán" required />
                <Field.Select name="vat" label="VAT (%)" required>
                  {[0, 5, 8, 10].map((v) => (
                    <MenuItem key={v} value={v}>{v}%</MenuItem>
                  ))}
                </Field.Select>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <Field.Autocomplete
                  name="categoryId"
                  label="Loại / Nhóm sản phẩm"
                  options={categories}
                  value={categories.find((c) => c.id === selectedCategoryId) || null}
                  getOptionLabel={(opt) => opt?.name ?? ""}
                  isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                  onChange={(_, newValue) =>
                    methods.setValue("categoryId", newValue?.id || 0, { shouldValidate: true })
                  }
                  fullWidth
                  required
                />

                <Tooltip title="Thêm loại sản phẩm mới" arrow>
                  <IconButton
                    onClick={() => setOpenCategoryModal(true)}
                    sx={{
                      mb: 0.5,
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon="mdi:plus-circle-outline" width={28} />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-end">
                <Field.Autocomplete
                  name="unitId"
                  label="Đơn vị tính"
                  options={units}
                  value={units.find((u) => u.id === selectedUnitId) || null}
                  getOptionLabel={(opt) => opt?.name ?? ""}
                  isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                  onChange={(_, newValue) =>
                    methods.setValue("unitId", newValue?.id || 0, { shouldValidate: true })
                  }
                  fullWidth
                  required
                />

                <Tooltip title="Thêm đơn vị tính mới" arrow>
                  <IconButton
                    onClick={() => setOpenUnitModal(true)}
                    sx={{
                      mb: 0.5,
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon="mdi:plus-circle-outline" width={28} />
                  </IconButton>
                </Tooltip>
              </Stack>

            </Stack>

            <DialogActions sx={{ px: 0, mt: 4 }}>
              <Button onClick={onClose} variant="outlined" fullWidth>
                Hủy
              </Button>
              <Button sx={{ bgcolor: (Theme) => Theme.palette.primary.main }} type="submit" variant="contained" fullWidth>
                Tạo sản phẩm
              </Button>
            </DialogActions>
          </Form>
        </DialogContent>
      </Dialog>

      <UnitNewEditForm
        open={openUnitModal}
        onClose={() => setOpenUnitModal(false)}
        currentUnit={undefined}
        selectedId={undefined}
      />

      <CategoryNewEditForm
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        currentCategory={undefined}
      />
    </>
  );
}