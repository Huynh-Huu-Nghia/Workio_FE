import React, { useEffect, useMemo, useState } from "react";
import { Lightbulb, Search } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminSuggestedJobsQuery } from "@/api/job-post.api";
import { useSearchParams } from "react-router-dom";
import { useGetAllCandidatesQuery } from "@/api/candidate.api";

const SuggestedJobs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [candidateId, setCandidateId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isFetching } = useAdminSuggestedJobsQuery(submittedId);
  const jobs = data?.data ?? [];
  const { data: candidateRes } = useGetAllCandidatesQuery();
  const candidates = (candidateRes as any)?.data || [];

  const filteredCandidates = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return candidates.filter(
      (c: any) =>
        c.full_name?.toLowerCase().includes(keyword) ||
        c.email?.toLowerCase().includes(keyword) ||
        c.phone?.includes(keyword) ||
        false
    );
  }, [candidates, searchTerm]);

  useEffect(() => {
    const candidateFromQuery = searchParams.get("candidate_id") || "";
    if (!candidateFromQuery) return;
    setCandidateId(candidateFromQuery);
    setSubmittedId(candidateFromQuery);
  }, [searchParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(candidateId.trim());
  };

  return (
    <AdminLayout title="Gợi ý việc làm" activeMenu="jobs">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Gợi ý việc làm cho ứng viên
          </h1>
          <p className="text-sm text-gray-500">
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên/email/sđt"
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <select
            value={candidateId}
            onChange={(e) => {
              setCandidateId(e.target.value);
              setSubmittedId(e.target.value);
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 md:max-w-xs bg-white"
          >
            <option value="">Chọn ứng viên</option>
            {filteredCandidates.map((c: any) => (
              <option key={c.candidate_id} value={c.candidate_id}>
                {c.full_name || "Chưa có tên"} — {c.email || c.phone || c.candidate_id}
              </option>
            ))}
          </select>
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
              Chọn ứng viên để xem gợi ý.
            </div>
          ) : (
            <div className="space-y-3">
              {isFetching && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {jobs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không có gợi ý.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {job.position}
                      </p>
                      <p className="text-xs text-gray-500">
                        Trạng thái: {job.status || "—"}
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

export default SuggestedJobs;
