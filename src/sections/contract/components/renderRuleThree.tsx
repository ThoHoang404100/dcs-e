import { Text, View } from "@react-pdf/renderer";
import { RenderRuleNameChild } from "../helper/renderRuleNameChild";
import { RenderRuleName } from "../helper/renderRuleName";

export const renderRuleThree = () => {
    const sideARule3 = [
        '- Đơn vị thụ hưởng:',
        '- Tài khoản số:',
        '- Tại:'
    ];

    const sideBRule3 = [
        'CÔNG TY TNHH GIẢI PHÁP DCS',
        '8100868',
        'tại Ngân hàng Á Châu - PGD Thảo Điền - TP. HCM'
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

    return (
        <View>
            <View
                style={{
                    paddingLeft: 69,
                    paddingRight: 50,
                    marginTop: 5,
                    flexDirection: 'column',
                    gap: 5
                }}
            >
                <View style={{ paddingLeft: 10 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 15, textAlign: 'justify' }}>
                        - Mọi chi phí phát sinh liên quan đến việc chuyển khoản (nếu có) do Bên A chịu trách nhiệm thanh toán.
                    </Text>
                </View>
                <RenderRuleNameChild sentence={`2.3 Thông tin chuyển khoản:`} />
                <View style={{ flexDirection: 'row', gap: 8, paddingLeft: 10 }}>
                    <View style={{ flexDirection: 'column', gap: 3 }}>
                        {sideARule3.map((item, index) => (
                            <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 15 }}>
                                {item}
                            </Text>
                        ))}
                    </View>
                    <View style={{
                        flexDirection: 'column',
                        gap: 3,
                    }}>
                        {sideBRule3.map((item, index) => (
                            <Text key={index} style={{
                                fontSize: 13,
                                fontFamily: index === 0 ? "Niramit-Bold" : "Niramit",
                                textIndent: index === 0 ? 15 : index === 1 ? 5 : 0,
                            }}>
                                {item}
                            </Text>
                        ))}
                    </View>
                </View>
                <View style={{ marginTop: 20 }}>
                    <RenderRuleName first="ĐIỀU 3:" second="TRỢ GIÚP KỸ THUẬT VÀ PHẠM VI BẢO HÀNH:" />
                </View>
                <View style={{ flexDirection: 'column', gap: 5 }}>
                    {ruleThree.map((item, index) => (
                        <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20, textAlign: 'justify' }}>
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
                    paddingLeft: 69,
                    paddingRight: 50,
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
                        <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20, textAlign: 'justify' }}>
                            {item}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
}