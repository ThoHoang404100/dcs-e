import { z as zod } from 'zod';

export const NewCustomerSchema = zod.object({
    name: zod.string().min(1, "Họ và tên khách hàng là trường bắt buộc"),
    phone: zod.string().min(10, "Số điện thoại không hợp lệ"),
    email: zod.string()
        .email("Email không hợp lệ")
        .or(zod.literal(""))
        .optional(),
    taxCode: zod.string()
        .trim()
        .refine(
            (val) => val === "" || /^\d{10}(-\d{3})?$/.test(val),
            "Mã số thuế phải gồm 10 chữ số hoặc 10 chữ số + '-' + 3 chữ số"
        )
        .optional(),
    companyName: zod.string().optional(),
    bankAccount: zod.string().optional(),
    position: zod.string().optional(),
    bankName: zod.string().optional(),
    address: zod.string().optional(),
    isPartner: zod.boolean().default(false),
    rewardPoint: zod.number().nonnegative().default(0),
    balance: zod.number({ coerce: true })
        .nonnegative({ message: "Số dư không được âm" })
        .default(0)
        .optional(),
}).refine(
    (data) => {
        if (data.companyName && !data.taxCode) {
            return false;
        }
        return true;
    },
    {
        message: "Bắt buộc có mã số thuế nếu bạn có công ty",
        path: ["taxCode"],
    }
);

export type NewCustomerSchemaType = zod.infer<typeof NewCustomerSchema>;