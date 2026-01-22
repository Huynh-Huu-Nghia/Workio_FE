import React, { useMemo, useState } from "react";
import { CalendarClock, Search, Eye, ChevronUp, MapPin } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminInterviewsOfCandidateQuery } from "@/api/interview.api";
import { useGetAllCandidatesQuery } from "@/api/candidate.api";

const InterviewsByCandidate: React.FC = () => {
  const [candidateId, setCandidateId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const { data, isFetching, error, isError } =
    useAdminInterviewsOfCandidateQuery(submittedId);
  const interviews = data?.data ?? [];
  const {
    data: candidateRes,
    isLoading: candidatesLoading,
    isError: candidatesIsError,
  } = useGetAllCandidatesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [interviewSearchTerm, setInterviewSearchTerm] = useState("");

  const filteredInterviews = useMemo(() => {
    const interviews = data?.data ?? [];
    const keyword = interviewSearchTerm.toLowerCase();
    return interviews.filter(
      (itv: any) =>
        itv.job_post?.position?.toLowerCase().includes(keyword) ||
        itv.job_post?.recruiter?.company_name
          ?.toLowerCase()
          .includes(keyword) ||
        itv.candidate?.full_name?.toLowerCase().includes(keyword) ||
        itv.status?.toLowerCase().includes(keyword) ||
        itv.location?.toLowerCase().includes(keyword) ||
        false,
    );
  }, [data, interviewSearchTerm]);

  const filteredCandidates = useMemo(() => {
    const candidates = (candidateRes as any)?.data || [];
    const keyword = searchTerm.toLowerCase();
    let filtered = candidates.filter(
      (c: any) =>
        c.full_name?.toLowerCase().includes(keyword) ||
        c.email?.toLowerCase().includes(keyword) ||
        c.phone?.includes(keyword) ||
        false,
    );
    // Always include the selected candidate if it's not already in the filtered list
    if (candidateId) {
      const selectedCandidate = candidates.find(
        (c: any) => (c.candidate_id || c.id) === candidateId,
      );
      if (
        selectedCandidate &&
        !filtered.find((c: any) => (c.candidate_id || c.id) === candidateId)
      ) {
        filtered = [selectedCandidate, ...filtered];
      }
    }
    return filtered;
  }, [candidateRes, searchTerm, candidateId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    let idToUse = candidateId;
    if (!idToUse && searchTerm.trim()) {
      // find candidate by partial match on name, email, or phone
      const candidates = (candidateRes as any)?.data || [];
      const keyword = searchTerm.toLowerCase().trim();
      const matches = candidates.filter(
        (c: any) =>
          c.full_name?.toLowerCase().includes(keyword) ||
          c.email?.toLowerCase().includes(keyword) ||
          c.phone?.includes(keyword),
      );
      if (matches.length > 0) {
        // Use the first match
        idToUse = matches[0].candidate_id || matches[0].id;
        setCandidateId(idToUse); // to select in dropdown
      } else {
        setSearchError("Không tìm thấy ứng viên nào khớp với từ khóa tìm kiếm");
        return;
      }
    }
    if (idToUse) {
      setSubmittedId(idToUse);
    } else {
      setSearchError("Vui lòng nhập tên, email hoặc số điện thoại ứng viên");
    }
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
              placeholder="Nhập tên, email hoặc số điện thoại ứng viên..."
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            {searchError && (
              <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs">
                {searchError}
              </div>
            )}
          </div>
          <div className="relative">
            {candidatesIsError && (
              <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs">
                Lỗi tải danh sách ứng viên
              </div>
            )}
            <select
              value={candidateId}
              onChange={(e) => {
                setCandidateId(e.target.value);
                setSubmittedId(e.target.value);
                setSearchError(null);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 md:max-w-xs bg-white"
              disabled={candidatesLoading}
            >
              <option value="">
                {candidatesLoading ? "Đang tải..." : "Chọn ứng viên"}
              </option>
              {filteredCandidates.map((c: any) => (
                <option
                  key={c.candidate_id || c.id}
                  value={c.candidate_id || c.id}
                >
                  {c.full_name || "Chưa có tên"} —{" "}
                  {c.email || c.phone || c.candidate_id || c.id}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            disabled={candidatesLoading}
          >
            Tìm kiếm
          </button>
        </form>
        {searchError && (
          <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {searchError}
          </div>
        )}

        <div className="p-5">
          {submittedId === "" ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Chọn ứng viên để xem lịch.
            </div>
          ) : (
            <div className="space-y-3">
              {isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  <p className="font-semibold">Lỗi tải dữ liệu</p>
                  <p className="text-sm">
                    {(error as any)?.message ||
                      "Không thể tải lịch phỏng vấn. Vui lòng thử lại."}
                  </p>
                </div>
              )}
              {isFetching && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {!isError && interviews.length > 0 && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={interviewSearchTerm}
                      onChange={(e) => setInterviewSearchTerm(e.target.value)}
                      placeholder="Tìm theo vị trí, công ty, trạng thái..."
                      className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              )}
              {!isError &&
              filteredInterviews.length === 0 &&
              interviewSearchTerm ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không tìm thấy lịch phỏng vấn nào khớp với từ khóa "
                  {interviewSearchTerm}".
                </div>
              ) : !isError && filteredInterviews.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  Không có lịch phỏng vấn.
                </div>
              ) : (
                filteredInterviews.map((itv) => (
                  <article key={itv.id} className="divide-y divide-gray-100">
                    <div className="flex flex-col gap-2 p-5 hover:bg-orange-50/40">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs uppercase text-gray-400">
                            Ứng viên:{" "}
                            {itv.candidate?.full_name || itv.candidate_id}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {itv.job_post?.position ||
                              `Bài đăng: ${itv.job_post_id || "N/A"}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Công ty:{" "}
                            {itv.job_post?.recruiter?.company_name || "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {itv.status || "Đang diễn ra"}
                          </span>
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === itv.id ? null : itv.id,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            {expandedId === itv.id ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Thu gọn
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Chi tiết
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-gray-400" />
                          {formatDateTime(itv.scheduled_time)}
                        </span>
                        {itv.location && (
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {itv.location}
                          </span>
                        )}
                        {itv.interview_type && (
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                            {itv.interview_type}
                          </span>
                        )}
                      </div>
                    </div>
                    {expandedId === itv.id && (
                      <div className="bg-gray-50 p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Thông tin ứng viên
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <strong>Họ tên:</strong>{" "}
                                {itv.candidate?.full_name || "—"}
                              </p>
                              <p>
                                <strong>ID:</strong> {itv.candidate_id}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Thông tin bài đăng
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <strong>Vị trí:</strong>{" "}
                                {itv.job_post?.position || "—"}
                              </p>
                              <p>
                                <strong>Công ty:</strong>{" "}
                                {itv.job_post?.recruiter?.company_name || "—"}
                              </p>
                              <p>
                                <strong>ID bài đăng:</strong> {itv.job_post_id}
                              </p>
                            </div>
                          </div>
                        </div>
                        {itv.notes && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Ghi chú
                            </h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                              {itv.notes}
                            </p>
                          </div>
                        )}
                      </div>
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
