// File: src/pages/Recruiter/Interviews.tsx
import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  Loader2,
  MapPin,
  Search,
  Edit,
  Trash2,
  Globe,
} from "lucide-react";
import {
  useRecruiterInterviewsQuery,
  useRecruiterJobPostsQuery,
  useDeleteRecruiterInterviewMutation,
} from "@/api/recruiter.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { toast } from "react-toastify";
import EditInterviewModal from "./EditInterviewModal";

const statusColors: Record<string, string> = {
  "Đang diễn ra": "bg-amber-50 text-amber-700 border-amber-200",
  "Đã kết thúc": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Đã hủy": "bg-red-50 text-red-700 border-red-200",
};

const RecruiterInterviews: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Lịch phỏng vấn";

  // --- FIX LỖI DATE.NOW() ---
  // Lưu thời gian hiện tại vào state để đảm bảo pure render
  const [now] = useState(new Date().getTime());

  // Data
  const { data: interviewsRes, isLoading } = useRecruiterInterviewsQuery();
  const { data: jobsRes } = useRecruiterJobPostsQuery();
  const deleteMutation = useDeleteRecruiterInterviewMutation();

  const interviews = interviewsRes?.data ?? [];
  const jobPosts = jobsRes?.data ?? [];

  // Filters State
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    interview: any;
  }>({ isOpen: false, interview: null });

  // Map Job để lấy tên Job nhanh (nếu backend không trả về đủ deep include)
  const jobMap = useMemo(() => {
    return jobPosts.reduce((acc: Record<string, any>, job: any) => {
      acc[job.id] = job;
      return acc;
    }, {});
  }, [jobPosts]);

  // Logic Lọc
  const filteredInterviews = useMemo(() => {
    return interviews.filter((itv: any) => {
      // 1. Lọc theo Job
      if (jobFilter !== "all" && itv.job_post_id !== jobFilter) return false;

      // 2. Lọc theo Status (Enum: 'Đang diễn ra', 'Đã kết thúc')
      if (statusFilter !== "all" && itv.status !== statusFilter) return false;

      // 3. Tìm kiếm
      if (searchTerm.trim()) {
        const keyword = searchTerm.trim().toLowerCase();
        // Handle alias dữ liệu từ backend trả về
        const candidateName =
          itv.candidate?.full_name || itv.candidate?.candidate?.name || "";
        const candidateEmail =
          itv.candidate?.email || itv.candidate?.candidate?.email || "";
        const jobTitle =
          itv.job_post?.position || jobMap[itv.job_post_id]?.position || "";

        const haystack =
          `${candidateName} ${candidateEmail} ${jobTitle} ${itv.notes || ""}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [interviews, jobFilter, statusFilter, searchTerm, jobMap]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa lịch phỏng vấn này? Hành động này không thể hoàn tác.",
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Đã xóa lịch phỏng vấn");
    } catch (e) {
      console.error(e);
      toast.error("Xóa thất bại");
    }
  };

  // Handle Edit Check
  const handleEditClick = (itv: any) => {
    const scheduled = new Date(itv.scheduled_time).getTime();

    // Logic chặn sửa: Nếu đã quá hạn VÀ trạng thái là Đã kết thúc/Đã hủy
    if (
      scheduled < now &&
      (itv.status === "Đã kết thúc" || itv.status === "Đã hủy")
    ) {
      toast.info("Lịch phỏng vấn đã kết thúc, không thể chỉnh sửa.");
      return;
    }
    setEditModal({ isOpen: true, interview: itv });
  };

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        {/* Header Stats & Filter */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Danh sách lịch hẹn
              </h2>
              <p className="text-sm text-gray-500">
                Quản lý các cuộc phỏng vấn sắp tới và đã hoàn thành.
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tên, email, vị trí..."
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">Tất cả tin tuyển dụng</option>
              {jobPosts.map((job: any) => (
                <option key={job.id} value={job.id}>
                  {job.position}
                </option>
              ))}
            </select>

            {/* Bộ lọc Status khớp với DB */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
              {/* <option value="Đã hủy">Đã hủy</option> (Nếu DB có enum này) */}
            </select>
          </div>
        </section>

        {/* List */}
        <section>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-dashed">
              Chưa có lịch phỏng vấn nào phù hợp.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInterviews.map((itv: any) => {
                const candidateName =
                  itv.candidate?.full_name ||
                  itv.candidate?.candidate?.name ||
                  "Ứng viên ẩn";
                const candidateEmail =
                  itv.candidate?.email || itv.candidate?.candidate?.email || "";
                const jobTitle =
                  itv.job_post?.position ||
                  jobMap[itv.job_post_id]?.position ||
                  "---";

                // Check expire dùng biến 'now' từ state (Safe for render)
                const scheduledTime = new Date(itv.scheduled_time).getTime();
                const isExpired = scheduledTime < now;

                return (
                  <div
                    key={itv.id}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {candidateName}
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({candidateEmail})
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[itv.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {itv.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        Vị trí:{" "}
                        <span className="text-orange-600">{jobTitle}</span>
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarClock size={16} />
                          {new Date(itv.scheduled_time).toLocaleString(
                            "vi-VN",
                            { dateStyle: "medium", timeStyle: "short" },
                          )}
                          {isExpired && itv.status === "Đang diễn ra" && (
                            <span className="text-red-500 text-xs font-bold ml-1">
                              (Quá hạn)
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          {itv.interview_type === "Online" ? (
                            <Globe size={16} />
                          ) : (
                            <MapPin size={16} />
                          )}
                          {itv.interview_type === "Online" ? (
                            <a
                              href={itv.location}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline truncate max-w-[200px]"
                            >
                              {itv.location || "Link Online"}
                            </a>
                          ) : (
                            itv.location
                          )}
                        </span>
                      </div>
                      {itv.notes && (
                        <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-2 mt-2">
                          {itv.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleEditClick(itv)}
                        className={`p-2 rounded-lg border transition ${isExpired && itv.status === "Đã kết thúc" ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-blue-600 border-blue-100 hover:bg-blue-50"}`}
                        title="Chỉnh sửa"
                        disabled={isExpired && itv.status === "Đã kết thúc"}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(itv.id)}
                        className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Edit Modal */}
        <EditInterviewModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, interview: null })}
          interview={editModal.interview}
        />
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterInterviews;
