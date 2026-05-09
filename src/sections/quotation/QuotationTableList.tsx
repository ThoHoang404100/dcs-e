// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   IconButton,
//   Paper,
//   Typography,
//   Button,
//   Divider,
//   Box,
//   Tooltip,
// } from "@mui/material";
// import { Iconify } from "src/components/iconify";
// import { useEffect, useMemo, useState } from "react";
// import { IQuotationItem } from "src/types/quotation";
// import {
//   useGetQuotations,
//   useGetQuotationDetail,
// } from "src/actions/quotation";
// import { formatDate } from "src/utils/format-time-vi";
// import { QuotationFilterBar } from "./quotation-filter";
// import { FilterValues } from "src/types/filter-values";
// import { EmptyContent } from "src/components/empty-content";
// import { toast } from 'sonner';
// import { deleteOne } from 'src/actions/delete';
// import { endpoints } from 'src/lib/axios';
// import { ConfirmDialog } from 'src/components/custom-dialog';
// import { useBoolean } from 'minimal-shared/hooks';
// import { Theme } from "@fullcalendar/core/internal";

// const statusMap: { [key: number]: [string, string] } = {
//   0: ["Bỏ qua", "fluent-color:dismiss-circle-16"],
//   1: ["Nháp", "material-symbols:draft"],
//   2: ["Đang thực hiện", "line-md:uploading-loop"],
//   3: ["Đã hoàn thành", "fluent-color:checkmark-circle-16"],
// };

// type IQuotationProduct = {
//   productID: string;
//   productName: string;
//   unit: string;
//   quantity: number;
//   price: number;
//   total: number;
//   vat: number;
//   vatAmount: number;
// };

// type Props = {
//   onViewDetails: (q: IQuotationItem) => void;
//   onEditing: (q: IQuotationItem) => void;
//   page: number;
//   setPage: (v: any) => void;
//   rowsPerPage: number;
//   setRowsPerPage: (v: any) => void;
// };

// export function QuotationTableList({
//   onViewDetails,
//   onEditing,
//   page,
//   setPage,
//   rowsPerPage,
//   setRowsPerPage,
// }: Props) {

//   const today = new Date();
//   const lastMonth = new Date();
//   lastMonth.setMonth(today.getMonth() - 1);

//   const [filters, setFilters] = useState<FilterValues>({
//     fromDate: formatDate(lastMonth),
//     toDate: formatDate(today),
//   });

//   const [searchText, setSearchText] = useState("");
//   const [selectedRow, setSelectedRow] = useState<IQuotationItem | null>(null);
//   const [quotationId, setQuotationId] = useState<number | null>(null);

//   const [detailPage, setDetailPage] = useState(0);
//   const [detailRowsPerPage, setDetailRowsPerPage] = useState(10);

//   const {
//     quotations,
//     quotationsLoading,
//     pagination,
//     quotationsEmpty,
//   } = useGetQuotations({
//     pageNumber: page + 1,
//     pageSize: rowsPerPage,
//     key: searchText.trim(),
//     // fromDate: filters.fromDate,
//     // toDate: filters.toDate,
//     fromDate: '',
//     toDate: '',
//     Filter: filters.customer,
//     Month: filters.month,
//     Status: filters.status,
//   });

//   const confirmDelRowDialog = useBoolean();
//   const [data, setData] = useState<IQuotationItem[]>([]);
//   const [idSelected, setIdSelected] = useState(0);

//   useEffect(() => {
//     setData(quotations);
//   }, [quotations]);


//   useEffect(() => {
//     setSelectedRow(null);
//     setQuotationId(null);
//     setDetailPage(0);
//   }, [filters, searchText]);

//   const {
//     quotationDetail,
//     pagination: detailPagination,
//   } = useGetQuotationDetail({
//     quotationId: quotationId || 0,
//     pageNumber: detailPage + 1,
//     pageSize: detailRowsPerPage,
//     options: { enabled: !!quotationId },
//   });

//   const detailItems: IQuotationProduct[] = (quotationDetail as any)?.products || [];

//   const totalAmount = useMemo(() =>
//     data.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
//     [data]
//   );

//   const totalQty = useMemo(() =>
//     detailItems.reduce((s, i) => s + (i.quantity ?? 0), 0),
//     [detailItems]
//   );

//   const totalMoney = useMemo(() =>
//     detailItems.reduce((s, i) => s + (i.total ?? 0), 0),
//     [detailItems]
//   );

//   const totalVAT = useMemo(() =>
//     detailItems.reduce((s, i) => s + ((i.vat ?? 0) / 100) * (i.total ?? 0), 0),
//     [detailItems]
//   );

//   const handleRowClick = (row: IQuotationItem) => {
//     if (selectedRow?.id === row.id) {
//       setSelectedRow(null);
//       setQuotationId(null);
//     } else {
//       setSelectedRow(row);
//       setQuotationId(row.id);
//       setDetailPage(0);
//     }
//   };

