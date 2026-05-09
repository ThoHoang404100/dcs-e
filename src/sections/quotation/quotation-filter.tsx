// // QuotationFilterBar.tsx
// import { useEffect, useState } from "react";
// import { Stack, Button, TextField, Box, Select, MenuItem, FormControl, InputLabel, Autocomplete, CircularProgress } from "@mui/material";
// import { Iconify } from "src/components/iconify";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import dayjs, { Dayjs } from "dayjs";
// import { useDebounce } from "minimal-shared/hooks";
// import { useGetCustomers } from "src/actions/customer";
// import { ICustomerItem } from "src/types/customer";
// import { FilterValues } from "src/types/filter-values";

// type Props = {
//     onFilterChange: (values: FilterValues) => void;
//     onReset: () => void;
//     onSearching: (key: string) => void;
// };

// export function QuotationFilterBar({ onFilterChange, onReset, onSearching }: Props) {
//     const [customerkeyword, setCustomerKeyword] = useState('');
//     const debouncedCustomerKw = useDebounce(customerkeyword, 300);
//     const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

//     const { customers, customersLoading } = useGetCustomers({
//         pageNumber: 1,
//         pageSize: 20,
//         key: debouncedCustomerKw,
//         enabled: true
//     });

//     const today = dayjs();
//     const defaultToDate = today;
//     const defaultFromDate = today.subtract(1, "month");

//     const statuses = [
//         { value: "Deleted", label: "Bỏ qua", icon: "fluent-color:dismiss-circle-16" },
//         { value: "Draft", label: "Nháp", icon: "material-symbols:draft" },
//         { value: "Ongoing", label: "Đang thực hiện", icon: "line-md:uploading-loop" },
//         { value: "Completed", label: "Đã hoàn thành", icon: "fluent-color:checkmark-circle-16" },
//     ];
//     const [status, setStatus] = useState("");

//     const months = Array.from({ length: 12 }, (_, i) => i + 1);
//     const [month, setMonth] = useState("");

//     const [fromDate, setFromDate] = useState<Dayjs | null>(defaultFromDate);
//     const [toDate, setToDate] = useState<Dayjs | null>(defaultToDate);

//     const handleApply = () => {
//         onFilterChange({
//             fromDate: fromDate ? fromDate.format("YYYY-MM-DD") : null,
//             toDate: toDate ? toDate.format("YYYY-MM-DD") : null,
//             status: status || undefined,
//             customer: selectedCustomer?.name
//                 ? selectedCustomer?.name
//                 : selectedCustomer?.companyName
//                     ? selectedCustomer?.companyName
//                     : undefined,
//             month: month ? Number(month) : undefined
//         });
//     };

//     const handleReset = () => {
//         setFromDate(defaultFromDate);
//         setToDate(defaultToDate);
//         setSelectedCustomer(null);
//         setStatus("");
//         setMonth("");
//         onReset();
//     };

//     const isChanged =
//         !fromDate?.isSame(defaultFromDate, "day") ||
//         !toDate?.isSame(defaultToDate, "day") ||
//         status !== "" ||
//         selectedCustomer !== null ||
//         month !== "";

//     useEffect(() => {
//         handleApply();
//     }, []);

//     return (
//         <Stack
//             direction={{ xs: "column", sm: "row", md: "row" }}
//             gap={2}
//             sx={{ m: 1.5, overflowX: 'auto', overflowY: 'hidden' }}
//             alignItems="center"
//             justifyContent="space-between"
//         >
//             <Stack
//                 direction={{ xs: "column", sm: "row" }}
//                 spacing={2}
//                 alignItems="center"
//                 p={1}
//             >
//                 <Button
//                     variant="contained"
//                     size="medium"
//                     onClick={handleApply}
//                     startIcon={<Iconify icon="solar:filter-bold" />}
//                     sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
//                 >
//                     Lọc
//                 </Button>
//                 {isChanged && (
//                     <Button
//                         variant="outlined"
//                         color="inherit"
//                         size="medium"
//                         onClick={handleReset}
//                         startIcon={<Iconify icon="cil:reload" />}
//                         sx={{
//                             height: 40,
//                             whiteSpace: 'nowrap'
//                         }}
//                     >
//                         Đặt lại
//                     </Button>
//                 )}
//             </Stack>
//             <Stack
//                 direction={{ xs: "column", sm: "row" }}
//                 spacing={2}
//                 alignItems="center"
//                 p={1}
//             >
//                 <FormControl
//                     fullWidth={false}
//                     size="small"
//                     sx={{
//                         width: 200,
//                         height: 40,
//                         '& .MuiSelect-select': {
//                             display: "flex",
//                             alignItems: "center",
//                             height: "40px !important",
//                             paddingY: 0,
//                         },
//                     }}
//                 >
//                     <InputLabel id="status-select-label">Tất cả trạng thái</InputLabel>
//                     <Select
//                         labelId="status-select-label"
//                         value={status}
//                         label="Tất cả trạng thái"
//                         onChange={(e) => setStatus(e.target.value)}
//                     >
//                         {statuses.map((s) => (
//                             <MenuItem key={s.value} value={s.value}>
//                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: 1 }}>
//                                     <span>{s.label}</span>
//                                     {s.icon && <Iconify icon={s.icon} />}
//                                 </Box>
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>

