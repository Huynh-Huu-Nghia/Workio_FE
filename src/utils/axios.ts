// src/utils/axios.ts
/*import axios from "axios";

// SỬA DÒNG NÀY!
// Chúng ta lấy port 3000 từ file .env của BE
const BASE_URL = "/api/v1";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "", // để trống để proxy xử lý
  headers: { "Content-Type": "application/json" },
});*/
import axios from "axios";

// 1. Tạo instance Axios với cấu hình cơ bản
export const axiosInstance = axios.create({
  baseURL: "", // Để trống để Vite Proxy xử lý (ví dụ gọi /admin sẽ tự sang localhost:3000)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // Timeout sau 20 giây nếu mạng quá lag
});

// 2. 🔥 INTERCEPTOR REQUEST (QUAN TRỌNG NHẤT)
// Chạy trước khi request được gửi đi
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage
    const token = localStorage.getItem("access_token");

    if (token) {
      // 🛠 FIX LỖI 400 BAD REQUEST Ở ĐÂY:
      // Kiểm tra xem token trong kho đã có chữ "Bearer " chưa?
      // - Nếu có rồi (VD: "Bearer eyJ...") -> Dùng nguyên xi.
      // - Nếu chưa có (VD: "eyJ...") -> Thêm "Bearer " vào trước.
      const formattedToken = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // Gắn vào Header
      config.headers.Authorization = formattedToken;

      // (Tùy chọn) Bật log này lên nếu muốn soi xem token gửi đi trông thế nào
      // console.log("🔑 Token gửi đi:", formattedToken.substring(0, 20) + "...");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR RESPONSE
// Chạy khi nhận được phản hồi từ Server
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu API trả về thành công (200-299), trả về response luôn
    return response;
  },
  (error) => {
    // Xử lý lỗi chung
    if (error.response) {
      // Ví dụ: Nếu lỗi 401 (Hết hạn Token) -> Có thể đá văng ra trang Login
      if (error.response.status === 401) {
        console.warn("⚠️ Phiên đăng nhập hết hạn hoặc không có quyền.");
        // localStorage.removeItem("access_token");
        // window.location.href = "/login"; // (Bật dòng này nếu muốn tự động logout)
      }
    }
    return Promise.reject(error);
  }
);
