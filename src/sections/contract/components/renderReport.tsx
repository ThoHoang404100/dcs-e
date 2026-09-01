import { Document, Page, Text, View } from "@react-pdf/renderer";
import { useStylesReport as styles } from "./useStyleReport";
import { renderHeader } from "./renderHeader";
import { RenderRuleName } from "../helper/renderRuleName";
import { Fragment } from "react/jsx-runtime";
import { IDateValue } from "src/types/common";
import { IContractData } from "src/types/contract";
import { fCurrencyNoUnit } from "src/utils/format-number";
import { RenderRuleNameChild } from "../helper/renderRuleNameChild";
import { capitalizeWords, formatPhoneNumber } from "src/utils/format-string";
import { generateReportNo } from "src/utils/random-func";
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
    currentContract?: IContractData;
    renderReportNo: string;
    companyInfoData: ICompanyInfoItem | null;
};

export const RenderReport = ({
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
    companyInfoData
}: RenderProps) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const lawTexts = [
        `Căn cứ vào hợp đồng số: ${contractNo} giữa ${companyName} và CÔNG TY TNHH GIẢI PHÁP DCS.`,
        `Hôm nay, ngày ${fDate(signatureDate)}, hai bên gồm:`,
    ];
    const SideLeft = [
        "- Địa chỉ:",
        "- Điện thoại:",
        "- Đại diện:",
        "- Mã số thuế:",
        "- Tài khoản số:"
    ];

    const ASideRight = [
        customerAddress,
        formatPhoneNumber(customerPhone || ''),
        customerName,
        customerTaxCode,
        `${customerBankNo} tại Ngân hàng ${customerBank}`
    ];

    const BSideRight = [
        "Số 1/50/5/16, Thanh Đa, P. Bình Quới, TP. Hồ Chí Minh",
        "0932 090207",
        "Nguyễn Chí Nhân Nghĩa",
        "0318436084",
        "8100868, tại Ngân Hàng ACB - Phòng GD Thảo Điền - TP.HCM"
    ];

    const sideA = [
        companyName ? companyName : customerName,
        position,
        customerName
    ];

    const sideB = [
        'CÔNG TY TNHH GIẢI PHÁP DCS',
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
                                BIÊN BẢN NGHIỆM THU/ BÀN GIAO
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
                            const parts = item.split(new RegExp(`(${companyName}|${companyInfoData?.name})`, "g"));

                            return (
                                <Text
                                    key={index}
                                    style={{
                                        fontSize: 13,
                                        fontFamily: "Niramit",
                                        marginBottom: 4,
                                        textIndent: 15,
                                        textAlign: 'justify',
                                    }}
                                >
                                    {parts.map((part, i) => (
                                        <Fragment key={i}>
                                            {part === companyName || part === companyInfoData?.name ? (
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
                                {`Sau khi xem xét quá trình thực hiện hợp đồng hai bên thống nhất ký biên bản nghiệm thu/ bàn giao hàng hóa theo hợp đồng số: ${contractNo} như sau:`}
                            </Text>
                        </View>
                    </View>
                    {/* Điều 1 */}
                    <View
                        style={{
                            paddingLeft: 69,
                            paddingRight: 50,
                            marginBottom: 10
                        }}
                    >
                        <RenderRuleName first="ĐIỀU 1:" second="GIAO NHẬN HÀNG HÓA:" />
                        <View
                            style={{
                                marginTop: 10
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                    textIndent: 22
                                }}
                            >
                                {`Bên B đã bàn giao hàng hóa cho bên A theo danh mục bên dưới:`}
                            </Text>
                        </View>
                        <View style={styles.table}>
                            <View>
                                <View style={styles.rowHeader}>
                                    <View style={styles.cell_1}>
                                        <Text style={[styles.text2Bold, { fontSize: 10 }]}>#</Text>
                                    </View>
                                    <View style={styles.cell_2}>
                                        <Text style={[styles.text2Bold, { fontSize: 10 }]}>Thông tin hàng hóa</Text>
                                    </View>
                                    <View style={[styles.cell_3, { textAlign: 'center' }]}>
                                        <Text style={[styles.text2Bold, { fontSize: 10 }]}>ĐVT</Text>
                                    </View>
                                    <View style={[styles.cell_5, { textAlign: 'center' }]}>
                                        <Text style={[styles.text2Bold, { fontSize: 10 }]}>Bảo hành</Text>
                                    </View>
                                    <View style={[styles.cell_4, { textAlign: 'center' }]}>
                                        <Text style={[styles.text2Bold, { fontSize: 10 }]}>SL</Text>
                                    </View>
                                    <View style={[styles.cell_6, { textAlign: 'center' }]}>
                                        <Text style={[styles.text2Bold, { fontSize: 10 }]}>Ghi chú</Text>
                                    </View>
                                </View>
                            </View>

                            <View>
                                {currentContract?.items?.flatMap((q) =>
                                    q.products.map((p) => {
                                        if (p.price > 0) displayIndex++;
                                        return (
                                            <View key={p.id} style={styles.row} wrap={false}>
                                                <View style={styles.cell_1}>
                                                    <Text>{displayIndex}</Text>
                                                </View>
                                                <View style={styles.cell_2}>
                                                    <Text style={[styles.text2Semi, { fontSize: 10 }]}>{p.productName}</Text>
                                                </View>
                                                <View style={[styles.cell_3, { textAlign: 'center' }]}>
                                                    <Text style={[styles.text2, { fontSize: 10 }]}>{p.unit}</Text>
                                                </View>
                                                <View style={[styles.cell_5, { textAlign: 'center' }]}>
                                                    <Text style={[styles.text2, { fontSize: 10 }]}>{p.warranty ? `${p.warranty} tháng` : ''}</Text>
                                                </View>
                                                <View style={[styles.cell_4, { textAlign: 'center' }]}>
                                                    <Text style={[styles.text2, { fontSize: 10 }]}>{p.quantity}</Text>
                                                </View>
                                                <View style={styles.cell_6}>
                                                    <Text style={[styles.text2, { fontSize: 10 }]}></Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                )}
                            </View>
                        </View>
                    </View>
                    {/* Điều 2 */}
                    <View
                        style={{
                            paddingLeft: 69,
                            paddingRight: 50,
                            marginBottom: 10
                        }}
                    >
                        <RenderRuleName first="ĐIỀU 2:" second="Ý KIẾN HAI BÊN:" />
                        <View
                            style={{
                                marginTop: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                }}
                            >
                                {`2.1. Giao nhận hàng hóa:`}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                    textIndent: 22,
                                    textAlign: 'justify'
                                }}
                            >
                                {`Bên A xác nhận đã nhận đầy đủ sản phẩm/dịch vụ theo hợp đồng.`}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                    textIndent: 22,
                                    textAlign: 'justify'
                                }}
                            >
                                {`Sản phẩm/dịch vụ hoạt động tốt, đúng thông số kỹ thuật, không có khiếu nại.`}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                    textIndent: 22,
                                    textAlign: 'justify'
                                }}
                            >
                                {`Trong khi giao nhận không có các phát sinh khác xảy ra.`}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                    marginTop: 5,
                                    textAlign: 'justify'
                                }}
                            >
                                {(() => {
                                    const text = `2.2. Hai bên thống nhất nghiệm thu, bàn giao, tiếp nhận hàng hóa theo đúng Hợp đồng số ${contractNo} ký ngày ${dd} tháng ${mm} năm ${yyyy} giữa ${companyName} và CÔNG TY TNHH GIẢI PHÁP DCS.`;

                                    const escapeRegExp = (s?: string) => s?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                                    const regex = new RegExp(`(${escapeRegExp(companyName)}|CÔNG TY TNHH GIẢI PHÁP DCS)`, 'g');

                                    const parts = text.split(regex);

                                    return parts.map((part, i) =>
                                        part === companyName || part === 'CÔNG TY TNHH GIẢI PHÁP DCS' ? (
                                            <Text key={i} style={{ fontFamily: 'Niramit-Bold' }}>
                                                {part}
                                            </Text>
                                        ) : (
                                            <Text key={i}>{part}</Text>
                                        )
                                    );
                                })()}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontFamily: "Niramit",
                                    marginTop: 5,
                                    textAlign: 'justify'
                                }}
                            >
                                {`2.3. Biên bản này được lập thành 02 bản có giá trị pháp lý ngang nhau. bên A giữ 01 bản. bên B giữ 01 bản./.`}
                            </Text>
                        </View>
                        {/* Ký tên */}
                        <View
                            style={{
                                marginTop: 10,
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                            }}
                            wrap={false}
                        >
                            {/* ==== Bên A ==== */}
                            <View
                                style={{
                                    width: '48%',
                                    flexShrink: 0,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: 150,
                                }}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontFamily: 'Niramit-Bold',
                                            fontSize: 13,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        ĐẠI DIỆN BÊN A
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: 'Niramit-SemiBold',
                                            fontSize: 13,
                                            textAlign: 'center',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {sideA[1]}
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        fontFamily: 'Niramit',
                                        fontSize: 13,
                                        marginTop: 60,
                                        textAlign: 'center',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {capitalizeWords(text ?? '')}
                                </Text>
                            </View>

                            {/* ==== Bên B ==== */}
                            <View
                                style={{
                                    width: '48%',
                                    flexShrink: 0,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: 150,
                                }}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontFamily: 'Niramit-Bold',
                                            fontSize: 13,
                                            textTransform: 'upperfirst',
                                        }}
                                    >
                                        ĐẠI DIỆN BÊN B
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: 'Niramit-SemiBold',
                                            fontSize: 13,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {sideB[1]}
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        fontFamily: 'Niramit',
                                        fontSize: 13,
                                        marginTop: 60,
                                        // color: 'rgba(238, 0, 51, 1)',
                                        textAlign: 'center',
                                    }}
                                >
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