//   const safeDate = (d: any) => {
//     if (!d) return "--";
//     try {
//       const date = new Date(d);
//       return date.toLocaleDateString("vi-VN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//       });
//     } catch {
//       return "--";
//     }
//   };

//   const handleDeleteRow = async (id: number) => {
//     if (id === 0 || !id) return;
//     const success = await deleteOne({
//       apiEndpoint: endpoints.quotation.delete(id),
//       listEndpoint: '/api/v1/quotation/quotations',
//     });
//     if (success) {
//       toast.success("Xóa thành công phiếu báo giá!");
//     } else {
//       toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
//     }
//   };

//   const renderConfirmDeleteRow = () => (
//     <ConfirmDialog
//       open={confirmDelRowDialog.value}
//       onClose={confirmDelRowDialog.onFalse}
//       title="Xác nhận xóa phiếu báo giá"
//       content="Bạn có chắc chắn muốn xóa phiếu báo giá này?"
//       action={
//         <Button
//           variant="contained"
//           color="error"
//           onClick={() => {
//             handleDeleteRow(idSelected);
//             confirmDelRowDialog.onFalse();
//           }}
//         >
//           Xác nhận
//         </Button>
//       }
//     />
//   );

//   return (
//     <Paper sx={{ borderRadius: 2 }}>
//       <QuotationFilterBar
//         onFilterChange={setFilters}
//         onSearching={setSearchText}
//         onReset={() => setFilters({ fromDate: "", toDate: "" })}
//       />

//       <Divider />

//       <TableContainer>
//         <Table size="small">
//           <TableHead>
//             <TableRow sx={{ bgcolor: "#E8F5E9" }}>
//               <TableCell>#</TableCell>
//               <TableCell>Ngày báo giá</TableCell>
//               <TableCell>Mã báo giá</TableCell>
//               <TableCell>Tên khách hàng</TableCell>
//               <TableCell>SĐT</TableCell>
//               <TableCell>Ngày quá hạn</TableCell>
//               <TableCell align="right">Tổng tiền thanh toán</TableCell>
//               <TableCell>Trạng thái</TableCell>
//               <TableCell align="center">Thao tác</TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {data.map((row, i) => (
//               <TableRow key={row.id} hover onClick={() => handleRowClick(row)} sx={{
//                 cursor: "pointer",
//                 ...(selectedRow?.id === row.id && {
//                   bgcolor: "#FDECEF",
//                   "&:hover": {
//                     bgcolor: "#FADADD",
//                   },
//                 }),
//               }}>
//                 <TableCell>{i + 1}</TableCell>
//                 <TableCell>{safeDate(row.createdDate)}</TableCell>
//                 <TableCell>{row.quotationNo}</TableCell>
//                 <TableCell>{row.customerName}</TableCell>
//                 <TableCell>{row.customerPhone}</TableCell>
//                 <TableCell>{safeDate(row.expiryDate)}</TableCell>
//                 <TableCell align="right">
//                   {(row.totalAmount ?? 0).toLocaleString()}
//                 </TableCell>
//                 <TableCell align="center">

//                   <Tooltip title={statusMap[row.status]?.[0] || ""}>
//                     <IconButton onClick={() => onEditing(row)}>
//                       <Iconify icon={statusMap[row.status]?.[1] || ""} />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>
//                 <TableCell align="center" onClick={(e) => e.stopPropagation()}>
//                   <Tooltip title="Xem PDF">
//                     <IconButton onClick={() => onViewDetails(row)}>
//                       <Iconify icon="solar:eye-bold" />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Chỉnh sửa">
//                     <IconButton onClick={() => onEditing(row)}>
//                       <Iconify icon="solar:pen-bold" />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Xóa">
//                     <IconButton
//                       color="error"
//                       onClick={() => {
//                         setIdSelected(row.id);
//                         confirmDelRowDialog.onTrue();
//                       }}
//                     >
//                       <Iconify icon="solar:trash-bin-trash-bold" />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>
//               </TableRow>
//             ))}

//             {data.length > 0 && (
//               <TableRow sx={{ bgcolor: "#E8F5E9", fontWeight: "bold" }}>
//                 <TableCell>

//                 </TableCell>
//                 <TableCell colSpan={5} align="left">
//                   <strong>Tổng</strong>
//                 </TableCell>
//                 <TableCell align="right">
//                   <strong>{totalAmount.toLocaleString()} đ</strong>
//                 </TableCell>
//                 <TableCell colSpan={2} />
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         component="div"
//         count={pagination?.totalRecord || 0}
//         page={page}
//         onPageChange={(_, p) => setPage(p)}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
//         labelRowsPerPage="Số dòng mỗi trang:"
//         labelDisplayedRows={({ from, to, count }) =>
//           `${from}–${to} trên tổng ${count !== -1 ? count : `hơn ${to}`}`
//         }
//       />

//       <Divider />

