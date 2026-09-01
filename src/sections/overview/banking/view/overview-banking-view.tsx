
import { DashboardContent } from 'src/layouts/dashboard';
import { _bankingContacts, _bankingCreditCard, _bankingRecentTransitions } from 'src/_mock';

import { Iconify } from 'src/components/iconify/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import { UseGridTableList } from 'src/components/data-grid-table/data-grid-table';
import { ChangeEvent, useEffect, useState } from 'react';
import { IBankAccountItem } from 'src/types/bankAccount';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { useGetBankAccounts } from 'src/actions/bankAccount';
import { useBoolean } from 'minimal-shared/hooks';
import { BANKACCOUNT_COLUMNS } from 'src/const/bankAccount';
import { BankingDetails } from '../banking-details';
import { BankingNewEditForm } from '../banking-new-edit-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { endpoints } from 'src/lib/axios';
import { deleteOne } from 'src/actions/delete';
import { toast } from 'sonner';
import { CONFIG } from 'src/global-config';
import { BankingBin } from '../banking-bin';
import { useCheckPermission } from 'src/auth/hooks/use-check-permission';
import { RoleBasedGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export function OverviewBankingView() {
  const openDetailsForm = useBoolean();
  const openCrudForm = useBoolean();
  const confirmDialog = useBoolean();
  const openBin = useBoolean();
  const confirmDelRowDialog = useBoolean();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
  const [searchText, setSearchText] = useState('');
  const { permission } = useCheckPermission(['TAIKHOAN.VIEW']);

  const { bankAccounts, pagination, bankAccountsLoading, mutation } = useGetBankAccounts({
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

  const [tableData, setTableData] = useState<IBankAccountItem[]>(bankAccounts);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [tableRowSelected, setTableRowSelected] = useState<IBankAccountItem | null>(null);
  const [rowIdSelected, setRowIdSelected] = useState(0);

  useEffect(() => {
    setTableData(bankAccounts);
  }, [bankAccounts]);

  const dataFiltered = tableData;

  const handleDeleteRow = async (id: number) => {
    const success = await deleteOne({
      apiEndpoint: endpoints.bankAccount.delete(id),
      listEndpoint: '/api/v1/bank-accounts/bank-accounts',
    });
    if (success) {
      toast.success('Xóa thành công 1 tài khoản ngân hàng!');
    } else {
      toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
    }
  }

  const renderDetails = () => (
    <BankingDetails
      open={openDetailsForm.value}
      bankAccountItem={tableRowSelected ?? ({} as IBankAccountItem)}
      onClose={openDetailsForm.onFalse}
    />
  );

  const renderCRUDForm = () => (
    <BankingNewEditForm
      open={openCrudForm.value}
      onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
      selectedId={rowIdSelected || undefined}
      currentBankingAccount={tableRowSelected || undefined}
    />
  );

  const renderConfirmDeleteRow = () => (
    <ConfirmDialog
      open={confirmDelRowDialog.value}
      onClose={confirmDelRowDialog.onFalse}
      title="Xác nhận xóa tài khoản ngân hàng"
      content={
        <>
          Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?
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
    <BankingBin
      open={openBin.value}
      onClose={openBin.onFalse}
      listMutation={mutation}
    />
  );


  return (
    <RoleBasedGuard
      hasContent
      currentRole={permission?.name || ''}
      allowedRoles={['TAIKHOAN.VIEW']}
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
          heading="Tài khoản ngân hàng"
          links={[
            { name: 'Quản lý danh mục' },
            { name: 'Tài khoản ngân hàng' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                setTableRowSelected(null),
                  openCrudForm.onTrue();
              }}
              sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
            >
              Tạo tài khoản ngân hàng
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <UseGridTableList
          dataFiltered={dataFiltered}
          loading={bankAccountsLoading}
          columns={
            BANKACCOUNT_COLUMNS({
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
        />
        {renderDetails()}
        {renderCRUDForm()}
        {renderConfirmDeleteRow()}
        {renderBin()}
      </DashboardContent>
    </RoleBasedGuard>
  );
}
