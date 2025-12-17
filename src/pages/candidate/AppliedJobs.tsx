import React from "react";
import { Briefcase, Calendar } from "lucide-react";
import { useCandidateAppliedJobsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";

const CandidateAppliedJobs: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc đã ứng tuyển";
  const { data, isLoading, isError } = useCandidateAppliedJobsQuery();
  const jobs = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
            Danh sách các tin tuyển dụng bạn đã nộp đơn/ứng tuyển để được tuyển.
          </p>
        </header>

        {isLoading && (
          <div className="text-center text-gray-500">Đang tải...</div>
        )}
        {isError && (
          <div className="text-center text-red-500">
            Không thể tải danh sách.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có việc nào đã ứng tuyển.
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {job.position}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Trạng thái: {job.status || "—"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Hạn nộp: {job.application_deadline_to || "—"}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateAppliedJobs;
