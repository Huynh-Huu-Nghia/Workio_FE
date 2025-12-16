import React, { useState } from "react";
import { Briefcase, Search } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminPostsOfCandidateQuery } from "@/api/job-post.api";

const CandidateJobs: React.FC = () => {
  const [candidateId, setCandidateId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const { data, isFetching } = useAdminPostsOfCandidateQuery(submittedId);
  const jobs = data?.data ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(candidateId.trim());
  };

  return (
    <AdminLayout title="Tin ứng viên đã ứng tuyển" activeMenu="candidates">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Tin ứng viên đã ứng tuyển
          </h1>
          <p className="text-sm text-gray-500">
            Gọi /admin/job-posts-of-candidate với candidate_id.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="Nhập candidate_id"
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
              Nhập candidate_id để xem danh sách.
            </div>
          ) : (
            <div className="space-y-3">
              {isFetching && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {jobs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không tìm thấy tin ứng tuyển.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {job.position}
                      </p>
                      <p className="text-xs text-gray-500">
                        Trạng thái: {job.status || "—"} | Hạn nộp:{" "}
                        {job.application_deadline_to || "—"}
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

export default CandidateJobs;
