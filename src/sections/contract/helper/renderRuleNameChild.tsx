import { Text } from "@react-pdf/renderer";

export function RenderRuleNameChild({ sentence }: { sentence: string }) {
    return (
        <Text
            style={{
                fontFamily: 'Niramit-SemiBold',
                fontSize: 13,
                textIndent: 22,
                textAlign: 'justify'
            }}
        >
            {sentence}
        </Text>
    );
}