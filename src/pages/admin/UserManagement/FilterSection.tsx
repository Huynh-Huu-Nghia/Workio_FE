import React from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";

const FilterSection: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Role Select */}
        <div className="relative">
          <select className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-gray-600 cursor-pointer">
            <option value="">Tất cả vai trò</option>
            <option value="candidate">Ứng viên</option>
            <option value="recruiter">Nhà tuyển dụng</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Date Picker */}
        <div className="relative">
          <input
            type="date"
            className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
          />
        </div>

        {/* Status Select */}
        <div className="relative">
          <select className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-gray-600 cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Chờ xác thực</option>
            <option value="blocked">Đã khóa</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-gray-200 pt-4">
        <button className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-sm shadow-orange-200 hover:shadow-md active:scale-95">
          <Search className="w-4 h-4" /> Tìm kiếm
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95">
          <RotateCcw className="w-4 h-4" /> Làm mới
        </button>
        <button className="ml-auto text-sm text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 transition-colors">
          Thu gọn <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
