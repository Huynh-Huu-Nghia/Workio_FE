// src/schemas/auth.schema.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email là bắt buộc" })
    .email({ message: "Email không đúng định dạng" }),

  password: z
    .string()
    .min(1, { message: "Mật khẩu là bắt buộc" })
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải có ít nhất 1 chữ hoa" })
    .regex(/[a-z]/, { message: "Mật khẩu phải có ít nhất 1 chữ thường" })
    .regex(/[0-9]/, { message: "Mật khẩu phải có ít nhất 1 chữ số" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
    }),

  // 👇 SỬA THÀNH z.string() CHO ĐƠN GIẢN VÀ HẾT LỖI 👇
  role: z.string().min(1, { message: "Vui lòng chọn vai trò đăng nhập" }),
});

export type LoginFormSchema = z.infer<typeof loginSchema>;
