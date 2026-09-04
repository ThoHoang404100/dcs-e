import { Text, View } from "@react-pdf/renderer";

type props = {
    customerName?: string;
    companyName?: string;
    position?: string;
};

export const renderSigner = ({ customerName, companyName, position }: props) => {
    const sideA = [
        companyName ? companyName : customerName,
        position || 'GIÁM ĐỐC',
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
            }}
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

            {/* Row 2: Companies */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ width: '48%', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13, textAlign: 'center' }}>
                        {sideA[0]}
                    </Text>
                </View>
                <View style={{ width: '48%', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Niramit-Bold', fontSize: 13, textAlign: 'center' }}>
                        {sideB[0]}
                    </Text>
                </View>
            </View>

            {/* Row 3: Positions */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
                <View style={{ width: '48%', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Niramit-SemiBold', fontSize: 13, textAlign: 'center', textTransform: 'uppercase' }}>
                        {sideA[1]}
                    </Text>
                </View>
                <View style={{ width: '48%', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Niramit-SemiBold', fontSize: 13, textAlign: 'center', textTransform: 'uppercase' }}>
                        {sideB[1]}
                    </Text>
                </View>
            </View>

            {/* Row 4: Names */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 60 }}>
                <View style={{ width: '48%', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Niramit', fontSize: 13, textAlign: 'center', color: 'rgba(238, 0, 51, 1)' }}>
                        {sideA[2]}
                    </Text>
                </View>
                <View style={{ width: '48%', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Niramit', fontSize: 13, textAlign: 'center', color: 'rgba(238, 0, 51, 1)' }}>
                        {sideB[2]}
                    </Text>
                </View>
            </View>
        </View>
    );
}