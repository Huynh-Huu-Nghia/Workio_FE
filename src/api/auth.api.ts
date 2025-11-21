import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../utils/axios";
import {
  type LoginFormSchema,
  type ForgotPasswordFormSchema,
  type ResetPasswordFormSchema,
} from "@/schemas/auth.schema";
import { type User } from "@/context/user/user.type";

// --- PHẦN LOGIN (Giữ nguyên) ---
interface LoginResponse {
  err: number;
  mes: string;
  access_token: string;
  refresh_token: string;
  data: User;
}

type LoginRequestPayload = LoginFormSchema & { role: string };

const loginRequest = (payload: LoginRequestPayload) => {
  const { role, ...loginData } = payload;
  let apiUrl = "";
  switch (role) {
    case "Admin":
      apiUrl = "/admin-auth/login";
      break;
    case "Recruiter":
      apiUrl = "/recruiter/auth/login";
      break;
    default:
      apiUrl = "/candidate/auth/login";
      break;
  }
  console.log(`🌐 Login [${role}] -> ${apiUrl}`);
  return axiosInstance.post<LoginResponse>(apiUrl, loginData);
};

export const useLoginMutation = () => {
  return useMutation({ mutationFn: loginRequest });
};

// --- ✅ PHẦN FORGOT PASSWORD (ĐÃ SỬA LỖI "ROLE NOT ALLOWED") ---
const forgotPasswordRequest = (payload: ForgotPasswordFormSchema) => {
  // 1. Lấy role và email từ dữ liệu form
  const { role, email } = payload;

  let apiUrl = "";

  // 2. Chọn đường dẫn API dựa trên Role
  switch (role) {
    case "Recruiter":
      apiUrl = "/recruiter/auth/forgot-password";
      break;
    default:
      apiUrl = "/candidate/auth/forgot-password";
      break;
  }

  console.log(`🌐 Forgot Password [${role}] -> ${apiUrl}`, { email });

  // 3. ⚠️ QUAN TRỌNG: Chỉ gửi object { email } lên server.
  // Không gửi nguyên 'payload' vì nó chứa 'role', server sẽ báo lỗi "Role is not allowed".
  return axiosInstance.post(apiUrl, { email });
};

export const useForgotPasswordMutation = () => {
  return useMutation({ mutationFn: forgotPasswordRequest });
};

// --- PHẦN RESET PASSWORD (Giữ nguyên) ---
const resetPasswordRequest = (payload: ResetPasswordFormSchema) => {
  // Tách role và confirm_password ra, chỉ gửi password và token đi
  const { role, confirm_password, ...resetData } = payload;
  let apiUrl = "";
  switch (role) {
    case "Recruiter":
      apiUrl = "/recruiter/auth/create-new-password";
      break;
    default:
      apiUrl = "/candidate/auth/create-new-password";
      break;
  }
  console.log(`🌐 Reset Password [${role}] -> ${apiUrl}`, resetData);

  // resetData lúc này chỉ còn { password, token } -> ĐÚNG
  return axiosInstance.put(apiUrl, resetData);
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
};
