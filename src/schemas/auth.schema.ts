import { z } from "zod";

// --- Login Schema (Giữ nguyên) ---
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.string().min(1, "Vui lòng chọn vai trò đăng nhập"),
});
export type LoginFormSchema = z.infer<typeof loginSchema>;

// --- ✅ THÊM MỚI: Forgot Password Schema ---
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không đúng định dạng"),
  // Vẫn cần chọn Role để biết gọi API nào
  role: z.string().min(1, "Vui lòng chọn cổng đăng nhập"),
});

export type ForgotPasswordFormSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số")
      .regex(/[^a-zA-Z0-9]/, "Cần ít nhất 1 ký tự đặc biệt"),
    confirm_password: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    // Token sẽ được lấy từ URL, nhưng ta vẫn validate nó trong form cho chắc
    token: z.string().min(1, "Token không hợp lệ"),
    // Role cũng cần để biết gọi API nào (Candidate hay Recruiter)
    role: z.string().min(1, "Vui lòng xác nhận vai trò của bạn"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirm_password"],
  });

export type ResetPasswordFormSchema = z.infer<typeof resetPasswordSchema>;
