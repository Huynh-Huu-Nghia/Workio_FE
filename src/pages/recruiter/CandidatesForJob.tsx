import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  CalendarPlus,
  Briefcase,
  Mail,
  Phone,
  Loader2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  useCandidatesOfJobQuery,
  useRecruiterJobPostsQuery,
} from "@/api/recruiter.api";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import path from "@/constants/path";
import CreateInterviewModal from "./CreateInterviewModal";
import CandidateDetailModal from "./CandidateDetailModal";

const CandidatesForJob: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Ứng viên cho tin";
  const [searchParams, setSearchParams] = useSearchParams();

  const initialJobId = searchParams.get("job_post_id") || "";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [candidateSearch, setCandidateSearch] = useState("");

  // State Modal Phỏng vấn
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
  }>({ isOpen: false, candidateId: "", candidateName: "" });

  // State Modal Chi tiết
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    candidate: any;
  }>({ isOpen: false, candidate: null });

  const { data: jobsRes, isLoading: jobsLoading } = useRecruiterJobPostsQuery();
  const jobPosts = Array.isArray(jobsRes?.data) ? jobsRes.data : [];

  // --- LOGIC CHECK TRẠNG THÁI JOB ---
  const currentJob = jobPosts.find((j: any) => j.id === selectedJobId);

  // Điều kiện 1: Job phải active (Không Hủy, Không Đã tuyển/Đóng)
  const isJobActive =
    currentJob &&
    currentJob.status !== "Đã hủy" &&
    currentJob.status !== "Đã tuyển"; // Hoặc "Đã kết thúc" tùy ENUM DB của bạn

  // Điều kiện 2: Job phải thuộc loại "Phỏng vấn"
  const isInterviewType =
    currentJob && currentJob.recruitment_type === "Phỏng vấn";

  // Tổng hợp điều kiện cho Job
  const canCreateInterviewForJob = isJobActive && isInterviewType;

  useEffect(() => {
    if (!selectedJobId && jobPosts.length > 0) {
      const firstId = jobPosts[0].id;
      setSelectedJobId(firstId);
      setSearchParams({ job_post_id: firstId }, { replace: true });
    }
  }, [jobPosts, selectedJobId, setSearchParams]);

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedJobId(newId);
    setSearchParams({ job_post_id: newId });
  };

  const {
    data: candidatesRes,
    isFetching: candidatesLoading,
    refetch,
  } = useCandidatesOfJobQuery(selectedJobId);
  const candidates = Array.isArray(candidatesRes?.data)
    ? candidatesRes.data
    : [];

  const filteredCandidates = candidates.filter(
    (c: any) =>
      (c.full_name || "")
        .toLowerCase()
        .includes(candidateSearch.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(candidateSearch.toLowerCase()),
  );

  const handleOpenInterviewModal = (candidate: any) => {
    setModalData({
      isOpen: true,
      candidateId: candidate.candidate_id || candidate.id,
      candidateName: candidate.full_name,
    });
  };

  const handleViewDetail = (candidate: any) => {
    setDetailModal({ isOpen: true, candidate: candidate });
  };

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">
                Quản lý hồ sơ ứng viên đã nộp đơn.
              </p>
            </div>
            <div className="w-full md:w-72">
              <select
                value={selectedJobId}
                onChange={handleJobChange}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-orange-500 focus:outline-none"
                disabled={jobsLoading}
              >
                {jobsLoading ? (
                  <option>Đang tải tin...</option>
                ) : jobPosts.length === 0 ? (
                  <option value="">Chưa có tin nào</option>
                ) : (
                  jobPosts.map((job: any) => (
                    <option key={job.id} value={job.id}>
                      {job.position} {job.status === "Đã hủy" ? "(Đã hủy)" : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          {selectedJobId && (
            <div className="mt-4 flex items-center justify-end">
              <Link
                to={`${path.RECRUITER_SUGGESTED_CANDIDATES}?job_post_id=${selectedJobId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <Briefcase size={16} /> Gợi ý thêm ứng viên phù hợp
              </Link>
            </div>
          )}
        </section>

        <section className="min-h-[400px]">
          {!selectedJobId ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-500">
              <Briefcase size={48} className="mb-2 opacity-50" />
              <p>Vui lòng chọn một tin tuyển dụng.</p>
            </div>
          ) : candidatesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-500">
              <Users size={48} className="mb-2 opacity-50" />
              <p>Chưa có ứng viên nào ứng tuyển vào vị trí này.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <Search size={18} className="text-gray-400" />
                <input
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="flex-1 outline-none text-sm"
                />
              </div>

              {/* Cảnh báo nếu Job không thể tạo Interview */}
              {!canCreateInterviewForJob && (
                <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 flex items-center gap-2 border border-amber-100">
                  <AlertCircle size={16} />
                  Tin tuyển dụng này đã đóng hoặc không thuộc loại "Phỏng vấn".
                  Chức năng hẹn lịch bị khóa.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCandidates.map((candidate: any) => {
                  // --- LOGIC MỚI: Check từng ứng viên ---
                  // candidate.interview_status được trả về từ Backend (JobPostRepository)
                  // Nếu có giá trị (vd: "Đang diễn ra", "Đã kết thúc") => Đã có lịch
                  const hasInterview = Boolean(candidate.interview_status);

                  // Nút chỉ active khi: Job OK VÀ Ứng viên chưa có lịch
                  const isButtonEnabled =
                    canCreateInterviewForJob && !hasInterview;

                  return (
                    <article
                      key={candidate.id}
                      className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600 shrink-0">
                            {candidate.avatar_url ? (
                              <img
                                src={candidate.avatar_url}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              (candidate.full_name || "U")
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="truncate text-lg font-bold text-gray-900"
                              title={candidate.full_name}
                            >
                              {candidate.full_name}
                            </h3>
                            <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1 truncate">
                                <Mail size={12} /> {candidate.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone size={12} /> {candidate.phone || "---"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
                            Đã nộp hồ sơ
                          </span>
                          {candidate.major && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                              {candidate.major}
                            </span>
                          )}
                          {/* Hiển thị badge trạng thái nếu đã có lịch */}
                          {hasInterview && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700 border border-emerald-100">
                              {candidate.interview_status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-gray-50 pt-4 flex gap-2">
                        <button
                          onClick={() => handleViewDetail(candidate)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Eye size={16} /> Chi tiết
                        </button>

                        <button
                          onClick={() => handleOpenInterviewModal(candidate)}
                          disabled={!isButtonEnabled}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition shadow-sm ${
                            isButtonEnabled
                              ? "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          }`}
                        >
                          <CalendarPlus size={16} />
                          {hasInterview ? "Đã hẹn lịch" : "Phỏng vấn"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* --- MODAL TẠO LỊCH --- */}
        <CreateInterviewModal
          isOpen={modalData.isOpen}
          onClose={() => setModalData({ ...modalData, isOpen: false })}
          jobPostId={selectedJobId}
          candidateId={modalData.candidateId}
          candidateName={modalData.candidateName}
          onSuccess={() => {
            // Refetch để cập nhật lại trạng thái nút (Disable nút vừa tạo)
            refetch();
          }}
        />

        {/* --- MODAL CHI TIẾT --- */}
        <CandidateDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ ...detailModal, isOpen: false })}
          candidate={detailModal.candidate}
        />
      </div>
    </RecruiterLayout>
  );
};

export default CandidatesForJob;
