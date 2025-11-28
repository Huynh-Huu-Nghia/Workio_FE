import React, { useState, useEffect } from "react";
// ✅ Import đúng đường dẫn
import Sidebar from "./Sidebar";
import MainHeader from "./MainHeader";
import { pathtotitle } from "@/configs/pagetitle"; // Import map URL → title
import { useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
  section?: string; // Tên phân hệ (VD: Quản lý Ứng Viên)
  title?: string; // Tên trang (VD: Thêm Mới)
  activeMenu?: string; // ID menu để highlight (VD: candidates)
  activeSubmenu?: string; // ID submenu để highlight (VD: add-candidate)
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  section,
  title,
  activeMenu,
  activeSubmenu,
}) => {
  const location = useLocation(); // Lấy URL hiện tại

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => !prev);
  };

  // Lấy pageTitle dựa vào URL, nếu không có thì dùng title truyền vào, nếu vẫn không có thì "Trang chủ"
  const pageTitle = pathtotitle[location.pathname] || title || "Trang chủ";

  return (
    <div className="min-h-screen flex bg-[#f5f7fb] text-gray-700 font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        activeMenu={activeMenu}
        activeSubmenu={activeSubmenu}
      />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-hidden">
        {/* Truyền pageTitle tự động xuống MainHeader */}
        <MainHeader
          sectionTitle={section}
          pageTitle={pageTitle}
          onMenuToggle={toggleSidebar}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <div className="animate-fade-in-up pb-10 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
