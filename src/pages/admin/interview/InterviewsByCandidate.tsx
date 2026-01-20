import React, { useMemo, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminInterviewsOfCandidateQuery } from "@/api/interview.api";
import { useGetAllCandidatesQuery } from "@/api/candidate.api";

const InterviewsByCandidate: React.FC = () => {
  const [candidateId, setCandidateId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const { data, isFetching } = useAdminInterviewsOfCandidateQuery(submittedId);
  const interviews = data?.data ?? [];
  const { data: candidateRes } = useGetAllCandidatesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const candidates = (candidateRes as any)?.data || [];

  const filteredCandidates = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return candidates.filter(
      (c: any) =>
        c.full_name?.toLowerCase().includes(keyword) ||
        c.email?.toLowerCase().includes(keyword) ||
        c.phone?.includes(keyword) ||
        false,
    );
  }, [candidates, searchTerm]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(candidateId.trim());
  };

  return (
    <AdminLayout
      title="Lịch phỏng vấn theo ứng viên"
      activeMenu="jobs"
      fullWidth={true}
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Lịch PV theo ứng viên
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
                {c.full_name || "Chưa có tên"} —{" "}
                {c.email || c.phone || c.candidate_id}
              </option>
            ))}
          </select>
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
              Chọn ứng viên để xem lịch.
            </div>
          ) : (
            <div className="space-y-3">
              {isFetching && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {interviews.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không có lịch phỏng vấn.
                </div>
              ) : (
                interviews.map((itv) => (
                  <article
                    key={itv.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase text-gray-400">
                          Job: {itv.job_post_id || "—"}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-800">
                          Candidate: {itv.candidate_id || "—"}
                        </h3>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {itv.status || "Đang diễn ra"}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <CalendarClock className="h-4 w-4 text-gray-400" />
                      {formatDateTime(itv.scheduled_time)}
                    </p>
                    {itv.notes && (
                      <p className="text-sm text-gray-600">{itv.notes}</p>
                    )}
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        hour12: false,
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Chưa đặt lịch";

export default InterviewsByCandidate;
