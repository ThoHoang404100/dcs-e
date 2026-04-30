import { IDateValue } from 'src/types/common';
import { z as zod } from 'zod';

export const InternalSpendSchema = zod.object({
    spendType: zod.enum(["salary", "other"]),

    employeeId: zod.string().optional(),
    department: zod.string().optional(),
    name: zod.string().optional(),

    receiptDate: zod.custom<IDateValue>().refine(
        (val) => val !== null && val !== undefined && val !== "",
        { message: "Vui lòng chọn ngày lập phiếu" }
    ),

    receiptNo: zod.string().min(1, "Số phiếu chi là trường bắt buộc"),

    cost: zod.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        zod.number({
            required_error: 'Số tiền là trường bắt buộc',
            invalid_type_error: 'Vui lòng nhập số tiền hợp lệ',
        }).nonnegative({ message: 'Số tiền không được âm' })
    ),

    address: zod.string().optional(),
    reason: zod.string().optional(),

    bankAccId: zod.number().min(1, "Vui lòng chọn tài khoản ngân hàng"),
    bankNo: zod.string().min(1, "Vui lòng nhập số tài khoản ngân hàng"),
}).superRefine((data, ctx) => {

    if (data.spendType === "salary") {
        if (!data.employeeId || data.employeeId.trim() === "") {
            ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: "Vui lòng chọn nhân viên nhận lương",
                path: ["employeeId"],
            });
        }

        if (!data.department || data.department.trim() === "") {
            ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: "Vui lòng chọn phòng ban nhân viên",
                path: ["department"],
            });
        }
    }

    if (data.spendType === "other") {
        if (!data.name || data.name.trim() === "") {
            ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: "Tên người chi tiền là trường bắt buộc",
                path: ["name"],
            });
        }
    }

});

export type InternalSpendSchemaType = zod.infer<typeof InternalSpendSchema>;