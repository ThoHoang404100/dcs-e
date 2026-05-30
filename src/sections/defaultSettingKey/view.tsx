// import { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Stack,
//   CircularProgress,
//   Container,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableRow,
//   Paper,
// } from "@mui/material";
// import { Save } from "@mui/icons-material";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z as zod } from "zod";
// import { toast } from "sonner";

// import axiosInstance from "src/lib/axios";
// import { Form, Field } from "src/components/hook-form";
// import { useGetUnits } from "src/actions/unit";
// import { useGetCategories } from "src/actions/category";

// const SettingsSchema = zod.object({
//   productGroupVat: zod.coerce.number().min(0).max(100),
//   productVat: zod.coerce.number().min(0).max(100),

//   productUnitId: zod
//     .number()
//     .min(1, "Vui lòng chọn đơn vị tính"),

//   productManufacturerId: zod
//     .number()
//     .min(1, "Vui lòng chọn loại sản phẩm"),

//   quotationVat: zod.coerce.number().min(0).max(100),

//   quotationQuantity: zod.coerce.number().min(1),

//   defaultSupplierName: zod.string().optional(),
// });

// type SettingsType = zod.infer<typeof SettingsSchema>;

// export function DefaultKeySettings() {
//   const [settingId, setSettingId] = useState(0);

//   const { units = [], unitsLoading } = useGetUnits({
//     pageNumber: 1,
//     pageSize: 999,
//   });

//   const {
//     categories = [],
//     categoriesLoading,
//   } = useGetCategories({
//     pageNumber: 1,
//     pageSize: 999,
//   });

//   const methods = useForm<SettingsType>({
//     resolver: zodResolver(SettingsSchema),
//     defaultValues: {
//       productGroupVat: 0,
//       productVat: 0,

//       productUnitId: 0,
//       productManufacturerId: 0,

//       quotationVat: 0,
//       quotationQuantity: 1,

//       defaultSupplierName: "",
//     },
//   });

//   const {
//     watch,
//     setValue,
//     reset,
//     handleSubmit,
//   } = methods;

//   const selectedUnitId = watch("productUnitId");

