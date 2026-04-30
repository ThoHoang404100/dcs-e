// import { useForm, useFieldArray, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     Button,
//     Stack,
//     Typography,
//     IconButton,
//     Box,
//     MenuItem,
//     Divider,
//     Tooltip,
//     InputAdornment,
//     Slider,
// } from "@mui/material";
// import { Iconify } from "src/components/iconify";
// import { Field, Form } from "src/components/hook-form";
// import { useGetCustomers } from "src/actions/customer";
// import { useDebounce } from "minimal-shared/hooks";
// import { useEffect, useState } from "react";
// import { ICustomerItem } from "src/types/customer";
// import { IProductFormEdit, IQuotationDao, IQuotationDetailDto, IQuotationDetails, IQuotationDto, IQuotationItem } from "src/types/quotation";
// import { QuotationItemsTable } from "./quotation-product-table";
// import { QuotationFormValues, quotationSchema } from "./schema/quotation-schema";
// import { addMoreProducts, createOrUpdateQuotation, editProductForm, useGetQuotation } from "src/actions/quotation";
// import { toast } from "sonner";
// import { generateQuotationNo } from "src/utils/random-func";
// import { mutate } from "swr";
// import { endpoints } from "src/lib/axios";
// import { QuotationCustomerForm } from "./quotation-customer-form";
// import { useAuthContext } from "src/auth/hooks";
// import { mapProductsToItems } from "./helper/mapProductsToItems";
// import { DetailItem } from "./helper/DetailItem";
// import { editAllQuotationDetails } from "./helper/mapQuotationProduct";
// import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";

// export type QuotationFormProps = {
//     selectedQuotation: IQuotationItem | null;
//     openForm: boolean;
//     onClose: () => void;
//     CopiedQuotation: IQuotationItem | null;
// };

// export function QuotationForm({ openForm, selectedQuotation, onClose, CopiedQuotation }: QuotationFormProps) {
//     const quotationId = selectedQuotation?.id ?? CopiedQuotation?.id ?? 0;
//     const { user } = useAuthContext();
//     const today = new Date();
//     const nextMonth = new Date();
//     nextMonth.setMonth(today.getMonth() + 1);
//     const sampleNote = `
// <p data-pm-slice="0 0 []">
//     - Giá trên <strong>đã bao gồm thuế GTGT</strong><br>
//     - Báo giá có giá trị trong 30 ngày<br>
//     - Tạm ứng 50% giá trị hợp đồng, ngay khi ký hợp đồng<br>
//     <strong>Ngân hàng Á Châu (ACB) - PGD Thảo Điền - TP.HCM</strong><br>
//     <strong>Tên tài khoản: Công ty TNHH GIẢI PHÁP DCS</strong><br>
//     <strong>Tài khoản số: 8100868</strong>
// </p>
// `;
//     const sampleDiscount = [0, 10, 20, 30];
//     const [originalItems, setOriginalItems] = useState<IQuotationDetailDto[]>([]);

//     const [totalPaid, setTotalPaid] = useState(0);

//     const [customerkeyword, setCustomerKeyword] = useState('');
//     const debouncedCustomerKw = useDebounce(customerkeyword, 300);

//     const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

//     const [quotationProductDetail, setQuotationProductDetail] = useState<IQuotationDetails>();

//     const { quotation: CurrentQuotation, quotationLoading } = useGetQuotation({
//         quotationId: quotationId,
//         pageNumber: 1,
//         pageSize: 999,
//         options: { enabled: !!selectedQuotation?.id }
//     });

//     const { customers, customersLoading, mutation: refetchCustomers } = useGetCustomers({
//         pageNumber: 1,
//         pageSize: 999,
//         key: debouncedCustomerKw,
//         enabled: openForm || !!selectedQuotation?.customerId
//     });

//     const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

//     const defaultValues: QuotationFormValues = {
//         customer: 0,
//         quotationNo: generateQuotationNo(),
//         date: today.toISOString(),
//         validUntil: nextMonth.toISOString(),
//         status: 1,
//         discount: 0,
//         items: [{
//             id: undefined,
//             product: "",
//             unit: "",
//             unitName: "",
//             qty: 1,
//             price: 0,
//             vat: 0
//         }],
//         notes: sampleNote,
//         paid: 0
//     };

//     const methods = useForm<QuotationFormValues>({
//         mode: 'onSubmit',
//         resolver: zodResolver(quotationSchema),
//         defaultValues,
//     });

//     const {
//         reset,
//         watch,
//         setValue,
//         handleSubmit,
//         control,
//         formState: { isSubmitting },
//     } = methods;

//     const customerId = watch('customer');

//     useEffect(() => {
//         //copy case
//         if (CopiedQuotation) {
//             if (!CurrentQuotation) return;
//             const currentDetails = CurrentQuotation.items.find(
//                 (q) => q.quotationID === CopiedQuotation.id
//             );

//             setQuotationProductDetail(currentDetails);

//             const mappedItems = mapProductsToItems(currentDetails?.products || []);

//             methods.reset({
//                 customer: CopiedQuotation.customerId ?? 0,
//                 quotationNo: generateQuotationNo(),
//                 date: today.toISOString(),
//                 validUntil: nextMonth.toISOString(),
//                 status: 1,
//                 discount: CopiedQuotation.discount,
//                 items: mappedItems,
//                 notes: CopiedQuotation.note ?? sampleNote,
//                 paid: CopiedQuotation.paid ?? 0
//             });

//             return;
//         }
//         //end copy case

//         //create case
//         if (!selectedQuotation) {
//             methods.reset(defaultValues);
//             setOriginalItems(
//                 defaultValues.items.map((item, i) => ({
//                     productID: item.product ?? "",
//                     quantity: item.qty ?? 0,
//                     row: i + 1,
//                     Unit: item.unitName || "",
//                     Price: item.price || 0
//                 }))
//             );
//             return;
//         }
//         //end create case

//         //update case
//         if (!CurrentQuotation) return;

//         const currentDetails = CurrentQuotation.items.find(
//             (q) => q.quotationID === selectedQuotation.id
//         );

//         if (currentDetails) {
//             setQuotationProductDetail(currentDetails);
//         }