//       <Box sx={{ p: 2 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
//           <Box
//             sx={{
//               bgcolor: (theme) => theme.palette.primary.main,
//               color: "#fff",
//               px: 1.5,
//               py: 0.9,
//               borderRadius: 1,
//               fontSize: 13,
//               fontWeight: 600,
//             }}
//           >
//             Chi tiết báo giá
//           </Box>
//           <Typography variant="subtitle1" fontWeight={600}>
//             {selectedRow
//               ? `Mã báo giá số: ${selectedRow.quotationNo}`
//               : "Chưa chọn báo giá để xem chi tiết"}
//           </Typography>
//         </Box>

//         <TableContainer sx={{ border: "1px solid #ddd", minHeight: 150 }}>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ bgcolor: "#E8F5E9" }}>
//                 <TableCell>#</TableCell>
//                 <TableCell>Mã hàng</TableCell>
//                 <TableCell>Tên hàng</TableCell>
//                 <TableCell>ĐVT</TableCell>
//                 <TableCell align="right">Số lượng</TableCell>
//                 <TableCell align="right">Đơn giá</TableCell>
//                 <TableCell align="right">Thành tiền</TableCell>
//                 <TableCell align="right">% VAT</TableCell>
//                 <TableCell align="right">Tiền VAT</TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {!selectedRow && (
//                 <TableRow>
//                   <TableCell colSpan={9}>
//                     <EmptyContent content="Chọn báo giá để xem chi tiết" />
//                   </TableCell>
//                 </TableRow>
//               )}

//               {detailItems.map((item, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{detailPage * detailRowsPerPage + i + 1}</TableCell>
//                   <TableCell>{item.productID}</TableCell>
//                   <TableCell>{item.productName}</TableCell>
//                   <TableCell>{item.unit}</TableCell>
//                   <TableCell align="right">{(item.quantity ?? 0).toLocaleString()}</TableCell>
//                   <TableCell align="right">{(item.price ?? 0).toLocaleString()}</TableCell>
//                   <TableCell align="right">{(item.total ?? 0).toLocaleString()}</TableCell>
//                   <TableCell align="right">{item.vat ?? 0}</TableCell>
//                   <TableCell align="right">
//                     {(((item.vat ?? 0) / 100) * (item.total ?? 0)).toLocaleString()}
//                   </TableCell>
//                 </TableRow>
//               ))}

//               {selectedRow && (
//                 <TableRow sx={{ bgcolor: "#E8F5E9" }}>
//                   <TableCell></TableCell>
//                   <TableCell colSpan={3}><b>Tổng</b></TableCell>
//                   <TableCell align="right"><b>{totalQty}</b></TableCell>
//                   <TableCell />
//                   <TableCell align="right">
//                     <b>{totalMoney.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</b>
//                   </TableCell>
//                   <TableCell />
//                   <TableCell align="right">
//                     <b>{totalVAT.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</b>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         <Divider sx={{ mt: 1 }} />

//         {selectedRow && (
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
//             <TablePagination
//               component="div"
//               count={detailPagination?.totalRecord || 0}
//               page={detailPage}
//               onPageChange={(_, p) => setDetailPage(p)}
//               rowsPerPage={detailRowsPerPage}
//               onRowsPerPageChange={(e) => {
//                 setDetailRowsPerPage(parseInt(e.target.value, 10));
//                 setDetailPage(0);
//               }}
//               rowsPerPageOptions={[5, 10, 20]}
//               labelRowsPerPage="Số dòng mỗi trang:"
//               labelDisplayedRows={({ from, to, count }) =>
//                 `${from}–${to} trên tổng ${count !== -1 ? count : `hơn ${to}`}`
//               }
//             />
//           </Box>
//         )}
//       </Box>

//       {renderConfirmDeleteRow()}
//     </Paper>
//   );
// }




// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   IconButton,
//   Paper,
//   Typography,
//   Button,
//   Divider,
//   Box,
//   Tooltip,
// } from "@mui/material";
// import { Iconify } from "src/components/iconify";
// import { useEffect, useMemo, useState } from "react";
// import { IQuotationItem } from "src/types/quotation";
// import {
//   useGetQuotations,
//   useGetQuotationDetail,
// } from "src/actions/quotation";
// import { formatDate } from "src/utils/format-time-vi";
// import { QuotationFilterBar } from "./quotation-filter";
// import { FilterValues } from "src/types/filter-values";
// import { EmptyContent } from "src/components/empty-content";
// import { toast } from 'sonner';
// import { deleteOne } from 'src/actions/delete';
// import { endpoints } from 'src/lib/axios';
// import { ConfirmDialog } from 'src/components/custom-dialog';
// import { useBoolean } from 'minimal-shared/hooks';

// const statusMap: { [key: number]: [string, string] } = {
//   0: ["Bỏ qua", "fluent-color:dismiss-circle-16"],
//   1: ["Nháp", "material-symbols:draft"],
//   2: ["Đang thực hiện", "line-md:uploading-loop"],
//   3: ["Đã hoàn thành", "fluent-color:checkmark-circle-16"],
// };

// type IQuotationProduct = {
//   productID: string;
//   productName: string;
//   unit: string;
//   quantity: number;
//   price: number;
//   total: number;
//   vat: number;
//   vatAmount: number;
// };

