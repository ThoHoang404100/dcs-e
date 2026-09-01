import type { ProductItem, ProductTableFilters } from 'src/types/product';
import type {
  GridRowSelectionModel,
} from '@mui/x-data-grid';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import { Button, Box } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useGetProducts } from 'src/actions/product';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from '../product-new-edit-form';
import { UseGridTableList } from 'src/components/data-grid-table/data-grid-table';
import { PRODUCT_COLUMNS } from 'src/const/product';
import { ProductDetails } from '../product-details';
import { deleteOne } from 'src/actions/delete';
import { endpoints } from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import { ProductBin } from '../product-bin';
import { RoleBasedGuard } from 'src/auth/guard';
import { useCheckPermission } from 'src/auth/hooks/use-check-permission';
import ServiceNavTabs from 'src/components/tabs/service-nav-tabs';
import { PRODUCT_TAB_DATA } from 'src/components/tabs/components/service-nav-tabs-data';
import { useLocation } from 'react-router';
import { ProductFilterAddition } from '../product-filter-addition';

// ----------------------------------------------------------------------

export function ProductListView() {
  const location = useLocation();

  const openCrudForm = useBoolean();
  const openDetailsForm = useBoolean();
  const openBin = useBoolean();
  const confirmDialog = useBoolean();
  const confirmDelRowDialog = useBoolean();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
  const [searchText, setSearchText] = useState('');
  const [filterState, setFilterState] = useState('all');

  const { products, pagination, productsLoading, productsEmpty, mutation } = useGetProducts({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    StockFilter: filterState !== 'all' ? filterState : '',
    key: searchText,
  });

  const { pagination: filterCounter } = useGetProducts({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
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

  const [tableData, setTableData] = useState<ProductItem[]>(products);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [rowIdSelected, setRowIdSelected] = useState('');
  const { permission } = useCheckPermission(['SANPHAM.VIEW']);

  const filters = useSetState<ProductTableFilters>({ Search: '', Filter: '' });
  const { state: currentFilters } = filters;

  useEffect(() => {
    setTableData(products);
  }, [products]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters: currentFilters,
  });

  const handleDeleteRow = async (id: number) => {
    const success = await deleteOne({
      apiEndpoint: endpoints.product.delete(id),
      listEndpoint: '/api/v1/products',
    });
    if (success) {
      toast.success('Xóa thành công 1 sản phẩm!');
    } else {
      toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
    }
  }

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    toast.success(`Xóa thành công ${deleteRows.length} sản phẩm!`);

    setTableData(deleteRows);
  }, [selectedRowIds, tableData]);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Xác nhận xóa hàng loạt sản phẩm"
      content={
        <>
          Bạn có chắc chắn muốn xóa <strong> {selectedRowIds.length} </strong> sản phẩm?
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
      title="Xác nhận xóa sản phẩm"
      content={
        <>
          Bạn có chắc chắn muốn xóa sản phẩm này?
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
    <ProductNewEditForm
      open={openCrudForm.value}
      onClose={() => { openCrudForm.onFalse(); setRowIdSelected('') }}
      selectedId={rowIdSelected || undefined}
    />
  );

  const renderDetails = () => (
    <ProductDetails
      open={openDetailsForm.value}
      selectedId={rowIdSelected}
      onClose={openDetailsForm.onFalse}
    />
  );

  const renderBin = () => (
    <ProductBin
      open={openBin.value}
      onClose={openBin.onFalse}
      listMutation={mutation}
    />
  );

  return (
    <RoleBasedGuard
      hasContent
      currentRole={permission?.name || ''}
      allowedRoles={['SANPHAM.VIEW']}
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
            { name: 'Sản phẩm' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                openCrudForm.onTrue();
                setRowIdSelected('');
              }}
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
            >
              Tạo sản phẩm
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <UseGridTableList
          dataFiltered={dataFiltered}
          loading={productsLoading}
          columns={
            PRODUCT_COLUMNS({
              openDetailsForm,
              openCrudForm,
              confirmDelRowDialog,
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
                <ServiceNavTabs tabs={PRODUCT_TAB_DATA} activePath={location.pathname} />
                <ProductFilterAddition filterProps={filterCounter} onChangeState={setFilterState} />
            </Box>
          }
        />
      </DashboardContent>

      {renderConfirmDialog()}
      {renderConfirmDeleteRow()}
      {renderCRUDForm()}
      {renderDetails()}
      {renderBin()}
    </RoleBasedGuard>
  );
}

type ApplyFilterProps = {
  inputData: ProductItem[];
  filters: ProductTableFilters;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
  const { Search, Filter } = filters;

  if (Search) {
    inputData = inputData.filter((product) =>
      product.name.toLowerCase().includes(Search.toLowerCase())
    );
  }

  if (Filter) {
    inputData = inputData.filter((product) => Filter.includes(product.code));
  }

  return inputData;
}