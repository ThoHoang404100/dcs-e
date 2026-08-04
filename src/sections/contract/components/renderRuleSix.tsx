import { Text, View } from "@react-pdf/renderer";
import { RenderRuleName } from "../helper/renderRuleName";
import { fCurrencyNoUnit, fRenderTextNumber, fRenderTextNumberNoUnit } from "src/utils/format-number";
import { RenderRuleNameChild } from "../helper/renderRuleNameChild";
import { fDate } from "src/utils/format-time-vi";
import { capitalizeFirstLetter, capitalizeWords } from "src/utils/format-string";
import { IDateValue } from "src/types/common";
import { IContractData } from "src/types/contract";
import { useStyles } from "./useStyle";

type RenderRuleSixProps = {
    customerName?: string;
    companyName?: string;
    position?: string;
    keptNo?: number;
    copiesNo?: number;
    downPayment?: number;
    nextPayment?: number;
    lastPayment?: number;
    signatureDate?: IDateValue;
    nextPaymentDate?: IDateValue;
    total?: number;
    deliveryAddress?: string;
    currentContract?: IContractData;
    discount?: number;
};

export const renderRules = ({
    customerName,
    companyName,
    position,
    keptNo,
    copiesNo,
    downPayment,
    nextPayment,
    lastPayment,
    signatureDate,
    nextPaymentDate,
    total,
    deliveryAddress,
    currentContract,
    discount
}: RenderRuleSixProps) => {
    const styles = useStyles();
    const roundedTotal = Math.round(total ?? 0);

    const totalPrice = currentContract?.items?.reduce(
        (sum, q) => sum + q.products.reduce((acc, p) => acc + p.price * p.quantity, 0),
        0
    ) ?? 0;

    const totalVat = currentContract?.items?.reduce((sum, q) => {
        return (
            sum +
            q.products.reduce((subSum, p) => {
                const lineTotal = p.price * p.quantity;
                return subSum + (lineTotal * p.vat) / 100;
            }, 0)
        );
    }, 0) ?? 0;


    const discountAmount = (totalPrice: number, totalVat: number, discountPercent: number) =>
        Math.round((totalPrice + totalVat) * (discountPercent / 100));

    const paymentPhases = [
        downPayment ?? 0,
        nextPayment ?? 0,
        lastPayment ?? 0,
    ];

    const activePhaseCount = paymentPhases.filter(v => v > 0).length;

    const formattedPhaseCount = String(activePhaseCount).padStart(2, '0');

    const formattedText = fRenderTextNumberNoUnit(Number(formattedPhaseCount));

    const phaseTexts = [
        `- Bên A thanh toán cho Bên B bằng hình thức chuyển khoản thành ${formattedText} (${formattedPhaseCount}) đợt, cụ thể:`,
        `Ngay sau khi ký hợp đồng, Bên A thanh toán cho Bên B số tiền ${fCurrencyNoUnit(downPayment)} (${capitalizeFirstLetter(fRenderTextNumber(downPayment || 0))}).`,
        `Trước ngày ${fDate(nextPaymentDate || signatureDate)}, Bên A thanh toán cho Bên B số tiền ${fCurrencyNoUnit(nextPayment)} (${capitalizeFirstLetter(fRenderTextNumber(nextPayment || 0))}).`,
        `Trong vòng 15 (mười lăm) ngày kể từ ngày Bên B bàn giao thiết bị cho Bên A, tương đương ${fCurrencyNoUnit(lastPayment)} (${capitalizeFirstLetter(fRenderTextNumber(lastPayment || 0))}).`
    ];

    const rule3Data = [
        {
            left: '- Đơn vị thụ hưởng:',
            right: 'CÔNG TY TNHH GIẢI PHÁP DCS',
            bold: true,
        },
        {
            left: '- Tài khoản số:',
            right: '8100868',
        },
        {
            left: '- Tại:',
            right: 'Ngân hàng Á Châu – PGD Thảo Điền – TP. HCM',
        },
    ];
    const ruleThree = [
        '- Bảo hành: Bên B sẽ bảo hành thiết bị đã bàn bán trong thời hạn một năm cho bên A',
        '- Phần ngoài phạm vi bảo hành: Bên A phải đảm bảo sử dụng thiết bị theo đúng chỉ dẫn của nhà sản xuất, cũng như môi trường cho thiết bị hoạt động tốt. Nếu thiết bị bị hư hỏng do những nguyên nhân sau đây sẽ không thuộc phạm vi bảo hành: không sử dụng đúng hướng dẫn của nhà sản xuất, máy bị hư, vỡ do rơi, va chạm mạnh, cháy nổ, sét đánh, môi trường ẩm ướt, côn trùng xâm nhập hoặc nguồn điện không ổn định.',
        '- Dịch vụ sau thời hạn bảo hành: Bên B sẽ cung cấp các thiết bị thay thế, dịch vụ sửa chữa với giá ưu đãi nhất đối với tất cả các thiết bị đã cung cấp cho bên A.',
    ];
    const ruleFour = [
        '- Trong quá trình thực hiện Hợp Đồng, hai bên nếu có phát sinh gì về Hợp Đồng phải gửi yêu cầu như một bản Phụ Lục Hợp Đồng đính kèm, phụ lục này là một phần không thể tách rời đối với hợp đồng.',
        '- Nếu một trong hai bên hoàn toàn không thực hiện Hợp Đồng thì phải chịu phạt Hợp Đồng ở mức cao nhất của khung hình phạt là 5% giá trị Hợp Đồng. Nếu hợp đồng mua bán có hạng mục Phần mềm bản quyền, bên A phải thanh toán 100% cho bên B hạng mục này trong mọi trường hợp tranh chấp hay hủy hợp đồng.',
        '- Bên A phải thanh toán cho bên B theo đúng thời hạn quy định. Nếu Bên A thanh toán chậm hơn so với kế hoạch thì sẽ chịu mức phạt là 0.1% tổng giá trị hợp đồng cho mỗi ngày chậm và không vượt quá 7 ngày. Sau 7 ngày bên B có quyền thu hồi lại sản phẩm và không hoàn cọc. Bên A tạo mọi điều kiện thuận lợi để bên B giao hàng.',
        '- Bên B phải giao hàng hóa đúng số lượng, chất lượng như đã thỏa thuận. Nếu bên B giao hàng hóa không đúng, Bên A có quyền từ chối nhận lô hàng đó và phải tiến hành giao ngay lô hàng khác theo đúng chất lượng, quy cách theo đúng thỏa thuận hai bên như Hợp Đồng đã nêu.',
        '- Việc kiểm tra các hàng hóa, thiết bị cho lô hàng sẽ do kỹ thuật của Bên B thực hiện với sự hỗ trợ của bên A và được thể hiện bằng biên bản nghiệm thu.',
        '- Đảm bảo thực hiện đúng theo hợp đồng đã ký, linh kiện và thiết bị được giao đúng chủng loại, quy cách.',
        '- Thời gian bàn giao thiết bị trong vòng 10 ngày kể từ ngày hợp đồng được ký kết. Trong trường hợp Bên B chậm giao hàng Bên B sẽ chịu phạt giao hàng chậm là 0.1% (không phẩy một phần trăm) tổng trị giá hợp đồng/số ngày chậm giao hàng ngoại trừ trường hợp sau đây Bên B có thông báo cho bên A trước ngày giao hàng bằng văn bản các đối tác cung cấp hết hàng.',
        '- Bảo hành thiết bị đúng như điều 3 của hợp đồng.'
    ];

    const ruleFive = [
        '- Sự kiện bất khả kháng là sự kiện xảy ra mang tính khách quan và nằm ngoài tầm kiểm soát của các bên như các: động đất, bão, lũ, lụt, lốc, sóng thần, hỏa hoạn, chiến tranh hoặc các nguy cơ xảy ra chiến tranh,… và các thảm họa khác; sự thay đổi chính sách hoặc việc ngăn cấm cơ quan có thẩm quyền của Việt Nam.',
        '- Việc một bên không hoàn thành nghĩa vụ của mình do sự kiện bất khả kháng sẽ không phải là cơ sở để bên kia chấm dứt Hợp Đồng. Tuy nhiên, bên bị ảnh hưởng bởi sự kiện bất khả kháng có nghĩa vụ phải tiến hành các biện pháp ngăn ngừa hợp lý và các biện pháp thay thế cần thiết để hạn chế tối đa ảnh hưởng do sự kiện bất khả kháng gây ra. Và thông báo ngay cho bên kia về sự kiện bất khả kháng xảy ra trong vòng 07 ngày, ngay sau khi xảy ra sự kiện bất khả kháng.',
        '- Trong trường hợp xảy ra sự kiện bất khả kháng, thời gian thực hiện Hợp Đồng sẽ được kéo dài bằng thời gian diễn ra sự kiện bất khả kháng, mà bên bị ảnh hưởng không thể hiện các nghĩa vụ theo Hợp Đồng của mình.'
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

    const renderBinaryNumber = (num: number) => (num < 10 ? `0${num}` : num);
    let keptAndCopies = 0;
    if (!keptNo || !copiesNo) return null;
    keptAndCopies = copiesNo - keptNo;
    const ruleSix = [
        ' - Hai bên cam kết thực hiện đúng các điều khoản của hợp đồng, bên nào vi phạm sẽ phải chịu trách nhiệm theo quy định của pháp luật.',
        '- Mọi thay đổi liên quan đến nội dung hợp đồng phải được thông báo bằng văn bản cho bên kia trước ít nhất 15 ngày. Mọi chi phí phát sinh cho thay đổi hợp đồng do nguyên nhân từ Bên nào thì Bên đó có trách nhiệm thanh toán.',
        '- Mọi tranh chấp trong quá trình thực hiện hợp đồng này nếu có sẽ được hai bên thương lượng giải quyết trên tinh thần hợp tác, tôn trọng lẫn nhau. Trường hợp hai bên không thống nhất giải quyết, thì vụ việc sẽ được chuyển lên Tòa Án có thẩm quyền để giải quyết. Quyết định của Toà là chung thẩm và có hiệu lực thi hành đối với các Bên.',
        '- Sau khi hai bên hoàn thành trách nhiệm của mình theo các điều khoản đã nêu trong hợp đồng này, 30 ngày sau đó hợp đồng mặc nhiên sẽ được thanh lý.',
        `- Hợp đồng này được lập thành ${renderBinaryNumber(copiesNo ?? 0)} (${fRenderTextNumberNoUnit(copiesNo ?? 0)}) bản gốc, có giá trị pháp lý như nhau; Bên A giữ ${renderBinaryNumber(keptAndCopies)} (${fRenderTextNumberNoUnit(keptAndCopies)}) bản, Bên B giữ ${renderBinaryNumber(keptNo ?? 0)} (${fRenderTextNumberNoUnit(keptNo ?? 0)}) bản. Hợp đồng có hiệu lực kể từ ngày ký kết và là căn cứ ràng buộc trách nhiệm pháp lý giữa các Bên./.`
    ];
    let displayIndex = 0;
    const text = sideA[2] ?? '';
    return (
        <View
            style={{
                paddingLeft: 69,
                paddingRight: 50,
                marginTop: 20,
                marginBottom: 20,
                flexDirection: 'column',
                gap: 5
            }}
        >
            <View style={styles.table}>
                <View>
                    <View style={styles.rowHeader}>
                        <View style={styles.cell_1}>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>#</Text>
                        </View>
                        <View style={styles.cell_2}>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>Tên SP/DV</Text>
                        </View>
                        <View style={[styles.cell_3, { textAlign: 'center' }]}>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>ĐVT</Text>
                        </View>
                        <View style={[styles.cell_4, { textAlign: 'center' }]}>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>SL</Text>
                        </View>
                        <View style={[styles.cell_5, { flexDirection: 'column', alignItems: 'center' }]}>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>Đơn giá</Text>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>{`(VNĐ)`}</Text>
                        </View>
                        <View style={[styles.cell_6, { flexDirection: 'column', alignItems: 'center' }]}>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>Thành tiền</Text>
                            <Text style={[styles.text2Bold, { fontSize: 10 }]}>{`(VNĐ)`}</Text>
                        </View>
                    </View>
                </View>

                <View>
                    {currentContract?.items?.flatMap((q) =>
                        q.products.map((p, index) => {
                            if (p.price > 0) displayIndex++;
                            return (
                                <View key={p.id} style={styles.row} wrap={false}>
                                    {p.price > 0 ?
                                        <>
                                            <View style={styles.cell_1}>
                                                <Text>{displayIndex}</Text>
                                            </View>
                                            <View style={styles.cell_2}>
                                                <Text style={[styles.text2Semi, { fontSize: 10 }]}>{p.productName}</Text>
                                                <Text style={[styles.textMontserrat, { fontSize: 10 }]}>{p.vat}% VAT</Text>
                                            </View>
                                            <View style={[styles.cell_3, { textAlign: 'center' }]}>
                                                <Text style={[styles.text2, { fontSize: 10 }]}>{p.unit}</Text>
                                            </View>
                                            <View style={[styles.cell_4, { textAlign: 'center' }]}>
                                                <Text style={[styles.text2, { fontSize: 10 }]}>{p.quantity}</Text>
                                            </View>
                                            <View style={[styles.cell_5, { textAlign: 'center' }]}>
                                                <Text style={[styles.text2, { fontSize: 10 }]}>{fCurrencyNoUnit(p.price)}</Text>
                                            </View>
                                            <View style={[styles.cell_6, {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'space-between',
                                                textAlign: 'right',
                                                height: '100%'
                                            }]}>
                                                <Text style={[styles.text2, { fontSize: 10 }]}>{fCurrencyNoUnit(p.price * p.quantity)}</Text>
                                                <Text style={[styles.textMontserrat, { fontSize: 10 }]}>{fCurrencyNoUnit(((p.price * p.quantity) * p.vat) / 100)}</Text>
                                            </View>
                                        </>
                                        :
                                        <>
                                            <View style={styles.cell_1}></View>
                                            <View style={[styles.cell_2, {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                height: '100%'
                                            }]}>
                                                <Text style={[styles.text2Semi, { fontSize: 10 }]}>{p.productName}</Text>
                                            </View>
                                            <View style={[styles.cell_3, { textAlign: 'center' }]}>
                                                <Text style={[styles.text2, { fontSize: 10 }]}>{p.unit}</Text>
                                            </View>
                                            <View style={[styles.cell_4, { textAlign: 'center' }]}>
                                                <Text style={[styles.text2, { fontSize: 10 }]}>{p.quantity}</Text>
                                            </View>
                                            <View style={[styles.cell_5]}></View>
                                            <View style={[styles.cell_6]}></View>
                                        </>
                                    }
                                </View>
                            )
                        })
                    )}

                    {[
                        { name: 'Tổng:', value: fCurrencyNoUnit(totalPrice) },
                        { name: 'VAT:', value: fCurrencyNoUnit(totalVat), styles: styles.textMontserrat, isVat: true },
                        // { name: 'Khuyến mãi:', value: (discount ? fCurrencyNoUnit(discountAmount(totalPrice, totalVat, discount)) : 0) },
                        { name: 'Tổng cộng:', value: fCurrencyNoUnit(total), styles: styles.h5, isTotal: true },
                    ].map((item, index) => (
                        <View key={item.name}
                            style={[
                                styles.row,
                                styles.noBorder,
                                index === 0 ? styles.rowFooter : {}
                            ]}
                            break wrap={false}
                        >
                            <View style={styles.cell_sub1} />
                            <View style={styles.cell_sub2} />
                            <View style={styles.cell_sub3} />

                            <View style={[styles.cell_sub4, { flexDirection: 'column' }]}>
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
                                            fontSize: 11,
                                            textTransform: item.styles ? 'uppercase' : 'none',
                                        } : {
                                            fontFamily: item.isVat ? 'Niramit-ExtraLight' : 'Niramit-SemiBold',
                                            fontSize: 10
                                        },
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </View>

                            <View style={[styles.cell_sub5, { flexDirection: 'column', textAlign: 'right' }]}>
                                {item.isTotal && (
                                    <View
                                        style={{
                                            height: 1,
                                            backgroundColor: 'rgba(0, 137, 0, 1)',
                                            width: '100%',
                                            alignSelf: 'flex-end',
                                            marginBottom: 2,
                                        }}
                                    />
                                )}
                                <Text
                                    style={[
                                        item.isTotal
                                            ? { fontFamily: 'Niramit-SemiBold', fontSize: 11 }
                                            : { fontFamily: item.isVat ? 'Niramit-ExtraLight' : 'Niramit-SemiBold', fontSize: 10 }
                                    ]}
                                >
                                    {item.value}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            <RenderRuleNameChild sentence="1.2 Chất lượng và Quy cách kỹ thuật hàng hóa:" />
            <View
                style={{
                    marginTop: 5,
                    flexDirection: 'column',
                    gap: 5
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 13,
                            fontFamily: "Niramit",
                            textIndent: 22
                        }}
                    >
                        {`Điều kiện kỹ thuật, các thông số kỹ thuật của hàng hóa đáp ứng theo đúng các thỏa thuận giữa hai bên.`}
                    </Text>
                </View>
                <View style={{ marginTop: 5, marginBottom: 5 }}>
                    <RenderRuleName first="ĐIỀU 2:" second="GIÁ TRỊ VÀ PHƯƠNG THỨC THANH TOÁN HỢP ĐỒNG:" />
                </View>
                <RenderRuleNameChild sentence={`2.1 Tổng giá trị hợp đồng là: ${fCurrencyNoUnit(total)} VNĐ`} />
                <View style={{
                    flexDirection: 'row',
                    gap: 10,
                    paddingRight: 50,
                }}>
                    <Text
                        style={{
                            fontFamily: 'Niramit-italic',
                            textIndent: 22,
                            fontSize: 13
                        }}
                    >
                        {`(Bằng chữ:`}
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Niramit-BoldItalic',
                            textIndent: 22,
                            fontSize: 13
                        }}
                    >
                        {`${capitalizeFirstLetter(fRenderTextNumber(total || 0))}).`}
                    </Text>
                </View>
                <View style={{
                    marginTop: 6,
                    marginBottom: 6
                }}>
                    <Text
                        style={{
                            fontFamily: 'Niramit',
                            textIndent: 22,
                            fontSize: 13,
                            textAlign: 'justify'
                        }}>
                        {`- Giá trị hợp đồng đã bao gồm toàn bộ chi phí vận chuyển đến ${deliveryAddress}, chi phí lắp đặt, nghiệm thu, bảo hành, thuế nhập khẩu thiết bị, thuế giá trị gia tăng (VAT) và các chi phí liên quan khác. Trường hợp phát sinh chi phí vận chuyển ngoài phạm vi nêu trên, Bên A có trách nhiệm thanh toán theo số tiền ghi trên hóa đơn do đơn vị vận chuyển cung cấp.`}
                    </Text>
                </View>
                <RenderRuleNameChild sentence={`2.2 Thông tin và Phương thức thanh toán:`} />
                <View style={{ paddingLeft: 10 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Niramit", lineHeight: 1.6 }}>
                        {phaseTexts.map((item, index) => {
                            if (lastPayment === 0 && index === 3) return;
                            return (
                                <Text key={index} style={{
                                    textIndent: index === 0 ? 15 : 0,
                                }}>
                                    {index !== 0 && (
                                        <Text style={{ fontFamily: "Niramit-SemiBold", textIndent: 15 }}>
                                            + Đợt {index}:
                                        </Text>
                                    )}{" "}
                                    {item}
                                    {index < phaseTexts.length - 1 ? "\n" : ""}
                                </Text>
                            )
                        })}
                    </Text>
                </View>
            </View>
            <View>
                <View
                    style={{
                        marginTop: 5,
                        flexDirection: 'column',
                        gap: 5
                    }}
                >
                    <View style={{ paddingLeft: 10 }}>
                        <Text style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 15 }}>
                            - Mọi chi phí phát sinh liên quan đến việc chuyển khoản (nếu có) do Bên A chịu trách nhiệm thanh toán.
                        </Text>
                    </View>
                    <RenderRuleNameChild sentence={`2.3 Thông tin chuyển khoản:`} />
                    <View wrap={false} style={{ flexDirection: 'column', paddingLeft: 10, gap: 3 }} >
                        {rule3Data.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', paddingLeft: 10, alignItems: 'flex-start' }}>
                                <View style={{ width: 120 }}>
                                    <Text style={{ fontSize: 13, fontFamily: "Niramit" }}>{item.left}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontFamily: item.bold ? "Niramit-Bold" : "Niramit",
                                        }}
                                    >
                                        {item.right}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <RenderRuleName first="ĐIỀU 3:" second="TRỢ GIÚP KỸ THUẬT VÀ PHẠM VI BẢO HÀNH:" />
                    </View>
                    <View style={{ flexDirection: 'column', gap: 5 }}>
                        {ruleThree.map((item, index) => (
                            <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20 }}>
                                {item}
                            </Text>
                        ))}
                        <View style={{ flexDirection: 'row', gap: 3 }}>
                            <Text style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20 }}>
                                - Liên hệ bảo hành:
                            </Text>
                            <Text style={{ fontSize: 13, fontFamily: "Niramit-Bold", textIndent: 20 }}>
                                CÔNG TY TNHH GIẢI PHÁP DCS
                            </Text>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        marginTop: 20,
                        marginBottom: 15,
                        flexDirection: 'column',
                        gap: 5
                    }}
                >
                    <RenderRuleName first="ĐIỀU 4:" second={`CÁC BIỆN PHÁP BẢO ĐẢM THỰC HIỆN HỢP ĐỒNG VÀ TRÁCH NHIỆM HAI BÊN:`} />
                    <View style={{
                        marginTop: 2,
                        flexDirection: 'column',
                        gap: 5
                    }}>
                        {ruleFour.map((item, index) => (
                            <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20 }}>
                                {item}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>
            <View
                style={{
                    marginTop: 5,
                    flexDirection: 'column',
                    gap: 5
                }}
            >
                <RenderRuleName first="ĐIỀU 5:" second="TRƯỜNG HỢP BẤT KHẢ KHÁNG:" />
                <View style={{
                    marginTop: 2,
                    flexDirection: 'column',
                    gap: 5
                }}>
                    {ruleFive.map((item, index) => (
                        <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20 }}>
                            {item}
                        </Text>
                    ))}
                </View>
            </View>
            <RenderRuleName first="ĐIỀU 6:" second="ĐIỀU KHOẢN CHUNG:" />
            <View style={{
                marginTop: 2,
                flexDirection: 'column',
                gap: 5
            }}
            >
                {ruleSix.map((item, index) => (
                    <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20 }}>
                        {item}
                    </Text>
                ))}
            </View>

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
                                fontFamily: 'Niramit-Bold',
                                fontSize: 13,
                                textAlign: 'center',
                            }}
                        >
                            {sideA[0]}
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
                                fontFamily: 'Niramit-Bold',
                                fontSize: 13,
                                textAlign: 'center',
                            }}
                        >
                            {sideB[0]}
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
    );
}