import React, { useState } from "react";
import { Users, Search } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminCandidatesOfJobQuery } from "@/api/job-post.api";

const JobCandidates: React.FC = () => {
  const [jobId, setJobId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const { data, isFetching } = useAdminCandidatesOfJobQuery(submittedId);
  const candidates = data?.data ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(jobId.trim());
  };

  return (
    <AdminLayout title="Ứng viên của tin" activeMenu="jobs">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Ứng viên ứng tuyển tin
          </h1>
          <p className="text-sm text-gray-500">
            Gọi /admin/candidates-of-job-post với job_post_id.
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
            Tra cứu
          </button>
        </form>

        <div className="p-5">
          {submittedId === "" ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Nhập job_post_id để xem ứng viên.
            </div>
          ) : (
            <div className="space-y-3">
              {isFetching && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {candidates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không có ứng viên.
                </div>
              ) : (
                candidates.map((c: any) => (
                  <div
                    key={c.candidate_id || c.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {c.full_name || "Chưa có tên"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Email: {c.email || c.user?.email || "—"} | Phone:{" "}
                        {c.phone || "—"}
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

export default JobCandidates;
