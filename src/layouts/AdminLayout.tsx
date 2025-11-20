// src/layouts/AdminLayout.tsx

import { Outlet } from "react-router-dom";

// (Mình "sẽ" (sẽ) "thêm" (thêm) "link" (link) "xịn" (xịn) "vào" (vào) "Sidebar" (thanh bên) "sau" (sau))
const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- 1. Sidebar (Thanh bên) --- */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-5 text-center text-2xl font-bold">Workio Admin</div>
        <nav className="mt-10">
          <a
            href="#" // (Link "giả" (giả))
            className="block bg-gray-700 px-6 py-3 text-white" // (Đây là "link" (link) "đang" (đang) "active" (active))
          >
            Quản lý Người dùng
          </a>
          <a
            href="#" // (Link "giã" (giả))
            className="block px-6 py-3 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            Quản lý Việc làm
          </a>
          {/* (Thêm "các" (các) "link" (link) "khác" (khác) "sau" (sau)...) */}
        </nav>
      </aside>

      {/* --- 2. Main Content (Nội dung chính) --- */}
      <div className="flex flex-1 flex-col">
        {/* --- 2.1 Header (Tiêu đề) --- */}
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow">
          <div className="text-lg font-semibold">Chào mừng, Admin!</div>
          <div>
            <button className="text-red-500 hover:text-red-700">
              Đăng xuất
            </button>
          </div>
        </header>

        {/* --- 2.2 Page Content (Nội dung trang) --- */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* <Outlet /> là "lỗ" (lỗ)
            "Nơi" (Nơi) "bộ điều hướng" (router) "sẽ" (sẽ) "nhét" (nhét) 
            "trang" (trang) "UserManagement.tsx" (Quản lý Người dùng) "vào" (vào) "đây" (đây)
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
