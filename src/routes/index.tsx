// src/routes/index.tsx

import { createBrowserRouter } from "react-router-dom"; // 1. BỎ "RouterProvider" Ở ĐÂY
import path from "@/constants/path";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import AdminLayout from "@/layouts/AdminLayout";

// 2. ĐỔI TÊN BIẾN "router" THÀNH "AppRouter" VÀ "EXPORT" NÓ RA
export const AppRouter = createBrowserRouter([
  // --- Luồng Trang Chủ (Home) ---
  {
    path: path.home,
    element: <div>Trang CHỦ - Móng (Router) OK!</div>,
  },

  // --- Luồng Auth (Xác thực) ---
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: path.login,
        element: <Login />,
      },

      {
        path: path.forgotPassword,
        element: <ForgotPassword />,
      },
      {
        path: path.resetPassword,
        element: <ResetPassword />,
      },
    ],
  },

  // --- Luồng Admin ---
  {
    path: path.admin,
    element: <AdminLayout />,
    children: [
      {
        path: path.adminUserManagement,
        element: (
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">
              Trang Quản lý Người dùng (UI Tĩnh)
            </h1>
          </div>
        ),
      },
    ],
  },
]);

// 3. XÓA BỎ HOÀN TOÀN HÀM "AppRouter" CŨ VÌ ĐÃ CÓ "App.tsx" LO
// (Không cần gì ở đây nữa)
