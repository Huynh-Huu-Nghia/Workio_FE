import { z } from "zod";

export const createRecruiterSchema = z.object({
  // 1. Tài khoản (Giống Candidate)
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Cần ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Cần ít nhất 1 số")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt"),

  // 2. Thông tin công ty (Khác Candidate)
  recruiterInfo: z.object({
    company_name: z.string().min(1, "Tên công ty là bắt buộc"),
    tax_number: z.string().min(5, "Mã số thuế không hợp lệ"), // MST thường 10-13 số
    phone: z
      .string()
      .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
    website: z.string().optional().or(z.literal("")), // Cho phép rỗng
    description: z.string().optional(),
    established_at: z
      .string()
      .refine((date) => new Date(date).toString() !== "Invalid Date", {
        message: "Ngày thành lập không hợp lệ",
      }),
    is_verified: z.boolean().default(false),
  }),

  // 3. Địa chỉ (Giống Candidate)
  addressInfo: z.object({
    street: z.string().min(1, "Số nhà, tên đường là bắt buộc"),
    province_code: z.string().min(1, "Vui lòng chọn Tỉnh/Thành"),
    district_code: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
    ward: z.string().min(1, "Vui lòng chọn Phường/Xã"), // Thêm Ward cho đồng bộ AddressSection
  }),
});

export type CreateRecruiterSchema = z.infer<typeof createRecruiterSchema>;
