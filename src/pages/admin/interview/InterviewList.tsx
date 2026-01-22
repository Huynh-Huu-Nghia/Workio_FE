import React, { useState } from "react";
import {
  CalendarClock,
  Loader2,
  MapPin,
  XCircle,
  Eye,
  ChevronUp,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useGetAdminInterviewsQuery } from "@/api/interview.api";

const InterviewList: React.FC = () => {
  const { data, isLoading, isError } = useGetAdminInterviewsQuery();
  const interviews = data?.data ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <AdminLayout
      title="Lịch phỏng vấn"
      activeMenu="jobs"
      activeSubmenu="interviews"
      fullWidth={true}
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Tất cả lịch phỏng vấn
            </h1>
            <p className="text-sm text-gray-500"></p>
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
                <article key={itv.id} className="divide-y divide-gray-100">
                  <div className="flex flex-col gap-2 p-5 hover:bg-orange-50/40">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs uppercase text-gray-400">
                          Ứng viên:{" "}
                          {itv.candidate?.full_name || itv.candidate_id}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {itv.job_post?.position ||
                            `Bài đăng: ${itv.job_post_id || "N/A"}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Công ty:{" "}
                          {itv.job_post?.recruiter?.company_name || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {itv.status || "Đang diễn ra"}
                        </span>
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === itv.id ? null : itv.id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          {expandedId === itv.id ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Thu gọn
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Chi tiết
                            </>
                          )}
                        </button>
                      </div>
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
                  </div>
                  {expandedId === itv.id && (
                    <div className="bg-gray-50 p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Thông tin ứng viên
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Họ tên:</strong>{" "}
                              {itv.candidate?.full_name || "—"}
                            </p>
                            <p>
                              <strong>ID:</strong> {itv.candidate_id}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Thông tin bài đăng
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Vị trí:</strong>{" "}
                              {itv.job_post?.position || "—"}
                            </p>
                            <p>
                              <strong>Công ty:</strong>{" "}
                              {itv.job_post?.recruiter?.company_name || "—"}
                            </p>
                            <p>
                              <strong>ID bài đăng:</strong> {itv.job_post_id}
                            </p>
                          </div>
                        </div>
                      </div>
                      {itv.notes && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Ghi chú
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {itv.notes}
                          </p>
                        </div>
                      )}
                    </div>
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
