import { Text, View } from "@react-pdf/renderer";
import { useStyles } from "./useStyle";
import { fCurrencyNoUnit } from "src/utils/format-number";
import { IQuotationData } from "src/types/quotation";

type props = {
    currentQuotation?: IQuotationData;
    discount?: number;
    totalAmount?: number;
}

export const renderTable = ({ currentQuotation, discount, totalAmount }: props) => {
    const styles = useStyles();

    const totalPrice = currentQuotation?.items?.reduce(
        (sum, q) => sum + q.products.reduce((acc, p) => acc + p.price * p.quantity, 0),
        0
    ) ?? 0;

    // const totalVat = currentQuotation?.items?.reduce((sum, q) => {
    //     return sum + q.products.reduce((subSum, p) => {
    //         const lineTotal = p.price * p.quantity;
    //         return subSum + (lineTotal * p.vat) / 100;
    //     }, 0);
    // }, 0) ?? 0;
    const totalVat = currentQuotation?.items?.reduce((sum, q) => {
        return sum + q.products.reduce((subSum, p) => {
            const lineTotal = p.price * p.quantity;

            return (
                subSum +
                (Number(p.vat) === 255
                    ? 0
                    : (lineTotal * p.vat) / 100)
            );
        }, 0);
    }, 0) ?? 0;

    const discountAmount = (totalPrice: number, totalVat: number, discountPercent: number) =>
        Math.round((totalPrice + totalVat) * (discountPercent / 100));

    const allProducts = currentQuotation?.items?.flatMap((q) => q.products.map((p, index) => ({
        ...p,
        index
    }))) ?? [];
    let displayIndex = 0;
    return (
        <View style={styles.table}>

            <View fixed style={styles.rowHeader}>
                <View style={styles.cell_1}><Text style={styles.text2Bold}>#</Text></View>
                <View style={[styles.cell_2]}><Text style={styles.text2Bold}>Tên hàng hóa / dịch vụ</Text></View>
                <View style={styles.cell_3}><Text style={[styles.text2Bold, { textAlign: 'center' }]}>ĐVT</Text></View>
                <View style={styles.cell_4}><Text style={[styles.text2Bold, { textAlign: 'center' }]}>SL</Text></View>
                <View style={styles.cell_5}><Text style={[styles.text2Bold, { textAlign: 'center' }]}>Đơn giá (VNĐ)</Text></View>
                <View style={[styles.cell_6, { textAlign: 'right' }]}>
                    <Text style={[styles.text2Bold]}>Thành tiền (VNĐ)</Text>
                </View>
            </View>

            {allProducts.map((p, index) => {
                if (p.price > 0) displayIndex++;
                return (
                    <View key={p.id || index} style={styles.row} wrap={false}>
                        {p.price > 0 ?
                            <>
                                <View style={styles.cell_1}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12 }}>
                                        {displayIndex}
                                    </Text>
                                </View>
                                <View style={[styles.cell_2]}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12 }}>{p.productName}</Text>
                                    {/* <Text style={{ fontFamily: 'Niramit-ExtraLight', fontSize: 10 }}>{p.vat}% VAT</Text> */}
                                    <Text
                                        style={{
                                            fontFamily: 'Niramit-ExtraLight',
                                            fontSize: 10,
                                        }}
                                    >
                                        {Number(p.vat) === 255
                                            ? 'Không chịu thuế'
                                            : `${p.vat ?? 0}% VAT`}
                                    </Text>
                                </View>
                                <View style={styles.cell_3}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12, textAlign: 'center' }}>
                                        {p.unit}
                                    </Text>
                                </View>
                                <View style={styles.cell_4}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12, textAlign: 'center' }}>
                                        {p.quantity}
                                    </Text>
                                </View>
                                <View style={styles.cell_5}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12, textAlign: 'center' }}>
                                        {fCurrencyNoUnit(p.price)}
                                    </Text>
                                </View>
                                <View style={[styles.cell_6, {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    textAlign: 'right',
                                    height: '100%'
                                }]}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12 }}>{fCurrencyNoUnit(p.price * p.quantity)}</Text>
                                    {/* <Text style={{ fontFamily: 'Niramit-ExtraLight', fontSize: 10 }}>
                                        {fCurrencyNoUnit(((p.price * p.quantity) * p.vat) / 100)}
                                    </Text> */}
                                    <Text style={{ fontFamily: 'Niramit-ExtraLight', fontSize: 10 }}>
                                        {fCurrencyNoUnit(
                                            Number(p.vat) === 255
                                                ? 0
                                                : ((p.price * p.quantity) * p.vat) / 100
                                        )}
                                    </Text>
                                </View>
                            </>
                            :
                            <>
                                <View style={styles.cell_1}>
                                </View>
                                <View style={[styles.cell_2, {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    height: '100%'
                                }]}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12 }}>
                                        {p.productName}
                                    </Text>
                                </View>
                                <View style={styles.cell_3}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12, textAlign: 'center' }}>
                                        {p.unit}
                                    </Text>
                                </View>
                                <View style={styles.cell_4}>
                                    <Text style={{ fontFamily: 'Niramit', fontSize: 12, textAlign: 'center' }}>
                                        {p.quantity}
                                    </Text>
                                </View>
                                <View style={styles.cell_5}></View>
                                <View style={[styles.cell_6]}></View>
                            </>
                        }
                    </View>
                )
            })}

            <View break style={{ marginTop: 6 }}>
                {[
                    { name: 'Tổng:', value: fCurrencyNoUnit(totalPrice) },
                    { name: 'VAT:', value: fCurrencyNoUnit(totalVat), styles: styles.textMontserrat, isVat: true },
                    // { name: 'Khuyến mãi:', value: discount ? fCurrencyNoUnit(discountAmount(totalPrice, totalVat, discount)) : null },
                    { name: 'Tổng cộng:', value: fCurrencyNoUnit(totalAmount), styles, isTotal: true },
                ].map((item, index) => {
                    if (!item.value) return null;
                    return (
                        <View
                            key={item.name}
                            style={[
                                styles.row,
                                styles.noBorder,
                                index === 0 ? styles.rowFooter : {}
                            ]}
                        >
                            <View style={{ width: '60%' }} />
                            <View style={{ width: '40%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '100%' }}>
                                    {item.isTotal && (
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: 'rgba(0, 137, 0, 1)',
                                                width: '100%',
                                                alignSelf: 'flex-start',
                                                marginBottom: 2,
                                            }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            item.isTotal ? {
                                                fontFamily: 'Niramit-SemiBold',
                                                flexWrap: 'nowrap',
                                                fontSize: 13,
                                                textTransform: item.styles ? 'uppercase' : 'none',
                                            } : {
                                                fontFamily: item.isVat ? 'Niramit-ExtraLight' : 'Niramit-SemiBold',
                                                fontSize: 12
                                            },
                                            { textAlign: 'left' }
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                                <View style={{ width: '100%' }}>
                                    {item.isTotal && (
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: 'rgba(0, 137, 0, 1)',
                                                alignSelf: 'flex-end',
                                                width: '100%',
                                                marginBottom: 2,
                                            }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            item.isTotal
                                                ? { fontFamily: 'Niramit-SemiBold' }
                                                : { fontFamily: item.isVat ? 'Niramit-ExtraLight' : 'Niramit-SemiBold' },
                                            { textAlign: 'right', fontSize: 12 }
                                        ]}
                                    >
                                        {item.value}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>

        </View >
    );
};
