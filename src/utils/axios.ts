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
});*/

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "", // để trống để proxy xử lý
  headers: { "Content-Type": "application/json" },
});
