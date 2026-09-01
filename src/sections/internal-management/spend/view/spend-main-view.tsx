import { Button, Box } from "@mui/material";
import { RoleBasedGuard } from "src/auth/guard";
import { ConfirmDialog } from "src/components/custom-dialog";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { ReceiptAndSpendData } from "src/types/internal";
import { SpendNewEditForm } from "../spend-new-edit-form";
import { DashboardContent } from "src/layouts/dashboard";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { Iconify } from "src/components/iconify";
import { ChangeEvent, useEffect, useState } from "react";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useGetInternalReceiptAndSpend } from "src/actions/internal";
import { useBoolean } from "minimal-shared/hooks";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { CONFIG } from "src/global-config";
import { paths } from "src/routes/paths";
import { endpoints } from "src/lib/axios";
import { toast } from "sonner";
import { deleteOne } from "src/actions/delete";
import { INTERNAL_SPEND_COLUMNS } from "src/const/internal-spend";
import { fDate, formatDate } from "src/utils/format-time-vi";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { INTERNAL_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import { SpendFilterBar } from "../spend-filter";
import { FilterValues } from "src/types/filter-values";

export function SpendMainView() {
    const location = useLocation();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const { permission } = useCheckPermission(['PHIEUCHI.VIEW']);

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
        isReceive: false,
        enabled: true,
        FromDate: filters.fromDate,
        ToDate: filters.toDate,
        Month: filters.month,
        Filter: filters.receiverName
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
            receiverName: undefined,
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
            toast.success('Xóa thành công 1 phiếu chi!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }
    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa phiếu chi"
            content={
                <>
                    Bạn có chắc chắn muốn xóa phiếu chi này?
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

    const renderForm = () => (
        <SpendNewEditForm
            open={openCrudForm.value}
            onClose={openCrudForm.onFalse}
            selectedReceipt={tableRowSelected}
            mutation={mutation}
            totalRecord={pagination.totalRecord}
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
        window.open(`${paths.spend}?${queryString}`, '_blank');
    }

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['PHIEUCHI.VIEW']}
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
                    heading="Phiếu chi"
                    links={[
                        { name: 'Quản lý nội bộ' },
                        { name: 'Phiếu chi' },
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
                            Tạo phiếu chi
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={tableData}
                    loading={receiptOrSpendDtLoading}
                    columns={
                        INTERNAL_SPEND_COLUMNS({
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
                            <SpendFilterBar
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