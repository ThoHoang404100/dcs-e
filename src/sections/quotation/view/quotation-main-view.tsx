import { Button, Tab, Tabs } from "@mui/material";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { Iconify } from "src/components/iconify";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { useState } from "react";
import { QuotationCardList } from "../quotation-card-list";
import { QuotationTableList } from "../QuotationTableList";
import { QuotationForm } from "../quotation-form";
import { QuotationDetails } from "../quotation-details";
import { IQuotationItem } from "src/types/quotation";
import { CONFIG } from "src/global-config";
import { RoleBasedGuard } from "src/auth/guard";
import { useCheckPermission } from "src/auth/hooks/use-check-permission";
import ServiceNavTabs from "src/components/tabs/service-nav-tabs";
import { useLocation } from "react-router";
import { CUSTOMER_SERVICE_TAB_DATA } from "src/components/tabs/components/service-nav-tabs-data";

export function QuotationMainView() {
    const location = useLocation();

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
            <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <CustomBreadcrumbs
                    heading="Nghiệp vụ khách hàng"
                    links={[
                        { name: 'Nghiệp vụ khách hàng' },
                        { name: 'Báo giá' },
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
                            Tạo báo giá
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <ServiceNavTabs tabs={CUSTOMER_SERVICE_TAB_DATA} activePath={location.pathname} />
                {/* <QuotationCardList
                    onViewDetails={handleViewDetails}
                    onEditing={handleEditing}
                    page={page}
                    setPage={setPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    location={location}
                /> */}

                <QuotationTableList
                    onViewDetails={handleViewDetails}
                    onEditing={handleEditing}
                    page={page}
                    setPage={setPage}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
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