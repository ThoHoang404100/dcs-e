import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetWarehouseImports } from "src/actions/contractSupplier";
import { RoleBasedGuard } from "src/auth/guard";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { WAREHOUSE_IMPORT_COLUMNS } from "src/const/warehouseImport";
import { CONFIG } from "src/global-config";
import { DashboardContent } from "src/layouts/dashboard";
import { IContractWarehouseImportItem } from "src/types/warehouse-import";
import { WarehouseImportNewEditForm } from "../warehouse-import-new-dit-form";
import { ConfirmDialog } from "src/components/custom-dialog";
import { Button, Box } from "@mui/material";
import { deleteOne } from "src/actions/delete";
import { toast } from "sonner";
import { endpoints } from "src/lib/axios";
import { useLocation } from "react-router";
import { SUPPLIER_SERVICE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { FilterValues } from "src/types/filter-values";
import { formatDate } from "src/utils/format-time-vi";
import { WarehouseImportFilterBar } from "../components/warehouse-import-filter";
import { Iconify } from "src/components/iconify";
import { paths } from "src/routes/paths";

export function WarehouseImportMainView() {
    const location = useLocation();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const { permission } = useCheckPermission(['PHIEUNHAPKHO.VIEW']);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<FilterValues>({
        fromDate: formatDate(lastMonth),
        toDate: formatDate(today),
    });

    const {
        contractWarehouseImports,
        contractWarehouseImportsEmpty,
        contractWarehouseImportsLoading,
        pagination,
        mutation
    } = useGetWarehouseImports({
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

    const handleDeleteRow = async () => {
        const success = await deleteOne({
            apiEndpoint: endpoints.contractWarehouseImport.delete(rowIdSelected),
            listEndpoint: '/api/v1/warehouse-imports/get-imports',
        });
        if (success) {
            toast.success('Xóa thành công 1 phiếu nhập kho!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const onPreviewWarehouseImport = (params: URLSearchParams) => {
        const queryString = params.toString();
        window.open(`${paths.warehouseImport}?${queryString}`, '_blank');
    }

    const [tableData, setTableData] = useState<IContractWarehouseImportItem[]>(contractWarehouseImports);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<IContractWarehouseImportItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(contractWarehouseImports);
    }, [contractWarehouseImports]);

    useEffect(() => {
        mutation();
    }, [location.pathname]);

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['PHIEUNHAPKHO.VIEW']}
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
                    heading="Nghiệp vụ nhà cung cấp"
                    links={[
                        { name: 'Nghiệp vụ nhà cung cấp' },
                        { name: 'Phiếu nhập kho' },
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
                            Tạo phiếu nhập kho
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
                    <ServiceNavTabs tabs={SUPPLIER_SERVICE_TAB_DATA} activePath={location.pathname} />
                    <WarehouseImportFilterBar
                        onFilterChange={handleFilterChange}
                        onSearching={setSearchText}
                        onReset={handleReset}
                    />
                </Box>

                <UseGridTableList
                    dataFiltered={tableData}
                    loading={contractWarehouseImportsLoading}
                    columns={
                        WAREHOUSE_IMPORT_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            setRowIdSelected,
                            setTableRowSelected,
                            page,
                            rowsPerPage,
                            onPreviewWarehouseImport
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
                <WarehouseImportNewEditForm
                    open={openCrudForm.value}
                    onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); }}
                    selectedWarehouseImport={tableRowSelected}
                    mutation={mutation}
                    onPreviewWarehouseImport={onPreviewWarehouseImport}
                />
                <ConfirmDialog
                    open={confirmDelRowDialog.value}
                    onClose={confirmDelRowDialog.onFalse}
                    title="Xác nhận xóa phiếu nhập kho"
                    content={
                        <>
                            Bạn có chắc chắn muốn xóa phiếu nhập kho này?
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
            </DashboardContent>
        </RoleBasedGuard>
    );
}