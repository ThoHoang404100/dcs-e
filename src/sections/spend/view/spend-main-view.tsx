import { Button, Box } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetReceiptContract } from "src/actions/contract";
import { deleteOne } from "src/actions/delete";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { ConfirmDialog } from "src/components/custom-dialog";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { CONFIG } from "src/global-config";
import { DashboardContent } from "src/layouts/dashboard";
import { endpoints } from "src/lib/axios";
import { IReceiptContract } from "src/types/contract";
import { SpendNewEditForm } from "../spend-new-edit-form";
import { SPEND_COLUMNS } from "src/const/spend";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { CUSTOMER_SERVICE_TAB_DATA, SUPPLIER_SERVICE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import { SpendFilterBar } from "../components/spend-filter";
import { FilterValues } from "src/types/filter-values";
import { formatDate } from "src/utils/format-time-vi";
import { Iconify } from "src/components/iconify";
import { paths } from "src/routes/paths";

export function SpendMainView({ contractType }: { contractType: string }) {
    const location = useLocation();
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDelRowDialog = useBoolean();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { permission } = useCheckPermission(['PHIEUCHI.VIEW']);
    const [filters, setFilters] = useState<FilterValues>({
        fromDate: formatDate(lastMonth),
        toDate: formatDate(today),
    });

    const {
        contractReceipt,
        contractReceiptItem,
        contractReceiptLoading,
        pagination,
        mutation
    } = useGetReceiptContract({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText.trim(),
        enabled: true,
        ContractType: contractType,
        ReceiptType: 'spend',
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

    const [tableData, setTableData] = useState<IReceiptContract[]>(contractReceiptItem);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<IReceiptContract | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(contractReceiptItem);
    }, [contractReceiptItem]);

    useEffect(() => {
        mutation();
    }, [location.pathname]);

    const handleDeleteRow = async () => {
        const success = await deleteOne({
            apiEndpoint: endpoints.contractReceipt.delete,
            listEndpoint: '/api/v1/contract-receipts/get-receipts',
            bodyEndpoint: {
                receiptId: rowIdSelected,
                contractNo: tableRowSelected?.contractNo
            }
        });
        if (success) {
            toast.success('Xóa thành công 1 phiếu chi!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const onPreviewReceipt = (params: URLSearchParams) => {
        const queryString = params.toString();
        window.open(`${paths.spend}?${queryString}`, '_blank');
    }

    const titleBreadcrumb = contractType === 'Customer' ? 'Nghiệp vụ khách hàng' : 'Nghiệp vụ nhà cung cấp';

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
                    heading={titleBreadcrumb}
                    links={[
                        { name: titleBreadcrumb },
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
                    <ServiceNavTabs
                        tabs={
                            contractType === 'Customer' ?
                                CUSTOMER_SERVICE_TAB_DATA :
                                SUPPLIER_SERVICE_TAB_DATA}
                        activePath={location.pathname}
                    />
                    <SpendFilterBar
                        onFilterChange={handleFilterChange}
                        onSearching={setSearchText}
                        onReset={handleReset}
                        contractType={contractType}
                    />
                </Box>

                <UseGridTableList
                    dataFiltered={tableData}
                    loading={contractReceiptLoading}
                    columns={
                        SPEND_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            onPreviewReceipt,
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
                    disableDefaultFilter
                />
                <SpendNewEditForm
                    open={openCrudForm.value}
                    onClose={openCrudForm.onFalse}
                    selectedReceipt={tableRowSelected}
                    contractType={contractType}
                    mutation={mutation}
                    onPreviewReceipt={onPreviewReceipt}
                />
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
            </DashboardContent>
        </RoleBasedGuard>
    );
}