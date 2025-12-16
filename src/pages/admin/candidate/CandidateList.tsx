import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Eye,
  Pencil,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Briefcase,
  Loader2, // Icon xoay xoay khi loading
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useGetAllCandidatesQuery } from "@/api/candidate.api"; // 👈 Import Hook

export default function CandidateList() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 GỌI API LẤY DANH SÁCH
  const { data: apiResponse, isLoading, isError } = useGetAllCandidatesQuery();

  // Lấy mảng ứng viên từ cục data trả về (cấu trúc { err, mes, data: [] })
  const candidates = apiResponse?.data || [];

  // --- HELPER FUNCTIONS ---

  const formatCurrency = (value: string | number | null) => {
    if (!value) return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  // Helper parse JSON field_wish (Vì MySQL lưu mảng dưới dạng chuỗi JSON)
  const parseTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        return JSON.parse(tags);
      } catch {
        return [];
      }
    }
    return [];
  };

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === candidates.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(candidates.map((u) => u.candidate_id));
    }
  };

  // Lọc theo search term
  const filteredCandidates = candidates.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  return (
    <AdminLayout
      title="DANH SÁCH ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="list-candidates"
    >
      <div className="min-h-screen bg-slate-50 p-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản Lý Hồ Sơ Ứng Viên
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem và quản lý tất cả ứng viên trong hệ thống.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          {/* TOOLBAR */}
          <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
            <div className="flex flex-1 w-full md:w-auto items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                <Filter size={16} />{" "}
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {selectedRows.length > 0 && (
                <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors animate-in fade-in">
                  <Trash2 size={16} /> Xóa ({selectedRows.length})
                </button>
              )}
              <Link
                to="/admin/candidates/create"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-200 hover:shadow-lg transform active:scale-95"
              >
                <Plus size={18} /> Thêm mới
              </Link>
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto min-h-[400px]">
            {/* 1. TRƯỜNG HỢP LOADING */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2
                  size={40}
                  className="animate-spin text-orange-500 mb-2"
                />
                <p>Đang tải dữ liệu...</p>
              </div>
            )}

            {/* 2. TRƯỜNG HỢP LỖI */}
            {isError && (
              <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <XCircle size={40} className="mb-2" />
                <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
              </div>
            )}

            {/* 3. TRƯỜNG HỢP CÓ DỮ LIỆU */}
            {!isLoading && !isError && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer w-4 h-4"
                        checked={
                          candidates.length > 0 &&
                          selectedRows.length === candidates.length
                        }
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="p-4">Thông tin ứng viên</th>
                    <th className="p-4">Mong muốn & Kỹ năng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-gray-500"
                      >
                        Không tìm thấy ứng viên nào.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((user) => (
                      <tr
                        key={user.candidate_id}
                        className={`hover:bg-orange-50/40 transition-colors group ${
                          selectedRows.includes(user.candidate_id)
                            ? "bg-orange-50/30"
                            : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer w-4 h-4"
                            checked={selectedRows.includes(user.candidate_id)}
                            onChange={() => toggleRow(user.candidate_id)}
                          />
                        </td>

                        {/* Info Column */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-100 shadow-sm shrink-0">
                              {user.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">
                                {user.full_name}
                              </p>
                              <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-3">
                                <span>{user.email}</span>
                                <span className="hidden sm:inline text-gray-300">
                                  |
                                </span>
                                <span>{user.phone || "Chưa cập nhật"}</span>
                              </div>
                              <div className="mt-1 inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                {user.graduation_rank || "Chưa cập nhật"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Career/Wish Column */}
                        <td className="p-4 max-w-xs">
                          <div className="mb-1 font-bold text-orange-600">
                            {formatCurrency(user.minimum_income)}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {parseTags(user.fields_wish)
                              .slice(0, 3)
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            {parseTags(user.fields_wish).length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{parseTags(user.fields_wish).length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="p-4 space-y-2">
                          {user.is_verified ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit border border-green-100">
                              <CheckCircle2 size={12} /> Đã xác thực
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit border border-gray-200">
                              <XCircle size={12} /> Chưa xác thực
                            </div>
                          )}

                          {user.is_employed && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full w-fit border border-purple-100">
                              <Briefcase size={12} /> Đã có việc
                            </div>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/candidates/view/${user.candidate_id}`
                                )
                              }
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/candidates/edit/${user.candidate_id}`
                                )
                              }
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION (Giữ nguyên hoặc làm sau) */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 gap-4 bg-gray-50/50">
            <span className="font-medium">
              Tổng số: {filteredCandidates.length} ứng viên
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
