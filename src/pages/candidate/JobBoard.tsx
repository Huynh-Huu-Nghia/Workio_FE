import React from "react";
import { Briefcase, Calendar, Loader2, MapPin, XCircle } from "lucide-react";
import { useCandidateJobPostsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";

const CandidateJobBoard: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc làm";
  const { data, isLoading, isError } = useCandidateJobPostsQuery();
  const jobs = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
            Đồng bộ với API /candidate/job-posts.
          </p>
          <div className="mt-3 flex gap-2 text-sm">
            <Link
              to="/candidate/jobs/applied"
              className="rounded-full bg-white px-3 py-1 font-semibold text-orange-600 shadow-sm border border-orange-100"
            >
              Việc đã ứng tuyển
            </Link>
            <Link
              to="/candidate/jobs/suggested"
              className="rounded-full bg-white px-3 py-1 font-semibold text-gray-700 shadow-sm border border-gray-200"
            >
              Việc làm gợi ý
            </Link>
          </div>
        </header>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải việc làm...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải danh sách việc làm.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có việc làm nào.
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {job.position}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Hình thức: {job.recruitment_type || "—"} | Trạng thái:{" "}
                          {job.status || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
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
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {job.requirements}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateJobBoard;