//         const mappedItems = mapProductsToItems(currentDetails?.products || []);
//         methods.setValue("customer", selectedQuotation.customerId ?? 0);
//         methods.setValue("quotationNo", selectedQuotation.quotationNo);
//         methods.setValue("date", selectedQuotation.createdDate ?? null);
//         methods.setValue("validUntil", selectedQuotation.expiryDate ?? null);
//         methods.setValue("status", selectedQuotation.status ?? 1);
//         methods.setValue("items", mappedItems);
//         methods.setValue("notes", selectedQuotation.note ?? "");
//         methods.setValue("discount", selectedQuotation.discount);
//         methods.setValue("paid", selectedQuotation.paid);

//         setOriginalItems(
//             mappedItems.map((item, i) => ({
//                 productID: item.product ?? "",
//                 quantity: item.qty ?? 0,
//                 row: i + 1,
//                 Unit: item.unitName || "",
//                 Price: item.price || 0
//             }))
//         );
//         //end update case

//     }, [selectedQuotation, CopiedQuotation, CurrentQuotation, methods.reset]);

//     useEffect(() => {
//         if (!customerId) {
//             setSelectedCustomer(null);
//             return;
//         }

//         const found = customers.find((cus) => Number(cus.id) === Number(customerId));
//         if (found) {
//             setSelectedCustomer(found);
//         }
//     }, [customerId, customers]);

//     const { fields, append, remove } = useFieldArray({
//         control,
//         name: "items",
//     });

//     const onSubmit = handleSubmit(async (data: QuotationFormValues) => {
//         try {
//             const basePayload = {
//                 quotationNo: data.quotationNo,
//                 customerID: data.customer,
//                 createDate: data.date,
//                 expiryDate: data.validUntil,
//                 discount: data.discount || 0,
//                 note: data.notes || '',
//                 paid: data.paid || 0,
//                 Type: 'Quotation',
//                 Status: data.status
//             };

//             const bodyPayload: IQuotationDto = {
//                 ...basePayload,
//                 quotationDetails: data.items
//                     .filter((item) => item.product && item.product !== "")
//                     .map((item, i): IQuotationDetailDto => ({
//                         productID: item.product ?? "",
//                         quantity: item.qty ?? 0,
//                         row: i + 1,
//                         Unit: item.unitName || "",
//                         Price: item.price || 0,
//                     })),

//             };

//             const updatePayload: IQuotationDao = {
//                 ...basePayload,
//                 seller: user?.accessToken || "",
//             };

//             const productPayload: IProductFormEdit[] = data.items
//                 .map((item, idx) => ({
//                     rowId: item.id,
//                     productId: Number(item.product),
//                     price: item.price || 0,
//                     quantity: item.qty || 0,
//                     unit: item.unitName ?? "",
//                 }));

//             await createOrUpdateQuotation(
//                 selectedQuotation?.id ?? null,
//                 bodyPayload,
//                 updatePayload
//             );

//             if (selectedQuotation) {
//                 if (!productPayload) return;

//                 for (const item of productPayload) {
//                     await editProductForm(item.rowId, item);
//                 }

//                 const newItems = bodyPayload.quotationDetails.filter(
//                     (item) => !originalItems.some((o) => o.productID === item.productID)
//                 );

//                 if (newItems.length > 0) {
//                     await addMoreProducts(selectedQuotation.id, newItems);
//                 }
//                 else {
//                     await editAllQuotationDetails(bodyPayload, selectedQuotation.id);
//                 }
//             }

//             toast.success(
//                 selectedQuotation
//                     ? "Dữ liệu báo giá đã được thay đổi!"
//                     : "Tạo báo giá thành công!"
//             );

//             mutate(
//                 (k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"),
//                 undefined,
//                 { revalidate: true }
//             );

//             if (selectedQuotation?.id) {
//                 mutate(endpoints.quotation.detail(selectedQuotation.id, `?pageNumber=1&pageSize=999`));
//             }

//             onClose();
//             reset(defaultValues);
//         } catch (error: any) {
//             console.error(error);
//             if (error.message) {
//                 toast.error(error.message);
//             } else {
//                 toast.error("Đã có lỗi xảy ra!");
//             }
//         }
//     });

//     const renderLeftColumn = () => (
//         <Stack width={{ xs: "100%", sm: "100%", md: "100%", lg: "30%" }} spacing={3}>
//             {/* Section Thông tin khách hàng */}
//             <Box>
//                 <Stack direction={{ xs: "column", md: "column", lg: "column", xl: "row" }} gap={2} justifyContent="space-between">
//                     <Typography variant="subtitle2">Thông tin khách hàng</Typography>
//                     <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
//                         <Field.Autocomplete
//                             name="customer"
//                             label="Chọn khách hàng có sẵn"
//                             options={customers}
//                             loading={customersLoading}
//                             getOptionLabel={(opt) => opt?.name ?
//                                 opt.name :
//                                 opt?.companyName ?
//                                     opt.companyName : ''}
//                             isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
//                             onInputChange={(_, value) => setCustomerKeyword(value)}
//                             value={selectedCustomer}
//                             fullWidth
//                             onChange={(_, newValue) => {
//                                 methods.setValue('customer', newValue?.id ?? 0, { shouldValidate: true });
//                                 setCustomerKeyword(newValue?.name ?? '');
//                             }}
//                             noOptionsText="Không có dữ liệu"
//                             sx={{ flex: 1, minWidth: 200 }}
//                             renderOption={(props, option) => (
//                                 <li {...props} key={option.id}>
//                                     {option.name ? option.name : option.companyName}
//                                 </li>
//                             )}
//                         />
//                         <Stack direction="row">
//                             <Tooltip title="Tạo khách hàng mới">
//                                 <IconButton
//                                     color="inherit"
//                                     sx={{
//                                         '&:hover': {
//                                             backgroundColor: 'transparent'
//                                         },
//                                     }}
//                                     onClick={() => setIsCreatingCustomer(true)}
//                                 >
//                                     <Iconify
//                                         icon="line-md:person-add"
//                                     />
//                                 </IconButton>
//                             </Tooltip>
//                         </Stack>
//                     </Stack>
//                 </Stack>
//                 <Stack spacing={2} sx={{ mt: 2 }}>
//                     <Stack direction="row" gap={2}>
//                         <DetailItem label="Tên khách hàng" value={selectedCustomer?.name ?? ""} />
//                         <DetailItem label="Tên công ty" value={selectedCustomer?.companyName ?? ""} />
//                     </Stack>
//                     <Stack direction="row" gap={2}>
//                         <DetailItem label="Email khách hàng" value={selectedCustomer?.email ?? ""} />
//                         <DetailItem label="Số điện thoại" value={selectedCustomer?.phone ?? ""} />
//                     </Stack>
//                 </Stack>
//             </Box>

