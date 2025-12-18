import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminRecruiterDetailQuery } from "@/api/recruiter.api";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RecruiterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminRecruiterDetailQuery(id);
  const recruiter = data?.data as any;

  return (
    <AdminLayout
      title="Chi tiết Nhà tuyển dụng"
      activeMenu="recruiters"
      activeSubmenu="all-recruiters"
    >
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(path.ADMIN_RECRUITER_LIST)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-red-700">
            Không thể tải dữ liệu NTD.
          </div>
        )}

        {!isLoading && !isError && recruiter && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-1 rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-bold text-xl border border-orange-100">
                  {recruiter.company_name?.charAt(0) || "N"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {recruiter.company_name || "Chưa cập nhật"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {recruiter?.user?.email || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Số ĐT</span>
                  <span className="font-medium text-gray-800">
                    {recruiter.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">MST</span>
                  <span className="font-medium text-gray-800">
                    {recruiter.tax_number || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className="font-medium text-gray-800">
                    {recruiter.is_verified ? "Đã xác thực" : "Chờ xác thực"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Địa chỉ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Đường</div>
                    <div className="font-medium text-gray-800">
                      {recruiter.address?.street || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Phường/Xã</div>
                    <div className="font-medium text-gray-800">
                      {recruiter.address?.ward_code || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tỉnh/TP</div>
                    <div className="font-medium text-gray-800">
                      {recruiter.address?.province_code || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-2">
                  Mô tả
                </h3>
                <p className="text-sm text-gray-700">
                  {recruiter.description || "Chưa cập nhật."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

