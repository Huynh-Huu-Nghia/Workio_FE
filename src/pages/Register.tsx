// src/pages/ForgotPassword.tsx

import path from "@/constants/path";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Quên Mật Khẩu 🔒
      </h1>

      <p className="mb-6 text-center text-sm text-gray-600">
        Đừng lo! Vui lòng nhập email của bạn, chúng tôi sẽ gửi cho bạn một link
        để đặt lại mật khẩu.
      </p>

      <form className="space-y-5">
        {/* --- Email --- */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nhập email của bạn"
          />
          {/* <p className="mt-1 text-xs text-red-500">Lỗi email (nếu có)</p> */}
        </div>

        {/* --- Submit Button --- */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          Gửi Link Đặt Lại
        </button>

        {/* --- Back to Login --- */}
        <div className="text-center">
          <Link
            to={path.login} // "Quay" (Trở) "về" (về) "Bản đồ" (map)
            className="text-sm text-blue-600 hover:underline"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
