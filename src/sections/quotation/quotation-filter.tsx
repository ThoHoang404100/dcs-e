import {
    Stack,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    Drawer,
    Box,
    Typography,
    IconButton
} from "@mui/material";
import { useGetCustomers } from "src/actions/customer";
import { useDebounce } from "minimal-shared/hooks";
import { useEffect } from "react";
import { Iconify } from "src/components/iconify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

export function QuotationFilterBar({ onFilterChange, onReset, onSearching }: any) {
    const [open, setOpen] = useState(false);

    const today = dayjs();
    // const [fromDate, setFromDate] = useState<Dayjs | null>(today.subtract(1, "month"));
    // const [toDate, setToDate] = useState<Dayjs | null>(today);
    const [fromDate, setFromDate] = useState<Dayjs | null>(null);
    const [toDate, setToDate] = useState<Dayjs | null>(null);
    const [status, setStatus] = useState("");
    const [month, setMonth] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerkeyword, setCustomerKeyword] = useState('');
    const debouncedCustomerKw = useDebounce(customerkeyword, 300);

    const { customers, customersLoading } = useGetCustomers({
        pageNumber: 1,
        pageSize: 20,
        key: debouncedCustomerKw,
        enabled: true
    });

    const handleApply = () => {
        onFilterChange({
            // fromDate: fromDate?.format("YYYY-MM-DD"),
            // toDate: toDate?.format("YYYY-MM-DD"),
            fromDate: fromDate?.format("DD/MM/YYYY"),
            toDate: toDate?.format("DD/MM/YYYY"),
            status: status || undefined,
            // customer: selectedCustomer?.name || selectedCustomer?.companyName,
            customer: selectedCustomer?.name
                ? selectedCustomer?.name
                : selectedCustomer?.companyName
                    ? selectedCustomer?.companyName
                    : undefined,
            month: month ? Number(month) : undefined,
        });

        setOpen(false);
    };

    const handleReset = () => {
        setFromDate(today.subtract(1, "month"));
        setToDate(today);
        setStatus("");
        setMonth("");
        setSelectedCustomer(null);
        onReset();
    };


    useEffect(() => {
        handleApply();
    }, []);

    return (
        <Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 2 }}>

            <Button
                sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                variant="contained"
                startIcon={<Iconify icon="solar:filter-bold" />}
                onClick={() => setOpen(true)}
            >
                Bộ lọc
            </Button>

            <TextField
                size="small"
                placeholder="Tìm kiếm..."
                onChange={(e) => onSearching(e.target.value)}
                sx={{ ml: "auto", width: 360 }}
                InputProps={{
                    startAdornment: (
                        <Iconify icon="eva:search-fill" sx={{ mr: 1, color: "text.disabled" }} />
                    ),
                }}
            />

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: { width: 420, borderRadius: "12px 0 0 12px" }
                }}
            >
                <Box sx={{ p: 2, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight={700}>Bộ lọc nâng cao</Typography>

                    <IconButton onClick={() => setOpen(false)}>
                        <Iconify icon="eva:close-fill" />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>

                    {/* <Autocomplete
                        size="small"
                        options={[]}
                        renderInput={(params) => (
                            <TextField {...params} label="Khách hàng" />
                        )}
                    /> */}


                    <Autocomplete
                        // fullWidth
                        size="small"
                        options={customers || []}
                        getOptionLabel={(option) => option.name ? option.name : option.companyName ? option.companyName : ""}
                        value={selectedCustomer}
                        onChange={(_, newValue) => setSelectedCustomer(newValue)}
                        onInputChange={(_, newInputValue) => setCustomerKeyword(newInputValue)}
                        loading={customersLoading}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                {option.name || option.companyName}
                            </li>
                        )}
                        noOptionsText="Không tìm thấy dữ liệu"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tất cả khách hàng"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}

                    />



                    <FormControl size="small">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={status}
                            label="Trạng thái"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="Draft">Nháp</MenuItem>
                            <MenuItem value="Ongoing">Đang thực hiện</MenuItem>
                            <MenuItem value="Completed">Hoàn thành</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small">
                        <InputLabel>Tháng</InputLabel>
                        <Select
                            value={month}
                            label="Tháng"
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            {Array.from({ length: 12 }, (_, i) => (
                                <MenuItem key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <DatePicker
                        label="Từ ngày"
                        format="DD/MM/YYYY"
                        value={fromDate}
                        onChange={setFromDate}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                    />

                    <DatePicker
                        label="Đến ngày"
                        format="DD/MM/YYYY"
                        value={toDate}
                        onChange={setToDate}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                    />
                </Box>

                <Box sx={{ p: 2, borderTop: "1px solid #eee", display: "flex", gap: 1 }}>
                    <Button fullWidth variant="outlined" onClick={handleReset}>
                        Đặt lại
                    </Button>

                    <Button fullWidth variant="contained" onClick={handleApply} sx={(theme) => ({ bgcolor: theme.palette.primary.main })}>
                        Áp dụng
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}