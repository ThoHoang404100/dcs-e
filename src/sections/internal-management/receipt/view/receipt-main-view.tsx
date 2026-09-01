import { Button, Box } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetReceiptContract } from "src/actions/contract";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { Iconify } from "src/components/iconify";
import { RECEIPT_COLUMNS } from "src/const/receipt";
import { CONFIG } from "src/global-config";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { IContractReceiptItem, IReceiptContract } from "src/types/contract";
import { deleteOne } from "src/actions/delete";
import { endpoints } from "src/lib/axios";
import { toast } from "sonner";
import { ConfirmDialog } from "src/components/custom-dialog";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { ReceiptNewEditForm } from "../receipt-new-edit-form";
import { useGetInternalReceiptAndSpend } from "src/actions/internal";
import { ReceiptAndSpendData } from "src/types/internal";
import { INTERNAL_RECEIPT_COLUMNS } from "src/const/internal-receipt";
import { fDate, formatDate } from "src/utils/format-time-vi";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { INTERNAL_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import { ReceiptFilterBar } from "../receipt-filter";
import { FilterValues } from "src/types/filter-values";

export function ReceiptMainView() {
    const location = useLocation();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const { permission } = useCheckPermission(['PHIEUTHU.VIEW']);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<FilterValues>({
        fromDate: formatDate(lastMonth),
        toDate: formatDate(today),
    });

    const {
        receiptOrSpendDt,
        receiptOrSpendDtEmpty,
        receiptOrSpendDtLoading,
        pagination,
        mutation
    } = useGetInternalReceiptAndSpend({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText,
        isReceive: true,
        enabled: true,
        FromDate: filters.fromDate,
        ToDate: filters.toDate,
        Month: filters.month,
        Filter: filters.payer
    });

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (values: FilterValues) => {
        setFilters(values);
        setPage(0);
    };

    const handleReset = () => {
        setFilters({
            fromDate: formatDate(lastMonth),
            toDate: formatDate(today),
            payer: undefined,
            month: undefined
        });
        setPage(0);
    };

    const [tableData, setTableData] = useState<ReceiptAndSpendData[]>(receiptOrSpendDt);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<ReceiptAndSpendData | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(receiptOrSpendDt);
    }, [receiptOrSpendDt]);

    const handleDeleteRow = async () => {
        const success = await deleteOne({
            apiEndpoint: endpoints.internal.delete(rowIdSelected),
            listEndpoint: '/api/v1/receipts/get-receipts',
        });
        if (success) {
            toast.success('Xóa thành công 1 phiếu thu!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa phiếu thu"
            content={
                <>
                    Bạn có chắc chắn muốn xóa phiếu thu này?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRow();
                        confirmDelRowDialog.onFalse();
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    const onPreviewReceipt = (item: ReceiptAndSpendData) => {
        const params = new URLSearchParams({
            companyName: "",
            customerName: "",
            date: String(fDate(item.receiptDate)),
            receiptNoToWatch: item.receiptNo,
            amount: String(item.cost),
            payer: item.name,
            contractNo: "",
            reason: item.reason,
            address: item.address,
            createdBy: item.createdBy
        } as Record<string, string>);
        const queryString = params.toString();
        window.open(`${paths.receipt}?${queryString}`, '_blank');
    }

    const renderForm = () => (
        <ReceiptNewEditForm
            open={openCrudForm.value}
            onClose={openCrudForm.onFalse}
            selectedReceipt={tableRowSelected}
            mutation={mutation}
            totalRecord={pagination.totalRecord}
        />
    )

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['PHIEUTHU.VIEW']}
            sx={{ py: 10 }}
        >
            <DashboardContent 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    zoom: "80%",
                    transformOrigin: "top left",
                }}
            >
                <CustomBreadcrumbs
                    heading="Phiếu thu"
                    links={[
                        { name: 'Quản lý nội bộ' },
                        { name: 'Phiếu thu' },
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => {
                                openCrudForm.onTrue();
                                setTableRowSelected(null);
                            }}
                            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                        >
                            Tạo phiếu thu
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={tableData}
                    loading={receiptOrSpendDtLoading}
                    columns={
                        INTERNAL_RECEIPT_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            setRowIdSelected,
                            setTableRowSelected,
                            page,
                            rowsPerPage,
                            onPreviewReceipt
                        })}
                    rowSelectionModel={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                    paginationCount={pagination?.totalRecord ?? 0}
                    page={page}
                    handleChangePage={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    disableDefaultFilter
                    additionalFilter={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <ServiceNavTabs tabs={INTERNAL_TAB_DATA} activePath={location.pathname} />
                            <ReceiptFilterBar
                                onFilterChange={handleFilterChange}
                                onSearching={setSearchText}
                                onReset={handleReset} />
                        </Box>
                    }
                />
                {renderForm()}
                {renderConfirmDeleteRow()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}