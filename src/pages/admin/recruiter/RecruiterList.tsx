import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useGetAllRecruitersQuery } from "@/api/recruiter.api";

const RecruiterList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showVerified, setShowVerified] = useState<"all" | "verified" | "pending">("all");

  const { data, isLoading, isError } = useGetAllRecruitersQuery();
  const recruiters = data?.data ?? [];

  const filtered = useMemo(() => {
    return recruiters.filter((rec) => {
      const keyword = searchTerm.toLowerCase();
      const matchesKeyword =
        rec.company_name?.toLowerCase().includes(keyword) ||
        rec.user?.email?.toLowerCase().includes(keyword) ||
        rec.phone?.toLowerCase().includes(keyword) ||
        false;

      if (!matchesKeyword) return false;

      if (showVerified === "verified") return Boolean(rec.is_verified);
      if (showVerified === "pending") return !rec.is_verified;
      return true;
    });
  }, [recruiters, searchTerm, showVerified]);

  return (
    <AdminLayout
      title="Danh sách Nhà tuyển dụng"
      activeMenu="recruiters"
      activeSubmenu="all-recruiters"
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Nhà tuyển dụng
            </h1>
            <p className="text-sm text-gray-500">
              Theo dõi trạng thái xác thực và thông tin liên hệ.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên công ty, email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:min-w-[260px]"
              />
            </div>
            <select
              value={showVerified}
              onChange={(e) =>
                setShowVerified(e.target.value as "all" | "verified" | "pending")
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">Tất cả</option>
              <option value="verified">Đã xác thực</option>
              <option value="pending">Chờ xác thực</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && (
            <div className="flex h-48 items-center justify-center text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
              Đang tải dữ liệu...
            </div>
          )}

          {isError && (
            <div className="flex h-48 items-center justify-center text-red-500">
              <XCircle className="mr-2 h-5 w-5" />
              Không thể tải danh sách nhà tuyển dụng.
            </div>
          )}

          {!isLoading && !isError && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3">Công ty</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Mã số thuế</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Không có nhà tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rec) => (
                    <tr key={rec.recruiter_id} className="hover:bg-orange-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {rec.company_name || "Chưa cập nhật"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Website: {rec.website || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-gray-700">
                          <span className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {rec.user?.email || "Không có email"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.phone || "Chưa có số điện thoại"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {rec.tax_number || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            rec.is_verified
                              ? "bg-green-50 text-green-600"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {rec.is_verified ? "Đã xác thực" : "Chờ xác thực"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RecruiterList;
