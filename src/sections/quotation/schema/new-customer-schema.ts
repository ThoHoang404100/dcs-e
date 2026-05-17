import { z } from "zod";

export const customerSchema = z.object({
    customerType: z.string().min(1, "Vui lòng chọn loại khách hàng"),
    name: z.string().optional(),
    phone: z.string().optional(),
    taxCode: z.string().trim()
        .refine(
            (val) => val === "" || /^\d{10}(-\d{3})?$/.test(val),
            "Mã số thuế phải gồm 10 chữ số hoặc 10 chữ số + '-' + 3 chữ số"
        ).optional(),
    companyName: z.string().optional(),
    address: z.string().optional(),
    nickName: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.customerType === "KHDN") {
        if (!data.address || data.address.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["address"],
                message: "Địa chỉ là trường bắt buộc",
            });
        }
        if (!data.taxCode || data.taxCode.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["taxCode"],
                message: "Mã số thuế là trường bắt buộc",
            });
        }
        if (!data.companyName || data.companyName.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["companyName"],
                message: "Tên công ty là trường bắt buộc",
            });
        }
    }

    if (data.customerType === "KHCN") {
        if (!data.name || data.name.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["name"],
                message: "Tên khách hàng là trường bắt buộc"
            });
        }
        if (!data.phone || data.phone.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["phone"],
                message: "Số điện thoại là trường bắt buộc",
            });
        }
    }
});


export type CustomerFormValues = z.infer<typeof customerSchema>;