import { Font, PDFViewer, StyleSheet } from "@react-pdf/renderer";
import { RenderReceipt } from "./components/renderReceiptTicket";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useSearchParams } from "react-router";
import { generatePdfBlob } from "src/utils/generateblob-func";
import { downloadPdf, printPdf } from "src/utils/random-func";
import { useEffect } from "react";
import { Iconify } from "src/components/iconify";
import { useGetCompanyInfo } from "src/actions/companyInfo";

export function ContractReceiptPdf() {
    const [searchParams] = useSearchParams();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
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

    const { companyInfoData } = useGetCompanyInfo();

    const receiptBody = {
        companyName: searchParams.get("companyName") || "",
        customerName: searchParams.get("customerName") || "",
        date: searchParams.get("date") || `ngày ${dd} tháng ${mm} năm ${yyyy}`,
        receiptNoToWatch: searchParams.get("receiptNoToWatch") || "",
        amount: Number(searchParams.get("amount")) || 0,
        payer: searchParams.get("payer") || "",
        contractNo: searchParams.get("contractNo") || "",
        address: searchParams.get("address") || "",
        reason: searchParams.get("reason") || "",
        createdBy: searchParams.get("createdBy") || ""
    };

    useEffect(() => {
        const isEmpty =
            !receiptBody.receiptNoToWatch ||
            !receiptBody.contractNo ||
            !receiptBody.date;

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
    }, [receiptBody]);

    const handleDownload = async () => {
        const blob = await generatePdfBlob(
            <RenderReceipt
                data={{
                    date: receiptBody.date,
                    contractNo: receiptBody.contractNo,
                    receiptNo: receiptBody.receiptNoToWatch,
                    payerName: receiptBody.payer,
                    address: receiptBody.address,
                    reason: receiptBody.reason,
                    amount: receiptBody.amount,
                    attachment: "",
                    createdBy: receiptBody.createdBy
                }}
                companyInfoData={companyInfoData}
            />
        );

        await downloadPdf(blob, `${receiptBody.receiptNoToWatch}.pdf`);
    };

    const handlePrint = async () => {
        const blob = await generatePdfBlob(
            <RenderReceipt
                data={{
                    date: receiptBody.date,
                    contractNo: receiptBody.contractNo,
                    receiptNo: receiptBody.receiptNoToWatch,
                    payerName: receiptBody.payer,
                    address: receiptBody.address,
                    reason: receiptBody.reason,
                    amount: receiptBody.amount,
                    attachment: "",
                    createdBy: receiptBody.createdBy
                }}
                companyInfoData={companyInfoData}
            />
        );

        await printPdf(blob);
    };

    return (
        <Box height="100vh" overflow="hidden" pb={8}>
            <Stack direction="row" spacing={1} padding={2} bgcolor="rgb(60,60,60)" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" sx={{ color: '#fff' }} fontWeight={700}>{receiptBody.receiptNoToWatch}</Typography>
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
                <RenderReceipt
                    data={{
                        date: receiptBody.date,
                        contractNo: receiptBody.contractNo,
                        receiptNo: receiptBody.receiptNoToWatch,
                        payerName: receiptBody.payer,
                        address: receiptBody.address,
                        reason: receiptBody.reason,
                        amount: receiptBody.amount,
                        attachment: "",
                        createdBy: receiptBody.createdBy
                    }}
                    companyInfoData={companyInfoData}
                />
            </PDFViewer>
        </Box>
    )
}
