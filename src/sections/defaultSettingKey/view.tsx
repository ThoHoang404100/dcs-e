import { useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Typography, CircularProgress
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from "zod";
import { toast } from 'sonner';
import axiosInstance from 'src/lib/axios';
import { Form, Field } from 'src/components/hook-form';
import { useGetUnits } from 'src/actions/unit';
import { useGetCategories } from 'src/actions/category';

const SettingsSchema = zod.object({
  defaultVat: zod.number().min(0).max(100),
  defaultUnitId: zod.number().min(1, "Vui lòng chọn đơn vị"),
  defaultProductGroupId: zod.number().min(1, "Vui lòng chọn nhóm"),
});

type SettingsType = zod.infer<typeof SettingsSchema>;

export function DefaultKeySettings() {
  const { units = [], unitsLoading } = useGetUnits({ pageNumber: 1, pageSize: 999 });
  const { categories = [], categoriesLoading } = useGetCategories({ pageNumber: 1, pageSize: 999 });

  const methods = useForm<SettingsType>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      defaultVat: 8,
      defaultUnitId: 0,
      defaultProductGroupId: 0,
    },
  });

  // Load dữ liệu khi trang khởi tạo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.post('/api/v1/defaultKey/Get');
        if (res.data) {
          methods.reset({
            defaultVat: res.data.defaultVat,
            defaultUnitId: res.data.defaultUnitId,
            defaultProductGroupId: res.data.defaultProductGroupId,
          });
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu cấu hình:", error);
      }
    };
    fetchData();
  }, [methods]);

  const onSubmit = async (data: SettingsType) => {
    try {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await axiosInstance.post('/api/v1/defaultKey/Create', payload);
      toast.success("Lưu cấu hình thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu");
    }
  };

  if (unitsLoading || categoriesLoading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Cài đặt biến mặc định</Typography>

      <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Thiết lập</TableCell>
                <TableCell style={{ width: '40%' }}>Giá trị</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* VAT: Dùng Field.Text với type="number" để tùy biến số */}
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>VAT mặc định (%)</TableCell>
                <TableCell>
                  <Field.Text name="defaultVat" type="number" size="small" fullWidth />
                </TableCell>
              </TableRow>

              {/* Unit */}
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Đơn vị tính mặc định</TableCell>
                <TableCell>
                  <Field.Autocomplete
                    name="defaultUnitId"
                    options={units}
                    value={units.find((u) => u.id === methods.watch("defaultUnitId")) || null}
                    getOptionLabel={(opt) => opt?.name ?? ""}
                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                    onChange={(_, val) => methods.setValue("defaultUnitId", val?.id || 0, { shouldValidate: true })}
                    fullWidth
                  />
                </TableCell>
              </TableRow>

              {/* Group */}
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>Nhóm sản phẩm mặc định</TableCell>
                <TableCell>
                  <Field.Autocomplete
                    name="defaultProductGroupId"
                    options={categories}
                    value={categories.find((c) => c.id === methods.watch("defaultProductGroupId")) || null}
                    getOptionLabel={(opt) => opt?.name ?? ""}
                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                    onChange={(_, val) => methods.setValue("defaultProductGroupId", val?.id || 0, { shouldValidate: true })}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} textAlign="right">
          <Button variant="contained" color="primary" type="submit">
            Lưu cấu hình
          </Button>
        </Box>
      </Form>
    </Box>
  );
}

