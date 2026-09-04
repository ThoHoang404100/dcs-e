import { Box, Button, Stack, Typography } from "@mui/material";
import { Font, PDFViewer } from "@react-pdf/renderer";
import { RenderWarehouseExport } from "./components/renderWarehouseExport";
import { useSearchParams } from "react-router";
import { useGetDetailWarehouseExportProduct, useGetUnExportProduct } from "src/actions/contract";
import { EmptyContent } from "src/components/empty-content";
import { useEffect, useMemo } from "react";
import { IContractRemainingProduct } from "src/types/contract";
import { Iconify } from "src/components/iconify";
import { downloadPdf, printPdf } from "src/utils/random-func";
import { generatePdfBlob } from "src/utils/generateblob-func";
import { useGetCompanyInfo } from "src/actions/companyInfo";

export function ContractWarehousePdf() {
    Font.register({
        family: 'Niramit-Medium',
        fonts: [{ src: '/fonts/Niramit/Niramit-Medium.ttf' }],
    });

    Font.register({
        family: 'Niramit-Bold',
        fonts: [{ src: '/fonts/Niramit/Niramit-Bold.ttf' }],
    });

    Font.register({
        family: 'Niramit-SemiBold',
        fonts: [{ src: '/fonts/Niramit/Niramit-SemiBold.ttf' }],
    });

    Font.register({
        family: 'Niramit-ExtraLight',
        fonts: [{ src: '/fonts/Niramit/Niramit-ExtraLight.ttf' }],
    });

    Font.register({
        family: 'Niramit-Light',
        fonts: [{ src: '/fonts/Niramit/Niramit-Light.ttf' }],
    });

    Font.register({
        family: 'Niramit-italic',
        fonts: [{ src: '/fonts/Niramit/Niramit-MediumItalic.ttf' }],
    });

    Font.register({
        family: 'Niramit-LightItalic',
        fonts: [{ src: '/fonts/Niramit/Niramit-LightItalic.ttf' }],
    });

    Font.register({
        family: 'Niramit-BoldItalic',
        fonts: [
            {
                src: '/fonts/Niramit/Niramit-BoldItalic.ttf',
            },
        ],
    });

    Font.register({
        family: 'Niramit',
        fonts: [
            {
                src: '/fonts/Niramit/Niramit-Light.ttf',
            },
        ],
    });

    Font.register({
        family: 'Montserrat-bold',
        fonts: [{ src: '/fonts/Montserrat/static/Montserrat-Bold.ttf' }],
    });

    Font.register({
        family: 'Montserrat-Semi',
        fonts: [{ src: '/fonts/Montserrat/static/Montserrat-Medium.ttf' }],
    });

    Font.register({
        family: 'Montserrat',
        fonts: [
            {
                src: '/fonts/Montserrat/static/Montserrat-Light.ttf',
            },
        ],
    });
    const [searchParams] = useSearchParams();
    const contractBody = Object.fromEntries(searchParams.entries());


    if (!contractBody.contractId) {
        return (<Box height="100vh" overflow="hidden">
            <EmptyContent content="Không có dữ liệu để tạo phiếu xuất kho" />
        </Box>);
    }

    const contractId = Number(contractBody.contractId);
    const exportId = Number(contractBody.exportId);
    const isCreating = contractBody.isCreating === "true";

    const hookParams = useMemo(() => ({
        contractId,
        exportId: exportId || 0,
        isCreating
    }), [contractId, exportId, isCreating]);

    const { companyInfoData } = useGetCompanyInfo();

    const { remainingProduct, remainingProductEmpty } = useGetUnExportProduct(
        hookParams.contractId,
        hookParams.isCreating
    );

    const { detailsProduct, detailsProductEmpty } = useGetDetailWarehouseExportProduct(
        hookParams.exportId,
        !hookParams.isCreating
    );

    const mappedProducts = useMemo<IContractRemainingProduct[]>(() => {
        if (contractBody.productsPreviewKey) {
            const productsFromStorage = JSON.parse(
                sessionStorage.getItem(contractBody.productsPreviewKey) || '[]'
            );
            return productsFromStorage;
        }

        if (isCreating) {
            return remainingProduct || [];
        }

        return (detailsProduct || []).map((p) => ({
            productID: p.productID,
            name: p.productName,
            price: p.price,
            quantity: p.quantity,
            productUnitID: p.unitProductID,
            productUnitName: p.unitProductName,
            total: p.total,
            vat: p.vat,
            warranty: 0,
            exported: 0,
            remaining: p.quantity,
        }));
    }, [contractBody.productsPreviewKey, isCreating, remainingProduct, detailsProduct]);

    useEffect(() => {
        if (contractBody.productsPreviewKey) {
            const timer = setTimeout(() => {
                sessionStorage.removeItem(contractBody.productsPreviewKey);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [contractBody.productsPreviewKey]);

    const isProductEmpty = isCreating ? remainingProductEmpty : detailsProductEmpty;

    if (isProductEmpty) {
        return (
            <Box height="100vh" overflow="hidden">
                <EmptyContent content="Không có dữ liệu để tạo phiếu xuất kho" />
            </Box>
        );
    }

    useEffect(() => {
        const isEmpty = isProductEmpty;

        if (isEmpty) {
            document.querySelectorAll('iframe[data-print="1"]').forEach((iframe) => {
                iframe.remove();
            });
        }

        return () => {
            document.querySelectorAll('iframe[data-print="1"]').forEach((iframe) => {
                iframe.remove();
            });
        };
    }, [isProductEmpty]);

    const handleDownload = async () => {
        const blob = await generatePdfBlob(
            <RenderWarehouseExport
                contractBody={contractBody}
                productsUnExported={mappedProducts}
                companyInfoData={companyInfoData}
            />
        );

        await downloadPdf(blob, `${contractBody.warehouseExportNo}.pdf`);
    };

    const handlePrint = async () => {
        const blob = await generatePdfBlob(
            <RenderWarehouseExport
                contractBody={contractBody}
                productsUnExported={mappedProducts}
                companyInfoData={companyInfoData}
            />
        );

        await printPdf(blob);
    };

    return (
        <Box height="100vh" overflow="hidden" pb={8}>
            <Stack direction="row" spacing={1} padding={2} bgcolor="rgb(60,60,60)" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" sx={{ color: '#fff' }} fontWeight={700}>{contractBody.warehouseExportNo}</Typography>
                </Box>
                <Box>
                    <Button variant="text" onClick={handleDownload} title="Tải về">
                        <Iconify icon="material-symbols:download" color="#fff" />
                    </Button>
                    <Button variant="text" onClick={handlePrint} title="In">
                        <Iconify icon="material-symbols:print-outline" color="#fff" />
                    </Button>
                </Box>
            </Stack>
            <PDFViewer width="100%" height="100%" style={{ border: "none", overflow: 'hidden' }} showToolbar={false}>
                <RenderWarehouseExport
                    contractBody={contractBody}
                    productsUnExported={mappedProducts}
                    companyInfoData={companyInfoData}
                />
            </PDFViewer>
        </Box>
    );
}
