import { Button } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { ConfirmDialog } from "src/components/custom-dialog";
import { Iconify } from "src/components/iconify";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { ICategoryItem } from "src/types/category";
import { useGetCategories } from "src/actions/category";
import { CategoryNewEditForm } from "../category-new-edit-form";
import { CategoryDetails } from "../category-details";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { CATEGORY_COLUMNS } from "src/const/category";
import { deleteOne } from "src/actions/delete";
import { endpoints } from "src/lib/axios";
import { CONFIG } from "src/global-config";
import { CategoryBin } from "../category-bin";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { PRODUCT_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
// ----------------------------------------------------------------------

export function CategoryListView() {
    const location = useLocation();

    const confirmDialog = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const openBin = useBoolean();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');

    const { permission } = useCheckPermission(['NHOMSANPHAM.VIEW']);

    const { categories, categoriesLoading, pagination, mutation } = useGetCategories({
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

    const [tableData, setTableData] = useState<ICategoryItem[]>(categories);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<ICategoryItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(categories);
    }, [categories]);

    const dataFiltered = tableData;

    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.category.delete(id),
            listEndpoint: '/api/v1/product-categories/categories',
        });
        if (success) {
            toast.success("Xóa thành công nhóm sản phẩm!");
            // const deleteRow = tableData.filter((row) => row.id !== id);
            // setTableData(deleteRow);
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

        toast.success('Xóa thành công các nhóm sản phẩm!');

        setTableData(deleteRows);
    }, [selectedRowIds, tableData]);

    const renderCRUDForm = () => (
        <CategoryNewEditForm
            open={openCrudForm.value}
            onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            currentCategory={tableRowSelected || undefined}
        />
    );

    const renderDetails = () => (
        <CategoryDetails
            open={openDetailsForm.value}
            categoryItem={tableRowSelected ?? ({} as ICategoryItem)}
            onClose={openDetailsForm.onFalse}
        />
    );

    const renderConfirmDeleteRows = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Xác nhận xóa hàng loạt nhóm sản phẩm"
            content={
                <>
                    Bạn có chắc chắn muốn xóa <strong> {selectedRowIds.length} </strong> nhóm sản phẩm?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRows();
                        confirmDialog.onFalse();
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={confirmDelRowDialog.onFalse}
            title="Xác nhận xóa nhóm sản phẩm"
            content={
                <>
                    Bạn có chắc chắn muốn xóa nhóm sản phẩm này?
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
        <CategoryBin
            open={openBin.value}
            onClose={openBin.onFalse}
            listMutation={mutation}
        />
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['NHOMSANPHAM.VIEW']}
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
                        { name: 'Quản lý danh mục', href: paths.dashboard.product.root },
                        { name: 'Nhóm sản phẩm' },
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
                            Tạo nhóm sản phẩm
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={dataFiltered}
                    loading={categoriesLoading}
                    columns={CATEGORY_COLUMNS({ openDetailsForm, openCrudForm, confirmDelRowDialog, setTableRowSelected, setRowIdSelected, page, rowsPerPage })}
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
            </DashboardContent>

            {renderConfirmDeleteRows()}
            {renderCRUDForm()}
            {renderConfirmDeleteRow()}
            {renderDetails()}
            {renderBin()}
        </RoleBasedGuard>
    );
}