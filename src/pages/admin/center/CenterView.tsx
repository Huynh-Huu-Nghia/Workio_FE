import { useMemo, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import {
  useAdminCenterCoursesQuery,
  useAdminCenterDetailQuery,
} from "@/api/center.api";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpDown,
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";

const STUDENT_STATUS = {
  PENDING: "cho_duyet",
  LEARNING: "dang_hoc",
  COMPLETED: "da_hoc",
  REJECTED: "tu_choi",
} as const;

type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];
type StatusKey = StudentStatus | "default";
type CourseSortKey =
  | "students_desc"
  | "students_asc"
  | "name_asc"
  | "name_desc";
type StudentSortKey = "recent" | "oldest" | "name";
type StudentFilterValue = StudentStatus | "all";

const STUDENT_STATUS_META: Record<
  StatusKey,
  { label: string; tone: string; description: string }
> = {
  cho_duyet: {
    label: "Chờ duyệt",
    tone: "bg-amber-50 text-amber-700",
    description: "Ứng viên đang chờ trung tâm xác nhận.",
  },
  dang_hoc: {
    label: "Đang học",
    tone: "bg-blue-50 text-blue-700",
    description: "Ứng viên đang tham gia khóa học.",
  },
  da_hoc: {
    label: "Đã hoàn thành",
    tone: "bg-emerald-50 text-emerald-700",
    description: "Ứng viên đã hoàn thành khóa học.",
  },
  tu_choi: {
    label: "Đã từ chối",
    tone: "bg-rose-50 text-rose-700",
    description: "Ứng viên bị từ chối hoặc đã rút đăng ký.",
  },
  default: {
    label: "Khác",
    tone: "bg-gray-100 text-gray-600",
    description: "Trạng thái chưa xác định.",
  },
};

const STATUS_SORT_ORDER: Record<StatusKey, number> = {
  cho_duyet: 0,
  dang_hoc: 1,
  da_hoc: 2,
  tu_choi: 3,
  default: 4,
};

const COURSE_SORT_OPTIONS: { value: CourseSortKey; label: string }[] = [
  { value: "students_desc", label: "Học viên nhiều → ít" },
  { value: "students_asc", label: "Học viên ít → nhiều" },
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
];

