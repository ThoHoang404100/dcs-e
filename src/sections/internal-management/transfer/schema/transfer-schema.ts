import { ba } from "node_modules/@fullcalendar/core/internal-common";
import { z } from "zod";

export const InternalTransferSchema = z.object({
    bankSendId: z.number().min(1, "Vui lòng chọn tài khoản chuyển"),
    bankSendNo: z.string().min(1, "Vui lòng nhập số tài khoản chuyển"),
    bankSendBalance: z.number().min(1, "Vui lòng nhập số dư tài khoản chuyển"),

    bankReceiveId: z.number().min(1, "Vui lòng chọn tài khoản nhận"),
    bankReceiveNo: z.string().min(1, "Vui lòng nhập số tài khoản nhận"),
    bankReceiveBalance: z.number().min(1, "Vui lòng nhập số dư tài khoản nhận"),

    sendAmount: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({
            required_error: 'Số tiền chuyển là trường bắt buộc',
            invalid_type_error: 'Vui lòng nhập số tiền hợp lệ',
        }).nonnegative({ message: 'Số tiền chuyển không được âm' })),
    note: z.string().max(255, "Giới hạn nội dung là 255 ký tự").optional(),
});

export type InternalTransferSchemaType = z.infer<typeof InternalTransferSchema>;