import React from "react";
import { CalendarClock, Loader2, MapPin, XCircle } from "lucide-react";
import { useCandidateInterviewsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";

const CandidateInterviews: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Lịch phỏng vấn";
  const { data, isLoading, isError } = useCandidateInterviewsQuery();
  const interviews = data?.data ?? [];

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-5xl">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </header>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải lịch...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải lịch phỏng vấn.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {interviews.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có lịch phỏng vấn nào.
              </div>
            ) : (
              interviews.map((itv: any) => (
                <article
                  key={itv.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Bài đăng: {itv.job_post_id || "—"}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Lịch phỏng vấn
                      </h3>
                      {itv.notes && (
                        <p className="text-sm text-gray-600">{itv.notes}</p>
                      )}
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {itv.status || "Đang diễn ra"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
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
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        hour12: false,
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Chưa đặt lịch";

export default CandidateInterviews;
