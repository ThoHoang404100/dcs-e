import { Document, Page, Text, View } from "@react-pdf/renderer";
import { useStylesReport as styles } from "./useStyleReport";
import { renderHeader } from "./renderHeader";
import { Fragment } from "react/jsx-runtime";
import { IDateValue } from "src/types/common";
import { IContractData } from "src/types/contract";
import { fCurrency, fCurrencyNoUnit, fRenderTextNumberNoUnit } from "src/utils/format-number";
import { capitalizeFirstLetter, capitalizeWords, formatPhoneNumber } from "src/utils/format-string";
import { fDate } from "src/utils/format-time-vi";
import { ICompanyInfoItem } from "src/types/companyInfo";

type RenderProps = {
    contractNo?: string;
    customerName?: string;
    companyName?: string;
    position?: string;
    keptNo?: number;
    copiesNo?: number;
    downPayment?: number;
    nextPayment?: number;
    lastPayment?: number;
    signatureDate?: IDateValue;
    total?: number;
    customerPhone?: string;
    customerAddress?: string;
    deliveryAddress?: string;
    customerTaxCode?: string;
    customerBank?: string;
    customerBankNo?: string;
    renderReportNo?: string;
    currentContract?: IContractData;
    paid?: number;
    debt?: number;
    companyInfoData: ICompanyInfoItem | null;
};

