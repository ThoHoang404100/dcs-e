import { Text, View } from "@react-pdf/renderer";

type props = {
    customerName?: string;
    companyName?: string;
    position?: string;
};

export const renderSigner = ({ customerName, companyName, position }: props) => {
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

    return (
        <View
            style={{
                paddingLeft: 69,
                paddingRight: 50,
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
            }}
        >
            {/* ==== Bên A ==== */}
            <View
                style={{
                    width: '48%',
                    flexShrink: 0,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
            >
                <Text
                    style={{
                        fontFamily: 'Niramit-Bold',
                        fontSize: 13,
                        textTransform: 'uppercase',
                    }}
                >
                    ĐẠI DIỆN BÊN A
                </Text>
                <View style={{ height: 60, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
                    <Text
                        style={{
                            fontFamily: 'Niramit-Bold',
                            fontSize: 13,
                            textAlign: 'center',
                        }}
                    >
                        {sideA[0]}
                    </Text>
                </View>
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
                <Text
                    style={{
                        fontFamily: 'Niramit',
                        fontSize: 13,
                        marginTop: 60,
                        color: 'rgba(238, 0, 51, 1)',
                        textAlign: 'center',
                    }}
                >
                    {sideA[2]}
                </Text>
            </View>

            {/* ==== Bên B ==== */}
            <View
                style={{
                    width: '48%',
                    flexShrink: 0,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
            >
                <Text
                    style={{
                        fontFamily: 'Niramit-Bold',
                        fontSize: 13,
                        textTransform: 'upperfirst',
                    }}
                >
                    ĐẠI DIỆN BÊN B
                </Text>
                <View style={{ height: 60, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
                    <Text
                        style={{
                            fontFamily: 'Niramit-Bold',
                            fontSize: 13,
                            textAlign: 'center',
                        }}
                    >
                        {sideB[0]}
                    </Text>
                </View>
                <Text
                    style={{
                        fontFamily: 'Niramit-SemiBold',
                        fontSize: 13,
                        textAlign: 'center',
                    }}
                >
                    {sideB[1]}
                </Text>
                <Text
                    style={{
                        fontFamily: 'Niramit',
                        fontSize: 13,
                        marginTop: 60,
                        color: 'rgba(238, 0, 51, 1)',
                        textAlign: 'center',
                    }}
                >
                    {sideB[2]}
                </Text>
            </View>
        </View>
    );
}