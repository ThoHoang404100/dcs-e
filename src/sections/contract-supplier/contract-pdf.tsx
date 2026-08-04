import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { Page, Document, Font, View, PDFViewer } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";
import { renderTitle } from "./components/renderTitle";
import { renderHeader } from "./components/renderHeader";
import { renderLaw } from "./components/renderLaw";
import { renderTwoSides } from "./components/renderTwoSides";
import { renderRuleOne } from "./components/renderRuleOne";
import { renderFooter } from "./components/renderFooter";
import { useStyles } from "./components/useStyle";
import { renderRules } from "./components/renderRuleSix";
import { IContractSupplyForDetail, IContractSupplyItem, ResponseContractSupplier } from "src/types/contractSupplier";
import { generatePdfBlob } from "src/utils/generateblob-func";
import { downloadPdf, printPdf } from "src/utils/random-func";
import { Iconify } from "src/components/iconify";
import { ICompanyInfoItem } from "src/types/companyInfo";

type ContractPDFProps = {
    contract: IContractSupplyItem;
    currentStatus: string;
    currentContract?: ResponseContractSupplier<IContractSupplyForDetail>;
    openDetail: boolean;
    companyInfoData: ICompanyInfoItem | null;
};

export function ContractPDFViewer({ contract, currentStatus, currentContract, openDetail, companyInfoData }: ContractPDFProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const memoizedDoc = useMemo(() => (
        <ContractPdfDocument
            contract={contract}
            currentContract={currentContract}
            companyInfoData={companyInfoData}
        />
    ), [contract, currentStatus, currentContract]);

    useEffect(() => {
        if (openDetail) {
            document.querySelectorAll('iframe[data-print="1"]').forEach((iframe) => {
                iframe.remove();
            });
        }

        return () => {
            document.querySelectorAll('iframe[data-print="1"]').forEach((iframe) => {
                iframe.remove();
            });
        };
    }, [openDetail]);

    const handleDownload = async () => {
        const blob = await generatePdfBlob(
            <ContractPdfDocument
                contract={contract}
                currentContract={currentContract}
                companyInfoData={companyInfoData}
            />
        );

        await downloadPdf(blob, `${contract.contractNo}.pdf`);
    };

    const handlePrint = async () => {
        const blob = await generatePdfBlob(
            <ContractPdfDocument
                contract={contract}
                currentContract={currentContract}
                companyInfoData={companyInfoData}
            />
        );

        await printPdf(blob);
    };

    return (
        <Box height="100%" overflow="hidden" pb={8}>
            {loading && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 10,
                    }}
                >
                    <CircularProgress sx={{ color: "#fff" }} />
                    <Typography variant="body1" sx={{ mt: 2, color: "#fff", fontWeight: "bold" }}>
                        Đang tạo bản xem trước...
                    </Typography>
                </Box>
            )}
            <Stack direction="row" spacing={1} padding={2} bgcolor="rgb(60,60,60)" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" sx={{ color: '#fff' }} fontWeight={700}>{contract.contractNo}</Typography>
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
            <PDFViewer width="100%" height="100%" style={{ border: "none" }} showToolbar={false}>
                {memoizedDoc}
            </PDFViewer>
        </Box>
    );
}

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
    family: 'Niramit-italic',
    fonts: [{ src: '/fonts/Niramit/Niramit-MediumItalic.ttf' }],
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

type ContractPdfDocumentProps = {
    contract?: IContractSupplyItem;
    currentContract?: ResponseContractSupplier<IContractSupplyForDetail>;
    companyInfoData: ICompanyInfoItem | null;
};

export function ContractPdfDocument({ contract, currentContract, companyInfoData }: ContractPdfDocumentProps) {
    const styles = useStyles();

    const {
        contractNo,
        supplierName,
        supplierEmail,
        supplierPhone,
        supplierAddress,
        bankAccount,
        bankName,
        taxCode,
        position,
        companyName,
        signatureDate,
        deliveryAddress,
        deliveryTime,
        downPayment,
        nextPayment,
        lastPayment,
        total,
        copiesNo,
        keptNo,
        status,
        createDate,
        createdBy,
        modifyDate,
        modifiedBy,
        note,
        seller,
        discount,
    } = contract ?? {};

    return (
        <Document
            title={`Hợp đồng số ${contractNo}`}
        >
            <Page size="A4" style={styles.page}>
                {renderHeader({ companyInfoData })}
                <View style={styles.body}>
                    {renderTitle(contractNo)}
                    {renderLaw(signatureDate)}
                    {renderTwoSides({
                        customerAddress: supplierAddress,
                        customerBank: bankName,
                        customerBankNo: bankAccount,
                        companyName,
                        position,
                        customerName: supplierName,
                        customerPhone: supplierPhone,
                        customerTaxCode: taxCode,
                        companyInfoData
                    })}
                    {renderRuleOne()}
                    {renderRules({
                        currentContract,
                        discount,
                        keptNo,
                        copiesNo,
                        companyName,
                        customerName: supplierName,
                        position,
                        downPayment,
                        nextPayment,
                        lastPayment,
                        signatureDate,
                        total,
                        deliveryAddress
                    })}
                    {/* {renderSigner({ companyName, customerName, position })} */}
                </View>
                {renderFooter({ companyInfoData })}
            </Page>
        </Document>
    );
}