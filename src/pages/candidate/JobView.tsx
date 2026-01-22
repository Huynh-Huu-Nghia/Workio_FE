import CandidateLayout from "@/layouts/CandidateLayout";
import path from "@/constants/path";
import { useParams, useNavigate } from "react-router-dom";
import { useCandidateJobPostsQuery } from "@/api/candidate.api";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Loader2,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { useJobLocationResolver } from "@/hooks/useJobLocationResolver";

export default function CandidateJobView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCandidateJobPostsQuery();
  const { resolveJobLocation } = useJobLocationResolver();

  // Find the specific job from the list
  const job = data?.data?.find((job: any) => job.id === id);

  const handleBack = () => {
    const canUseHistory =
      typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    navigate(path.CANDIDATE_SUGGESTED_JOBS);
  };

  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "")
      return "Thỏa thuận";
    const num = Number(value);
    if (isNaN(num) || num === 0) return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "—";

  return (
    <CandidateLayout title="Chi tiết việc làm">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại
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
            Không thể tải dữ liệu việc làm.
          </div>
        )}

        {!isLoading && !isError && job && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {job.position || "Chưa có tên vị trí"}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {job.recruiter_name ||
                        job.recruiter?.company_name ||
                        "Nhà tuyển dụng"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.fields || ([] as any)).map((field: string) => (
                      <span
                        key={field}
                        className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700">
                        {formatCurrency(job.monthly_salary)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>
                        {resolveJobLocation(job).label ||
                          "Chưa cập nhật địa điểm"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>
                        Hạn: {formatDate(job.application_deadline_to)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {job.status || "Đang mở"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Requirements */}
              <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                  Yêu cầu công việc
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="whitespace-pre-line">
                    {job.requirements || "Không có mô tả chi tiết."}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Phúc lợi
                </h2>
                {job.benefits && (
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(job.benefits) ? (
                      (job.benefits as any).map((benefit: string) => (
                        <span
                          key={benefit}
                          className="rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 border border-green-100"
                        >
                          {benefit}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 border border-green-100">
                        {job.benefits as any}
                      </span>
                    )}
                  </div>
                )}
                {!job.benefits && (
                  <p className="text-gray-500">
                    Chưa cập nhật thông tin phúc lợi.
                  </p>
                )}
              </div>

              {/* Job Type & Working Time */}
              <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Thông tin làm việc
                </h2>
                <div className="space-y-3">
                  {job.job_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại công việc:</span>
                      <span className="font-medium">{job.job_type}</span>
                    </div>
                  )}
                  {job.working_time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian làm việc:</span>
                      <span className="font-medium">{job.working_time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Requirements */}
              {job.other_requirements && (
                <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Yêu cầu khác
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {job.other_requirements}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && !isError && !job && (
          <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-6 shadow-sm text-yellow-700">
            Không tìm thấy thông tin việc làm này.
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}
