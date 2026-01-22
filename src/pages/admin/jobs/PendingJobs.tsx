import React from "react";
import {
  AlertCircle,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  useGetAdminJobPostsQuery,
  useUpdateAdminJobPostMutation,
} from "@/api/job-post.api";
import { toast } from "react-toastify";
import {
  ADMIN_APPLICATION_FORM_DOC_URL,
  ADMIN_RECRUITMENT_NOTICE_PDF_URL,
} from "@/constants/documents";

const PendingJobs: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetAdminJobPostsQuery();
  const updateMutation = useUpdateAdminJobPostMutation();
  const jobs = data?.data ?? [];
  const pendingJobs = jobs.filter(
    (job) => !job.status || job.status === "Đang xem xét",
  );

  const handleApprove = (jobId: string) => {
    updateMutation.mutate(
      {
        jobPostId: jobId,
        payload: { status: "Đang mở" },
      },
      {
        onSuccess: () => {
          toast.success("Đã duyệt tin tuyển dụng thành công!");
          refetch();
        },
        onError: (error) => {
          toast.error("Có lỗi xảy ra khi duyệt tin tuyển dụng.");
          console.error("Error approving job:", error);
        },
      },
    );
  };

  const handleReject = (jobId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối tin tuyển dụng này?")) {
      updateMutation.mutate(
        {
          jobPostId: jobId,
          payload: { status: "Đã hủy" },
        },
        {
          onSuccess: () => {
            toast.success("Đã từ chối tin tuyển dụng!");
            refetch();
          },
          onError: (error) => {
            toast.error("Có lỗi xảy ra khi từ chối tin tuyển dụng.");
            console.error("Error rejecting job:", error);
          },
        },
      );
    }
  };

  return (
    <AdminLayout
      title="Tin chờ duyệt"
      activeMenu="jobs"
      activeSubmenu="pending-jobs"
      fullWidth={true}
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Tin tuyển dụng đang chờ xét duyệt
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={ADMIN_RECRUITMENT_NOTICE_PDF_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              title="Tải Thông báo tuyển dụng"
            >
              <Download className="h-4 w-4" />
              Thông báo tuyển dụng
            </a>
            <a
              href={ADMIN_APPLICATION_FORM_DOC_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              title="Tải Phiếu đăng ký dự tuyển"
            >
              <Download className="h-4 w-4" />
              Phiếu đăng ký dự tuyển
            </a>
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
            Không thể tải danh sách tin chờ duyệt.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {pendingJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Không có tin chờ duyệt.
              </div>
            ) : (
              pendingJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-gray-100 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs uppercase text-gray-400">
                        {job.recruitment_type || "Chưa đặt hình thức"}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {job.position}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Số lượng: {job.available_quantity ?? "—"} | Hạn nộp:{" "}
                        {job.application_deadline_to || "Chưa thiết lập"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                        Đang xem xét
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(job.id)}
                          disabled={updateMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                          title="Duyệt tin tuyển dụng"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(job.id)}
                          disabled={updateMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          title="Từ chối tin tuyển dụng"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                  {job.requirements && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {job.requirements}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PendingJobs;
