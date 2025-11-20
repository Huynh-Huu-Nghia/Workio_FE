import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../utils/axios";
import { type LoginFormSchema } from "@/schemas/auth.schema";
import { type User } from "@/context/user/user.type";

interface LoginResponse {
  err: number;
  mes: string;
  access_token: string;
  refresh_token: string;
  data: User;
}

// Định nghĩa payload gửi vào hàm request (bao gồm cả role để chọn URL)
type LoginRequestPayload = LoginFormSchema & { role: string };

const loginRequest = (payload: LoginRequestPayload) => {
  // 1. Tách role ra để chọn đường dẫn, còn lại là data login (email, pass)
  const { role, ...loginData } = payload;

  let apiUrl = "";

  // 2. CẤU HÌNH ĐƯỜNG DẪN API TƯƠNG ỨNG VỚI ROLE
  // ⚠️ Bạn hãy kiểm tra lại với Backend xem đúng các đường dẫn này không nhé
  switch (role) {
    case "Admin":
      apiUrl = "/admin-auth/login";
      break;
    case "Recruiter":
      // Ví dụ: API cho nhà tuyển dụng
      apiUrl = "/recruiter/auth/login";
      // Hoặc nếu dùng chung: apiUrl = "/auth/login";
      break;
    case "Candidate":
    default:
      // Ví dụ: API cho ứng viên
      apiUrl = "/candidate/auth/login";
      // Hoặc nếu dùng chung: apiUrl = "/auth/login";
      break;
  }

  console.log(`🌐 Gọi API Login tới: [${apiUrl}] với quyền [${role}]`);

  return axiosInstance.post<LoginResponse>(apiUrl, loginData);
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginRequest,
  });
};
