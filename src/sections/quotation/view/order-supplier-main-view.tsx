import { Button, Box } from "@mui/material";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { Iconify } from "src/components/iconify";
import { DashboardContent } from "src/layouts/dashboard";
import { useState } from "react";
import { IQuotationItem } from "src/types/quotation";
import { CONFIG } from "src/global-config";
import { RoleBasedGuard } from "src/auth/guard";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import { QuotationTableList } from "../QuotationTableList";
import { QuotationForm } from "../supplier/quotation-form";
import { QuotationDetails } from "../supplier/quotation-details";
import { useLocation } from "react-router";
import { SUPPLIER_SERVICE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { FilterValues } from "src/types/filter-values";
import { QuotationFilterBar } from "../supplier/quotation-filter";

export function OrderSupplierMainView() {
    const location = useLocation();
    const [filters, setFilters] = useState<FilterValues>({
        fromDate: "",
        toDate: "",
    });

    const [searchText, setSearchText] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<IQuotationItem | null>(null);
    const [copiedQuotation, setCopiedQuotation] = useState<IQuotationItem | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(CONFIG.pageSizesGlobal);

    const { permission } = useCheckPermission(['BAOGIA.VIEW']);

    const handleViewDetails = (quotation: IQuotationItem) => {
        setSelectedQuotation(quotation);
        setOpenDetail(true);
    };

    const handleEditing = (quotation: IQuotationItem) => {
        setSelectedQuotation(quotation);
        setCopiedQuotation(null)
        setOpenForm(true);
    }

    const handleCopying = (obj: IQuotationItem) => {
        setCopiedQuotation(obj);
        setSelectedQuotation(null);
        setOpenForm(true);
    }

    return (
        <RoleBasedGuard
            hasContent
            currentRole={permission?.name || ''}
            allowedRoles={['BAOGIA.VIEW']}
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
                    heading="Nghiệp vụ nhà cung cấp"
                    links={[
                        { name: 'Nghiệp vụ nhà cung cấp' },
                        { name: 'Đặt hàng' },
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => {
                                setSelectedQuotation(null);
                                setCopiedQuotation(null)
                                setOpenForm(true)
                            }}
                            sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
                        >
                            Tạo phiếu đặt hàng
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
                    <ServiceNavTabs tabs={SUPPLIER_SERVICE_TAB_DATA} activePath={location.pathname} />

                    <QuotationFilterBar
                        onFilterChange={setFilters}
                        onSearching={setSearchText}
                        onReset={() =>
                            setFilters({
                                fromDate: "",
                                toDate: "",
                            })
                        }
                    />
                </Box>

                <QuotationTableList
                    onViewDetails={handleViewDetails}
                    onEditing={handleEditing}
                    page={page}
                    setPage={setPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    filters={filters}
                    searchText={searchText}
                    type="Order"
                />

                <QuotationForm
                    selectedQuotation={selectedQuotation}
                    openForm={openForm}
                    onClose={() => {
                        setOpenForm(false);
                        setSelectedQuotation(null);
                        setCopiedQuotation(null);
                    }}
                    CopiedQuotation={copiedQuotation}
                />
                {selectedQuotation && (
                    <QuotationDetails
                        selectedQuotation={selectedQuotation}
                        openDetail={openDetail}
                        openForm={handleCopying}
                        onClose={() => setOpenDetail(false)}
                    />
                )}
            </DashboardContent>
        </RoleBasedGuard>
    );
}
