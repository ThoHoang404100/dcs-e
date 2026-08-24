import { Button, Box } from "@mui/material"
import { GridRowSelectionModel } from "@mui/x-data-grid"
import { useBoolean } from "minimal-shared/hooks"
import { ChangeEvent, useEffect, useState } from "react"
import { useGetSuppliers } from "src/actions/suppliers"
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs"
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table"
import { Iconify } from "src/components/iconify"
import { SUPPLIERS_COLUMNS } from "src/const/supplier"
import { DashboardContent } from "src/layouts/dashboard"
import { ISuppliersItem } from "src/types/suppliers"
import { SupplierNewEditForm } from "../supplier-new-edit-form"
import { SupplierDetails } from "../supplier-details"
import { ConfirmDialog } from "src/components/custom-dialog"
import { deleteOne } from "src/actions/delete"
import { endpoints } from "src/lib/axios"
import { toast } from "sonner"
import { CONFIG } from "src/global-config"
import { SupplierBin } from "../supplier-bin"
import { RoleBasedGuard } from "src/auth/guard"
import { useCheckPermission } from "src/auth/hooks/use-check-permission"
import { useLocation } from "react-router"
import ServiceNavTabs from "src/components/tabs/service-nav-tabs"
import { CUSTOMER_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data"
import { SupplierFilter } from "../supplier-filter"

export function SuppliersListView() {
    const location = useLocation();

    const openCrudForm = useBoolean();
    const confirmDialog = useBoolean();
    const openBin = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { permission } = useCheckPermission(['NHACUNGCAP.VIEW']);
    const [isBusiness, setIsBusiness] = useState<boolean | null>(null);

    const { suppliers, pagination, suppliersLoading, mutation } = useGetSuppliers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText,
        IsBusiness: isBusiness !== null && isBusiness === true
            ? true
            : isBusiness !== null && isBusiness === false
                ? false
                : null,
    });

    const { pagination: { totalRecord: allRecord } } = useGetSuppliers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsBusiness: null
    });

    const { pagination: { totalRecord: businessRecord } } = useGetSuppliers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsBusiness: true
    });

    const { pagination: { totalRecord: unBusinessRecord } } = useGetSuppliers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsBusiness: false
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
    const [tableData, setTableData] = useState<ISuppliersItem[]>(suppliers);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<ISuppliersItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(suppliers);
    }, [suppliers]);

    const dataFiltered = tableData;

    const renderCRUDForm = () => (
        <SupplierNewEditForm
            open={openCrudForm.value}
            onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            selectedId={rowIdSelected || undefined}
            currentSupplier={tableRowSelected || undefined}
        />
    );

    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.suppliers.delete(id),
            listEndpoint: '/api/v1/suppliers/suppliers',
        });
        if (success) {
            toast.success('Xóa thành công 1 nhà cung cấp!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }
    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa nhà cung cấp"
            content={
                <>
                    Bạn có chắc chắn muốn xóa nhà cung cấp này?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRow(Number(rowIdSelected));
                        confirmDelRowDialog.onFalse();
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    const renderDetails = () => (
        <SupplierDetails
            open={openDetailsForm.value}
            selectedSupplier={tableRowSelected || undefined}
            onClose={openDetailsForm.onFalse}
        />
    );

    const renderBin = () => (
        <SupplierBin
            open={openBin.value}
            onClose={openBin.onFalse}
            listMutation={mutation}
        />
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['NHACUNGCAP.VIEW']}
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
                    heading="Khách hàng"
                    links={[
                        { name: 'Quản lý danh mục' },
                        { name: 'Nhà cung cấp' },
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => {
                                setTableRowSelected(null);
                                openCrudForm.onTrue();
                            }}
                            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                        >
                            Tạo nhà cung cấp
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={dataFiltered}
                    loading={suppliersLoading}
                    columns={
                        SUPPLIERS_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            setRowIdSelected,
                            setTableRowSelected,
                            page,
                            rowsPerPage
                        })}
                    rowSelectionModel={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                    paginationCount={pagination?.totalRecord ?? 0}
                    page={page}
                    handleChangePage={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    openBin={openBin}
                    additionDefaultFilter={
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <ServiceNavTabs tabs={CUSTOMER_TAB_DATA} activePath={location.pathname} />
                            <SupplierFilter
                                allRecord={allRecord}
                                filterState={isBusiness}
                                onChangeState={setIsBusiness}
                                businessRecord={businessRecord}
                                unBusinessRecord={unBusinessRecord}
                            />
                        </Box>
                    }
                />
                {renderCRUDForm()}
                {renderDetails()}
                {renderConfirmDeleteRow()}
                {renderBin()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}