//                 <Autocomplete
//                     fullWidth
//                     size="small"
//                     options={customers || []}
//                     getOptionLabel={(option) => option.name ? option.name : option.companyName ? option.companyName : ""}
//                     value={selectedCustomer}
//                     onChange={(_, newValue) => setSelectedCustomer(newValue)}
//                     onInputChange={(_, newInputValue) => setCustomerKeyword(newInputValue)}
//                     loading={customersLoading}
//                     isOptionEqualToValue={(option, value) => option.id === value.id}
//                     renderOption={(props, option) => (
//                         <li {...props} key={option.id}>
//                             {option.name || option.companyName}
//                         </li>
//                     )}
//                     noOptionsText="Không tìm thấy dữ liệu"
//                     renderInput={(params) => (
//                         <TextField
//                             {...params}
//                             label="Tất cả khách hàng"
//                             InputProps={{
//                                 ...params.InputProps,
//                                 endAdornment: (
//                                     <>
//                                         {params.InputProps.endAdornment}
//                                     </>
//                                 ),
//                             }}
//                         />
//                     )}
//                     sx={{
//                         width: 200,
//                         height: 40,
//                     }}
//                 />

//                 <FormControl
//                     fullWidth={false}
//                     size="small"
//                     sx={{
//                         width: 150,
//                         height: 40,
//                         '& .MuiSelect-select': {
//                             display: "flex",
//                             alignItems: "center",
//                             height: "40px !important",
//                             paddingY: 0,
//                         },
//                     }}
//                 >
//                     <InputLabel id="month-select-label">Trong tháng</InputLabel>
//                     <Select
//                         labelId="month-select-label"
//                         value={month}
//                         label="Trong tháng"
//                         onChange={(e) => setMonth(e.target.value)}
//                     >
//                         {months.map((m) => (
//                             <MenuItem key={m} value={m}>
//                                 Tháng {m}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>

//                 <DatePicker
//                     label="Từ ngày"
//                     value={fromDate}
//                     onChange={(newValue) => setFromDate(newValue)}
//                     format="DD/MM/YYYY"
//                     slotProps={{ textField: { size: "small" } }}
//                     sx={{ width: 180 }}
//                 />
//                 <DatePicker
//                     label="Đến ngày"
//                     value={toDate}
//                     onChange={(newValue) => setToDate(newValue)}
//                     format="DD/MM/YYYY"
//                     slotProps={{ textField: { size: "small" } }}
//                     sx={{ width: 180 }}
//                 />

//                 <TextField
//                     size="small"
//                     variant="outlined"
//                     placeholder="Tìm kiếm..."
//                     sx={{
//                         width: 200,
//                     }}
//                     onChange={(e) => onSearching(e.target.value)}
//                     InputProps={{
//                         startAdornment: (
//                             <Iconify
//                                 icon="eva:search-fill"
//                                 sx={{ color: 'text.disabled', width: 20, height: 20, mr: 1 }}
//                             />
//                         ),
//                     }}
//                 />
//             </Stack>
//         </Stack>
//     );
// }



// QuotationFilterBar.tsx
import { useState, useRef } from "react";
import {
    Stack, Button, TextField, Select, MenuItem,
    FormControl, InputLabel, Autocomplete, IconButton, Box, Typography
} from "@mui/material";
import { Iconify } from "src/components/iconify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useDebounce } from "minimal-shared/hooks";
import { useGetCustomers } from "src/actions/customer";
import { ICustomerItem } from "src/types/customer";
import { FilterValues } from "src/types/filter-values";
import { Theme } from "@fullcalendar/core/internal";

type Props = {
    onFilterChange: (values: FilterValues) => void;
    onReset: () => void;
    onSearching: (key: string) => void;
};

