import React from "react";
import { CalendarClock, Loader2, MapPin, XCircle } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useGetAdminInterviewsQuery } from "@/api/interview.api";

const InterviewList: React.FC = () => {
  const { data, isLoading, isError } = useGetAdminInterviewsQuery();
  const interviews = data?.data ?? [];

  return (
    <AdminLayout
      title="Lịch phỏng vấn"
      activeMenu="jobs"
      activeSubmenu="interviews"
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Tất cả lịch phỏng vấn
            </h1>
            <p className="text-sm text-gray-500">
            </p>
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
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải lịch phỏng vấn.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="divide-y divide-gray-100">
            {interviews.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Chưa có lịch phỏng vấn nào.
              </div>
            ) : (
              interviews.map((itv) => (
                <article
                  key={itv.id}
                  className="flex flex-col gap-2 p-5 hover:bg-orange-50/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Ứng viên: {itv.candidate_id}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Bài đăng: {itv.job_post_id || "N/A"}
                      </h3>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {itv.status || "Đang diễn ra"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-gray-400" />
                      {formatDateTime(itv.scheduled_time)}
                    </span>
                    {itv.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {itv.location}
                      </span>
                    )}
                    {itv.interview_type && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        {itv.interview_type}
                      </span>
                    )}
                  </div>
                  {itv.notes && (
                    <p className="text-sm text-gray-700">{itv.notes}</p>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const formatDateTime = (value?: string) => {
  if (!value) return "Chưa đặt lịch";
  return new Date(value).toLocaleString("vi-VN", {
    hour12: false,
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default InterviewList;
