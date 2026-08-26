import { Text, View } from "@react-pdf/renderer";
import { ICompanyInfoItem } from "src/types/companyInfo";
import { formatPhoneNumber } from "src/utils/format-string";

type props = {
    customerAddress?: string;
    customerPhone?: string;
    customerName?: string;
    customerBankNo?: string;
    customerBank?: string;
    position?: string;
    companyName?: string;
    customerTaxCode?: string;
    companyInfoData: ICompanyInfoItem | null;
}

export const renderTwoSides = ({
    customerAddress,
    customerPhone,
    customerName,
    customerBankNo,
    customerBank,
    companyName,
    position,
    customerTaxCode,
    companyInfoData
}: props) => {
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
        customerAddress ? customerAddress : '',
        formatPhoneNumber(customerPhone || ''),
        customerName,
        customerTaxCode,
        customerBankNo ? `${customerBankNo}, tại Ngân hàng ${customerBank}` : ''
    ];

    const BSideRight = [
        companyAddress,
        "0932 090207",
        "Nguyễn Chí Nhân Nghĩa",
        companyTaxcode,
        "8100868, tại Ngân Hàng ACB - Phòng GD Thảo Điền - TP.HCM"
    ];

    return (
        <View
            style={{
                paddingLeft: 69,
                paddingRight: 50,
                marginTop: 5,
                marginBottom: 15
            }}
        >
            {/* Bên A */}
            <View style={{ display: 'flex', flexDirection: 'column' }}>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
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
                            marginLeft: 10,
                            flex: 1,
                            flexShrink: 1,
                        }}
                    >
                        {companyName ? companyName : customerName}
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
                                        {position || 'Giám đốc'}
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
                        flexWrap: 'wrap',
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
                            marginLeft: 10,
                            flex: 1,
                            flexShrink: 1,
                        }}
                    >
                        {companyInfoData?.name || "CÔNG TY TNHH GIẢI PHÁP DCS"}
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
                marginTop: 10
            }}>
                <Text
                    style={{
                        fontFamily: 'Niramit-Medium',
                        fontSize: 13,
                        textIndent: 20,
                        textAlign: 'justify'
                    }}
                >
                    Hai Bên thống nhất ký kết Hợp đồng cung cấp thiết bị với các điều khoản sau đây:
                </Text>
            </View>
        </View>
    );
}