//             {/* Section Phiếu */}
//             <Box>
//                 <Typography variant="subtitle2">
//                     Phiếu
//                 </Typography>
//                 <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
//                     <Field.Text
//                         label="Mã báo giá"
//                         name="quotationNo"
//                         disabled={selectedQuotation ? true : false}
//                     />
//                     <Field.Select label="Trạng thái" name="status">
//                         <MenuItem key={0} value={0}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
//                                 <span>Bỏ qua</span>
//                                 <Iconify icon="fluent-color:dismiss-circle-16" />
//                             </Box>
//                         </MenuItem>
//                         <MenuItem key={1} value={1}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
//                                 <span>Nháp</span>
//                                 <Iconify icon="material-symbols:draft" />
//                             </Box>
//                         </MenuItem>
//                         <MenuItem key={2} value={2}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
//                                 <span>Đang thực hiện</span>
//                                 <Iconify icon="line-md:uploading-loop" />
//                             </Box>
//                         </MenuItem>
//                         <MenuItem key={3} value={3}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
//                                 <span>Đã hoàn thành</span>
//                                 <Iconify icon="fluent-color:checkmark-circle-16" />
//                             </Box>
//                         </MenuItem>
//                     </Field.Select>
//                 </Stack>
//                 <Stack direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
//                     <Field.DatePicker name="date" label="Ngày báo giá" />
//                     <Field.DatePicker name="validUntil" label="Hiệu lực đến" />
//                 </Stack>
//                 <Stack display="none" direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }} spacing={2}>
//                     <Field.Text
//                         name="discount"
//                         label="Khuyến mãi (%)"
//                         placeholder="0.00"
//                         type="number"
//                         sx={{ width: 150 }}
//                         slotProps={{
//                             inputLabel: { shrink: true },
//                             input: {
//                                 endAdornment: (
//                                     <InputAdornment position="start" sx={{ mr: 0.75 }}>
//                                         <Box component="span" sx={{ color: 'text.disabled' }}>
//                                             %
//                                         </Box>
//                                     </InputAdornment>
//                                 ),
//                             },
//                         }}
//                     />
//                     <Controller
//                         name="discount"
//                         control={control}
//                         defaultValue={0}
//                         render={({ field }) => (
//                             <Slider
//                                 {...field}
//                                 step={null}
//                                 min={0}
//                                 max={30}
//                                 marks={sampleDiscount.map((val) => ({
//                                     value: val,
//                                     label: `${val}%`,
//                                 }))}
//                                 value={field.value ?? 0}
//                                 onChange={(_, val) => field.onChange(val)}
//                                 valueLabelDisplay="auto"
//                                 valueLabelFormat={(value) => `${value}%`}
//                                 sx={{ alignSelf: "center", width: "calc(100% - 24px)" }}
//                             />
//                         )}
//                     />
//                 </Stack>
//                 <Stack spacing={1.5} my={2}>
//                     <Typography variant="subtitle2">Ghi chú</Typography>
//                     <Field.Editor
//                         name="notes"
//                         sx={{
//                             height: { xs: 'auto', sm: 'auto', md: 'auto', lg: 'auto', xl: 330 }
//                         }}
//                     />
//                 </Stack>
//                 <Field.VNCurrencyInput name="paid" label="Số tiền tạm ứng" required sx={{ mt: 2, maxWidth: 200, display: 'none' }} />
//             </Box>
//         </Stack>
//     );

//     const renderDetails = () => (
//         <Stack direction={{ xs: "column", sm: "column", md: "column", lg: "row", xl: "row" }} height="100%" spacing={3} sx={{ mt: 1 }}>
//             {renderLeftColumn()}
//             <Divider
//                 flexItem
//                 orientation="vertical"
//                 sx={{
//                     display: { xs: "none", md: "block" },
//                 }}
//             />
//             <Divider
//                 flexItem
//                 orientation="horizontal"
//                 sx={{
//                     display: { xs: "block", md: "none" },
//                 }}
//             />
//             <QuotationItemsTable
//                 quotationProductDetail={quotationProductDetail}
//                 idQuotation={selectedQuotation?.id}
//                 methods={methods}
//                 fields={fields}
//                 append={append}
//                 remove={remove}
//                 setPaid={setTotalPaid}
//             />
//         </Stack>
//     );

//     const renderActions = () => (
//         <Box display="flex" flexDirection="row" gap={2}>
//             <Button
//                 variant="outlined"
//                 color="inherit"
//                 size="medium"
//                 sx={{ flex: 1 }}
//                 onClick={() => {
//                     onClose();
//                     reset(defaultValues);
//                 }}
//                 disabled={isSubmitting}
//             >
//                 Hủy
//             </Button>
//             <Button
//                 type="submit"
//                 variant="contained"
//                 size="medium"
//                 sx={{ flex: 1, whiteSpace: 'nowrap', px: 3 }}
//                 disabled={isCreatingCustomer}
//                 loading={isSubmitting}
//             >
//                 {selectedQuotation ? `Lưu báo giá` : 'Tạo báo giá'}
//             </Button>
//         </Box>
//     );

