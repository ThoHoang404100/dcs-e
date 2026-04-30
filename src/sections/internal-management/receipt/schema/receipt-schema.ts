import { IDateValue } from 'src/types/common';
import { z as zod } from 'zod';

export const InternalReceiptSchema = zod.object({
    name: zod.string().min(1, "Tên người nộp tiền là trường bắt buộc"),
    receiptDate: zod.custom<IDateValue>().refine(
        (val) => val !== null && val !== undefined && val !== "",
        { message: "Vui lòng chọn ngày lập phiếu" }
    ),
    receiptNo: zod.string().min(1, "Số phiếu thu là trường bắt buộc"),
    cost: zod.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        zod.number({
            required_error: 'Số tiền là trường bắt buộc',
            invalid_type_error: 'Vui lòng nhập số tiền hợp lệ',
        })
            .nonnegative({ message: 'Số tiền không được âm' })
    ),
    address: zod.string().optional(),
    reason: zod.string().optional(),
    bankAccId: zod.number().min(1, "Vui lòng chọn tài khoản ngân hàng"),
    bankNo: zod.string().min(1, "Vui lòng nhập số tài khoản ngân hàng"),
});

export type InternalReceiptSchemaType = zod.infer<typeof InternalReceiptSchema>;