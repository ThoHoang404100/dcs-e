import { z as zod } from 'zod';

export const NewSupplierSchema = zod.object({
    name: zod.string().min(1, "Tên nhà cung cấp là trường bắt buộc"),
    phone: zod.string().min(8, "Số điện thoại không hợp lệ"),
    taxCode: zod.string()
        .regex(/^\d{10}(-\d{3})?$/, "Mã số thuế phải gồm 10 chữ số hoặc 10 chữ số + '-' + 3 chữ số")
        .min(1, { message: "Mã số thuế là trường bắt buộc" }),
    companyName: zod.string().min(1, "Tên công ty là trường bắt buộc"),
    email: zod.string().email("Email không hợp lệ").optional(),
    bankAccount: zod.string().optional(),
    bankName: zod.string().optional(),
    balance: zod.number({ coerce: true })
        .nonnegative({ message: "Số dư không được âm" })
        .default(0)
        .optional(),
    address: zod.string().optional(),
});

export type NewSupplierSchemaType = zod.infer<typeof NewSupplierSchema>;