export function QuotationFilterBar({ onFilterChange, onReset, onSearching }: Props) {
    const [openPopup, setOpenPopup] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerItem | null>(null);

    const { customers, customersLoading } = useGetCustomers({
        pageNumber: 1,
        pageSize: 30,
        key: debouncedCustomerKw,
        enabled: true
    });

    const today = dayjs();
    const [fromDate, setFromDate] = useState<Dayjs | null>(today.subtract(1, "month"));
    const [toDate, setToDate] = useState<Dayjs | null>(today);
    const [status, setStatus] = useState("");
    const [month, setMonth] = useState("");

    const handleApply = () => {
        onFilterChange({
            fromDate: fromDate ? fromDate.format("YYYY-MM-DD") : null,
            toDate: toDate ? toDate.format("YYYY-MM-DD") : null,
            status: status || undefined,
            customer: selectedCustomer?.name || selectedCustomer?.companyName || undefined,
            month: month ? Number(month) : undefined,
        });
        setOpenPopup(false);
    };

    const handleReset = () => {
        setFromDate(today.subtract(1, "month"));
        setToDate(today);
        setSelectedCustomer(null);
        setStatus("");
        setMonth("");
        onReset();
    };

    // Kéo popup
    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        const popup = popupRef.current;
        if (!popup) return;

        const shiftX = e.clientX - popup.getBoundingClientRect().left;
        const shiftY = e.clientY - popup.getBoundingClientRect().top;

        const moveAt = (pageX: number, pageY: number) => {
            popup.style.left = `${pageX - shiftX}px`;
            popup.style.top = `${pageY - shiftY}px`;
        };

        const onMouseMove = (ev: MouseEvent) => moveAt(ev.pageX, ev.pageY);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    };

    return (
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
            <Stack direction="row" alignItems="center" gap={2}>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenPopup(true)}
                    startIcon={<Iconify icon="solar:filter-bold" />}
                    endIcon={<Iconify icon="eva:arrow-down-fill" />}
                    sx={{
                        bgcolor: (Theme) => Theme.palette.primary.main,
                        '&:hover': { bgcolor: '#43a047' },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        borderRadius: '8px'
                    }}
                >
                    Lọc
                </Button>

                {openPopup && (
                    <Box
                        ref={popupRef}
                        sx={{
                            position: 'absolute',
                            top: '80px',
                            left: '150px',
                            width: 450,
                            bgcolor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            zIndex: 9999,
                            border: '1px solid #ddd',
                        }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderBottom: '1px solid #eee',
                                cursor: 'move',
                                userSelect: 'none',
                                bgcolor: '#f8f9fa',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                            }}
                            onMouseDown={handleDragStart}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight={600}>Bộ lọc nâng cao</Typography>
                                <IconButton size="small" onClick={() => setOpenPopup(false)}>
                                    <Iconify icon="eva:close-fill" />
                                </IconButton>
                            </Stack>
                        </Box>

                        <Box sx={{ p: 2.5 }}>
                            <Stack direction="column" gap={2}>
                                {/* Tìm kiếm khách hàng */}
                                <Autocomplete
                                    size="small"
                                    fullWidth
                                    disablePortal
                                    options={customers || []}
                                    getOptionLabel={(opt) => opt.name || opt.companyName || ""}
                                    value={selectedCustomer}
                                    onChange={(_, newValue) => setSelectedCustomer(newValue)}
                                    onInputChange={(_, val) => setCustomerKeyword(val)}
                                    renderInput={(params) => <TextField {...params} label="Tìm khách hàng" placeholder="Chọn khách hàng..." />}
                                />

                                <Stack direction="row" gap={2}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Trạng thái</InputLabel>
                                        <Select
                                            value={status}
                                            label="Trạng thái"
                                            onChange={(e) => setStatus(e.target.value)}
                                            MenuProps={{
                                                disablePortal: true
                                            }}
                                        >
                                            <MenuItem value="">Tất cả</MenuItem>
                                            <MenuItem value="Draft">Nháp</MenuItem>
                                            <MenuItem value="Ongoing">Đang thực hiện</MenuItem>
                                            <MenuItem value="Completed">Hoàn thành</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Tháng</InputLabel>
                                        <Select
                                            value={month}
                                            label="Tháng"
                                            onChange={(e) => setMonth(e.target.value)}
                                            MenuProps={{
                                                disablePortal: true
                                            }}
                                        >
                                            <MenuItem value="">Tất cả</MenuItem>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <MenuItem key={i + 1} value={i + 1}>Tháng {i + 1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                <Stack direction="row" gap={2}>
                                    <DatePicker
                                        label="Từ ngày"
                                        value={fromDate}
                                        onChange={setFromDate}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: { size: "small", fullWidth: true },
                                            popper: {
                                                disablePortal: true
                                            }
                                        }}
                                    />
                                    <DatePicker
                                        label="Đến ngày"
                                        value={toDate}
                                        onChange={setToDate}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: { size: "small", fullWidth: true },
                                            popper: {
                                                disablePortal: true
                                            }
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </Box>

                        <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" size="small" onClick={handleReset}>
                                Đặt lại
                            </Button>
                            <Button variant="contained" size="small" onClick={handleApply} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#43a047' } }}>
                                Áp dụng
                            </Button>
                        </Box>
                    </Box>
                )}

                <TextField
                    size="small"
                    placeholder="Tìm kiếm số hợp đồng, tên khách hàng..."
                    onChange={(e) => onSearching(e.target.value)}
                    InputProps={{
                        startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
                    }}
                    sx={{ ml: 'auto', width: 360 }}
                />
            </Stack>
        </Box>
    );
}