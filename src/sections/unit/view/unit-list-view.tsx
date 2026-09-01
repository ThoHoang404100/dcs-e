import { Button } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetUnits } from "src/actions/unit";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { Iconify } from "src/components/iconify";
import { UNIT_COLUMNS } from "src/const/unit";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { IUnitItem } from "src/types/unit";
import { UnitNewEditForm } from "../unit-new-edit-form";
import { ConfirmDialog } from "src/components/custom-dialog";
import { deleteOne } from "src/actions/delete";
import { endpoints } from "src/lib/axios";
import { toast } from "sonner";
import { CONFIG } from "src/global-config";
import { UnitBin } from "../unit-bin";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { PRODUCT_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";

export function UnitListView() {
    const location = useLocation();

    const openCrudForm = useBoolean();
    const confirmDialog = useBoolean();
    const openBin = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { permission } = useCheckPermission(['DONVITINH.VIEW']);

    const { units, pagination, unitsLoading, mutation } = useGetUnits({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText,
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

    const [tableData, setTableData] = useState<IUnitItem[]>(units);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<IUnitItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(units);
    }, [units]);

    const dataFiltered = tableData;

    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.unit.delete(id),
            listEndpoint: '/api/v1/units/units',
        });
        if (success) {
            toast.success('Xóa thành công 1 đơn vị tính!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa đơn vị tính"
            content={
                <>
                    Bạn có chắc chắn muốn xóa đơn vị tính này?
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

    const renderCRUDForm = () => (
        <UnitNewEditForm
            open={openCrudForm.value}
            onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            selectedId={rowIdSelected || undefined}
            currentUnit={tableRowSelected || undefined}
        />
    );

    const renderBin = () => (
        <UnitBin
            open={openBin.value}
            onClose={openBin.onFalse}
            listMutation={mutation}
        />
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['DONVITINH.VIEW']}
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
                    heading="Sản phẩm"
                    links={[
                        { name: 'Quản lý danh mục' },
                        { name: 'Đơn vị tính' },
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
                            Tạo đơn vị tính
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={dataFiltered}
                    loading={unitsLoading}
                    columns={UNIT_COLUMNS({ openCrudForm, confirmDelRowDialog, setTableRowSelected, setRowIdSelected, page, rowsPerPage })}
                    rowSelectionModel={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                    paginationCount={pagination?.totalRecord ?? 0}
                    page={page}
                    handleChangePage={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    openBin={openBin}
                    additionDefaultFilter={<ServiceNavTabs tabs={PRODUCT_TAB_DATA} activePath={location.pathname} />}
                />
                {renderCRUDForm()}
                {renderConfirmDeleteRow()}
                {renderBin()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}