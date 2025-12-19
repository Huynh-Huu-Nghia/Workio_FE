import React, { useState } from "react";
import { Briefcase, Calendar, ChevronDown } from "lucide-react";
import { useCandidateAppliedJobsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";

const CandidateAppliedJobs: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc đã ứng tuyển";
  const { data, isLoading, isError } = useCandidateAppliedJobsQuery();
  const apiErr = data && (data as any).err !== 0;
  const jobs = !apiErr ? data?.data ?? [] : [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-5xl">
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

        {!isLoading && !isError && apiErr && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center text-red-700">
            {(data as any)?.mes || "Không tải được danh sách đã ứng tuyển."}
          </div>
        )}

        {!isLoading && !isError && !apiErr && (
          <div className="space-y-3 px-4 py-2">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Bạn chưa ứng tuyển tin nào.
              </div>
            ) : (
              jobs.map((job) => {
                const expanded = expandedId === job.id;
                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
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
                            Trạng thái: {job.status || "—"}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Hạn nộp: {job.application_deadline_to || "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : job.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
                        />
                        Xem chi tiết
                      </button>
                    </div>
                    {expanded && (
                      <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        {(job.application_deadline_from || job.application_deadline_to) && (
                          <div>
                            <span className="font-semibold text-gray-800">Hạn ứng tuyển: </span>
                            {job.application_deadline_from || "—"} → {job.application_deadline_to || "—"}
                          </div>
                        )}
                        {job.duration && (
                          <div>
                            <span className="font-semibold text-gray-800">Thời lượng: </span>
                            {job.duration}
                          </div>
                        )}
                        {job.fields && (
                          <div>
                            <span className="font-semibold text-gray-800">Ngành nghề: </span>
                            {Array.isArray(job.fields) ? job.fields.join(", ") : job.fields}
                          </div>
                        )}
                        {job.monthly_salary && (
                          <div>
                            <span className="font-semibold text-gray-800">Mức lương: </span>
                            {job.monthly_salary}
                          </div>
                        )}
                        {job.available_quantity !== null && job.available_quantity !== undefined && (
                          <div>
                            <span className="font-semibold text-gray-800">Số lượng cần: </span>
                            {job.available_quantity}
                          </div>
                        )}
                        {job.other_requirements && (
                          <div>
                            <span className="font-semibold text-gray-800">Yêu cầu khác: </span>
                            {job.other_requirements}
                          </div>
                        )}
                        {job.benefits && (
                          <div>
                            <span className="font-semibold text-gray-800">Quyền lợi: </span>
                            {job.benefits}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

export default CandidateAppliedJobs;
