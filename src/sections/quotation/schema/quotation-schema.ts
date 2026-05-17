// import { IDateValue } from "src/types/common";
// import { z } from "zod";
// import { customerSchema } from "./new-customer-schema";

// export const quotationItemSchema = z.object({
//     id: z.number().optional(),
//     product: z.string().min(1, "Vui lòng chọn sản phẩm"),
//     unit: z.string().optional().or(z.literal("")),
//     unitName: z.string().optional().or(z.literal("")),
//     qty: z.number().min(1, "Số lượng > 0"),
//     price: z.number().min(0, "Đơn giá >= 0"),
//     vat: z.number().optional(),
// });

// const customItemsSchema = z
//     .array(quotationItemSchema.partial()) // Cho phép field trống tạm thời
//     .superRefine((items, ctx) => {
//         // Nếu mảng trống thì không cần xử lý
//         if (items.length === 0) return;

//         const lastIndex = items.length - 1;

//         items.forEach((item, index) => {
//             const isLast = index === lastIndex;
//             const isEmpty = !item.product || item.product === "";

//             // Nếu là phần tử cuối và trống → bỏ qua
//             if (isLast && isEmpty) return;

//             // Các phần tử khác: validate lại đầy đủ theo schema gốc
//             const result = quotationItemSchema.safeParse(item);
//             if (!result.success) {
//                 for (const issue of result.error.issues) {
//                     ctx.addIssue({
//                         code: z.ZodIssueCode.custom,
//                         message: issue.message,
//                         path: [index, ...issue.path],
//                     });
//                 }
//             }
//         });
//     });


// export const quotationSchema = z.object({
//     customer: z.number().min(1, { message: "Vui lòng chọn khách hàng" }),
//     quotationNo: z
//         .string()
//         .min(1, "Mã báo giá là trường bắt buộc"),
//     date: z.custom<IDateValue>().refine(
//         (val) => val !== null && val !== undefined && val !== "",
//         { message: "Vui lòng chọn ngày báo giá" }
//     ),
//     validUntil: z.custom<IDateValue>().refine(
//         (val) => val !== null && val !== undefined && val !== "",
//         { message: "Vui lòng chọn ngày có hiệu lực" }
//     ),
//     status: z.number().min(0).max(4),
//     items: customItemsSchema,
//     discount: z.preprocess(
//         (val) => {
//             if (val === "" || val === null || val === undefined) {
//                 return undefined;
//             }
//             return Number(val);
//         },
//         z.number().min(0, "Khuyến mãi nhập tối thiểu là 0%").max(30, "Khuyến mãi nhập tối đa là 30%").optional()
//     ),
//     paid: z.number().min(0, "Vui lòng nhập số tiền đã trả trước"),
//     notes: z.string().optional(),
//     customerDetails: customerSchema.optional(),
// });

// export type QuotationFormValues = z.infer<typeof quotationSchema>;

import { IDateValue } from "src/types/common";
import { z } from "zod";
import { customerSchema } from "./new-customer-schema";

export const quotationItemSchema = z.object({
    id: z.number().optional(),
    product: z.string().min(1, "Vui lòng chọn sản phẩm"),
    unit: z.string().optional().or(z.literal("")),
    unitName: z.string().optional().or(z.literal("")),
    qty: z.number().min(1, "Số lượng > 0"),
    price: z.number().min(0, "Đơn giá >= 0"),
    vat: z.number().optional(),
});

const customItemsSchema = z
    .array(quotationItemSchema.partial())
    .superRefine((items, ctx) => {
        if (items.length === 0) return;

        const lastIndex = items.length - 1;

        items.forEach((item, index) => {
            const isLast = index === lastIndex;
            const isEmpty = !item.product || item.product === "";

            if (isLast && isEmpty) return;

            const result = quotationItemSchema.safeParse(item);
            if (!result.success) {
                for (const issue of result.error.issues) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: issue.message,
                        path: [index, ...issue.path],
                    });
                }
            }
        });
    });

export const quotationSchema = z.object({
    customer: z.number().min(1, { message: "Vui lòng chọn khách hàng" }),
    quotationNo: z.string().min(1, "Mã báo giá là trường bắt buộc"),

    date: z.custom<IDateValue>().refine(
        (val) => val !== null && val !== undefined && val !== "",
        { message: "Vui lòng chọn ngày báo giá" }
    ),
    validUntil: z.custom<IDateValue>().refine(
        (val) => val !== null && val !== undefined && val !== "",
        { message: "Vui lòng chọn ngày có hiệu lực" }
    ),

    status: z.number().min(0).max(4),

    // === THÊM CÁC TRƯỜNG THÔNG TIN KHÁCH HÀNG ===
    cusName: z.string().optional(),
    companyName: z.string().optional(),
    taxCode: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    nickName: z.string().optional(),

    items: customItemsSchema,

    discount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number().min(0).max(30).optional()
    ),

    paid: z.number().min(0, "Vui lòng nhập số tiền đã trả trước"),
    notes: z.string().optional(),

    customerDetails: customerSchema.optional(),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;