//     return (
//         <Dialog
//             open={openForm}
//             onClose={
//                 () => {
//                     onClose();
//                     reset(defaultValues);
//                 }
//             }
//             fullScreen>
//             <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%' }}>
//                 <DialogTitle
//                     sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         borderBottom: "1px solid",
//                         borderColor: "divider",
//                         py: 2,
//                         px: 3,
//                     }}
//                 >
//                     {selectedQuotation ? `Chỉnh sửa - ${selectedQuotation.quotationNo}` : 'Tạo báo giá'}
//                     {renderActions()}
//                 </DialogTitle>
//                 <DialogContent
//                     sx={{
//                         pb: 0,
//                         pt: '10px !important',
//                         overflowY: "auto",
//                     }}
//                 >
//                     {quotationLoading ? renderSkeleton() : renderDetails()}
//                 </DialogContent>
//             </Form>
//             <QuotationCustomerForm
//                 openChild={isCreatingCustomer}
//                 setOpenChild={setIsCreatingCustomer}
//                 methodsQuotation={methods}
//                 setCustomerKeyword={setCustomerKeyword}
//                 setSelectedCustomer={setSelectedCustomer}
//                 refetchCustomers={refetchCustomers}
//             />
//         </Dialog>
//     );
// }


// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     Button,
//     Stack,
//     Typography,
//     IconButton,
//     Box,
//     MenuItem,
//     Divider,
//     Tooltip,
//     Grid,
// } from "@mui/material";
// import { Iconify } from "src/components/iconify";
// import { Field, Form } from "src/components/hook-form";
// import { useGetCustomers } from "src/actions/customer";
// import { useDebounce } from "minimal-shared/hooks";
// import { useEffect, useState, useMemo } from "react";
// import { ICustomerItem } from "src/types/customer";
// import {
//     IProductFormEdit,
//     IQuotationDao,
//     IQuotationDetailDto,
//     IQuotationDetails,
//     IQuotationDto,
//     IQuotationItem
// } from "src/types/quotation";
// import { QuotationItemsTable } from "./quotation-product-table";
// import { QuotationFormValues, quotationSchema } from "./schema/quotation-schema";
// import {
//     addMoreProducts,
//     createOrUpdateQuotation,
//     editProductForm,
//     useGetQuotation,
// } from "src/actions/quotation";
// import { editAllQuotationDetails } from "./helper/mapQuotationProduct";

// import { toast } from "sonner";
// import { generateQuotationNo } from "src/utils/random-func";
// import { mutate } from "swr";
// import { endpoints } from "src/lib/axios";
// import { QuotationCustomerForm } from "./quotation-customer-form";
// import { useAuthContext } from "src/auth/hooks";
// import { mapProductsToItems } from "./helper/mapProductsToItems";
// import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";

// export type QuotationFormProps = {
//     selectedQuotation: IQuotationItem | null;
//     openForm: boolean;
//     onClose: () => void;
//     CopiedQuotation: IQuotationItem | null;
// };

// export function QuotationForm({ openForm, selectedQuotation, onClose, CopiedQuotation }: QuotationFormProps) {
//     const quotationId = selectedQuotation?.id ?? CopiedQuotation?.id ?? 0;
//     const { user } = useAuthContext();
//     const today = new Date();
//     const nextMonth = new Date();
//     nextMonth.setMonth(today.getMonth() + 1);

//     const sampleNote = `
// <p data-pm-slice="0 0 []">
//     - Giá trên <strong>đã bao gồm thuế GTGT</strong><br>
//     - Báo giá có giá trị trong 30 ngày<br>
//     - Tạm ứng 50% giá trị hợp đồng, ngay khi ký hợp đồng<br>
//     <strong>Ngân hàng Á Châu (ACB) - PGD Thảo Điền - TP.HCM</strong><br>
//     <strong>Tên tài khoản: Công ty TNHH GIẢI PHÁP DCS</strong><br>
//     <strong>Tài khoản số: 8100868</strong>
// </p>
// `;

//     const [originalItems, setOriginalItems] = useState<IQuotationDetailDto[]>([]);
//     const [totalPaid, setTotalPaid] = useState(0);
//     const [customerkeyword, setCustomerKeyword] = useState('');
//     const debouncedCustomerKw = useDebounce(customerkeyword, 300);
//     const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
//     const [quotationProductDetail, setQuotationProductDetail] = useState<IQuotationDetails>();

//     const { quotation: CurrentQuotation, quotationLoading } = useGetQuotation({
//         quotationId,
//         pageNumber: 1,
//         pageSize: 999,
//         options: { enabled: !!selectedQuotation?.id }
//     });

//     const { customers, customersLoading, mutation: refetchCustomers } = useGetCustomers({
//         pageNumber: 1,
//         pageSize: 999,
//         key: debouncedCustomerKw,
//         enabled: openForm || !!selectedQuotation?.customerId
//     });

//     const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

//     const defaultValues: QuotationFormValues = {
//         customer: 0,
//         quotationNo: generateQuotationNo(),
//         date: today.toISOString(),
//         validUntil: nextMonth.toISOString(),
//         status: 1,
//         discount: 0,
//         items: [{ id: undefined, product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 }],
//         notes: sampleNote,
//         paid: 0,
//         cusName: "",
//         companyName: "",
//         taxCode: "",
//         phone: "",
//         address: "",
//     };

//     const methods = useForm<QuotationFormValues>({
//         mode: 'onSubmit',
//         resolver: zodResolver(quotationSchema),
//         defaultValues,
//     });

//     const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;
//     const customerId = watch('customer');
//     const watchItems = watch('items');

//     // Tính tổng tiền thanh toán
//     const grandTotal = useMemo(() => {
//         return watchItems?.reduce((acc, item) => {
//             const qty = Number(item.qty) || 0;
//             const price = Number(item.price) || 0;
//             const vat = Number(item.vat) || 0;
//             return acc + Math.round(qty * price * (1 + vat / 100));
//         }, 0) || 0;
//     }, [watchItems]);

//     // Fill thông tin khách hàng
//     useEffect(() => {
//         if (!selectedCustomer) return;
//         setValue("cusName", selectedCustomer.name || "");
//         setValue("companyName", selectedCustomer.companyName || "");
//         setValue("taxCode", selectedCustomer.taxCode || "");
//         setValue("phone", selectedCustomer.phone || "");
//         setValue("address", selectedCustomer.address || "");
//     }, [selectedCustomer, setValue]);

