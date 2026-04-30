import { IDateValue } from 'src/types/common';
import { z as zod } from 'zod';

export const EditEmployeeSchema = zod.object({
    name: zod.string().min(2, "Họ và tên là trường bắt buộc").max(20, { message: 'Họ và tên tối đa 50 ký tự' }),
    phone: zod.string().min(1, "Số điện thoại không được để trống").min(10, "Số điện thoại không hợp lệ"),
    email: zod.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
    gender: zod.enum(["Male", "Female", "Other"]),
    bankAccount: zod.string()
        .min(6, "Số tài khoản không hợp lệ")
        .max(15, "Số tài khoản vượt quá giới hạn cho phép (Giới hạn 15 ký tự)")
        .regex(/^[0-9]+$/, "Số tài khoản chỉ được chứa số"),
    bankName: zod.string().optional(),
    birthday: zod.custom<IDateValue>().refine((val) => {
        if (val === null || val === undefined || val === "") return false;

        const date = new Date(val);
        if (isNaN(date.getTime())) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }, {
        message: "Vui lòng chọn ngày sinh hợp lệ",
    }),
    balance: zod.number({ coerce: true })
        .nonnegative({ message: "Số dư không được âm" })
        .default(0)
        .optional(),
    address: zod.string().optional(),
    image: zod.any().optional(),
    departmentId: zod.number().min(1, { message: 'Phòng ban là trường bắt buộc' }),
    employeeTypeId: zod.number().min(1, { message: 'Chức vụ là trường bắt buộc' }),
    Folder: zod.string().min(1, { message: 'Thư mục tải lên là trường bắt buộc' }),
});

export const CreateEmployeeSchema = EditEmployeeSchema.extend({
    username: zod.string().min(4, "Tên đăng nhập tối thiểu 4 ký tự").max(20, "Tên đăng nhập tối đa 20 ký tự"),
    password: zod.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(16, "Mật khẩu tối đa 16 ký tự"),
    userTypeId: zod.number().min(0, { message: "Vai trò là trường bắt buộc" })
});

export type EditEmployeeSchemaType = zod.infer<typeof EditEmployeeSchema>;
export type CreateEmployeeSchemaType = zod.infer<typeof CreateEmployeeSchema>;
