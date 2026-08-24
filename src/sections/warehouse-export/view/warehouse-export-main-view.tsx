import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetWarehouseExports } from "src/actions/contract";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { WAREHOUSE_EXPORT_COLUMNS } from "src/const/warehouseExport";
import { CONFIG } from "src/global-config";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { IContractWarehouseExportItem } from "src/types/warehouseExport";
import { WarehouseExportNewEditForm } from "../warehouse-export-new-edit-form";
import { deleteOne } from "src/actions/delete";
import { endpoints } from "src/lib/axios";
import { toast } from "sonner";
import { ConfirmDialog } from "src/components/custom-dialog";
import { Button, Box } from "@mui/material";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { useLocation } from "react-router";
import { CUSTOMER_SERVICE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { FilterValues } from "src/types/filter-values";
import { formatDate } from "src/utils/format-time-vi";
import { WarehouseExportFilterBar } from "../components/warehoue-export-filter";
import { Iconify } from "src/components/iconify";

export function WarehouseExportMainView() {
    const location = useLocation();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const { permission } = useCheckPermission(['PHIEUXUATKHO.VIEW']);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<FilterValues>({
        fromDate: formatDate(lastMonth),
        toDate: formatDate(today),
    });

    const {
        contractWarehouseExports,
        contractWarehouseExportsEmpty,
        contractWarehouseExportsLoading,
        pagination,
        mutation
    } = useGetWarehouseExports({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText.trim(),
        enabled: true,
        ContractNo: filters.contract,
        FromDate: filters.fromDate,
        ToDate: filters.toDate,
        Month: filters.month,
    });

    const handleFilterChange = (values: FilterValues) => {
        setFilters(values);
        setPage(0);
    };

    const handleReset = () => {
        setFilters({
            fromDate: formatDate(lastMonth),
            toDate: formatDate(today),
            contract: undefined,
            month: undefined
        });
        setPage(0);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [tableData, setTableData] = useState<IContractWarehouseExportItem[]>(contractWarehouseExports);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<IContractWarehouseExportItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(contractWarehouseExports);
    }, [contractWarehouseExports]);

    useEffect(() => {
        mutation();
    }, [location.pathname]);

    const onPreviewWarehouseExport = (params: URLSearchParams) => {
        const queryString = params.toString();
        window.open(`${paths.warehouseExport}?${queryString}`, '_blank');
    }

    const renderForm = () => (
        <WarehouseExportNewEditForm
            open={openCrudForm.value}
            onClose={openCrudForm.onFalse}
            selectedWarehouseExport={tableRowSelected}
            refetchList={mutation}
            onPreviewWarehouseExport={onPreviewWarehouseExport}
        />
    )

    const handleDeleteRow = async () => {
        const success = await deleteOne({
            apiEndpoint: endpoints.contractWarehouse.delete(rowIdSelected),
            listEndpoint: '/api/v1/warehouse-exports/get-exports',
        });
        if (success) {
            toast.success('Xóa thành công 1 phiếu xuất kho!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa phiếu xuất kho"
            content={
                <>
                    Bạn có chắc chắn muốn xóa phiếu xuất kho này?
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

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['PHIEUXUATKHO.VIEW']}
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
                    heading="Nghiệp vụ khách hàng"
                    links={[
                        { name: 'Nghiệp vụ khách hàng' },
                        { name: 'Phiếu xuất kho' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
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
                            Tạo phiếu xuất kho
                        </Button>
                    }
                />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <ServiceNavTabs tabs={CUSTOMER_SERVICE_TAB_DATA} activePath={location.pathname} />
                    <WarehouseExportFilterBar
                        onFilterChange={handleFilterChange}
                        onSearching={setSearchText}
                        onReset={handleReset}
                    />
                </Box>

                <UseGridTableList
                    dataFiltered={tableData}
                    loading={contractWarehouseExportsLoading}
                    columns={
                        WAREHOUSE_EXPORT_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            setRowIdSelected,
                            setTableRowSelected,
                            page,
                            rowsPerPage,
                            onPreviewWarehouseExport
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
                />
                {renderForm()}
                {renderConfirmDeleteRow()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}