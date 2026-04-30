import { IDateValue } from 'src/types/common';
import { z as zod } from 'zod';

export const ContractReceiptSchema = zod.object({
    companyName: zod.string().min(1, "Tên công ty là trường bắt buộc"),
    customerName: zod.string().min(1, "Tên khách hàng là trường bắt buộc"),
    date: zod.custom<IDateValue>().refine(
        (val) => val !== null && val !== undefined && val !== "",
        { message: "Vui lòng chọn ngày lập phiếu" }
    ),
    receiptNo: zod.string().min(1, "Số phiếu thu là trường bắt buộc"),
    amount: zod.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        zod.number({
            required_error: 'Số tiền là trường bắt buộc',
            invalid_type_error: 'Vui lòng nhập số tiền hợp lệ',
        })
            .nonnegative({ message: 'Số tiền không được âm' })
    ),
    payer: zod.preprocess(
        (val) => (typeof val === 'string' ? val.trim() : val),
        zod.string().min(2, 'Tên người nộp phải có ít nhất 2 ký tự')
    ),
    address: zod.string().optional(),
    reason: zod.string().optional(),
    bankAccId: zod.number().min(1, "Vui lòng chọn tài khoản ngân hàng"),
    bankNo: zod.string().min(1, "Vui lòng nhập số tài khoản ngân hàng"),
});

export type ContractReceiptSchemaType = zod.infer<typeof ContractReceiptSchema>;