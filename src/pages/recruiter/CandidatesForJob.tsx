import React, { useState } from "react";
import { Users, Search } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import { useCandidatesOfJobQuery } from "@/api/recruiter.api";

const CandidatesForJob: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Ứng viên cho tin";
  const [jobId, setJobId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const { data, isFetching } = useCandidatesOfJobQuery(submittedId);
  const candidates = data?.data ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(jobId.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
            Gọi /recruiter/candidates-of-job-post với job_post_id.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="mb-4 flex flex-col gap-3 md:flex-row md:items-center"
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
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <Users className="h-5 w-5" />
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
  );
};

export default CandidatesForJob;
