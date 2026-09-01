import { Autocomplete, Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useBoolean } from "minimal-shared/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { changePassword, lockOrunLockAccount, useGetEmployees } from "src/actions/employee";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { UseGridTableList } from "src/components/data-grid-table/data-grid-table";
import { Iconify } from "src/components/iconify";
import { EMPLOYEE_COLUMNS } from "src/const/employee";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { IEmployeeItem } from "src/types/employee";
import { EmployeeNewEditForm } from "../employee-new-edit-form";
import { EmployeeDetails } from "../employee-details";
import { ConfirmDialog } from "src/components/custom-dialog";
import { deleteOne } from "src/actions/delete";
import { toast } from "sonner";
import { endpoints } from "src/lib/axios";
import { CONFIG } from "src/global-config";
import { EmployeeBin } from "../employee-bin";
import { set } from "nprogress";
import { Field, Form } from "src/components/hook-form";
import { z as zod } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { RoleBasedGuard } from "src/auth/guard";
import { useLocation } from "react-router";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { EMPLOYEE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import { useGetDepartments } from "src/actions/department";

export const ChangePassWordAccSchema = zod
    .object({
        newPassword: zod.string().min(1, { message: 'Vui lòng nhập mật khẩu mới!' }),
        confirmNewPassword: zod.string().min(1, { message: 'Vui lòng xác nhận mật khẩu!' }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Xác nhận mật khẩu không khớp với mật khẩu mới, vui lòng nhập lại!',
        path: ['confirmNewPassword'],
    });

export type ChangePassWordAccSchemaType = zod.infer<typeof ChangePassWordAccSchema>;

export function EmployeeListView() {
    const location = useLocation();
    const confirmChangePass = useBoolean();
    const showPassword = useBoolean();

    const defaultValues: ChangePassWordAccSchemaType = {
        newPassword: '',
        confirmNewPassword: '',
    };

    const methods = useForm<ChangePassWordAccSchemaType>({
        mode: 'all',
        resolver: zodResolver(ChangePassWordAccSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const openCrudForm = useBoolean();
    const openDetailsForm = useBoolean();
    const confirmDialog = useBoolean();
    const openBin = useBoolean();
    const confirmUnlockDialog = useBoolean();
    const confirmDelRowDialog = useBoolean();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);
    const [searchText, setSearchText] = useState('');
    const { permission } = useCheckPermission(['NHANVIEN.VIEW']);
    const [selectedDepartment, setSelectedDepartment] = useState("");

    const { employees, pagination, employeesLoading, mutation } = useGetEmployees({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        key: searchText,
        filter: selectedDepartment
    });

    const { departments, departmentsLoading, departmentsEmpty } = useGetDepartments({ pageNumber: 1, pageSize: 20 });

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const [tableData, setTableData] = useState<IEmployeeItem[]>(employees);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [tableRowSelected, setTableRowSelected] = useState<IEmployeeItem | null>(null);
    const [rowIdSelected, setRowIdSelected] = useState(0);

    useEffect(() => {
        setTableData(employees);
    }, [employees]);

    const dataFiltered = tableData;

    const handleDeleteRow = async (id: number) => {
        const success = await deleteOne({
            apiEndpoint: endpoints.employees.delete(id),
            listEndpoint: '/api/v1/employees/employees',
        });
        if (success) {
            toast.success('Xóa thành công 1 nhân viên!');
        } else {
            toast.error("Xóa thất bại, vui lòng kiểm tra lại!");
        }
    }

    const handleUnOrlockAcc = async (id: number) => {
        try {
            await lockOrunLockAccount(id);
            toast.success(`${tableRowSelected?.lock === false ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
            mutation();
        } catch (error) {
            toast.error("Không thể thực hiện, đã có lỗi xảy ra!");
        }
    }

    const handleChangePass = handleSubmit(async (data) => {
        try {
            await changePassword({ id: String(rowIdSelected), newPassword: data.newPassword });
            reset();
            toast.success('Đổi mật khẩu thành công!');
            mutation();
        } catch (error) {
            console.error(error);
            toast.error("Không thể thực hiện, đã có lỗi xảy ra!");
        } finally {
            confirmChangePass.onFalse();
        }
    });

    const renderConfirmDeleteRow = () => (
        <ConfirmDialog
            open={confirmDelRowDialog.value}
            onClose={() => {
                confirmDelRowDialog.onFalse();
                setTableRowSelected(null);
                setRowIdSelected(0);
            }}
            title="Xác nhận xóa sản phẩm"
            content={
                <>
                    Bạn có chắc chắn muốn xóa nhân viên này?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRow(Number(rowIdSelected));
                        confirmDelRowDialog.onFalse();
                        setTableRowSelected(null);
                        setRowIdSelected(0);
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    const renderConfirmUnlockRow = () => (
        <ConfirmDialog
            open={confirmUnlockDialog.value}
            onClose={() => {
                confirmUnlockDialog.onFalse();
                setTableRowSelected(null);
                setRowIdSelected(0);
            }}
            title={`Xác nhận ${tableRowSelected?.lock === false ? 'khóa' : 'mở khóa'} tài khoản?`}
            content={
                <>
                    Bạn có chắc chắn muốn {tableRowSelected?.lock === false ? 'khóa' : 'mở khóa'} tài khoản này?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleUnOrlockAcc(Number(rowIdSelected));
                        confirmUnlockDialog.onFalse();
                        setTableRowSelected(null);
                        setRowIdSelected(0);
                    }}
                >
                    Xác nhận
                </Button>
            }
        />
    );

    const renderChangePass = () => (
        <Dialog open={confirmChangePass.value}
            onClose={() => { confirmChangePass.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            maxWidth="sm"
            fullWidth
        >
            <Form methods={methods} onSubmit={handleChangePass}>
                <DialogTitle>Đổi mật khẩu</DialogTitle>
                <DialogContent>
                    <Stack direction="column" spacing={2} width="100%" my={2}>
                        <Field.Text
                            name="newPassword"
                            label="Mật khẩu mới"
                            type={showPassword.value ? 'text' : 'password'}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={showPassword.onToggle} edge="end">
                                                <Iconify
                                                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Field.Text
                            name="confirmNewPassword"
                            type={showPassword.value ? 'text' : 'password'}
                            label="Xác nhận mật khẩu mới"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={showPassword.onToggle} edge="end">
                                                <Iconify
                                                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => { confirmChangePass.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}>Đóng</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
                        Đổi mật khẩu
                    </Button>
                </DialogActions>
            </Form>
        </Dialog>
    );

    const renderCRUDForm = () => (
        <EmployeeNewEditForm
            open={openCrudForm.value}
            onClose={() => { openCrudForm.onFalse(); setTableRowSelected(null); setRowIdSelected(0); }}
            selectedId={rowIdSelected || undefined}
            currentEmployee={tableRowSelected || undefined}
            refecth={mutation}
        />
    );

    const renderDetails = () => (
        <EmployeeDetails
            open={openDetailsForm.value}
            selectedEmployee={tableRowSelected || undefined}
            onClose={openDetailsForm.onFalse}
        />
    );

    const renderBin = () => (
        <EmployeeBin
            open={openBin.value}
            onClose={openBin.onFalse}
            listMutation={mutation}
        />
    );

    const renderFilter = () => (
        <>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={2}>
                <Autocomplete
                    disablePortal
                    options={departments ?? []}
                    loading={departmentsLoading}
                    noOptionsText={
                        departmentsLoading
                            ? "Đang tải..."
                            : departmentsEmpty
                                ? "Không có phòng ban"
                                : "Không có kết quả"
                    }
                    onChange={(e, value) => {
                        setSelectedDepartment(value?.name || "");
                    }}
                    fullWidth
                    getOptionLabel={(option) => option?.name ?? ""}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={departmentsLoading ? <CircularProgress size={20} /> : "Phòng ban"}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    sx={{
                        flexGrow: 1,
                        minWidth: 200,
                        "&& .MuiTextField-root": {
                            width: "100% !important",
                            p: 0
                        },
                        "& .MuiInputBase-root": {
                            height: 56,
                        },
                        "& .MuiAutocomplete-inputRoot": {
                            padding: "0 !important",
                            height: "100% !important",
                        },
                        "& .MuiOutlinedInput-input": {
                            padding: "8.5px 14px!important",
                        },
                        "& .MuiInputLabel-outlined": {
                            top: "50%",
                            transform: "translate(14px, -50%) scale(1)",
                            pointerEvents: "none",
                        },

                        "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
                            top: 0,
                            transform: "translate(14px, -50%) scale(0.75)",
                        },

                    }}
                />
            </Stack>
        </>
    );

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['NHANVIEN.VIEW']}
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
                        { name: 'Nhân viên' },
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
                            Tạo nhân viên
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UseGridTableList
                    dataFiltered={dataFiltered}
                    loading={employeesLoading}
                    columns={
                        EMPLOYEE_COLUMNS({
                            openDetailsForm,
                            openCrudForm,
                            confirmDelRowDialog,
                            confirmUnlockDialog,
                            confirmChangePass,
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
                    additionDefaultFilter={<ServiceNavTabs tabs={EMPLOYEE_TAB_DATA} activePath={location.pathname} />}
                    additionDefaultFilterSub={renderFilter()}
                />
                {renderCRUDForm()}
                {renderDetails()}
                {renderConfirmDeleteRow()}
                {renderConfirmUnlockRow()}
                {renderChangePass()}
                {renderBin()}
            </DashboardContent>
        </RoleBasedGuard>
    );
}