//     // Load quotation data
//     useEffect(() => {
//         if (CopiedQuotation) {
//             if (!CurrentQuotation) return;
//             const currentDetails = CurrentQuotation.items.find(q => q.quotationID === CopiedQuotation.id);
//             setQuotationProductDetail(currentDetails);
//             const mappedItems = mapProductsToItems(currentDetails?.products || []);
//             methods.reset({
//                 customer: CopiedQuotation.customerId ?? 0,
//                 quotationNo: generateQuotationNo(),
//                 date: today.toISOString(),
//                 validUntil: nextMonth.toISOString(),
//                 status: 1,
//                 discount: CopiedQuotation.discount,
//                 items: mappedItems,
//                 notes: CopiedQuotation.note ?? sampleNote,
//                 paid: CopiedQuotation.paid ?? 0,
//                 cusName: "",
//                 companyName: "",
//                 taxCode: "",
//                 phone: "",
//                 address: "",
//             });
//             return;
//         }

//         if (!selectedQuotation) {
//             methods.reset(defaultValues);
//             setOriginalItems(defaultValues.items.map((item, i) => ({
//                 productID: item.product ?? "",
//                 quantity: item.qty ?? 0,
//                 row: i + 1,
//                 Unit: item.unitName || "",
//                 Price: item.price || 0
//             })));
//             return;
//         }

//         if (!CurrentQuotation) return;

//         const currentDetails = CurrentQuotation.items.find(q => q.quotationID === selectedQuotation.id);
//         if (currentDetails) setQuotationProductDetail(currentDetails);

//         const mappedItems = mapProductsToItems(currentDetails?.products || []);
//         methods.setValue("customer", selectedQuotation.customerId ?? 0);
//         methods.setValue("quotationNo", selectedQuotation.quotationNo);
//         methods.setValue("date", selectedQuotation.createdDate ?? null);
//         methods.setValue("validUntil", selectedQuotation.expiryDate ?? null);
//         methods.setValue("status", selectedQuotation.status ?? 1);
//         methods.setValue("items", mappedItems);
//         methods.setValue("notes", selectedQuotation.note ?? "");
//         methods.setValue("discount", selectedQuotation.discount);
//         methods.setValue("paid", selectedQuotation.paid);

//         setOriginalItems(mappedItems.map((item, i) => ({
//             productID: item.product ?? "",
//             quantity: item.qty ?? 0,
//             row: i + 1,
//             Unit: item.unitName || "",
//             Price: item.price || 0
//         })));
//     }, [selectedQuotation, CopiedQuotation, CurrentQuotation, methods]);

//     useEffect(() => {
//         if (!customerId) {
//             setSelectedCustomer(null);
//             return;
//         }
//         const found = customers.find((cus) => Number(cus.id) === Number(customerId));
//         setSelectedCustomer(found || null);
//     }, [customerId, customers]);

//     const { fields, append, remove } = useFieldArray({ control, name: "items" });

//     const onSubmit = handleSubmit(async (data: QuotationFormValues) => {
//         try {
//             const basePayload = {
//                 quotationNo: data.quotationNo,
//                 customerID: data.customer,
//                 createDate: data.date,
//                 expiryDate: data.validUntil,
//                 discount: data.discount || 0,
//                 note: data.notes || '',
//                 paid: data.paid || 0,
//                 Type: 'Quotation',
//                 Status: data.status
//             };

//             const bodyPayload: IQuotationDto = {
//                 ...basePayload,
//                 quotationDetails: data.items
//                     .filter((item) => item.product && item.product !== "")
//                     .map((item, i): IQuotationDetailDto => ({
//                         productID: item.product ?? "",
//                         quantity: item.qty ?? 0,
//                         row: i + 1,
//                         Unit: item.unitName || "",
//                         Price: item.price || 0,
//                     })),
//             };

//             const updatePayload: IQuotationDao = {
//                 ...basePayload,
//                 seller: user?.accessToken || "",
//             };

//             const productPayload: IProductFormEdit[] = data.items.map((item) => ({
//                 rowId: item.id,
//                 productId: Number(item.product),
//                 price: item.price || 0,
//                 quantity: item.qty || 0,
//                 unit: item.unitName ?? "",
//             }));

//             await createOrUpdateQuotation(selectedQuotation?.id ?? null, bodyPayload, updatePayload);

//             if (selectedQuotation) {
//                 for (const item of productPayload) {
//                     await editProductForm(item.rowId, item);
//                 }

//                 const newItems = bodyPayload.quotationDetails.filter(
//                     (item) => !originalItems.some((o) => o.productID === item.productID)
//                 );

//                 if (newItems.length > 0) {
//                     await addMoreProducts(selectedQuotation.id, newItems);
//                 } else {
//                     await editAllQuotationDetails(bodyPayload, selectedQuotation.id); // ← Đã sửa
//                 }
//             }

//             toast.success(selectedQuotation ? "Dữ liệu báo giá đã được thay đổi!" : "Tạo báo giá thành công!");

//             mutate((k) => typeof k === "string" && k.startsWith("/api/v1/quotation/quotations"), undefined, { revalidate: true });
//             if (selectedQuotation?.id) {
//                 mutate(endpoints.quotation.detail(selectedQuotation.id, `?pageNumber=1&pageSize=999`));
//             }

//             onClose();
//             reset(defaultValues);
//         } catch (error: any) {
//             toast.error(error.message || "Đã có lỗi xảy ra!");
//         }
//     });

//     // ==================== RENDER DETAILS ====================
//     const renderDetails = () => (
//         <Stack spacing={4}>
//             <Grid container spacing={4}>
//                 {/* Thông tin khách hàng */}
//                 <Grid size={{ xs: 15, lg: 8 }}>
//                     <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Thông tin khách hàng</Typography>

//                     <Stack direction="row" gap={2} alignItems="flex-start" sx={{ mb: 2 }}>
//                         <Field.Autocomplete
//                             name="customer"
//                             label="Mã khách hàng *"
//                             options={customers}
//                             loading={customersLoading}
//                             getOptionLabel={(opt) => opt?.name || opt?.companyName || ''}
//                             onInputChange={(_, value) => setCustomerKeyword(value)}
//                             value={selectedCustomer}
//                             fullWidth
//                             onChange={(_, newValue) => {
//                                 methods.setValue('customer', newValue?.id ?? 0, { shouldValidate: true });
//                                 setCustomerKeyword(newValue?.name ?? '');
//                             }}
//                         />
//                         <Tooltip title="Tạo khách hàng mới">
//                             <IconButton color="primary" onClick={() => setIsCreatingCustomer(true)}>
//                                 <Iconify icon="line-md:person-add" />
//                             </IconButton>
//                         </Tooltip>
//                     </Stack>

