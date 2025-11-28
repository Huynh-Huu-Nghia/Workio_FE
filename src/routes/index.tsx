// src/routes/index.tsx

import { createBrowserRouter, Outlet } from "react-router-dom"; // 1. BỎ "RouterProvider" Ở ĐÂY
import path from "@/constants/path";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import UserManagementPage from "@/pages/admin/UserManagement";
import CreateCandidate from "@/pages/admin/candidate/CreateCandidate";
import CreateRecruiter from "@/pages/admin/recruiter/CreateRecruiter";

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
    // Lưu ý: AdminLayout cần title và activeMenu props. Ta sẽ đặt giá trị mặc định ở đây
    // và để trang con (UserManagementPage) tự cung cấp props qua HOC (nếu cần),
    // hoặc đơn giản là dùng AdminLayout component trực tiếp trong trang con (như đã làm).
    // Ở đây ta đặt layout ở ngoài để dùng chung cho tất cả luồng admin.
    element: <Outlet />,
    children: [
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_MANAGEMENT,
        element: <UserManagementPage />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_CANDIDATE_CREATE,
        element: <CreateCandidate />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_RECRUITER_CREATE,
        element: <CreateRecruiter />,
      },
      // Thêm các routes Admin khác tại đây
    ],
  },
]);

// 3. XÓA BỎ HOÀN TOÀN HÀM "AppRouter" CŨ VÌ ĐÃ CÓ "App.tsx" LO
// (Không cần gì ở đây nữa)
