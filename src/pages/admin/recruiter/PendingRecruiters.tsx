import React from "react";
import { AlertTriangle, Eye, Loader2 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useGetAllRecruitersQuery } from "@/api/recruiter.api";
import { useNavigate } from "react-router-dom";

const PendingRecruiters: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAllRecruitersQuery();
  const recruiters = data?.data ?? [];
  const pending = recruiters.filter((rec) => !rec.is_verified);

  return (
    <AdminLayout
      title="NTD chờ duyệt"
      activeMenu="recruiters"
      activeSubmenu="pending-recruiters"
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Nhà tuyển dụng cần xác thực
            </h1>
          </div>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            Không thể tải danh sách.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {pending.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Không có nhà tuyển dụng nào đang chờ duyệt.
              </div>
            ) : (
              pending.map((rec) => (
                <div
                  key={rec.recruiter_id}
                  className="rounded-xl border border-gray-100 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase text-gray-400">
                        {rec.tax_number || "MSDN chưa cập nhật"}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {rec.company_name || "Chưa đặt tên"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {rec.description || "Chưa có mô tả"}
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Chờ xác thực
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Email: {rec.user?.email || "N/A"} | Điện thoại:{" "}
                    {rec.phone || "N/A"}
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        navigate(`/admin/recruiters/view/${rec.recruiter_id}`)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PendingRecruiters;