// type Props = {
//   onViewDetails: (q: IQuotationItem) => void;
//   onEditing: (q: IQuotationItem) => void;
//   page: number;
//   setPage: (v: any) => void;
//   rowsPerPage: number;
//   setRowsPerPage: (v: any) => void;
// };

// export function QuotationTableList({
//   onViewDetails,
//   onEditing,
//   page,
//   setPage,
//   rowsPerPage,
//   setRowsPerPage,
// }: Props) {

//   const today = new Date();
//   const lastMonth = new Date();
//   lastMonth.setMonth(today.getMonth() - 1);

//   const [filters, setFilters] = useState<FilterValues>({
//     fromDate: formatDate(lastMonth),
//     toDate: formatDate(today),
//   });

//   const [searchText, setSearchText] = useState("");
//   const [selectedRow, setSelectedRow] = useState<IQuotationItem | null>(null);
//   const [quotationId, setQuotationId] = useState<number | null>(null);

//   const [detailPage, setDetailPage] = useState(0);
//   const [detailRowsPerPage, setDetailRowsPerPage] = useState(10);

//   const {
//     quotations,
//     pagination,
//   } = useGetQuotations({
//     pageNumber: page + 1,
//     pageSize: rowsPerPage,
//     key: searchText.trim(),
//     fromDate: '',
//     toDate: '',
//     Filter: filters.customer,
//     Month: filters.month,
//     Status: filters.status,
//   });

//   const confirmDelRowDialog = useBoolean();
//   const [data, setData] = useState<IQuotationItem[]>([]);
//   const [idSelected, setIdSelected] = useState(0);

//   useEffect(() => {
//     setData(quotations);
//   }, [quotations]);

//   useEffect(() => {
//     setSelectedRow(null);
//     setQuotationId(null);
//     setDetailPage(0);
//   }, [filters, searchText]);

//   const {
//     quotationDetail,
//     pagination: detailPagination,
//   } = useGetQuotationDetail({
//     quotationId: quotationId || 0,
//     pageNumber: detailPage + 1,
//     pageSize: detailRowsPerPage,
//     options: { enabled: !!quotationId },
//   });

//   const detailItems: IQuotationProduct[] = (quotationDetail as any)?.products || [];

//   const totalAmount = useMemo(() =>
//     data.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
//     [data]
//   );

//   const totalQty = useMemo(() =>
//     detailItems.reduce((s, i) => s + (i.quantity ?? 0), 0),
//     [detailItems]
//   );

//   const totalMoney = useMemo(() =>
//     detailItems.reduce((s, i) => s + (i.total ?? 0), 0),
//     [detailItems]
//   );

//   const totalVAT = useMemo(() =>
//     detailItems.reduce((s, i) => s + ((i.vat ?? 0) / 100) * (i.total ?? 0), 0),
//     [detailItems]
//   );

//   const handleRowClick = (row: IQuotationItem) => {
//     if (selectedRow?.id === row.id) {
//       setSelectedRow(null);
//       setQuotationId(null);
//     } else {
//       setSelectedRow(row);
//       setQuotationId(row.id);
//       setDetailPage(0);
//     }
//   };

//   const safeDate = (d: any) => {
//     if (!d) return "--";
//     try {
//       const date = new Date(d);
//       return date.toLocaleDateString("vi-VN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//       });
//     } catch {
//       return "--";
//     }
//   };

//   const handleDeleteRow = async (id: number) => {
//     if (id === 0 || !id) return;
//     const success = await deleteOne({
//       apiEndpoint: endpoints.quotation.delete(id),
//       listEndpoint: '/api/v1/quotation/quotations',
//     });
//     if (success) {
//       toast.success("Xóa thành công phiếu báo giá!");
//     } else {
//       toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
//     }
//   };

//   const renderConfirmDeleteRow = () => (
//     <ConfirmDialog
//       open={confirmDelRowDialog.value}
//       onClose={confirmDelRowDialog.onFalse}
//       title="Xác nhận xóa phiếu báo giá"
//       content="Bạn có chắc chắn muốn xóa phiếu báo giá này?"
//       action={
//         <Button
//           variant="contained"
//           color="error"
//           onClick={() => {
//             handleDeleteRow(idSelected);
//             confirmDelRowDialog.onFalse();
//           }}
//         >
//           Xác nhận
//         </Button>
//       }
//     />
//   );

//   return (
//     <Paper sx={{ borderRadius: 2 }}>
//       <QuotationFilterBar
//         onFilterChange={setFilters}
//         onSearching={setSearchText}
//         onReset={() => setFilters({ fromDate: "", toDate: "" })}
//       />

//       <Divider />

