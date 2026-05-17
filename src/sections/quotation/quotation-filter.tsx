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

import { Iconify } from "src/components/iconify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

export function QuotationFilterBar({ onFilterChange, onReset, onSearching }: any) {
    const [open, setOpen] = useState(false);

    const today = dayjs();
    const [fromDate, setFromDate] = useState<Dayjs | null>(today.subtract(1, "month"));
    const [toDate, setToDate] = useState<Dayjs | null>(today);
    const [status, setStatus] = useState("");
    const [month, setMonth] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const handleApply = () => {
        onFilterChange({
            fromDate: fromDate?.format("YYYY-MM-DD"),
            toDate: toDate?.format("YYYY-MM-DD"),
            status: status || undefined,
            customer: selectedCustomer?.name || selectedCustomer?.companyName,
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

                    <Autocomplete
                        size="small"
                        options={[]}
                        renderInput={(params) => (
                            <TextField {...params} label="Khách hàng" />
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
                        value={fromDate}
                        onChange={setFromDate}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                    />

                    <DatePicker
                        label="Đến ngày"
                        value={toDate}
                        onChange={setToDate}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                    />
                </Box>

                <Box sx={{ p: 2, borderTop: "1px solid #eee", display: "flex", gap: 1 }}>
                    <Button fullWidth variant="outlined" onClick={handleReset}>
                        Đặt lại
                    </Button>

                    <Button fullWidth variant="contained" onClick={handleApply}>
                        Áp dụng
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}