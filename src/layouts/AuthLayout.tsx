// src/layouts/AuthLayout.tsx

import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    // "Luồng" (AuthLayout)
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* <Outlet /> là "lỗ" (hole)
        Nơi "bộ điều hướng" (router) sẽ "nhét" (inject) 
        trang Login.tsx hoặc ForgotPassword.tsx vào
      */}
      <Outlet />
    </div>
  );
}