//       {/* ==================== BẢNG CHÍNH ==================== */}
//       <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)', overflow: 'auto' }}>
//         <Table size="small" stickyHeader>
//           <TableHead>
//             <TableRow sx={{ bgcolor: "#E8F5E9" }}>
//               <TableCell>#</TableCell>
//               <TableCell>Ngày báo giá</TableCell>
//               <TableCell>Mã báo giá</TableCell>
//               <TableCell>Tên khách hàng</TableCell>
//               <TableCell>SĐT</TableCell>
//               <TableCell>Ngày quá hạn</TableCell>
//               <TableCell align="right">Tổng tiền thanh toán</TableCell>
//               <TableCell>Trạng thái</TableCell>
//               <TableCell align="center">Thao tác</TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {data.map((row, i) => (
//               <TableRow
//                 key={row.id}
//                 hover
//                 onClick={() => handleRowClick(row)}
//                 sx={{
//                   cursor: "pointer",
//                   ...(selectedRow?.id === row.id && {
//                     bgcolor: "#FDECEF",
//                     "&:hover": { bgcolor: "#FADADD" },
//                   }),
//                 }}
//               >
//                 <TableCell>{i + 1}</TableCell>
//                 <TableCell>{safeDate(row.createdDate)}</TableCell>
//                 <TableCell>{row.quotationNo}</TableCell>
//                 <TableCell>{row.customerName}</TableCell>
//                 <TableCell>{row.customerPhone}</TableCell>
//                 <TableCell>{safeDate(row.expiryDate)}</TableCell>
//                 <TableCell align="right">
//                   {(row.totalAmount ?? 0).toLocaleString()}
//                 </TableCell>
//                 <TableCell align="center">
//                   <Tooltip title={statusMap[row.status]?.[0] || ""}>
//                     <IconButton onClick={() => onEditing(row)}>
//                       <Iconify icon={statusMap[row.status]?.[1] || ""} />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>
//                 <TableCell align="center" onClick={(e) => e.stopPropagation()}>
//                   <Tooltip title="Xem PDF">
//                     <IconButton onClick={() => onViewDetails(row)}>
//                       <Iconify icon="solar:eye-bold" />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Chỉnh sửa">
//                     <IconButton onClick={() => onEditing(row)}>
//                       <Iconify icon="solar:pen-bold" />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Xóa">
//                     <IconButton
//                       color="error"
//                       onClick={() => {
//                         setIdSelected(row.id);
//                         confirmDelRowDialog.onTrue();
//                       }}
//                     >
//                       <Iconify icon="solar:trash-bin-trash-bold" />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>
//               </TableRow>
//             ))}

//             {data.length > 0 && (
//               <TableRow sx={{ bgcolor: "#E8F5E9", fontWeight: "bold" }}>
//                 <TableCell></TableCell>
//                 <TableCell colSpan={5} align="left"><strong>Tổng</strong></TableCell>
//                 <TableCell align="right">
//                   <strong>{totalAmount.toLocaleString()} đ</strong>
//                 </TableCell>
//                 <TableCell colSpan={2} />
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         component="div"
//         count={pagination?.totalRecord || 0}
//         page={page}
//         onPageChange={(_, p) => setPage(p)}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
//         labelRowsPerPage="Số dòng mỗi trang:"
//         labelDisplayedRows={({ from, to, count }) =>
//           `${from}–${to} trên tổng ${count !== -1 ? count : `hơn ${to}`}`
//         }
//       />

//       <Divider />

//       {/* ==================== PHẦN CHI TIẾT - RIÊNG BIỆT ==================== */}
//       <Box sx={{ p: 2, bgcolor: "#f8f9fa" }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
//           <Box
//             sx={{
//               bgcolor: (theme) => theme.palette.primary.main,
//               color: "#fff",
//               px: 1.5,
//               py: 0.9,
//               borderRadius: 1,
//               fontSize: 13,
//               fontWeight: 600,
//             }}
//           >
//             Chi tiết báo giá
//           </Box>
//           <Typography variant="subtitle1" fontWeight={600}>
//             {selectedRow
//               ? `Mã báo giá số: ${selectedRow.quotationNo}`
//               : "Chưa chọn báo giá để xem chi tiết"}
//           </Typography>
//         </Box>

//         <TableContainer sx={{ border: "1px solid #ddd", minHeight: 200 }}>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ bgcolor: "#E8F5E9" }}>
//                 <TableCell>#</TableCell>
//                 <TableCell>Mã hàng</TableCell>
//                 <TableCell>Tên hàng</TableCell>
//                 <TableCell>ĐVT</TableCell>
//                 <TableCell align="right">Số lượng</TableCell>
//                 <TableCell align="right">Đơn giá</TableCell>
//                 <TableCell align="right">Thành tiền</TableCell>
//                 <TableCell align="right">% VAT</TableCell>
//                 <TableCell align="right">Tiền VAT</TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {!selectedRow && (
//                 <TableRow>
//                   <TableCell colSpan={9}>
//                     <EmptyContent content="Chọn báo giá để xem chi tiết" />
//                   </TableCell>
//                 </TableRow>
//               )}

