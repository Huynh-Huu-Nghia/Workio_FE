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
    case "Center":
      apiUrl = "/center/auth/login";
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
    case "Admin":
      apiUrl = "/admin-auth/forgot-password";
      break;
    case "Recruiter":
      apiUrl = "/recruiter/auth/forgot-password";
      break;
    case "Center":
      apiUrl = "/center/auth/forgot-password";
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
  const { role, confirm_password: _confirm_password, token, ...resetData } = payload;
  let apiUrl = "";
  switch (role) {
    case "Admin":
      apiUrl = "/admin-auth/create-new-password";
      break;
    case "Recruiter":
      apiUrl = `/recruiter/auth/reset-password?token=${token}`;
      break;
    case "Center":
      apiUrl = `/center/auth/reset-password?token=${token}`;
      break;
    default:
      apiUrl = `/candidate/auth/reset-password?token=${token}`;
      break;
  }
  console.log(`🌐 Reset Password [${role}] -> ${apiUrl}`, resetData);

  // resetData lúc này chỉ còn { password } -> ĐÚNG
  return axiosInstance.post(apiUrl, resetData);
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
};

// --- ✅ Refresh token + Logout (Candidate/Recruiter/Admin/Center) ---
export type AuthRole = "Admin" | "Recruiter" | "Candidate" | "Center";

export const refreshTokenRequest = async ({
  role,
  refresh_token,
}: {
  role: AuthRole;
  refresh_token: string;
}) => {
  let apiUrl = "";
  switch (role) {
    case "Admin":
      apiUrl = "/admin-auth/refresh-token";
      break;
    case "Recruiter":
      apiUrl = "/recruiter/auth/refresh-token";
      break;
    case "Center":
      apiUrl = "/center/auth/refresh-token";
      break;
    default:
      apiUrl = "/candidate/auth/refresh-token";
      break;
  }
  return axiosInstance.post(apiUrl, { refresh_token });
};

export const useRefreshTokenMutation = () =>
  useMutation({ mutationFn: refreshTokenRequest });

export const logoutRequest = async ({
  role,
}: {
  role: AuthRole;
}) => {
  let apiUrl = "";
  switch (role) {
    case "Admin":
      apiUrl = "/admin-auth/logout";
      break;
    case "Recruiter":
      apiUrl = "/recruiter/auth/logout";
      break;
    case "Center":
      apiUrl = "/center/auth/logout";
      break;
    default:
      apiUrl = "/candidate/auth/logout";
      break;
  }
  return axiosInstance.post(apiUrl, {});
};

export const useLogoutMutation = () =>
  useMutation({ mutationFn: logoutRequest });

// --- Optional: verify email / verify reset token (used by email links) ---
export const verifyEmailRequest = async ({
  role,
  token,
}: {
  role: "Recruiter" | "Candidate";
  token: string;
}) => {
  const apiUrl =
    role === "Recruiter" ? "/recruiter/auth/verified" : "/candidate/auth/verified";
  return axiosInstance.get(apiUrl, { params: { token } });
};

export const verifyResetPasswordTokenRequest = async ({
  role,
  token,
}: {
  role: "Recruiter" | "Candidate";
  token: string;
}) => {
  const apiUrl =
    role === "Recruiter"
      ? "/recruiter/auth/reset-password"
      : "/candidate/auth/reset-password";
  return axiosInstance.get(apiUrl, { params: { token } });
};
