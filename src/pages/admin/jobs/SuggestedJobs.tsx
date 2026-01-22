import React, { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminSuggestedJobsQuery } from "@/api/job-post.api";
import { useSearchParams } from "react-router-dom";
import { useGetAllCandidatesQuery } from "@/api/candidate.api";

const SuggestedJobs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [candidateId, setCandidateId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const { data, isFetching } = useAdminSuggestedJobsQuery(submittedId);
  const { data: candidateRes } = useGetAllCandidatesQuery();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    const jobs = data?.data ?? [];
    const keyword = jobSearchTerm.toLowerCase();
    return jobs.filter(
      (job: any) =>
        job.position?.toLowerCase().includes(keyword) ||
        job.recruiter?.company_name?.toLowerCase().includes(keyword) ||
        job.job_type?.toLowerCase().includes(keyword) ||
        false,
    );
  }, [data, jobSearchTerm]);
  const filteredCandidates = useMemo(() => {
    const candidates = (candidateRes as any)?.data || [];
    // Always include the selected candidate if it's not already in the filtered list
    if (candidateId) {
      const selectedCandidate = candidates.find(
        (c: any) => c.candidate_id === candidateId,
      );
      if (selectedCandidate) {
        return [
          selectedCandidate,
          ...candidates.filter((c: any) => c.candidate_id !== candidateId),
        ];
      }
    }
    return candidates;
  }, [candidateRes, candidateId]);

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
    <AdminLayout title="Gợi ý việc làm" activeMenu="jobs" fullWidth={true}>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Gợi ý việc làm cho ứng viên
          </h1>
          <p className="text-sm text-gray-500"></p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              placeholder="Tìm theo loại công việc, vị trí, công ty..."
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
                {c.full_name || "Chưa có tên"} —{" "}
                {c.email || c.phone || c.candidate_id}
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
              {filteredJobs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không có gợi ý.
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-orange-50/40"
                      onClick={() =>
                        setExpandedJobId(
                          expandedJobId === job.id ? null : job.id,
                        )
                      }
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {job.position}
                        </p>
                        <p className="text-xs text-gray-500">
                          Trạng thái: {job.status || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {expandedJobId === job.id ? "Thu gọn" : "Chi tiết"}
                        </span>
                        {expandedJobId === job.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {expandedJobId === job.id && (
                      <div className="bg-gray-50 px-4 pb-4 border-t border-gray-100">
                        <div className="grid gap-3 pt-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm mb-2">
                                Thông tin công việc
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <strong>Vị trí:</strong> {job.position || "—"}
                                </p>
                                <p>
                                  <strong>Công ty:</strong>{" "}
                                  {job.recruiter?.company_name || "—"}
                                </p>
                                <p>
                                  <strong>Địa điểm:</strong>{" "}
                                  {job.ward?.name && job.province?.name ? (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {job.ward.name}, {job.province.name}
                                    </span>
                                  ) : job.province?.name ? (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {job.province.name}
                                    </span>
                                  ) : job.address?.province?.name ? (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {job.address.province.name}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </p>
                                <p>
                                  <strong>Loại công việc:</strong>{" "}
                                  {job.job_type || "—"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm mb-2">
                                Yêu cầu & Lương bổng
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <strong>Loại công việc:</strong>{" "}
                                  {job.job_type || "—"}
                                </p>
                                <p>
                                  <strong>Thời gian làm việc:</strong>{" "}
                                  {job.working_time || "—"}
                                </p>
                                <p>
                                  <strong>Lương:</strong>{" "}
                                  {job.monthly_salary ? (
                                    <span className="inline-flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      {typeof job.monthly_salary === "number"
                                        ? job.monthly_salary.toLocaleString()
                                        : job.monthly_salary}{" "}
                                      VND/tháng
                                    </span>
                                  ) : (
                                    "Thỏa thuận"
                                  )}
                                </p>
                                <p>
                                  <strong>Thời gian:</strong>{" "}
                                  {job.working_time ? (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {job.working_time}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          {job.requirements && (
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm mb-2">
                                Mô tả / Yêu cầu
                              </h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                {job.requirements}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