//               {detailItems.map((item, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{detailPage * detailRowsPerPage + i + 1}</TableCell>
//                   <TableCell>{item.productID}</TableCell>
//                   <TableCell>{item.productName}</TableCell>
//                   <TableCell>{item.unit}</TableCell>
//                   <TableCell align="right">{(item.quantity ?? 0).toLocaleString()}</TableCell>
//                   <TableCell align="right">{(item.price ?? 0).toLocaleString()}</TableCell>
//                   <TableCell align="right">{(item.total ?? 0).toLocaleString()}</TableCell>
//                   <TableCell align="right">{item.vat ?? 0}</TableCell>
//                   <TableCell align="right">
//                     {(((item.vat ?? 0) / 100) * (item.total ?? 0)).toLocaleString()}
//                   </TableCell>
//                 </TableRow>
//               ))}

//               {selectedRow && detailItems.length > 0 && (
//                 <TableRow sx={{ bgcolor: "#E8F5E9" }}>
//                   <TableCell></TableCell>
//                   <TableCell colSpan={3}><b>Tổng</b></TableCell>
//                   <TableCell align="right"><b>{totalQty}</b></TableCell>
//                   <TableCell />
//                   <TableCell align="right">
//                     <b>{totalMoney.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</b>
//                   </TableCell>
//                   <TableCell />
//                   <TableCell align="right">
//                     <b>{totalVAT.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</b>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {selectedRow && (
//           <Box sx={{ mt: 1 }}>
//             <TablePagination
//               component="div"
//               count={detailPagination?.totalRecord || 0}
//               page={detailPage}
//               onPageChange={(_, p) => setDetailPage(p)}
//               rowsPerPage={detailRowsPerPage}
//               onRowsPerPageChange={(e) => {
//                 setDetailRowsPerPage(parseInt(e.target.value, 10));
//                 setDetailPage(0);
//               }}
//               rowsPerPageOptions={[5, 10, 20]}
//               labelRowsPerPage="Số dòng mỗi trang:"
//               labelDisplayedRows={({ from, to, count }) =>
//                 `${from}–${to} trên tổng ${count !== -1 ? count : `hơn ${to}`}`
//               }
//             />
//           </Box>
//         )}
//       </Box>

//       {renderConfirmDeleteRow()}
//     </Paper>
//   );
// }






import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Paper,
  Typography,
  Button,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { useEffect, useMemo, useState, useRef } from "react";
import { IQuotationItem } from "src/types/quotation";
import {
  useGetQuotations,
  useGetQuotationDetail,
} from "src/actions/quotation";
import { formatDate } from "src/utils/format-time-vi";
import { QuotationFilterBar } from "./quotation-filter";
import { FilterValues } from "src/types/filter-values";
import { EmptyContent } from "src/components/empty-content";
import { toast } from 'sonner';
import { deleteOne } from 'src/actions/delete';
import { endpoints } from 'src/lib/axios';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'minimal-shared/hooks';

const statusMap: { [key: number]: [string, string] } = {
  0: ["Bỏ qua", "fluent-color:dismiss-circle-16"],
  1: ["Nháp", "material-symbols:draft"],
  2: ["Đang thực hiện", "line-md:uploading-loop"],
  3: ["Đã hoàn thành", "fluent-color:checkmark-circle-16"],
};

type IQuotationProduct = {
  productID: string;
  productName: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
  vat: number;
  vatAmount: number;
};

type Props = {
  onViewDetails: (q: IQuotationItem) => void;
  onEditing: (q: IQuotationItem) => void;
  page: number;
  setPage: (v: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (v: number) => void;
};

type ResizableTableCellProps = {
  children: React.ReactNode;
  width?: number;
  onResize: (width: number) => void;
  align?: "left" | "center" | "right";
  [key: string]: any;
};

const ResizableTableCell = ({
  children,
  width,
  onResize,
  align = "left",
  ...props
}: ResizableTableCellProps) => {
  const cellRef = useRef<HTMLTableCellElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.pageX;
    const startWidth = width || cellRef.current?.offsetWidth || 120;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(80, startWidth + (moveEvent.pageX - startX));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <TableCell
      ref={cellRef}
      align={align}
      sx={{
        position: "relative",
        width: width || "auto",
        minWidth: 80,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      {...props}
    >
      {children}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: "absolute",
          right: -1,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: "col-resize",
          zIndex: 10,
          "&:hover": { bgcolor: "primary.main", opacity: 0.4 },
        }}
      />
    </TableCell>
  );
};

