import React, { useEffect, useMemo, useState } from "react";
import { Users, Search, CalendarPlus, Briefcase } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  useCandidatesOfJobQuery,
  useCreateRecruiterInterviewMutation,
  useRecruiterJobPostsQuery,
} from "@/api/recruiter.api";
import { toast } from "react-toastify";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import path from "@/constants/path";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa thiết lập";

const CandidatesForJob: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Ứng viên cho tin";
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get("job_post_id") || "";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [candidateSearch, setCandidateSearch] = useState("");

  const { data: jobsRes, isLoading: jobsLoading } = useRecruiterJobPostsQuery();
  const jobPosts = jobsRes?.data ?? [];

  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
      return;
    }
    if (!selectedJobId && jobPosts.length > 0) {
      setSelectedJobId(jobPosts[0].id);
    }
  }, [initialJobId, jobPosts, selectedJobId]);

  const { data, isFetching } = useCandidatesOfJobQuery(selectedJobId);
  const createInterview = useCreateRecruiterInterviewMutation();
  const candidates = data?.data ?? [];

  const filteredCandidates = useMemo(() => {
    if (!candidateSearch.trim()) return candidates;
    const q = candidateSearch.trim().toLowerCase();
    return candidates.filter((c: any) => {
      const haystack =
        `${c.full_name || ""} ${c.email || c.user?.email || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [candidates, candidateSearch]);

  const selectedJob = useMemo(
    () => jobPosts.find((job: any) => job.id === selectedJobId),
    [jobPosts, selectedJobId],
  );

  const handleCreateInterview = async (candidate: any) => {
    if (!selectedJobId) {
      toast.info("Vui lòng chọn tin tuyển dụng trước.");
      return;
    }
    const when = window.prompt(
      "Nhập thời gian phỏng vấn (YYYY-MM-DD HH:mm)",
      "",
    );
    if (!when) return;
    const locationInput =
      window.prompt("Địa điểm (Online/Offline)", "Online") || "Online";
    try {
      const res = await createInterview.mutateAsync({
        job_post_id: selectedJobId,
        payload: {
          candidate_id: candidate.candidate_id || candidate.id,
          scheduled_time: when,
          location: locationInput,
          interview_type: "Online",
          notes: "",
        },
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã tạo lịch phỏng vấn.");
      } else {
        toast.error((res as any)?.mes || "Tạo phỏng vấn thất bại.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Tạo phỏng vấn thất bại.");
    }
  };

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Chọn tin tuyển dụng
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Liệt kê ứng viên đã ứng tuyển
              </h2>
              <p className="text-sm text-gray-500">
                Hệ thống tự động lấy ứng viên dựa trên API
                `/recruiter/candidates-of-job-post`.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:min-w-[240px]"
              >
                <option value="">Chọn tin tuyển dụng</option>
                {jobPosts
                  .filter((job: any) => job.status !== "Đã tuyển")
                  .map((job: any) => (
                    <option key={job.id} value={job.id}>
                      {job.position} • {job.status || "Chưa rõ"}
                    </option>
                  ))}
              </select>
              <Link
                to={path.RECRUITER_JOB_CREATE}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                + Đăng tin mới
              </Link>
            </div>
          </div>

          {jobsLoading ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
              Đang tải danh sách tin...
            </div>
          ) : jobPosts.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
              Bạn chưa có tin tuyển dụng nào. Hãy tạo tin mới để xem danh sách
              ứng viên.
            </div>
          ) : selectedJob ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Trạng thái",
                  value: selectedJob.status || "Chưa rõ",
                },
                {
                  label: "Chỉ tiêu",
                  value: selectedJob.available_quantity ?? "—",
                },
                {
                  label: "Hạn nộp",
                  value: formatDate(selectedJob.application_deadline_to),
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Lọc ứng viên
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                Kết quả cho tin đang chọn
              </h3>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {!selectedJobId ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Hãy chọn một tin tuyển dụng để xem danh sách ứng viên.
            </div>
          ) : isFetching ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Đang tải danh sách ứng viên...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Chưa có ứng viên phù hợp.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredCandidates.map((candidate: any) => (
                <article
                  key={candidate.candidate_id || candidate.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {candidate.full_name || "Chưa cập nhật tên"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Email:{" "}
                          {candidate.email || candidate.user?.email || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {candidate.major && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-gray-700">
                          {candidate.major}
                        </span>
                      )}
                      {candidate.experience_years && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-gray-700">
                          {candidate.experience_years} năm KN
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCreateInterview(candidate)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <CalendarPlus className="h-4 w-4" /> Lên lịch phỏng vấn
                    </button>
                    <Link
                      to={`${path.RECRUITER_SUGGESTED_CANDIDATES}?job_post_id=${selectedJobId}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Briefcase className="h-4 w-4" /> Gợi ý thêm
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </RecruiterLayout>
  );
};

export default CandidatesForJob;
