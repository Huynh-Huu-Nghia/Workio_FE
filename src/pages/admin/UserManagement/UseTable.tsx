import React, { useState } from "react";
import { Trash2, Download, Plus, Eye, Pencil, Printer } from "lucide-react";
import StatusBadge from "@/components/common/StatusBagde"; // Import component badge

// Mock Data (Sau này thay bằng data từ API)
const MOCK_USERS = [
  {
    id: "#0001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "Candidate",
    avatar: "[https://i.pravatar.cc/150?u=1](https://i.pravatar.cc/150?u=1)",
    status: "active",
    createdAt: "20/11/2023",
  },
  {
    id: "#0002",
    name: "Trần Thị B",
    email: "tranthib@workio.com",
    role: "Recruiter",
    avatar: "[https://i.pravatar.cc/150?u=2](https://i.pravatar.cc/150?u=2)",
    status: "inactive",
    createdAt: "15/10/2023",
  },
  {
    id: "#0003",
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    role: "Candidate",
    avatar: "[https://i.pravatar.cc/150?u=3](https://i.pravatar.cc/150?u=3)",
    status: "blocked",
    createdAt: "01/12/2023",
  },
  {
    id: "#0004",
    name: "Phạm Nhật D",
    email: "phamnhatd@gmail.com",
    role: "Candidate",
    avatar: "[https://i.pravatar.cc/150?u=4](https://i.pravatar.cc/150?u=4)",
    status: "active",
    createdAt: "22/11/2023",
  },
  {
    id: "#0005",
    name: "Hoàng Thùy E",
    email: "hoangthuye@workio.com",
    role: "Admin",
    avatar: "[https://i.pravatar.cc/150?u=5](https://i.pravatar.cc/150?u=5)",
    status: "active",
    createdAt: "10/09/2023",
  },
];

const UserTable: React.FC = () => {
  // Logic chọn dòng (Checkbox)
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm">
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Mật khẩu được tự sinh khi tạo mới, không cần nhập tay.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-200 hover:shadow-lg transform active:scale-95">
          <Plus className="w-5 h-5" /> Thêm mới (auto password)
        </button>
      </div>

      {/* Table Content */}
      <div className="divide-y divide-gray-100">
        {MOCK_USERS.map((user) => {
          const checked = selectedRows.includes(user.id);
          return (
            <div
              key={user.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                checked ? "bg-orange-50/40" : "bg-white"
              }`}
              >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer w-4 h-4"
                  checked={checked}
                  onChange={() => toggleRow(user.id)}
                />
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700">
                        {user.role}
                      </span>
                      <StatusBadge status={user.status} />
                      <span className="text-gray-400">Tạo: {user.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <Printer className="w-4 h-4" />
                  In hồ sơ
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 gap-4">
        <span className="font-medium">
          Hiển thị 1-5 trong tổng số 120 bản ghi
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled
          >
            Trước
          </button>
          <button className="px-3 py-1.5 border border-orange-500 bg-orange-500 text-white rounded-md font-bold shadow-sm">
            1
          </button>
          <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 font-medium hover:text-orange-600 hover:border-orange-200 transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 font-medium hover:text-orange-600 hover:border-orange-200 transition-colors">
            3
          </button>
          <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 font-medium hover:text-orange-600 hover:border-orange-200 transition-colors">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
