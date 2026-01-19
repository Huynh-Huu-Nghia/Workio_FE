import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import {
  type AdminCandidateDetail,
  type CandidateTrainingRecord,
  useDeleteCandidateAdminMutation,
  useGetCandidateDetailAdminQuery,
} from "@/api/candidate.api";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Loader2, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const COURSE_STATUS_LABELS: Record<string, string> = {
  dang_hoc: "Đang học",
  da_hoc: "Đã hoàn thành",
};

const formatCourseDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

const getCourseStatusLabel = (status?: string | null) =>
  (status ? COURSE_STATUS_LABELS[status] : undefined) || "Đang cập nhật";

const getCourseBadgeClass = (status?: string | null) => {
  if (status === "da_hoc") return "bg-green-50 text-green-700";
  if (status === "dang_hoc") return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

interface CourseSectionProps {
  title: string;
  courses: CandidateTrainingRecord[];
}

const CourseSection = ({ title, courses }: CourseSectionProps) => {
  if (!courses?.length) return null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>{title}</span>
        <span className="text-gray-400">{courses.length} khóa</span>
      </div>
      <div className="grid gap-3">
        {courses.map((course) => {
          const status = course?.participation?.status;
          return (
            <div
              key={
                course?.course_id ||
                `${course?.course_name}-${course?.center_id}`
              }
              className="rounded-lg border border-gray-100 bg-slate-50 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {course?.course_name || "Khóa học chưa đặt tên"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {course?.center_name || "Chưa cập nhật trung tâm"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getCourseBadgeClass(
                    status,
                  )}`}
                >
                  {getCourseStatusLabel(status)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
                <div>
                  <span className="font-semibold text-gray-700">
                    Ngành đào tạo:
                  </span>{" "}
                  {course?.training_field || "—"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Thời gian:
                  </span>{" "}
                  {formatCourseDate(course?.start_date)} -{" "}
                  {formatCourseDate(course?.end_date)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Điểm danh:
                  </span>{" "}
                  {course?.participation?.attendance ?? "—"} buổi
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Học phí:</span>{" "}
                  {course?.participation?.tuition_confirmed
                    ? "Đã xác nhận"
                    : "Chưa xác nhận"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Ngày ký:</span>{" "}
                  {formatCourseDate(course?.participation?.signed_at)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Nghề đào tạo:
                  </span>{" "}
                  {course?.occupation_type || "—"}
                </div>
              </div>
              {course?.participation?.notes && (
                <p className="mt-2 rounded-lg bg-white/70 p-2 text-xs text-gray-600">
                  Ghi chú: {course.participation.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CandidateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useGetCandidateDetailAdminQuery(id);
  const deleteMutation = useDeleteCandidateAdminMutation();

  const candidate = apiResponse?.data as AdminCandidateDetail | undefined;
  const trainingHistory: CandidateTrainingRecord[] = Array.isArray(
    candidate?.training_history,
  )
    ? candidate.training_history
    : [];
  const ongoingCourses = trainingHistory.filter(
    (course) => course?.participation?.status === "dang_hoc",
  );
  const completedCourses = trainingHistory.filter(
    (course) => course?.participation?.status === "da_hoc",
  );
  const otherCourses = trainingHistory.filter((course) => {
    const status = course?.participation?.status ?? "";
    return !["dang_hoc", "da_hoc"].includes(status);
  });

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm("Bạn có chắc muốn xóa ứng viên này không?");
    if (!ok) return;

    try {
      const res = await deleteMutation.mutateAsync(id);
      if (res?.err === 0) {
        toast.info(res?.mes || "Đã xóa ứng viên.");
        await queryClient.invalidateQueries({ queryKey: ["candidates"] });
        navigate(path.ADMIN_USER_CANDIDATE_LIST);
        return;
      }
      toast.error(res?.mes || "Xóa thất bại.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  const handleBack = () => {
    const canUseHistory =
      typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    navigate(path.ADMIN_USER_CANDIDATE_LIST);
  };

  return (
    <AdminLayout
      title="CHI TIẾT ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="list-candidates"
    >
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Xóa ứng viên
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 size={40} className="animate-spin text-orange-500 mb-2" />
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
            Không thể tải chi tiết ứng viên. Vui lòng thử lại sau.
          </div>
        )}

        {!isLoading && !isError && apiResponse?.err !== 0 && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
            {apiResponse?.mes || "Không tìm thấy ứng viên."}
          </div>
        )}

        {!isLoading && !isError && candidate && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-1 rounded-xl border border-gray-200/60 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-bold text-lg border border-orange-100">
                  {candidate.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-800 truncate">
                    {candidate.full_name}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {candidate.candidate?.email || candidate.email || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">SĐT</span>
                  <span className="font-medium text-gray-800 truncate">
                    {candidate.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Xác thực</span>
                  <span className="font-medium text-gray-800">
                    {candidate.is_verified ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Việc làm</span>
                  <span className="font-medium text-gray-800">
                    {candidate.is_employed ? "Có" : "Tìm"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-5">
              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Địa chỉ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Đường</div>
                    <div className="font-medium text-gray-800">
                      {candidate.address?.street || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Phường/Xã</div>
                    <div className="font-medium text-gray-800">
                      {candidate.address?.ward ||
                        candidate.address?.ward_code ||
                        "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tỉnh/TP</div>
                    <div className="font-medium text-gray-800">
                      {candidate.address?.province_code || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Học vấn / Kinh nghiệm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800 mb-2">
                      Học vấn
                    </div>
                    {Array.isArray(candidate.study_history) &&
                    candidate.study_history.length > 0 ? (
                      <ul className="space-y-2">
                        {candidate.study_history.map((item: any) => (
                          <li
                            key={
                              item?.id ||
                              `${item?.school_name}-${item?.start_year}`
                            }
                            className="rounded-lg bg-slate-50 p-3 border border-gray-100"
                          >
                            <div className="font-medium text-gray-800">
                              {item?.school_name || "—"}
                            </div>
                            <div className="text-gray-600">
                              {item?.field_of_study || item?.major || "—"} •{" "}
                              {item?.start_date || item?.start_year || "—"} -{" "}
                              {item?.end_date || item?.end_year || "—"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">Chưa có dữ liệu.</div>
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-gray-800 mb-2">
                      Kinh nghiệm
                    </div>
                    {Array.isArray(candidate.work_experience) &&
                    candidate.work_experience.length > 0 ? (
                      <ul className="space-y-2">
                        {candidate.work_experience.map((item: any) => (
                          <li
                            key={
                              item?.id ||
                              `${item?.company_name}-${item?.start_date}`
                            }
                            className="rounded-lg bg-slate-50 p-3 border border-gray-100"
                          >
                            <div className="font-medium text-gray-800">
                              {item?.company_name || "—"}
                            </div>
                            <div className="text-gray-600">
                              {item?.position || "—"} •{" "}
                              {item?.start_date || "—"} -{" "}
                              {item?.end_date || "—"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">Chưa có dữ liệu.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Lộ trình đào tạo
                      </h3>
                      <p className="text-xs text-gray-500">
                        Theo dõi các khóa học đang theo học và đã hoàn thành
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    {trainingHistory.length} khóa
                  </span>
                </div>
                {trainingHistory.length === 0 ? (
                  <div className="mt-3 text-sm text-gray-500">
                    Chưa có dữ liệu khóa học.
                  </div>
                ) : (
                  <div className="mt-4 space-y-5">
                    <CourseSection
                      title="Khóa đang theo học"
                      courses={ongoingCourses}
                    />
                    <CourseSection
                      title="Khóa đã hoàn thành"
                      courses={completedCourses}
                    />
                    <CourseSection title="Khóa khác" courses={otherCourses} />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Lịch phỏng vấn
                </h3>
                {Array.isArray(candidate.interview) &&
                candidate.interview.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                          <th className="p-3">Thời gian</th>
                          <th className="p-3">Hình thức</th>
                          <th className="p-3">Vị trí</th>
                          <th className="p-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {candidate.interview.map((it: any) => (
                          <tr key={it?.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              {it?.scheduled_time
                                ? new Date(it.scheduled_time).toLocaleString()
                                : "—"}
                            </td>
                            <td className="p-3">{it?.interview_type || "—"}</td>
                            <td className="p-3">
                              {it?.job_post?.position || it?.location || "—"}
                            </td>
                            <td className="p-3">{it?.status || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Chưa có dữ liệu.</div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Tin đã ứng tuyển
                  </h3>
                  <span className="text-xs text-gray-500">
                    {candidate.applied_jobs?.length || 0} tin
                  </span>
                </div>
                {Array.isArray(candidate.applied_jobs) &&
                candidate.applied_jobs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                          <th className="p-3">Vị trí</th>
                          <th className="p-3">Nhà tuyển dụng</th>
                          <th className="p-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {candidate.applied_jobs.map((job: any) => (
                          <tr
                            key={job.job_post_id}
                            className="hover:bg-slate-50"
                          >
                            <td className="p-3 font-semibold text-gray-800">
                              {job.position || "—"}
                            </td>
                            <td className="p-3 text-gray-600">
                              {job.employer || "—"}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                {job.status || "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Chưa có dữ liệu.</div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Thông tin bổ sung
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-500">Ngành nghề mong muốn</div>
                    <div className="font-medium text-gray-800">
                      {Array.isArray(candidate.fields_wish)
                        ? candidate.fields_wish.join(", ")
                        : candidate.fields_wish || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Ngôn ngữ</div>
                    <div className="font-medium text-gray-800">
                      {Array.isArray(candidate.languguages)
                        ? candidate.languguages.join(", ")
                        : candidate.languguages || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Loại công việc</div>
                    <div className="font-medium text-gray-800">
                      {candidate.job_type || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Thời gian làm việc</div>
                    <div className="font-medium text-gray-800">
                      {candidate.working_time || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Xác thực</div>
                    <div className="font-medium text-gray-800">
                      {candidate.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Tình trạng việc làm</div>
                    <div className="font-medium text-gray-800">
                      {candidate.is_employed ? "Đã có việc" : "Đang tìm việc"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
