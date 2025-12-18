import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminJobPostDetailQuery } from "@/api/job-post.api";
import { ArrowLeft, Calendar, Loader2, MapPin } from "lucide-react";

export default function JobView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminJobPostDetailQuery(id);
  const job = data?.data as any;

  return (
    <AdminLayout title="Chi tiết tin tuyển dụng" activeMenu="jobs">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(path.ADMIN_JOB_LIST)}
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
            Không thể tải dữ liệu tin tuyển dụng.
          </div>
        )}

        {!isLoading && !isError && job && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-800">{job.position}</h1>
              <p className="text-sm text-gray-500 mb-3">
                Trạng thái: {job.status || "—"}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Hạn nộp: {job.application_deadline_to || "Chưa thiết lập"}
                </span>
                {job.support_info && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {job.support_info}
                  </span>
                )}
              </div>

              {job.requirements && (
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-gray-800 mb-1">
                    Mô tả / Yêu cầu
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm space-y-3">
              <div>
                <p className="text-xs uppercase text-gray-400">Nhà tuyển dụng</p>
                <p className="text-sm font-semibold text-gray-800">
                  {job.recruiter?.company_name || job.recruiter_id || "—"}
                </p>
                <p className="text-xs text-gray-500">
                  {job.recruiter?.recruiter?.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Hình thức</p>
                <p className="text-sm text-gray-800">
                  {job.recruitment_type || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Số lượng cần</p>
                <p className="text-sm text-gray-800">
                  {job.available_quantity ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Lương</p>
                <p className="text-sm text-gray-800">
                  {job.monthly_salary ?? "Thỏa thuận"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