//   const selectedManufacturerId = watch(
//     "productManufacturerId"
//   );

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axiosInstance.post(
//           "/api/v1/defaultKey/Get"
//         );

//         const data = res?.data;

//         if (data) {
//           setSettingId(data.id ?? 0);

//           reset({
//             productGroupVat:
//               data.productGroupVat ?? 0,

//             productVat:
//               data.productVat ?? 0,

//             productUnitId:
//               data.productUnitId ?? 0,

//             productManufacturerId:
//               data.productManufacturerId ?? 0,

//             quotationVat:
//               data.quotationVat ?? 0,

//             quotationQuantity:
//               data.quotationQuantity ?? 1,

//             defaultSupplierName:
//               data.defaultSupplierName ?? "",
//           });
//         }
//       } catch (error) {
//         console.error(error);

//         toast.error(
//           "Không thể tải cấu hình mặc định"
//         );
//       }
//     };

//     fetchData();
//   }, [reset]);

//   const onSubmit = async (
//     data: SettingsType
//   ) => {
//     try {
//       const payload = {
//         id: settingId,

//         productGroupVat:
//           data.productGroupVat,

//         productVat:
//           data.productVat,

//         productUnitId:
//           data.productUnitId,

//         productManufacturerId:
//           data.productManufacturerId,

//         quotationVat:
//           data.quotationVat,

//         quotationQuantity:
//           data.quotationQuantity,

//         defaultSupplierName:
//           data.defaultSupplierName,

//         updatedAt:
//           new Date().toISOString(),
//       };

//       console.log(
//         "Default Setting Payload",
//         payload
//       );

//       await axiosInstance.post(
//         "/api/v1/defaultKey/Create",
//         payload
//       );

//       toast.success(
//         "Lưu cấu hình thành công!"
//       );
//     } catch (error: any) {
//       console.error(error);

//       toast.error(
//         error?.response?.data?.message ||
//         "Lưu cấu hình thất bại"
//       );
//     }
//   };

//   if (unitsLoading || categoriesLoading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight={400}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ py: 3 }}>
//       <Typography
//         variant="h4"
//         fontWeight={700}
//         sx={{ mb: 3 }}
//       >
//         Cài đặt mặc định
//       </Typography>

//       <Form
//         methods={methods}
//         onSubmit={handleSubmit(onSubmit)}
//       >
//         <Paper
//           elevation={1}
//           sx={{
//             overflow: "hidden",
//             borderRadius: 1,
//           }}
//         >
//           <TableContainer>
//             <Table>
//               <TableBody>
//                 <TableRow>
//                   <TableCell
//                     colSpan={2}
//                     sx={{
//                       bgcolor: "grey.100",
//                       fontWeight: 700,
//                       fontSize: 15,
//                     }}
//                   >
//                     SẢN PHẨM
//                   </TableCell>
//                 </TableRow>



//                 <TableRow hover>
//                   <TableCell sx={{ pl: 5 }}>
//                     VAT sản phẩm (%)
//                   </TableCell>

//                   <TableCell>
//                     <Field.Text
//                       name="productVat"
//                       type="number"
//                     />
//                   </TableCell>
//                 </TableRow>

//                 <TableRow hover>
//                   <TableCell sx={{ pl: 5 }}>
//                     Đơn vị tính mặc định
//                   </TableCell>

//                   <TableCell>
//                     <Field.Autocomplete
//                       name="productUnitId"
//                       options={units}
//                       value={
//                         units.find(
//                           (u) =>
//                             u.id ===
//                             selectedUnitId
//                         ) || null
//                       }
//                       getOptionLabel={(option) =>
//                         option?.name ?? ""
//                       }
//                       isOptionEqualToValue={(
//                         option,
//                         value
//                       ) =>
//                         option?.id === value?.id
//                       }
//                       onChange={(
//                         _,
//                         newValue
//                       ) =>
//                         setValue(
//                           "productUnitId",
//                           newValue?.id || 0,
//                           {
//                             shouldValidate: true,
//                             shouldDirty: true,
//                           }
//                         )
//                       }
//                       fullWidth
//                     />
//                   </TableCell>
//                 </TableRow>

//                 <TableRow hover>
//                   <TableCell sx={{ pl: 5 }}>
//                     Nhà cung cấp mặc định
//                   </TableCell>

//                   <TableCell>
//                     <Field.Text
//                       name="defaultSupplierName"
//                     />
//                   </TableCell>
//                 </TableRow>

//                 <TableRow>
//                   <TableCell
//                     colSpan={2}
//                     sx={{
//                       bgcolor: "grey.100",
//                       fontWeight: 700,
//                       fontSize: 15,
//                     }}
//                   >
//                     NHÓM SẢN PHẨM
//                   </TableCell>
//                 </TableRow>
//                 <TableRow hover>
//                   <TableCell
//                     sx={{
//                       width: "35%",
//                       pl: 5,
//                     }}
//                   >
//                     VAT nhóm sản phẩm (%)
//                   </TableCell>

//                   <TableCell>
//                     <Field.Text
//                       name="productGroupVat"
//                       type="number"
//                     />
//                   </TableCell>
//                 </TableRow>
//                 <TableRow hover>
//                   <TableCell sx={{ pl: 5 }}>
//                     Loại sản phẩm mặc định
//                   </TableCell>

//                   <TableCell>
//                     <Field.Autocomplete
//                       name="productManufacturerId"
//                       options={categories}
//                       value={
//                         categories.find(
//                           (c) =>
//                             c.id ===
//                             selectedManufacturerId
//                         ) || null
//                       }
//                       getOptionLabel={(option) =>
//                         option?.name ?? ""
//                       }
//                       isOptionEqualToValue={(
//                         option,
//                         value
//                       ) =>
//                         option?.id === value?.id
//                       }
//                       onChange={(
//                         _,
//                         newValue
//                       ) =>
//                         setValue(
//                           "productManufacturerId",
//                           newValue?.id || 0,
//                           {
//                             shouldValidate: true,
//                             shouldDirty: true,
//                           }
//                         )
//                       }
//                       fullWidth
//                     />
//                   </TableCell>
//                 </TableRow>

//                 <TableRow>
//                   <TableCell
//                     colSpan={2}
//                     sx={{
//                       bgcolor: "grey.100",
//                       fontWeight: 700,
//                       fontSize: 15,
//                     }}
//                   >
//                     BÁO GIÁ
//                   </TableCell>
//                 </TableRow>



//                 <TableRow hover>
//                   <TableCell sx={{ pl: 5 }}>
//                     VAT báo giá (%)
//                   </TableCell>

//                   <TableCell>
//                     <Field.Text
//                       name="quotationVat"
//                       type="number"
//                     />
//                   </TableCell>
//                 </TableRow>

//                 <TableRow hover>
//                   <TableCell sx={{ pl: 5 }}>
//                     Số lượng mặc định
//                   </TableCell>

//                   <TableCell>
//                     <Field.Text
//                       name="quotationQuantity"
//                       type="number"
//                     />
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </Paper>

//         <Stack
//           direction="row"
//           justifyContent="flex-end"
//           sx={{ mt: 3 }}
//         >
//           <Button
//             type="submit"
//             variant="contained"
//             startIcon={<Save />}
//           >
//             Lưu thay đổi
//           </Button>
//         </Stack>
//       </Form>
//     </Container>
//   );
// }

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  MenuItem,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from "zod";
import { toast } from "sonner";

import axiosInstance from "src/lib/axios";
import { Form, Field } from "src/components/hook-form";
import { useGetUnits } from "src/actions/unit";
import { useGetCategories } from "src/actions/category";

const SettingsSchema = zod.object({
  productGroupVat: zod.number().min(0).max(255),
  productVat: zod.number().min(0).max(255),
  productUnitId: zod.number().min(1, "Vui lòng chọn đơn vị tính"),
  productManufacturerId: zod.number().min(1, "Vui lòng chọn loại sản phẩm"),
  quotationVat: zod.number().min(0).max(255),
  quotationQuantity: zod.number().min(1),
  defaultSupplierName: zod.string().optional(),
});

type SettingsType = zod.infer<typeof SettingsSchema>;

// Hàm chuyển đổi hiển thị VAT
const formatVatDisplay = (value: number | null | undefined): string => {
  if (value === 255) return "Không chịu thuế";
  return value?.toString() || "";
};

export function DefaultKeySettings() {
  const [settingId, setSettingId] = useState(0);

  const { units = [], unitsLoading } = useGetUnits({ pageNumber: 1, pageSize: 999 });
  const { categories = [], categoriesLoading } = useGetCategories({ pageNumber: 1, pageSize: 999 });

  const methods = useForm<SettingsType>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      productGroupVat: 0,
      productVat: 0,
      productUnitId: 0,
      productManufacturerId: 0,
      quotationVat: 0,
      quotationQuantity: 1,
      defaultSupplierName: "",
    },
  });

  const { watch, setValue, reset, handleSubmit } = methods;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.post("/api/v1/defaultKey/Get");
        const data = res?.data;

        if (data) {
          setSettingId(data.id ?? 0);
          reset({
            productGroupVat: data.productGroupVat ?? 0,
            productVat: data.productVat ?? 0,
            productUnitId: data.productUnitId ?? 0,
            productManufacturerId: data.productManufacturerId ?? 0,
            quotationVat: data.quotationVat ?? 0,
            quotationQuantity: data.quotationQuantity ?? 1,
            defaultSupplierName: data.defaultSupplierName ?? "",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải cấu hình mặc định");
      }
    };

    fetchData();
  }, [reset]);

  const onSubmit = async (data: SettingsType) => {
    try {
      const payload = {
        id: settingId,
        productGroupVat: data.productGroupVat,
        productVat: data.productVat,
        productUnitId: data.productUnitId,
        productManufacturerId: data.productManufacturerId,
        quotationVat: data.quotationVat,
        quotationQuantity: data.quotationQuantity,
        defaultSupplierName: data.defaultSupplierName,
        updatedAt: new Date().toISOString(),
      };

      await axiosInstance.post("/api/v1/defaultKey/Create", payload);
      toast.success("Lưu cấu hình thành công!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lưu cấu hình thất bại");
    }
  };

  if (unitsLoading || categoriesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Cài đặt mặc định
      </Typography>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Paper elevation={1} sx={{ overflow: "hidden", borderRadius: 1 }}>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} sx={{ bgcolor: "grey.100", fontWeight: 700, fontSize: 15 }}>
                    SẢN PHẨM
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ pl: 5 }}>VAT sản phẩm (%)</TableCell>
                  <TableCell>
                    <Field.Select
                      name="productVat"
                      fullWidth
                      size="small"
                    >
                      <MenuItem value={255}>Không chịu thuế</MenuItem>
                      {Array.from({ length: 101 }, (_, i) => (
                        <MenuItem key={i} value={i}>
                          {i}%
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ pl: 5 }}>Đơn vị tính mặc định</TableCell>
                  <TableCell>
                    <Field.Autocomplete
                      name="productUnitId"
                      options={units}
                      value={units.find((u) => u.id === watch("productUnitId")) || null}
                      getOptionLabel={(option) => option?.name ?? ""}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      onChange={(_, newValue) => setValue("productUnitId", newValue?.id || 0, { shouldValidate: true })}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ pl: 5 }}>Nhà cung cấp mặc định</TableCell>
                  <TableCell>
                    <Field.Text name="defaultSupplierName" size="small" fullWidth />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ bgcolor: "grey.100", fontWeight: 700, fontSize: 15 }}>
                    NHÓM SẢN PHẨM
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ width: "35%", pl: 5 }}>VAT nhóm sản phẩm (%)</TableCell>
                  <TableCell>
                    <Field.Select name="productGroupVat" fullWidth size="small">
                      <MenuItem value={255}>Không chịu thuế</MenuItem>
                      {Array.from({ length: 101 }, (_, i) => (
                        <MenuItem key={i} value={i}>
                          {i}%
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ pl: 5 }}>Loại sản phẩm mặc định</TableCell>
                  <TableCell>
                    <Field.Autocomplete
                      name="productManufacturerId"
                      options={categories}
                      value={categories.find((c) => c.id === watch("productManufacturerId")) || null}
                      getOptionLabel={(option) => option?.name ?? ""}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      onChange={(_, newValue) => setValue("productManufacturerId", newValue?.id || 0, { shouldValidate: true })}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ bgcolor: "grey.100", fontWeight: 700, fontSize: 15 }}>
                    BÁO GIÁ
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ pl: 5 }}>VAT báo giá (%)</TableCell>
                  <TableCell>
                    <Field.Select name="quotationVat" fullWidth size="small">
                      <MenuItem value={255}>Không chịu thuế</MenuItem>
                      {Array.from({ length: 101 }, (_, i) => (
                        <MenuItem key={i} value={i}>
                          {i}%
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </TableCell>
                </TableRow>

                <TableRow hover>
                  <TableCell sx={{ pl: 5 }}>Số lượng mặc định</TableCell>
                  <TableCell>
                    <Field.Text name="quotationQuantity" type="number" size="small" fullWidth />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>
            Lưu thay đổi
          </Button>
        </Stack>
      </Form>
    </Container>
  );
}