import React, { useEffect, useState } from "react";
import { Lightbulb, Search } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminSuggestedCandidatesQuery } from "@/api/job-post.api";
import { useSearchParams } from "react-router-dom";

const AdminSuggestedCandidates: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [jobId, setJobId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const { data, isFetching } = useAdminSuggestedCandidatesQuery(submittedId);
  const candidates = data?.data ?? [];

  useEffect(() => {
    const jobPostId = searchParams.get("job_post_id") || "";
    if (!jobPostId) return;
    setJobId(jobPostId);
    setSubmittedId(jobPostId);
  }, [searchParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(jobId.trim());
  };

  return (
    <AdminLayout title="Gợi ý ứng viên" activeMenu="jobs">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Gợi ý ứng viên cho tin tuyển dụng
          </h1>
          <p className="text-sm text-gray-500">
            Nhập `job_post_id` để lấy danh sách ứng viên phù hợp.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Nhập job_post_id"
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Gợi ý
          </button>
        </form>

        <div className="p-5">
          {submittedId === "" ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Nhập job_post_id để xem gợi ý.
            </div>
          ) : (
            <div className="space-y-3">
              {isFetching && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {candidates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không có gợi ý.
                </div>
              ) : (
                candidates.map((c: any) => (
                  <div
                    key={c.candidate_id || c.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {c.full_name || "Chưa có tên"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Email: {c.email || c.user?.email || "—"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSuggestedCandidates;

