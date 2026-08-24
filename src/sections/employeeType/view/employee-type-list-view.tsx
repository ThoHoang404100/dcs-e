import { Button } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetEmployeeTypes } from "src/actions/employeeType";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { Iconify } from "src/components/iconify";
import { EMPLOYEETYPES_COLUMNS } from "src/const/employeeTypes";
import { DashboardContent } from "src/layouts/dashboard";
import { IEmployeeTypeItem } from "src/types/employeeType";
import { EmployeeTypeNewEditForm } from "../employee-type-new-edit-form";
import { deleteOne } from "src/actions/delete";
import { endpoints } from "src/lib/axios";
import { toast } from "sonner";
import { ConfirmDialog } from "src/components/custom-dialog";
import { CONFIG } from "src/global-config";
import { EmployeeTypeBin } from "../employee-type-bin";
import { RoleBasedGuard } from "src/auth/guard";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { EMPLOYEE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";

export function EmployeeTypeListView() {
    const location = useLocation();

    const openCrudForm = useBoolean();
    const confirmDialog = useBoolean();
    const openBin = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { permission } = useCheckPermission(['CHUCVU.VIEW']);

    const { employeeTypes, pagination, employeeTypesLoading, mutation } = useGetEmployeeTypes({
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

    const [tableData, setTableData] = useState<IEmployeeTypeItem[]>(employeeTypes);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<IEmployeeTypeItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(employeeTypes);
    }, [employeeTypes]);

    const dataFiltered = tableData;


    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.employeeType.delete(id),
            listEndpoint: '/api/v1/employee-type/employee-types',
        });
        if (success) {
            toast.success('Xóa thành công 1 chức vụ!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }


    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa chức vụ"
            content={
                <>
                    Bạn có chắc chắn muốn xóa chức vụ này?
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
        <EmployeeTypeNewEditForm
            open={openCrudForm.value}
            onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            selectedId={rowIdSelected || undefined}
            currentEmployeeType={tableRowSelected || undefined}
        />
    );

    const renderBin = () => (
        <EmployeeTypeBin
            open={openBin.value}
            onClose={openBin.onFalse}
            listMutation={mutation}
        />
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['CHUCVU.VIEW']}
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
                    heading="Nhân viên"
                    links={[
                        { name: 'Quản lý danh mục' },
                        { name: 'Chức vụ' },
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
                            Tạo chức vụ
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={dataFiltered}
                    loading={employeeTypesLoading}
                    columns={EMPLOYEETYPES_COLUMNS({ openCrudForm, confirmDelRowDialog, setTableRowSelected, setRowIdSelected, page, rowsPerPage })}
                    rowSelectionModel={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                    paginationCount={pagination?.totalRecord ?? 0}
                    page={page}
                    handleChangePage={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    openBin={openBin}
                    additionDefaultFilter={<ServiceNavTabs tabs={EMPLOYEE_TAB_DATA} activePath={location.pathname} />}
                />
                {renderCRUDForm()}
                {renderConfirmDeleteRow()}
                {renderBin()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}