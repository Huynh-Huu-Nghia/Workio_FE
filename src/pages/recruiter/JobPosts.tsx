import React from "react";
import { Briefcase, Calendar, Loader2, XCircle } from "lucide-react";
import {
  useDeleteRecruiterJobPostMutation,
  useRecruiterJobPostsQuery,
} from "@/api/recruiter.api";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";

const RecruiterJobPosts: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Tin tuyển dụng";
  const { data, isLoading, isError, refetch } = useRecruiterJobPostsQuery();
  const jobs = data?.data ?? [];
  const deleteMutation = useDeleteRecruiterJobPostMutation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
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
          </div>
          <Link
            to={path.RECRUITER_JOB_CREATE}
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            + Đăng tin mới
          </Link>
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
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Link
                      to={path.RECRUITER_JOB_EDIT.replace(":id", job.id)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Xóa tin tuyển dụng này?")) return;
                        try {
                          const res = await deleteMutation.mutateAsync(job.id);
                          if ((res as any)?.err === 0) {
                            await refetch();
                          } else {
                            window.alert((res as any)?.mes || "Xóa thất bại");
                          }
                        } catch (e: any) {
                          window.alert(e?.response?.data?.mes || "Xóa thất bại");
                        }
                      }}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold text-red-600 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                    <Link
                      to={`${path.RECRUITER_JOB_CANDIDATES}?job_post_id=${job.id}`}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Xem ứng viên
                    </Link>
                  </div>
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
