import { Text, View } from "@react-pdf/renderer";
import { RenderRuleName } from "../helper/renderRuleName";

export const renderRuleFive = () => {
    const ruleFive = [
        '- Sự kiện bất khả kháng là sự kiện xảy ra mang tính khách quan và nằm ngoài tầm kiểm soát của các bên như các: động đất, bão, lũ, lụt, lốc, sóng thần, hỏa hoạn, chiến tranh hoặc các nguy cơ xảy ra chiến tranh,… và các thảm họa khác; sự thay đổi chính sách hoặc việc ngăn cấm cơ quan có thẩm quyền của Việt Nam.',
        '- Việc một bên không hoàn thành nghĩa vụ của mình do sự kiện bất khả kháng sẽ không phải là cơ sở để bên kia chấm dứt Hợp Đồng. Tuy nhiên, bên bị ảnh hưởng bởi sự kiện bất khả kháng có nghĩa vụ phải tiến hành các biện pháp ngăn ngừa hợp lý và các biện pháp thay thế cần thiết để hạn chế tối đa ảnh hưởng do sự kiện bất khả kháng gây ra. Và thông báo ngay cho bên kia về sự kiện bất khả kháng xảy ra trong vòng 07 ngày, ngay sau khi xảy ra sự kiện bất khả kháng.',
        '- Trong trường hợp xảy ra sự kiện bất khả kháng, thời gian thực hiện Hợp Đồng sẽ được kéo dài bằng thời gian diễn ra sự kiện bất khả kháng, mà bên bị ảnh hưởng không thể hiện các nghĩa vụ theo Hợp Đồng của mình.'
    ];
    return (
        <View
            style={{
                paddingLeft: 69,
                paddingRight: 50,
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
                    <Text key={index} style={{ fontSize: 13, fontFamily: "Niramit", textIndent: 20, textAlign: 'justify' }}>
                        {item}
                    </Text>
                ))}
            </View>
        </View>
    );
}