//                     <Grid container spacing={2}>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                             <Field.Text name="cusName" label="Tên khách hàng" fullWidth />
//                         </Grid>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                             <Field.Text name="companyName" label="Tên công ty" fullWidth />
//                         </Grid>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                             <Field.Text name="taxCode" label="Mã số thuế" fullWidth />
//                         </Grid>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                             <Field.Text name="phone" label="Số điện thoại" fullWidth />
//                         </Grid>
//                         <Grid width={432} height={46}>
//                             <Field.Text name="address" label="Địa chỉ" fullWidth multiline rows={2} />
//                         </Grid>
//                         <Grid height={177} width={672}>

//                             <Typography variant="subtitle2" sx={{ mb: 1 }}>Ghi chú</Typography>
//                             <Field.Editor name="notes" sx={{ height: 180, fontSize: 13 }} />

//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 {/* Thông tin báo giá + Tổng tiền */}
//                 <Grid size={{ xs: 9, lg: 3 }}>
//                     <Grid container spacing={3}>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                             <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
//                                 Thông tin báo giá
//                             </Typography>
//                             <Stack spacing={2}>
//                                 <Field.Text
//                                     name="quotationNo"
//                                     label="Mã báo giá"
//                                     disabled={!!selectedQuotation}
//                                     fullWidth
//                                 />
//                                 <Field.DatePicker name="date" label="Ngày báo giá" />
//                                 <Field.DatePicker name="validUntil" label="Hiệu lực đến" />
//                                 <Field.Select name="status" label="Trạng thái" fullWidth>
//                                     <MenuItem value={1}>Nháp</MenuItem>
//                                     <MenuItem value={2}>Đang thực hiện</MenuItem>
//                                     <MenuItem value={3}>Hoàn thành</MenuItem>
//                                 </Field.Select>
//                             </Stack>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                             <Box sx={{
//                                 height: '100%',
//                                 minHeight: 200,
//                                 bgcolor: '#FFF7E6',
//                                 border: '2px solid #FFE7BA',
//                                 borderRadius: 2,
//                                 p: 3,
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 justifyContent: 'center',
//                                 alignItems: 'center',
//                                 textAlign: 'center'
//                             }}>
//                                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                                     Tổng tiền thanh toán
//                                 </Typography>
//                                 <Typography
//                                     variant="h3"
//                                     sx={{ color: '#D97706', fontWeight: 800 }}
//                                 >
//                                     {new Intl.NumberFormat('vi-VN').format(grandTotal)}đ
//                                 </Typography>
//                             </Box>
//                         </Grid>
//                     </Grid>
//                 </Grid>
//             </Grid>

//             <Divider />

//             {/* Bảng Hàng tiền Full Width */}
//             <Box sx={{ width: "100%" }}>
//                 <QuotationItemsTable
//                     quotationProductDetail={quotationProductDetail}
//                     idQuotation={selectedQuotation?.id}
//                     methods={methods}
//                     fields={fields}
//                     append={append}
//                     remove={remove}
//                     setPaid={setTotalPaid}
//                 />
//             </Box>


//         </Stack>
//     );

//     return (
//         <Dialog open={openForm} onClose={onClose} fullScreen>
//             <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%' }}>
//                 <DialogTitle sx={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     borderBottom: '1px solid',
//                     borderColor: 'divider',
//                     py: 2,
//                     px: 3
//                 }}>
//                     <Typography variant="h6">
//                         {selectedQuotation ? `Chỉnh sửa - ${selectedQuotation.quotationNo}` : 'Tạo báo giá'}
//                     </Typography>
//                     <Stack direction="row" spacing={2}>
//                         <Button variant="outlined" onClick={onClose}>Hủy</Button>
//                         <Button type="submit" variant="contained" loading={isSubmitting}>Lưu</Button>
//                     </Stack>
//                 </DialogTitle>

//                 <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
//                     {quotationLoading ? renderSkeleton() : renderDetails()}
//                 </DialogContent>
//             </Form>

//             <QuotationCustomerForm
//                 openChild={isCreatingCustomer}
//                 setOpenChild={setIsCreatingCustomer}
//                 methodsQuotation={methods}
//                 setCustomerKeyword={setCustomerKeyword}
//                 setSelectedCustomer={setSelectedCustomer}
//                 refetchCustomers={refetchCustomers}
//             />
//         </Dialog>
//     );
// }



import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Stack,
    Typography,
    IconButton,
    Box,
    MenuItem,
    Divider,
    Tooltip,
    Grid,
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { Field, Form } from "src/components/hook-form";
import { useGetCustomers } from "src/actions/customer";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect, useState, useMemo } from "react";
import { ICustomerItem } from "src/types/customer";
import {
    IProductFormEdit,
    IQuotationDao,
    IQuotationDetailDto,
    IQuotationDetails,
    IQuotationDto,
    IQuotationItem
} from "src/types/quotation";
import { QuotationItemsTable } from "./quotation-product-table";
import { QuotationFormValues, quotationSchema } from "./schema/quotation-schema";
import {
    addMoreProducts,
    createOrUpdateQuotation,
    editProductForm,
    useGetQuotation,

} from "src/actions/quotation";
import { editAllQuotationDetails } from "./helper/mapQuotationProduct";
import { toast } from "sonner";
import { generateQuotationNo } from "src/utils/random-func";
import { mutate } from "swr";
import { endpoints } from "src/lib/axios";
import { QuotationCustomerForm } from "./quotation-customer-form";
import { useAuthContext } from "src/auth/hooks";
import { mapProductsToItems } from "./helper/mapProductsToItems";
import { renderSkeleton } from "src/components/skeleton/skeleton-quotation-contract";