export function QuotationTableList({
  onViewDetails,
  onEditing,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
}: Props) {
  const [filters, setFilters] = useState<FilterValues>({
    fromDate: "",
    toDate: "",
  });

  const [searchText, setSearchText] = useState("");
  const [selectedRow, setSelectedRow] = useState<IQuotationItem | null>(null);
  const [quotationId, setQuotationId] = useState<number | null>(null);

  const [detailPage, setDetailPage] = useState(0);
  const [detailRowsPerPage, setDetailRowsPerPage] = useState(10);

  const [mainHeightPercent, setMainHeightPercent] = useState(42);

  const [columnWidths, setColumnWidths] = useState({
    index: 20, date: 110, code: 140, customer: 240,
    phone: 120, expiry: 110, total: 160, status: 110, action: 240,
  });

  const { quotations, pagination } = useGetQuotations({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    key: searchText.trim(),
    fromDate: '',
    toDate: '',
    Filter: filters.customer,
    Month: filters.month,
    Status: filters.status,
  });

  const confirmDelRowDialog = useBoolean();
  const [data, setData] = useState<IQuotationItem[]>([]);
  const [idSelected, setIdSelected] = useState(0);

  const {
    quotationDetail,
    pagination: detailPagination,
  } = useGetQuotationDetail({
    quotationId: quotationId || 0,
    pageNumber: detailPage + 1,
    pageSize: detailRowsPerPage,
    options: { enabled: !!quotationId },
  });

  const detailItems: IQuotationProduct[] = (quotationDetail as any)?.products || [];

  const totalAmount = useMemo(() => data.reduce((sum, item) => sum + (item.totalAmount || 0), 0), [data]);
  const totalQty = useMemo(() => detailItems.reduce((s, i) => s + (i.quantity ?? 0), 0), [detailItems]);
  const totalMoney = useMemo(() => detailItems.reduce((s, i) => s + (i.total ?? 0), 0), [detailItems]);
  const totalVAT = useMemo(() => detailItems.reduce((s, i) => s + ((i.vat ?? 0) / 100) * (i.total ?? 0), 0), [detailItems]);

  useEffect(() => setData(quotations), [quotations]);

  useEffect(() => {
    setSelectedRow(null);
    setQuotationId(null);
    setDetailPage(0);
  }, [filters, searchText]);

  const handleRowClick = (row: IQuotationItem) => {
    if (selectedRow?.id === row.id) {
      setSelectedRow(null);
      setQuotationId(null);
    } else {
      setSelectedRow(row);
      setQuotationId(row.id);
      setDetailPage(0);
    }
  };

  const safeDate = (d: any) => {
    if (!d) return "--";
    try {
      return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "--";
    }
  };

  const handleDeleteRow = async (id: number) => {
    if (!id) return;
    const success = await deleteOne({
      apiEndpoint: endpoints.quotation.delete(id),
      listEndpoint: '/api/v1/quotation/quotations',
    });
    success ? toast.success("Xóa thành công!") : toast.error("Xóa thất bại!");
  };

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.pageY;
    const startPercent = mainHeightPercent;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = ((moveEvent.pageY - startY) / window.innerHeight) * 100;
      setMainHeightPercent(Math.max(30, Math.min(70, startPercent + delta)));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const renderConfirmDeleteRow = () => (
    <ConfirmDialog
      open={confirmDelRowDialog.value}
      onClose={confirmDelRowDialog.onFalse}
      title="Xác nhận xóa"
      content="Bạn có chắc chắn muốn xóa phiếu báo giá này?"
      action={
        <Button variant="contained" color="error" onClick={() => { handleDeleteRow(idSelected); confirmDelRowDialog.onFalse(); }}>
          Xác nhận
        </Button>
      }
    />
  );

  return (
    <Paper sx={{ borderRadius: 2, height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <QuotationFilterBar
        onFilterChange={setFilters}
        onSearching={setSearchText}
        onReset={() => setFilters({ fromDate: "", toDate: "" })}
      />

      <Divider />

      {/* ==================== BẢNG CHÍNH + PHÂN TRANG ==================== */}
      <Box sx={{ height: `${mainHeightPercent}%`, minHeight: 280, display: "flex", flexDirection: "column" }}>
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E8F5E9" }}>
                <ResizableTableCell width={columnWidths.index} onResize={(w) => setColumnWidths(p => ({ ...p, index: w }))}>#</ResizableTableCell>
                <ResizableTableCell width={columnWidths.date} onResize={(w) => setColumnWidths(p => ({ ...p, date: w }))}>Ngày báo giá</ResizableTableCell>
                <ResizableTableCell width={columnWidths.code} onResize={(w) => setColumnWidths(p => ({ ...p, code: w }))}>Mã báo giá</ResizableTableCell>
                <ResizableTableCell width={columnWidths.customer} onResize={(w) => setColumnWidths(p => ({ ...p, customer: w }))}>Tên khách hàng</ResizableTableCell>
                <ResizableTableCell width={columnWidths.phone} onResize={(w) => setColumnWidths(p => ({ ...p, phone: w }))}>SĐT</ResizableTableCell>
                <ResizableTableCell width={columnWidths.expiry} onResize={(w) => setColumnWidths(p => ({ ...p, expiry: w }))}>Ngày quá hạn</ResizableTableCell>
                <ResizableTableCell width={columnWidths.total} align="right" onResize={(w) => setColumnWidths(p => ({ ...p, total: w }))}>Tổng tiền</ResizableTableCell>
                <ResizableTableCell width={columnWidths.status} align="center" onResize={(w) => setColumnWidths(p => ({ ...p, status: w }))}>Trạng thái</ResizableTableCell>
                <ResizableTableCell width={columnWidths.action} align="center" onResize={(w) => setColumnWidths(p => ({ ...p, action: w }))}>Thao tác</ResizableTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, i) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleRowClick(row)}
                  sx={{ cursor: "pointer", ...(selectedRow?.id === row.id && { bgcolor: "#FDECEF" }) }}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{safeDate(row.createdDate)}</TableCell>
                  <TableCell>{row.quotationNo}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.customerPhone}</TableCell>
                  <TableCell>{safeDate(row.expiryDate)}</TableCell>
                  <TableCell align="right">{(row.totalAmount ?? 0).toLocaleString()} đ</TableCell>
                  <TableCell align="center">
                    <Tooltip title={statusMap[row.status]?.[0] || ""}>
                      <IconButton onClick={(e) => { e.stopPropagation(); onEditing(row); }}>
                        <Iconify icon={statusMap[row.status]?.[1] || ""} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Xem PDF"><IconButton onClick={() => onViewDetails(row)}><Iconify icon="solar:eye-bold" /></IconButton></Tooltip>
                    <Tooltip title="Chỉnh sửa"><IconButton onClick={() => onEditing(row)}><Iconify icon="solar:pen-bold" /></IconButton></Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton color="error" onClick={() => { setIdSelected(row.id); confirmDelRowDialog.onTrue(); }}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {data.length > 0 && (
                <TableRow sx={{ bgcolor: "#E8F5E9", fontWeight: "bold" }}>
                  <TableCell colSpan={6}><strong>Tổng cộng</strong></TableCell>
                  <TableCell align="right"><strong>{totalAmount.toLocaleString()} đ</strong></TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination?.totalRecord || 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Box>

      <Box
        onMouseDown={handleSplitterMouseDown}
        sx={{
          height: 6,
          bgcolor: "#ddd",
          cursor: "ns-resize",
          "&:hover": { bgcolor: "primary.main" },
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", color: "#666" }}>⋮⋮⋮</Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: "#f8f9fa" }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #ddd" }}>
          <Box sx={{ bgcolor: "primary.main", color: "#fff", px: 1.5, py: 0.8, borderRadius: 1, fontWeight: 600 }}>
            CHI TIẾT BÁO GIÁ
          </Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {selectedRow ? `Mã: ${selectedRow.quotationNo}` : "Chưa chọn báo giá"}
          </Typography>
        </Box>

        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E8F5E9" }}>
                <TableCell width={50}>#</TableCell>
                <ResizableTableCell onResize={() => { }}>Mã hàng</ResizableTableCell>
                <ResizableTableCell onResize={() => { }}>Tên hàng</ResizableTableCell>
                <ResizableTableCell onResize={() => { }}>ĐVT</ResizableTableCell>
                <ResizableTableCell align="right" onResize={() => { }}>Số lượng</ResizableTableCell>
                <ResizableTableCell align="right" onResize={() => { }}>Đơn giá</ResizableTableCell>
                <ResizableTableCell align="right" onResize={() => { }}>Thành tiền</ResizableTableCell>
                <ResizableTableCell align="right" onResize={() => { }}>% VAT</ResizableTableCell>
                <ResizableTableCell align="right" onResize={() => { }}>Tiền VAT</ResizableTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!selectedRow && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <EmptyContent content="Chọn báo giá từ bảng trên để xem chi tiết" />
                  </TableCell>
                </TableRow>
              )}

              {detailItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{detailPage * detailRowsPerPage + i + 1}</TableCell>
                  <TableCell>{item.productID}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="right">{(item.quantity ?? 0).toLocaleString()}</TableCell>
                  <TableCell align="right">{(item.price ?? 0).toLocaleString()}</TableCell>
                  <TableCell align="right">{(item.total ?? 0).toLocaleString()}</TableCell>
                  <TableCell align="right">{item.vat ?? 0}%</TableCell>
                  <TableCell align="right">
                    {(((item.vat ?? 0) / 100) * (item.total ?? 0)).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}

              {selectedRow && detailItems.length > 0 && (
                <TableRow sx={{ bgcolor: "#E8F5E9", fontWeight: "bold" }}>
                  <TableCell colSpan={4}><b>TỔNG</b></TableCell>
                  <TableCell align="right"><b>{totalQty}</b></TableCell>
                  <TableCell />
                  <TableCell align="right"><b>{totalMoney.toLocaleString()} đ</b></TableCell>
                  <TableCell />
                  <TableCell align="right"><b>{totalVAT.toLocaleString()} đ</b></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedRow && (
          <TablePagination
            component="div"
            count={detailPagination?.totalRecord || 0}
            page={detailPage}
            onPageChange={(_, p) => setDetailPage(p)}
            rowsPerPage={detailRowsPerPage}
            onRowsPerPageChange={(e) => {
              setDetailRowsPerPage(parseInt(e.target.value, 10));
              setDetailPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        )}
      </Box>

      {renderConfirmDeleteRow()}
    </Paper>
  );
}