const STUDENT_SORT_OPTIONS: { value: StudentSortKey; label: string }[] = [
  { value: "recent", label: "Mới cập nhật" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name", label: "Tên A → Z" },
];

const STUDENT_FILTER_OPTIONS: { value: StudentFilterValue; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  {
    value: STUDENT_STATUS.PENDING,
    label: STUDENT_STATUS_META[STUDENT_STATUS.PENDING].label,
  },
  {
    value: STUDENT_STATUS.LEARNING,
    label: STUDENT_STATUS_META[STUDENT_STATUS.LEARNING].label,
  },
  {
    value: STUDENT_STATUS.COMPLETED,
    label: STUDENT_STATUS_META[STUDENT_STATUS.COMPLETED].label,
  },
  {
    value: STUDENT_STATUS.REJECTED,
    label: STUDENT_STATUS_META[STUDENT_STATUS.REJECTED].label,
  },
];

const normalizeStatus = (status?: string | null): StatusKey => {
  const normalized = (status || "").toLowerCase();
  return STUDENT_STATUS_META[normalized as StatusKey]
    ? (normalized as StatusKey)
    : "default";
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa cập nhật";

const getCandidateName = (student: any) =>
  student?.candidate?.full_name ||
  student?.candidate?.name ||
  student?.name ||
  student?.candidate_name ||
  "Học viên chưa cập nhật";

const getCandidateContacts = (student: any) => {
  const email = student?.candidate?.email || student?.email || null;
  const phone = student?.candidate?.phone || student?.phone || null;
  return { email, phone };
};

const getCourseCandidates = (course?: any) =>
  Array.isArray(course?.candidates) ? (course.candidates as any[]) : [];

const getStudentCount = (course?: any) => getCourseCandidates(course).length;

const getRequestedTimestamp = (student: any) =>
  student?.requested_at ? new Date(student.requested_at).getTime() : 0;

const summarizeCourse = (course: any) => {
  const students = getCourseCandidates(course);
  return students.reduce(
    (summary, student) => {
      const status = normalizeStatus(student.status);
      if (status === STUDENT_STATUS.PENDING) summary.pending += 1;
      else if (status === STUDENT_STATUS.LEARNING) summary.learning += 1;
      else if (status === STUDENT_STATUS.COMPLETED) summary.completed += 1;
      else if (status === STUDENT_STATUS.REJECTED) summary.rejected += 1;
      return summary;
    },
    { pending: 0, learning: 0, completed: 0, rejected: 0 },
  );
};

export default function CenterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminCenterDetailQuery(id);
  const {
    data: coursesRes,
    isLoading: loadingCourses,
    isError: errorCourses,
  } = useAdminCenterCoursesQuery(id);
  const center = data?.data as any;
  const courses = coursesRes?.data ?? [];
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSort, setCourseSort] = useState<CourseSortKey>("students_desc");
  const [studentStatusFilter, setStudentStatusFilter] =
    useState<StudentFilterValue>("all");
  const [studentSort, setStudentSort] = useState<StudentSortKey>("recent");
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<any | null>(
    null,
  );
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
    course: any;
    student: any;
  } | null>(null);
  const hasCourses = courses.length > 0;

  const filteredCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();
    const filtered = courses.filter((course: any) => {
      if (!keyword) return true;
      const name = (course?.name || "").toLowerCase();
      const description = (course?.description || "").toLowerCase();
      return name.includes(keyword) || description.includes(keyword);
    });

    return filtered.sort((a: any, b: any) => {
      if (courseSort === "students_desc") {
        return getStudentCount(b) - getStudentCount(a);
      }
      if (courseSort === "students_asc") {
        return getStudentCount(a) - getStudentCount(b);
      }
      const nameA = (a?.name || "").toLowerCase();
      const nameB = (b?.name || "").toLowerCase();
      const comparison = nameA.localeCompare(nameB, "vi", {
        sensitivity: "base",
      });
      return courseSort === "name_desc" ? -comparison : comparison;
    });
  }, [courses, courseSearch, courseSort]);

  const handleOpenCourseDetail = (course: any) => {
    setSelectedCourseDetail(course);
    setStudentStatusFilter("all");
    setStudentSort("recent");
    setSelectedStudentDetail(null);
  };

  const handleCloseCourseDetail = () => {
    setSelectedCourseDetail(null);
    setSelectedStudentDetail(null);
  };

  const handleOpenStudentDetail = (course: any, student: any) => {
    setSelectedStudentDetail({ course, student });
  };

  const handleCloseStudentDetail = () => setSelectedStudentDetail(null);

  const handleBack = () => {
    const canUseHistory =
      typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    navigate(path.ADMIN_CENTER_LIST);
  };

  const renderStudentDetailModal = () => {
    if (!selectedStudentDetail) return null;
    const { course: selectedCourse, student } = selectedStudentDetail;
    const statusKey = normalizeStatus(student?.status);
    const meta = STUDENT_STATUS_META[statusKey];
    const { email, phone } = getCandidateContacts(student);
    const requestedAt = formatDateTime(student?.requested_at);
    const signedAt = student?.signed_at
      ? formatDateTime(student.signed_at)
      : null;
    const attendanceValue =
      typeof student?.attendance === "number"
        ? `${Math.max(0, Math.min(100, student.attendance))}%`
        : "Chưa cập nhật";
    const name = getCandidateName(student);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Chi tiết học viên
              </p>
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">
                Thuộc khóa học: {selectedCourse?.name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseStudentDetail}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Trạng thái
              </p>
              <p
                className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}
              >
                {meta.label}
              </p>
              <p className="mt-1 text-xs text-gray-500">{meta.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Email
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {email || "Chưa cập nhật"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Điện thoại
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {phone || "Chưa cập nhật"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Gửi yêu cầu
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {requestedAt}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Ngày ký cam kết
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {signedAt || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Điểm danh
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {attendanceValue}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Học phí
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {student?.tuition_confirmed ? "Đã xác nhận" : "Chưa xác nhận"}
                </p>
              </div>
            </div>

            {student?.notes && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Ghi chú
                </p>
                <p className="mt-1 text-sm text-gray-700">{student.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCourseDetailPanel = () => {
    if (!selectedCourseDetail) return null;
    const students = getCourseCandidates(selectedCourseDetail);
    const summary = summarizeCourse(selectedCourseDetail);
    const filteredStudents = students
      .filter((student) =>
        studentStatusFilter === "all"
          ? true
          : normalizeStatus(student.status) === studentStatusFilter,
      )
      .sort((a, b) => {
        if (studentSort === "recent") {
          return getRequestedTimestamp(b) - getRequestedTimestamp(a);
        }
        if (studentSort === "oldest") {
          return getRequestedTimestamp(a) - getRequestedTimestamp(b);
        }
        if (studentSort === "name") {
          const compare = getCandidateName(a).localeCompare(
            getCandidateName(b),
            "vi",
            {
              sensitivity: "base",
            },
          );
          if (compare !== 0) return compare;
        }
        return (
          STATUS_SORT_ORDER[normalizeStatus(a.status)] -
          STATUS_SORT_ORDER[normalizeStatus(b.status)]
        );
      });

    return (
      <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-slate-900/40 p-0 sm:p-4">
        <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-3xl">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">
                Chi tiết khóa học
              </p>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedCourseDetail?.name || "Chưa đặt tên"}
              </h3>
              {selectedCourseDetail?.description && (
                <p className="text-sm text-gray-500">
                  {selectedCourseDetail.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCloseCourseDetail}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {center && (
              <div className="rounded-2xl border border-gray-200/70 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 text-lg font-bold text-blue-700">
                    {center.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {center.name || "Chưa cập nhật"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {center.center?.email || center.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <div className="text-gray-500">Điện thoại</div>
                    <div className="font-semibold text-gray-800">
                      {center.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Website</div>
                    <div className="font-semibold text-gray-800">
                      {center.website || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trạng thái</div>
                    <div className="font-semibold text-gray-800">
                      {center.is_active ? "Hoạt động" : "Đang khóa"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Địa chỉ</div>
                    <div className="font-semibold text-gray-800">
                      {[
                        center.address?.street,
                        center.address?.ward_code,
                        center.address?.province_code,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-orange-600">
                    Thời gian
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedCourseDetail?.start_date || "—"} →{" "}
                    {selectedCourseDetail?.end_date || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-orange-600">
                    Tổng học viên
                  </p>
                  <p className="text-2xl font-bold text-orange-700">
                    {students.length}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4 text-center text-sm font-semibold">
                <div className="rounded-2xl border border-amber-100 bg-white/70 p-3">
                  <p className="text-xs text-amber-600">Chờ duyệt</p>
                  <p className="text-2xl text-amber-700">{summary.pending}</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white/70 p-3">
                  <p className="text-xs text-blue-600">Đang học</p>
                  <p className="text-2xl text-blue-700">{summary.learning}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white/70 p-3">
                  <p className="text-xs text-emerald-600">Hoàn thành</p>
                  <p className="text-2xl text-emerald-700">
                    {summary.completed}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-white/70 p-3">
                  <p className="text-xs text-rose-600">Từ chối</p>
                  <p className="text-2xl text-rose-700">{summary.rejected}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <select
                    value={studentStatusFilter}
                    onChange={(e) =>
                      setStudentStatusFilter(
                        e.target.value as StudentFilterValue,
                      )
                    }
                    className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                  >
                    {STUDENT_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                  <ArrowUpDown className="h-4 w-4 text-purple-500" />
                  <select
                    value={studentSort}
                    onChange={(e) =>
                      setStudentSort(e.target.value as StudentSortKey)
                    }
                    className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                  >
                    {STUDENT_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                Bộ lọc áp dụng cho danh sách học viên bên dưới.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  Học viên hiển thị ({filteredStudents.length}/{students.length}
                  )
                </div>
                <span className="text-xs text-gray-500">
                  Sắp xếp:{" "}
                  {
                    STUDENT_SORT_OPTIONS.find(
                      (opt) => opt.value === studentSort,
                    )?.label
                  }
                </span>
              </div>
              {filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-6 text-center text-sm text-gray-500">
                  Không có học viên phù hợp với bộ lọc.
                </div>
              ) : (
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                  {filteredStudents.map((student: any) => {
                    const statusKey = normalizeStatus(student.status);
                    const meta = STUDENT_STATUS_META[statusKey];
                    const { email, phone } = getCandidateContacts(student);
                    const displayName = getCandidateName(student);
                    return (
                      <div
                        key={`${selectedCourseDetail?.id || selectedCourseDetail?.course_id}-${student.candidate_id}`}
                        className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs text-gray-600 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              ID: {student.candidate_id}
                            </p>
                          </div>
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${meta.tone}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                          <span>Email: {email || "Chưa cập nhật"}</span>
                          <span>Điện thoại: {phone || "Chưa cập nhật"}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500">
                          Gửi yêu cầu: {formatDateTime(student.requested_at)}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenStudentDetail(
                                selectedCourseDetail,
                                student,
                              )
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                path.ADMIN_CANDIDATE_VIEW.replace(
                                  ":id",
                                  student.candidate_id,
                                ),
                              )
                            }
                            className="rounded-lg border border-orange-200 px-3 py-1 text-[11px] font-semibold text-orange-700 transition hover:bg-orange-50"
                          >
                            Hồ sơ ứng viên
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Chi tiết Trung tâm"
      activeMenu="center"
      fullWidth={true}
    >
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-red-700">
            Không thể tải dữ liệu trung tâm.
          </div>
        )}

        {!isLoading && !isError && center && (
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 text-lg font-bold text-blue-700">
                  {center.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {center.name || "Chưa cập nhật"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {center.center?.email || center.email || "—"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Giao diện này chỉ hiển thị danh sách khóa học. Chọn “Chi tiết”
                trong từng thẻ để mở thông tin trung tâm và học viên của khóa.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Khóa học
                  </h3>
                  <p className="text-xs text-gray-500">
                    Theo dõi chương trình đào tạo của trung tâm
                  </p>
                </div>
                {loadingCourses && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải
                  </span>
                )}
              </div>
              {errorCourses ? (
                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  Không tải được danh sách khóa học.
                </div>
              ) : !hasCourses ? (
                <div className="mt-4 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Trung tâm chưa có khóa học.
                </div>
              ) : (
                <>
                  <div className="mt-4 rounded-3xl border border-gray-100 bg-gray-50/80 p-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-inner">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          placeholder="Tìm theo tên hoặc mô tả khóa học"
                          className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                        <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                        <select
                          value={courseSort}
                          onChange={(e) =>
                            setCourseSort(e.target.value as CourseSortKey)
                          }
                          className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                        >
                          {COURSE_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500">
                      Tìm kiếm và sắp xếp được áp dụng cho danh sách khóa học
                      bên dưới.
                    </p>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-8 text-center text-sm text-gray-500">
                      Không tìm thấy khóa học phù hợp.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {filteredCourses.map((course: any, index: number) => {
                        const summary = summarizeCourse(course);
                        const students = getCourseCandidates(course);
                        const courseKey =
                          course?.id ||
                          course?.course_id ||
                          `${course?.name || "course"}-${index}`;
                        return (
                          <div
                            key={courseKey}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                          >
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase text-white/70">
                                    Khóa học
                                  </p>
                                  <h4 className="text-xl font-semibold leading-tight">
                                    {course?.name || "Chưa đặt tên"}
                                  </h4>
                                  {course?.description && (
                                    <p className="text-sm text-white/80">
                                      {course.description}
                                    </p>
                                  )}
                                </div>
                                <div className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold">
                                  {students.length} học viên
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-white/70">
                                {course?.start_date || "—"} →{" "}
                                {course?.end_date || "—"}
                              </p>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="grid gap-3 text-center text-sm font-semibold sm:grid-cols-4">
                                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                                  <p className="text-xs text-amber-600">
                                    Chờ duyệt
                                  </p>
                                  <p className="text-2xl text-amber-700">
                                    {summary.pending}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                                  <p className="text-xs text-blue-600">
                                    Đang học
                                  </p>
                                  <p className="text-2xl text-blue-700">
                                    {summary.learning}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                                  <p className="text-xs text-emerald-600">
                                    Hoàn thành
                                  </p>
                                  <p className="text-2xl text-emerald-700">
                                    {summary.completed}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                                  <p className="text-xs text-rose-600">
                                    Từ chối
                                  </p>
                                  <p className="text-2xl text-rose-700">
                                    {summary.rejected}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm text-gray-500">
                                  Nhấn “Chi tiết” để xem học viên và thông tin
                                  trung tâm.
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCourseDetail(course)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                                >
                                  Chi tiết & học viên
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {renderCourseDetailPanel()}
      {renderStudentDetailModal()}
    </AdminLayout>
  );
}
