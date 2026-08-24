import { Button, Box } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useGetCustomers } from "src/actions/customer";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { Iconify } from "src/components/iconify";
import { CUSTOMER_COLUMNS } from "src/const/customer";
import { DashboardContent } from "src/layouts/dashboard";
import { ICustomerItem } from "src/types/customer";
import { CustomerNewEditForm } from "../customer-new-edit-form";
import { CustomerDetails } from "../customer-details";
import { ConfirmDialog } from "src/components/custom-dialog";
import { deleteOne } from "src/actions/delete";
import { endpoints } from "src/lib/axios";
import { toast } from "sonner";
import { CONFIG } from "src/global-config";
import { CustomerBin } from "../customer-bin";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { CUSTOMER_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import { CustomerFilter } from "../customer-filter";

export function CustomerListView() {
    const location = useLocation();

    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDialog = useBoolean();
    const openBin = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { permission } = useCheckPermission(['KHACHHANG.VIEW']);
    const [isBusiness, setIsBusiness] = useState<boolean | null>(null);
    const [isPartner, setIsPartner] = useState<boolean | null>(null);

    const { customers, pagination, customersLoading, mutation } = useGetCustomers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText,
        IsBusiness: isBusiness !== null && isBusiness === true
            ? true
            : isBusiness !== null && isBusiness === false
                ? false
                : null,
        IsPartner: isPartner !== null && isPartner === true
            ? true
            : isPartner !== null && isPartner === false
                ? false
                : null,
    });

    const { pagination: { totalRecord: allRecord } } = useGetCustomers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsBusiness: null
    });

    const { pagination: { totalRecord: businessRecord } } = useGetCustomers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsBusiness: true
    });

    const { pagination: { totalRecord: unBusinessRecord } } = useGetCustomers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsBusiness: false
    });

    const { pagination: { totalRecord: partnerRecord } } = useGetCustomers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsPartner: true
    });

    const { pagination: { totalRecord: retailRecord } } = useGetCustomers({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        IsPartner: false
    });

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handleChangeRowsPerPage = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [tableData, setTableData] = useState<ICustomerItem[]>(customers);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<ICustomerItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(customers);
    }, [customers]);

    const dataFiltered = tableData;

    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.customer.delete(id),
            listEndpoint: '/api/v1/customers/customers',
        });
        if (success) {
            toast.success('Xóa thành công 1 khách hàng!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const renderCRUDForm = () => (
        <CustomerNewEditForm
            open={openCrudForm.value}
            onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            selectedId={rowIdSelected || undefined}
            currentCustomer={tableRowSelected || undefined}
        />
    );

    const renderDetails = () => (
        <CustomerDetails
            open={openDetailsForm.value}
            selectedCustomer={tableRowSelected || undefined}
            onClose={openDetailsForm.onFalse}
        />
    );

    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa khách hàng"
            content={
                <>
                    Bạn có chắc chắn muốn xóa khách hàng này?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRow(rowIdSelected);
                        confirmDelRowDialog.onFalse();
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    const renderBin = () => (
        <CustomerBin
            open={openBin.value}
            onClose={openBin.onFalse}
            listMutation={mutation}
        />
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['KHACHHANG.VIEW']}
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
                        { name: 'Khách hàng' },
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
                            Tạo khách hàng
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={dataFiltered}
                    loading={customersLoading}
                    columns={
                        CUSTOMER_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            setTableRowSelected,
                            setRowIdSelected,
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
                            <CustomerFilter
                                allRecord={allRecord}
                                filterState={isBusiness}
                                onChangeState={setIsBusiness}
                                isPartner={isPartner}
                                onCheck={setIsPartner}
                                businessRecord={businessRecord}
                                unBusinessRecord={unBusinessRecord}
                                partnerRecord={partnerRecord}
                                retailRecord={retailRecord}
                            />
                        </Box>
                    }
                />
                {renderCRUDForm()}
                {renderConfirmDeleteRow()}
                {renderDetails()}
                {renderBin()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}