export type QuotationFormProps = {
    selectedQuotation: IQuotationItem | null;
    openForm: boolean;
    onClose: () => void;
    CopiedQuotation: IQuotationItem | null;
};

export function QuotationForm({ openForm, selectedQuotation, onClose, CopiedQuotation }: QuotationFormProps) {
    const quotationId = selectedQuotation?.id ?? CopiedQuotation?.id ?? 0;
    const { user } = useAuthContext();
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const sampleNote = `
<p data-pm-slice="0 0 []">
    - Giá trên <strong>đã bao gồm thuế GTGT</strong><br>
    - Báo giá có giá trị trong 30 ngày<br>
    - Tạm ứng 50% giá trị hợp đồng, ngay khi ký hợp đồng<br>
    <strong>Ngân hàng Á Châu (ACB) - PGD Thảo Điền - TP.HCM</strong><br>
    <strong>Tên tài khoản: Công ty TNHH GIẢI PHÁP DCS</strong><br>
    <strong>Tài khoản số: 8100868</strong>
</p>
`;

    const [originalItems, setOriginalItems] = useState<IQuotationDetailDto[]>([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [quotationProductDetail, setQuotationProductDetail] = useState<IQuotationDetails>();

    const { quotation: CurrentQuotation, quotationLoading } = useGetQuotation({
        quotationId,
        pageNumber: 1,
        pageSize: 999,
        options: { enabled: !!selectedQuotation?.id }
    });

    const { customers, customersLoading, mutation: refetchCustomers } = useGetCustomers({
        pageNumber: 1,
        pageSize: 999,
        key: debouncedCustomerKw,
        enabled: openForm || !!selectedQuotation?.customerId
    });

    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

    const defaultValues: QuotationFormValues = {
        customer: 0,
        quotationNo: generateQuotationNo(),
        date: today.toISOString(),
        validUntil: nextMonth.toISOString(),
        status: 1,
        discount: 0,
        items: [{ id: undefined, product: "", unit: "", unitName: "", qty: 1, price: 0, vat: 0 }],
        notes: sampleNote,
        paid: 0,
        cusName: "",
        companyName: "",
        taxCode: "",
        phone: "",
        address: "",
    };

    const methods = useForm<QuotationFormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(quotationSchema),
        defaultValues,
    });

    const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;
    const customerId = watch('customer');
    const watchItems = watch('items');

    const grandTotal = useMemo(() => {
        return watchItems?.reduce((acc, item) => {
            const qty = Number(item.qty) || 0;
            const price = Number(item.price) || 0;
            const vat = Number(item.vat) || 0;
            return acc + Math.round(qty * price * (1 + vat / 100));
        }, 0) || 0;
    }, [watchItems]);

    // Fill thông tin khách hàng
    useEffect(() => {
        if (!selectedCustomer) return;
        setValue("cusName", selectedCustomer.name || "");
        setValue("companyName", selectedCustomer.companyName || "");
        setValue("taxCode", selectedCustomer.taxCode || "");
        setValue("phone", selectedCustomer.phone || "");
        setValue("address", selectedCustomer.address || "");
    }, [selectedCustomer, setValue]);

    // Load quotation data
    useEffect(() => {
        if (CopiedQuotation) {
            if (!CurrentQuotation) return;
            const currentDetails = CurrentQuotation.items.find(q => q.quotationID === CopiedQuotation.id);
            setQuotationProductDetail(currentDetails);
            const mappedItems = mapProductsToItems(currentDetails?.products || []);
            methods.reset({
                ...defaultValues,
                customer: CopiedQuotation.customerId ?? 0,
                quotationNo: generateQuotationNo(),
                date: today.toISOString(),
                validUntil: nextMonth.toISOString(),
                status: 1,
                discount: CopiedQuotation.discount,
                items: mappedItems,
                notes: CopiedQuotation.note ?? sampleNote,
                paid: CopiedQuotation.paid ?? 0,
            });
            return;
        }

        if (!selectedQuotation) {
            methods.reset(defaultValues);
            return;
        }

        if (!CurrentQuotation) return;

        const currentDetails = CurrentQuotation.items.find(q => q.quotationID === selectedQuotation.id);
        if (currentDetails) setQuotationProductDetail(currentDetails);

        const mappedItems = mapProductsToItems(currentDetails?.products || []);
        methods.setValue("customer", selectedQuotation.customerId ?? 0);
        methods.setValue("quotationNo", selectedQuotation.quotationNo);
        methods.setValue("date", selectedQuotation.createdDate ?? null);
        methods.setValue("validUntil", selectedQuotation.expiryDate ?? null);
        methods.setValue("status", selectedQuotation.status ?? 1);
        methods.setValue("items", mappedItems);
        methods.setValue("notes", selectedQuotation.note ?? "");
        methods.setValue("discount", selectedQuotation.discount);
        methods.setValue("paid", selectedQuotation.paid);
    }, [selectedQuotation, CopiedQuotation, CurrentQuotation, methods]);

    useEffect(() => {
        if (!customerId) {
            setSelectedCustomer(null);
            return;
        }
        const found = customers.find((cus) => Number(cus.id) === Number(customerId));
        setSelectedCustomer(found || null);
    }, [customerId, customers]);

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const onSubmit = handleSubmit(async (data: QuotationFormValues) => {
        try {
            const basePayload = {
                quotationNo: data.quotationNo,
                customerID: data.customer,
                createDate: data.date,
                expiryDate: data.validUntil,
                discount: data.discount || 0,
                note: data.notes || '',
                paid: data.paid || 0,
                Type: 'Quotation',
                Status: data.status
            };

            const bodyPayload: IQuotationDto = {
                ...basePayload,
                quotationDetails: data.items
                    .filter((item) => item.product && item.product !== "")
                    .map((item, i) => ({
                        productID: item.product ?? "",
                        quantity: item.qty ?? 0,
                        row: i + 1,
                        Unit: item.unitName || "",
                        Price: item.price || 0,
                    })),
            };

            const updatePayload: IQuotationDao = {
                ...basePayload,
                seller: user?.accessToken || "",
            };

            await createOrUpdateQuotation(selectedQuotation?.id ?? null, bodyPayload, updatePayload);

            if (selectedQuotation) {
                const productPayload: IProductFormEdit[] = data.items.map((item) => ({
                    rowId: item.id,
                    productId: Number(item.product),
                    price: item.price || 0,
                    quantity: item.qty || 0,
                    unit: item.unitName ?? "",
                }));

                for (const item of productPayload) {
                    await editProductForm(item.rowId, item);
                }

                const newItems = bodyPayload.quotationDetails.filter(
                    (item) => !originalItems.some((o) => o.productID === item.productID)
                );

                if (newItems.length > 0) {
                    await addMoreProducts(selectedQuotation.id, newItems);
                } else {
                    await editAllQuotationDetails(bodyPayload, selectedQuotation.id);
                }
            }

            toast.success(selectedQuotation ? "Dữ liệu đã được thay đổi!" : "Tạo hợp đồng thành công!");
            onClose();
            reset(defaultValues);
        } catch (error: any) {
            toast.error(error.message || "Đã có lỗi xảy ra!");
        }
    });

    const renderDetails = () => (
        <Stack spacing={3}>
            <Grid container spacing={3}>
                {/* CỘT 1: THÔNG TIN KHÁCH HÀNG */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Thông tin khách hàng</Typography>

                    <Stack direction="row" gap={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                        <Field.Autocomplete
                            name="customer"
                            label="Mã khách hàng có sẵn *"
                            size="small"
                            options={customers}
                            loading={customersLoading}
                            getOptionLabel={(opt) => opt?.name || opt?.companyName || ''}
                            onInputChange={(_, value) => setCustomerKeyword(value)}
                            value={selectedCustomer}
                            fullWidth
                            onChange={(_, newValue) => {
                                methods.setValue('customer', newValue?.id ?? 0, { shouldValidate: true });
                                setCustomerKeyword(newValue?.name ?? '');
                            }}
                        />
                        <Tooltip title="Tạo khách hàng mới">
                            <IconButton color="primary" size="small" onClick={() => setIsCreatingCustomer(true)}>
                                <Iconify icon="line-md:person-add" />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="cusName" label="Tên khách hàng" size="small" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="companyName" label="Tên công ty" size="small" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="taxCode" label="Mã số thuế" size="small" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field.Text name="phone" label="Số điện thoại" size="small" fullWidth />
                        </Grid>
                        <Grid size={12}>
                            <Field.Text name="address" label="Địa chỉ" size="small" fullWidth multiline rows={2} />
                        </Grid>
                    </Grid>
                </Grid>

                {/* CỘT 2: GHI CHÚ */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Ghi chú</Typography>
                    <Field.Editor
                        name="notes"
                        sx={{ height: 145, fontSize: '0.875rem' }}
                    />
                </Grid>

                {/* CỘT 3: THÔNG TIN HỢP ĐỒNG + TỔNG TIỀN */}
                {/* CỘT 3: THÔNG TIN HỢP ĐỒNG + TỔNG TIỀN - 2 CỘT NGANG HÀNG */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    <Grid container spacing={2} sx={{ height: '100%' }}>

                        {/* Cột trái: Thông tin hợp đồng */}
                        <Grid size={{ xs: 12, sm: 7 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                Thông tin hợp đồng
                            </Typography>
                            <Stack spacing={1.2}>
                                <Field.Text
                                    name="quotationNo"
                                    label="Số hợp đồng"
                                    size="small"
                                    disabled={!!selectedQuotation}
                                    fullWidth
                                />
                                <Field.DatePicker
                                    name="date"
                                    label="Ngày tạo"

                                />
                                <Field.DatePicker
                                    name="validUntil"
                                    label="Ngày ký"

                                />
                                <Field.Select
                                    name="status"
                                    label="Trạng thái"
                                    size="small"
                                    fullWidth
                                >
                                    <MenuItem value={1}>Nháp</MenuItem>
                                    <MenuItem value={2}>Đang thực hiện</MenuItem>
                                    <MenuItem value={3}>Hoàn thành</MenuItem>
                                </Field.Select>
                            </Stack>
                        </Grid>

                        {/* Cột phải: Tổng tiền thanh toán */}
                        <Grid size={{ xs: 12, sm: 5 }}>
                            <Box sx={{
                                height: '100%',
                                minHeight: { xs: 160, sm: 200 },
                                bgcolor: '#FFF7E6',
                                border: '2px solid #FFE7BA',
                                borderRadius: 2,
                                p: 2.5,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1, fontSize: '0.85rem' }}
                                >
                                    Tổng tiền thanh toán
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: '#D97706',
                                        fontWeight: 800,
                                        fontSize: '1.85rem',
                                        lineHeight: 1.2
                                    }}
                                >
                                    {new Intl.NumberFormat('vi-VN').format(grandTotal)}đ
                                </Typography>
                            </Box>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>

            <Divider />

            {/* BẢNG HÀNG TIỀN */}
            <Box sx={{ width: "100%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Hàng tiền</Typography>
                <QuotationItemsTable
                    quotationProductDetail={quotationProductDetail}
                    idQuotation={selectedQuotation?.id}
                    methods={methods}
                    fields={fields}
                    append={append}
                    remove={remove}
                    setPaid={setTotalPaid}
                />
            </Box>
        </Stack>
    );

    return (
        <Dialog open={openForm} onClose={onClose} fullScreen>
            <Form methods={methods} onSubmit={onSubmit} style={{ height: '100%' }}>
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ddd',
                    py: 2,
                    px: 3
                }}>
                    <Typography variant="h6">TẠO HỢP ĐỒNG</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={onClose} size="small">Hủy</Button>
                        <Button type="submit" variant="contained" loading={isSubmitting} size="small">Lưu</Button>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                    {quotationLoading ? renderSkeleton() : renderDetails()}
                </DialogContent>
            </Form>

            <QuotationCustomerForm
                openChild={isCreatingCustomer}
                setOpenChild={setIsCreatingCustomer}
                methodsQuotation={methods}
                setCustomerKeyword={setCustomerKeyword}
                setSelectedCustomer={setSelectedCustomer}
                refetchCustomers={refetchCustomers}
            />
        </Dialog>
    );
}