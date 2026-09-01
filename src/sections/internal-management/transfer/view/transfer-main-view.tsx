import { Button } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetInternalTransfer } from "src/actions/internal";
import { RoleBasedGuard } from "src/auth/guard";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { Iconify } from "src/components/iconify";
import { INTERNAL_TRANSFER_COLUMNS } from "src/const/internal-transfer";
import { CONFIG } from "src/global-config";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { TransferData } from "src/types/internal";
import { TransferNewEditForm } from "../transfer-new-edit.form";
import { ConfirmDialog } from "src/components/custom-dialog";
import { endpoints } from "src/lib/axios";
import { deleteOne } from "src/actions/delete";
import { toast } from "sonner";
import { TransferDetail } from "../transfer-details";
import { useLocation } from "react-router";
import { INTERNAL_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";

export function TransferMainView() {
    const location = useLocation();

    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const { permission } = useCheckPermission(['CHUYENKHOANNOIBO.VIEW']);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { transferData,
        transferDataLoading,
        mutation,
        pagination
    } = useGetInternalTransfer({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText,
        enabled: true
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

    const [tableData, setTableData] = useState<TransferData[]>(transferData);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<TransferData | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);


    const handleDeleteRow = async () => {
        const success = await deleteOne({
            apiEndpoint: endpoints.internal.deleteTransfer(rowIdSelected),
            listEndpoint: '/api/v1/transfer/get-transfer',
        });
        if (success) {
            toast.success('Xóa thành công 1 lịch sử giao dịch!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }
    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa lịch sử giao dịch"
            content={
                <>
                    Bạn có chắc chắn muốn xóa lịch sử giao dịch này?
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

    useEffect(() => {
        setTableData(transferData);
    }, [transferData]);

    const renderForm = () => (
        <TransferNewEditForm
            open={openCrudForm.value}
            onClose={openCrudForm.onFalse}
            selectedTransfer={tableRowSelected}
            mutation={mutation}
            totalRecord={pagination.totalRecord}
        />
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['CHUYENKHOANNOIBO.VIEW']}
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
                    heading="Chuyển khoản"
                    links={[
                        { name: 'Quản lý nội bộ' },
                        { name: 'Chuyển khoản' },
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="grommet-icons:transaction" />}
                            onClick={() => {
                                openCrudForm.onTrue();
                                setTableRowSelected(null);
                            }}
                            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                        >
                            Chuyển khoản
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={tableData}
                    loading={transferDataLoading}
                    columns={
                        INTERNAL_TRANSFER_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            setRowIdSelected,
                            setTableRowSelected,
                            page,
                            rowsPerPage,
                        })}
                    rowSelectionModel={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                    paginationCount={pagination?.totalRecord ?? 0}
                    page={page}
                    handleChangePage={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    additionDefaultFilter={<ServiceNavTabs tabs={INTERNAL_TAB_DATA} activePath={location.pathname} />}
                />
                {renderForm()}
                {renderConfirmDeleteRow()}
                <TransferDetail
                    open={openDetailsForm.value}
                    onClose={openDetailsForm.onFalse}
                    data={tableRowSelected}
                />
            </DashboardContent>
        </RoleBasedGuard>
    );
}