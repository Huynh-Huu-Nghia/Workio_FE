import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";

interface MainHeaderProps {
  sectionTitle?: string;
  pageTitle?: string;
  onMenuToggle: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  sectionTitle,
  pageTitle,
  onMenuToggle,
}) => {
  const location = useLocation();

  // Lấy tiêu đề dựa vào URL hiện tại, nếu không có thì dùng pageTitle truyền vào
  const currentTitle =
    pathtotitle[location.pathname] || pageTitle || "Trang chủ";

  return (
    <header className="bg-white border-b border-gray-100 h-16 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm/50">
      {/* Bên Trái */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-orange-600 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          {sectionTitle && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight">
              {sectionTitle}
            </span>
          )}
          <h1 className="text-lg font-bold text-gray-800 leading-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Bên Phải */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm cursor-pointer border border-orange-200">
          AD
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
