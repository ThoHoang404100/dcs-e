import {
    Box,
    TablePagination,
    Skeleton,
    Button,
    Paper,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, useRef } from 'react';
import { formatDate } from 'src/utils/format-time-vi';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'minimal-shared/hooks';
import { useGetContracts, useGetContract } from 'src/actions/contract';
import { IContractItem } from 'src/types/contract';
import { toast } from 'sonner';
import { endpoints } from 'src/lib/axios';
import { deleteOne } from 'src/actions/delete';
import { FilterValues } from 'src/types/filter-values';
import { Location } from 'react-router';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import statusMap from './contract-item';
import { Iconify } from 'src/components/iconify';
import { mutate as globalMutate } from 'swr';

type Props = {
    onViewDetails: (contract: IContractItem) => void;
    onEditing: (contract: IContractItem) => void;
    page: number;
    setPage: (value: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (value: number) => void;
    location: Location<any>;
    filters: FilterValues;
    searchText: string;
    isDataChanged?: boolean;
    setIsDataChanged?: (value: boolean) => void;
};

const tableCellStyle = {
    fontSize: '12px',
    padding: '6px 12px',
    whiteSpace: 'nowrap',
};

const ellipsisStyle = {
    ...tableCellStyle,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
};

export function ContractTableList({ ...props }: Props) {
    const {
        onViewDetails,
        onEditing,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        location,
        filters,
        searchText,
        isDataChanged,
        setIsDataChanged
    } = props;

    const [selectedRow, setSelectedRow] = useState<IContractItem | null>(null);
    const [contractId, setContractId] = useState<number | null>(null);
    const [detailPage, setDetailPage] = useState(0);
    const [detailRowsPerPage, setDetailRowsPerPage] = useState(20);
    const [mainHeightPercent, setMainHeightPercent] = useState(45);

    const confirmDelRowDialog = useBoolean();
    const [idSelected, setIdSelected] = useState(0);

    // Main list
    const { contracts, contractsLoading, pagination, mutate } = useGetContracts({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText.trim(),
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        Filter: filters.customer,
        Month: filters.month,
        Status: filters.status
    });

    // Detail
    const { contract: contractData, contractLoading: detailLoading } = useGetContract({
        contractId: contractId || 0,
        pageNumber: detailPage + 1,
        pageSize: detailRowsPerPage,
    });

    // Tự động gọi lại data khi đóng form chỉnh sửa
    useEffect(() => {
        if (isDataChanged) {
            mutate();
            if (contractId) {
                globalMutate(`${endpoints.contract.detail}/${contractId}`);
            }
            if (setIsDataChanged) {
                setIsDataChanged(false);
            }
        }
    }, [isDataChanged, contractId, mutate, setIsDataChanged]);

    const detailItems = useMemo(() => {
        if (!contractData) return [];
        return contractData.items?.[0]?.products || contractData.items || [];
    }, [contractData]);

    const totalRecord = contractData?.totalRecord ?? detailItems.length;

    useEffect(() => {
        setSelectedRow(null);
        setContractId(null);
        setDetailPage(0);
    }, [filters, searchText]);

    const totalQty = useMemo(() =>
        detailItems.reduce((s: number, i: any) => s + (i.quantity ?? 0), 0), [detailItems]
    );

    const totalMoney = useMemo(() =>
        detailItems.reduce((s: number, i: any) => s + (i.total ?? 0), 0), [detailItems]
    );

    const totalVAT = useMemo(() =>
        detailItems.reduce((s: number, i: any) => s + (i.total ?? 0) * (i.vat ?? 0) / 100, 0), [detailItems]
    );

    useEffect(() => {
        mutate();
    }, [location.pathname, mutate]);

    const handleRowClick = (row: IContractItem) => {
        setSelectedRow(row);
        setContractId(row.id);
        setDetailPage(0);
    };

    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.contract.delete(id),
            listEndpoint: '/api/v1/contracts/contracts',
        });
        if (success) {
            toast.success('Xóa thành công!');
            mutate();
            if (selectedRow?.id === id) {
                setSelectedRow(null);
                setContractId(null);
            }
        } else {
            toast.error("Xóa thất bại!");
        }
    };

    const totalMainMoney = useMemo(() => {
        if (!contracts) return 0;
        return contracts.reduce((sum: number, contract: IContractItem) => sum + (contract.total || 0), 0);
    }, [contracts]);

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
            title="Xác nhận xóa hợp đồng"
            content="Bạn có chắc chắn muốn xóa hợp đồng này?"
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRow(idSelected);
                        confirmDelRowDialog.onFalse();
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    return (
        <Paper sx={{ borderRadius: 2, height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* BẢNG CHÍNH (DANH SÁCH HỢP ĐỒNG) */}
            <Box sx={{ height: `${mainHeightPercent}%`, minHeight: 250, display: "flex", flexDirection: "column" }}>
                <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                    <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: 1000 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#E8F5E9" }}>
                                <TableCell style={{ ...tableCellStyle, width: '50px' }} align="center">STT</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '150px' }}>Mã HĐ</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '220px' }}>Khách hàng</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '110px' }}>Ngày ký</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '110px' }}>Ngày hết hạn</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '90px' }} align="center">Trạng thái</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '120px' }} align="right">Tổng tiền thanh toán</TableCell>
                                <TableCell style={{ ...tableCellStyle, width: '120px' }} align="center">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {contractsLoading ? (
                                Array.from({ length: rowsPerPage }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 8 }).map((__, j) => (
                                            <TableCell key={j} style={tableCellStyle}><Skeleton variant="text" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <>
                                    {contracts.map((contract, index) => (
                                        <TableRow
                                            key={contract.id}
                                            hover
                                            onClick={() => handleRowClick(contract)}
                                            sx={{ cursor: "pointer", ...(selectedRow?.id === contract.id && { bgcolor: "#FDECEF" }) }}
                                        >
                                            <TableCell style={tableCellStyle} align="center">
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell style={tableCellStyle}>
                                                {contract.contractNo || `#${contract.id}`}
                                            </TableCell>
                                            <Tooltip title={contract.nickName} placement="top-start" arrow>
                                                <TableCell style={ellipsisStyle}>
                                                    {contract.customerName}
                                                </TableCell>
                                            </Tooltip>
                                            <TableCell style={tableCellStyle}>{formatDate(contract.createDate)}</TableCell>
                                            <TableCell style={tableCellStyle}>{formatDate(contract.signatureDate)}</TableCell>
                                            <TableCell style={tableCellStyle} align="center">
                                                {statusMap[contract.status] ? (
                                                    <Tooltip title={statusMap[contract.status][0]}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Iconify icon={statusMap[contract.status][1]} width={18} />
                                                        </Box>
                                                    </Tooltip>
                                                ) : contract.status}
                                            </TableCell>
                                            <TableCell style={tableCellStyle} align="right">
                                                {(contract.total || 0).toLocaleString('vi-VN')}
                                            </TableCell>
                                            <TableCell style={tableCellStyle} align="center" onClick={e => e.stopPropagation()}>
                                                <Tooltip title="Xem chi tiết"><IconButton size="small" onClick={() => onViewDetails(contract)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => onEditing(contract)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton size="small" color="error" onClick={() => { setIdSelected(contract.id); confirmDelRowDialog.onTrue(); }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {contracts.length > 0 && (
                                        <TableRow sx={{ bgcolor: "#F5F5F5", position: 'sticky', bottom: 0, zIndex: 1 }}>
                                            <TableCell colSpan={3} style={tableCellStyle}>
                                                <strong>TỔNG CỘNG</strong>
                                            </TableCell>
                                            <TableCell colSpan={3} style={tableCellStyle} />
                                            <TableCell align="right" style={tableCellStyle}>
                                                <strong>{totalMainMoney.toLocaleString('vi-VN')} ₫</strong>
                                            </TableCell>
                                            <TableCell style={tableCellStyle} />
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer sx={{ flexShrink: 0, bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
                    <TablePagination
                        component="div"
                        count={pagination?.totalRecord || 0}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        labelRowsPerPage="Số dòng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}–${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
                        }
                        sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '12px' } }}
                    />
                </TableContainer>
            </Box>

            {/* Splitter */}
            <Box onMouseDown={handleSplitterMouseDown} sx={{ height: 6, bgcolor: "#ddd", cursor: "ns-resize", "&:hover": { bgcolor: "primary.main" }, position: 'relative' }}>
                <Box sx={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", color: "#666", pointerEvents: "none" }}>⋮⋮⋮</Box>
            </Box>

            {/* BẢNG CHI TIẾT HỢP ĐỒNG */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
                <Box sx={{ p: '10px 16px', display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #ddd", bgcolor: "#fff", flexShrink: 0 }}>
                    <Box sx={{ bgcolor: "primary.main", color: "#fff", px: 1.5, py: 0.5, borderRadius: 0.5, fontSize: '12px', fontWeight: 600 }}>
                        CHI TIẾT HỢP ĐỒNG
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '13px' }}>
                        {selectedRow ? `HĐ: ${selectedRow.contractNo || selectedRow.id}` : "Chưa chọn hợp đồng"}
                    </Typography>
                </Box>

                <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                    <Table size="small" stickyHeader sx={{ minWidth: 1100 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#E8F5E9" }}>
                                <TableCell style={{ ...tableCellStyle, width: '50px' }}>#</TableCell>
                                <TableCell style={tableCellStyle}>Mã hàng</TableCell>
                                <TableCell style={tableCellStyle}>Tên hàng hóa / Dịch vụ</TableCell>
                                <TableCell style={tableCellStyle}>ĐVT</TableCell>
                                <TableCell style={tableCellStyle} align="right">Số lượng</TableCell>
                                <TableCell style={tableCellStyle} align="right">Đơn giá</TableCell>
                                <TableCell style={tableCellStyle} align="right">Thành tiền</TableCell>
                                <TableCell style={tableCellStyle} align="right">% VAT</TableCell>
                                <TableCell style={tableCellStyle} align="right">Tiền thuế VAT</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {!selectedRow ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" style={tableCellStyle}>
                                        <EmptyContent content="Chọn hợp đồng từ bảng trên để xem chi tiết" />
                                    </TableCell>
                                </TableRow>
                            ) : detailLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <TableCell key={j} style={tableCellStyle}><Skeleton variant="text" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : detailItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" style={tableCellStyle}>Không có sản phẩm nào</TableCell>
                                </TableRow>
                            ) : (
                                detailItems.map((item: any, i: number) => (
                                    <TableRow key={item.id || i}>
                                        <TableCell style={tableCellStyle}>{detailPage * detailRowsPerPage + i + 1}</TableCell>
                                        <TableCell style={tableCellStyle}>{item.productID}</TableCell>
                                        <TableCell style={tableCellStyle}>{item.productName}</TableCell>
                                        <TableCell style={tableCellStyle}>{item.unitProductName || item.unit}</TableCell>
                                        <TableCell style={tableCellStyle} align="right">{item.quantity}</TableCell>
                                        <TableCell style={tableCellStyle} align="right">{(item.price || 0).toLocaleString()}</TableCell>
                                        <TableCell style={tableCellStyle} align="right">{(item.total || 0).toLocaleString()}</TableCell>
                                        <TableCell style={tableCellStyle} align="right">{item.vat}%</TableCell>
                                        <TableCell style={tableCellStyle} align="right">{Math.round(((item.price || 0) * (item.vat || 0)) / 100).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            )}

                            {selectedRow && detailItems.length > 0 && !detailLoading && (
                                <TableRow sx={{ bgcolor: "#E8F5E9", fontWeight: "bold" }}>
                                    <TableCell colSpan={4} style={tableCellStyle}><strong>TỔNG CỘNG</strong></TableCell>
                                    <TableCell align="right" style={tableCellStyle}><strong>{totalQty}</strong></TableCell>
                                    <TableCell style={tableCellStyle} />
                                    <TableCell align="right" style={tableCellStyle}><strong>{totalMoney.toLocaleString()} ₫</strong></TableCell>
                                    <TableCell style={tableCellStyle} />
                                    <TableCell align="right" style={tableCellStyle}><strong>{totalVAT.toLocaleString()} ₫</strong></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
                    <TablePagination
                        component="div"
                        count={totalRecord}
                        page={detailPage}
                        onPageChange={(_, p) => setDetailPage(p)}
                        rowsPerPage={detailRowsPerPage}
                        onRowsPerPageChange={(e) => { setDetailRowsPerPage(parseInt(e.target.value)); setDetailPage(0); }}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        labelRowsPerPage="Số dòng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}–${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
                        }
                        sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '12px' } }}
                    />
                </Box>
            </Box>

            {renderConfirmDeleteRow()}
        </Paper>
    );
}