export const RenderLiquidation = ({
    contractNo,
    customerName,
    companyName,
    position,
    keptNo,
    copiesNo,
    downPayment,
    nextPayment,
    lastPayment,
    signatureDate,
    total,
    customerPhone,
    customerAddress,
    deliveryAddress,
    customerTaxCode,
    customerBank,
    customerBankNo,
    currentContract,
    renderReportNo,
    paid,
    debt,
    companyInfoData
}: RenderProps) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const lawTexts = [
        `Căn cứ vào hợp đồng số: ${contractNo} giữa ${companyName} và ${companyInfoData?.name}.`,
        `Căn cứ vào Biên bản nghiệm thu số: ${renderReportNo} giữa ${companyName} và ${companyInfoData?.name}.`,
        `Hôm nay, ngày ${fDate(signatureDate)}, hai bên gồm:`,
    ];
    const SideLeft = [
        "- Địa chỉ:",
        "- Điện thoại:",
        "- Đại diện:",
        "- Mã số thuế:",
        "- Tài khoản số:"
    ];

    const companyAddress = companyInfoData?.address || "Số 1/50/5/16, Thanh Đa, P. Bình Quới, TP. Hồ Chí Minh";

    const companyTaxcode = companyInfoData?.taxCode || "0318436084";

    const ASideRight = [
        customerAddress,
        formatPhoneNumber(customerPhone || ''),
        customerName,
        customerTaxCode,
        `${customerBankNo} tại Ngân hàng ${customerBank}`
    ];

    const BSideRight = [
        companyAddress,
        "0932 090207",
        "Nguyễn Chí Nhân Nghĩa",
        companyTaxcode,
        "8100868, tại Ngân Hàng ACB - Phòng GD Thảo Điền - TP.HCM"
    ];

    const sideA = [
        companyName ? companyName : customerName,
        position || 'GIÁM ĐỐC',
        customerName
    ];

    const sideB = [
        `${companyInfoData?.name || "CÔNG TY TNHH GIẢI PHÁP DCS"}`,
        'GIÁM ĐỐC',
        'Nguyễn Chí Nhân Nghĩa'
    ];


    let displayIndex = 0;
    const text = sideA[2] ?? '';
    return (
        <Document title={renderReportNo}>
            <Page size="A4" style={styles.page}>
                {renderHeader({ companyInfoData })}
                <View style={styles.body}>
                    {/* tiêu đề .... */}
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Niramit-SemiBold', fontSize: 14 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
                        </View>

                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Niramit-SemiBold', fontSize: 14 }}>
                                Độc lập – Tự do – Hạnh phúc
                            </Text>
                            <View
                                style={{
                                    marginTop: 2,
                                    height: 1,
                                    width: '33%',
                                    backgroundColor: '#000',
                                    alignSelf: 'center',
                                }}
                            />
                        </View>

                        <View style={{ marginTop: 15, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 16 }}>
                                BIÊN BẢN THANH LÝ HỢP ĐỒNG
                            </Text>
                        </View>
                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13 }}>
                                Số: {renderReportNo}
                            </Text>
                        </View>
                    </View>
                    {/* Căn cứ ..... */}
                    <View style={{
                        paddingLeft: 69,
                        paddingRight: 50,
                        marginTop: 15,
                    }}>
                        {lawTexts.map((item, index) => {
                            const parts = item.split(new RegExp(`(${companyName}|CÔNG TY TNHH GIẢI PHÁP DCS)`, "g"));

                            return (
                                <Text
                                    key={index}
                                    style={{
                                        fontSize: 13,
                                        fontFamily: "Niramit",
                                        marginBottom: 4,
                                        textAlign: 'justify',
                                    }}
                                >
                                    {parts.map((part, i) => (
                                        <Fragment key={i}>
                                            {part === companyName || part === "CÔNG TY TNHH GIẢI PHÁP DCS" ? (
                                                <Text style={{ fontFamily: "Niramit-Bold" }}>{part}</Text>
                                            ) : (
                                                <Text
                                                    style={{
                                                        textIndent: 20
                                                    }}
                                                >{part}</Text>
                                            )}
                                        </Fragment>
                                    ))}
                                </Text>
                            );
                        })}

                    </View>
                    {/* Bên a Bên B */}
                    <View
                        style={{
                            paddingLeft: 69,
                            paddingRight: 50,
                            marginTop: 5,
                            marginBottom: 10
                        }}
                    >
                        {/* Bên A */}
                        <View style={{ display: 'flex', flexDirection: 'column' }}>
                            <View
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    marginBottom: 4,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontFamily: 'Niramit-Bold',
                                    }}
                                >
                                    Bên A (Bên mua):
                                </Text>

                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontFamily: 'Niramit-Bold',
                                        marginLeft: 8,
                                    }}
                                >
                                    {companyName}
                                </Text>
                            </View>

                            {SideLeft.map((label, index) => {
                                const value = ASideRight[index];

                                if (label.includes('Đại diện')) {
                                    return (
                                        <View
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                marginBottom: 4,
                                            }}
                                        >
                                            <View style={{ width: 120 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 13,
                                                        fontFamily: 'Niramit',
                                                        textIndent: 20,
                                                    }}
                                                >
                                                    {label}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 13,
                                                        fontFamily: 'Niramit-Bold',
                                                    }}
                                                >
                                                    {value}
                                                </Text>
                                            </View>

                                            <View
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    marginLeft: 20,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Text style={{ fontSize: 13, fontFamily: 'Niramit' }}>Chức vụ:</Text>
                                                <Text
                                                    style={{
                                                        marginLeft: 8,
                                                        fontSize: 13,
                                                        fontFamily: 'Niramit-Bold',
                                                    }}
                                                >
                                                    {position}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            marginBottom: 4,
                                        }}
                                    >
                                        <View style={{ width: 120 }}>
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontFamily: 'Niramit',
                                                    textIndent: 20,
                                                }}
                                            >
                                                {label}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontFamily: 'Niramit',
                                                }}
                                            >
                                                {value}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Bên B */}
                        <View
                            style={{
                                marginTop: 10,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <View
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    marginBottom: 4,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontFamily: 'Niramit-Bold',
                                    }}
                                >
                                    Bên B (Bên bán):
                                </Text>

                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontFamily: 'Niramit-Bold',
                                        marginLeft: 8,
                                    }}
                                >
                                    {companyInfoData?.name}
                                </Text>
                            </View>

                            {SideLeft.map((label, index) => {
                                const value = BSideRight[index];

                                if (label.includes('Đại diện')) {
                                    return (
                                        <View
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'flex-start',
                                                marginBottom: 4,
                                            }}
                                        >
                                            <View style={{ width: 120 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 13,
                                                        fontFamily: 'Niramit',
                                                        textIndent: 20,
                                                    }}
                                                >
                                                    {label}
                                                </Text>
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <View
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        gap: 3,
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 13, fontFamily: 'Niramit' }}>Ông</Text>
                                                    <Text
                                                        style={{
                                                            fontSize: 13,
                                                            fontFamily: 'Niramit-Bold',
                                                        }}
                                                    >
                                                        {value}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    marginLeft: 20,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Text style={{ fontSize: 13, fontFamily: 'Niramit' }}>Chức vụ:</Text>
                                                <Text
                                                    style={{
                                                        marginLeft: 8,
                                                        fontSize: 13,
                                                        fontFamily: 'Niramit-Bold',
                                                    }}
                                                >
                                                    Giám đốc
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            marginBottom: 4,
                                        }}
                                    >
                                        <View style={{ width: 120 }}>
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontFamily: 'Niramit',
                                                    textIndent: 20,
                                                }}
                                            >
                                                {label}
                                            </Text>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontFamily: 'Niramit',
                                                }}
                                            >
                                                {value}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <View style={{
                            marginTop: 5
                        }}>
                            <Text
                                style={{
                                    fontFamily: 'Niramit-Medium',
                                    fontSize: 13,
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >
                                {`Hai bên cùng thống nhất thanh lý hợp đồng với các nội dung sau:`}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            paddingLeft: 69,
                            paddingRight: 50,
                            marginTop: 5,
                            marginBottom: 10
                        }}
                    >
                        <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13 }}>1. Thực hiện hợp đồng và chất lượng dịch vụ:</Text>
                        <View style={{ marginVertical: 5, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >
                                Bên B đã hoàn thành Hợp đồng số{' '}{contractNo}
                                {' '}giữa{' '}
                                <Text style={{ fontFamily: 'Niramit-Bold' }}>{companyName}</Text>
                                {' '}và{' '}
                                <Text style={{ fontFamily: 'Niramit-Bold' }}>CÔNG TY TNHH GIẢI PHÁP DCS</Text>
                            </Text>

                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >
                                Chất lượng dịch vụ: Các thông số, cấu hình đáp ứng như yêu cầu và vận hành tốt đúng theo hợp đồng số{' '}
                                {contractNo}
                                {' '}ký ngày {fDate(signatureDate)}
                            </Text>
                        </View>
                        <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13 }}>2. Giá trị thanh toán:</Text>
                        <View style={{ marginTop: 5, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >{`- Tổng giá trị hợp đồng: ${fCurrencyNoUnit(total || 0)} đồng (Bằng chữ: ${capitalizeFirstLetter(fRenderTextNumberNoUnit(total || 0))}).`}</Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >{`- Giá trị đã thanh toán: ${fCurrencyNoUnit(paid || 0)} đồng.`}</Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >{`- Giá trị công nợ còn lại (nếu có): ${fCurrencyNoUnit(debt || 0)} đồng (Bằng chữ: ${capitalizeFirstLetter(fRenderTextNumberNoUnit(debt || 0))}).`}</Text>
                        </View>
                        <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13 }}>KẾT LUẬN</Text>
                        <View style={{ marginVertical: 15, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >
                                Hai bên thống nhất hợp đồng số{' '}
                                <Text style={{ fontFamily: 'Niramit-Bold' }}>{renderReportNo}</Text>
                                {' '}ký ngày {fDate(signatureDate)}
                                {' '}giữa{' '}
                                <Text style={{ fontFamily: 'Niramit-Bold' }}>{companyName}</Text>
                                {' '}và{' '}
                                <Text style={{ fontFamily: 'Niramit-Bold' }}>CÔNG TY TNHH GIẢI PHÁP DCS, </Text>
                                Hợp đồng chính thức được thanh lý sau khi bên A thanh toán toàn bộ giá trị hợp đồng cho bên B.
                            </Text>

                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: 'Niramit',
                                    textIndent: 20,
                                    textAlign: 'justify'
                                }}
                            >
                                Biên bản có hai trang lập thành 02 bộ có giá trị pháp lý như nhau, bên A giữ 01 bộ, bên B giữ 01 bộ./.
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            marginTop: 10,
                            paddingLeft: 69,
                            paddingRight: 50,
                        }}
                        wrap={false}
                    >
                        {/* Row 1: Titles */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ width: '48%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13, textTransform: 'uppercase' }}>
                                    ĐẠI DIỆN BÊN A
                                </Text>
                            </View>
                            <View style={{ width: '48%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13, textTransform: 'uppercase' }}>
                                    ĐẠI DIỆN BÊN B
                                </Text>
                            </View>
                        </View>

                        {/* Row 2: Positions */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
                            <View style={{ width: '48%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Niramit-SemiBold', fontSize: 13, textAlign: 'center', textTransform: 'uppercase' }}>
                                    {sideA[1]}
                                </Text>
                            </View>
                            <View style={{ width: '48%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Niramit-SemiBold', fontSize: 13, textAlign: 'center' }}>
                                    {sideB[1]}
                                </Text>
                            </View>
                        </View>

                        {/* Row 3: Names */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 60 }}>
                            <View style={{ width: '48%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Niramit', fontSize: 13, textAlign: 'center', textTransform: 'capitalize' }}>
                                    {capitalizeWords(text ?? '')}
                                </Text>
                            </View>
                            <View style={{ width: '48%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Niramit', fontSize: 13, textAlign: 'center' }}>
                                    {sideB[2]}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.container, styles.footer]} fixed>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'column', width: '100%', alignItems: 'flex-end' }}>
                            <View style={{ marginTop: 5, paddingLeft: 70, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{
                                    fontFamily: 'Niramit',
                                    fontSize: 8
                                }}
                                >
                                    {`W.  ${companyInfoData?.link}   |   E.  ${companyInfoData?.email}`}
                                </Text>
                                <View style={{ width: 1, height: '100%', backgroundColor: '#ddd', marginLeft: 4, marginRight: 4 }} />
                                <Text
                                    style={[styles.textNiramit, { fontSize: 11 }]}
                                    render={({ pageNumber, totalPages }) =>
                                        `Trang ${pageNumber}/${totalPages}`
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
};