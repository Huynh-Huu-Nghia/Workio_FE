import React from "react";
import { Briefcase, Calendar, Loader2, XCircle } from "lucide-react";
import { useRecruiterJobPostsQuery } from "@/api/recruiter.api";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";

const RecruiterJobPosts: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Tin tuyển dụng";
  const { data, isLoading, isError } = useRecruiterJobPostsQuery();
  const jobs = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Link
              to="/recruiter/jobs/candidates"
              className="rounded-full bg-white px-3 py-1 font-semibold text-orange-600 shadow-sm border border-orange-100"
            >
              Ứng viên cho tin
            </Link>
          </div>
        </header>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải tin đăng...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải tin đăng.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có tin đăng nào.
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                          Trạng thái: {job.status || "—"} | SL cần:{" "}
                          {job.available_quantity ?? "—"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {job.recruitment_type || "Không rõ"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Hạn nộp: {job.application_deadline_to || "Chưa thiết lập"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      Hình thức: {job.working_time || "—"}
                    </span>
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

export default RecruiterJobPosts;
