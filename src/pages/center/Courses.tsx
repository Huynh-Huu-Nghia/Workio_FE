import { useEffect, useMemo, useState } from "react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation, useNavigate } from "react-router-dom";
import type { Course, CourseCandidate } from "@/api/center.api";
import {
  useCenterCoursesQuery,
  useCreateCenterCourseMutation,
  useUpdateCenterCourseMutation,
  useUpdateStudentStatusMutation,
  useDeleteCenterCourseMutation,
  useRemoveStudentFromCourseMutation,
} from "@/api/center.api";
import { toast } from "react-toastify";
import CenterLayout from "@/layouts/CenterLayout";
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Filter,
  Sparkles,
  Search,
  SlidersHorizontal,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  GraduationCap,
  X,
} from "lucide-react";

const STUDENT_STATUS = {
  PENDING: "cho_duyet",
  LEARNING: "dang_hoc",
  COMPLETED: "da_hoc",
  REJECTED: "tu_choi",
} as const;

type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];
type StatusKey = StudentStatus | "default";
type CourseSortKey = "students_desc" | "students_asc" | "name_asc" | "name_desc";
type StudentSortKey = "recent" | "oldest" | "name";
type StudentFilterValue = StudentStatus | "all";
type CenterTabId = "create" | "manage";

type EditFormState = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  capacity: string;
};

type ProgressFormState = {
  attendance: string;
  tuition_confirmed: boolean;
  signed_at: string;
  notes: string;
};

const STUDENT_STATUS_META: Record<
  StatusKey,
  { label: string; tone: string; description: string }
> = {
  cho_duyet: {
    label: "Chờ duyệt",
    tone: "bg-amber-100 text-amber-700",
    description: "Thí sinh đã gửi yêu cầu đăng ký và chờ trung tâm phản hồi.",
  },
  dang_hoc: {
    label: "Đang học",
    tone: "bg-blue-100 text-blue-700",
    description: "Học viên đang tham gia khóa học.",
  },
  da_hoc: {
    label: "Đã hoàn thành",
    tone: "bg-emerald-100 text-emerald-700",
    description: "Học viên đã hoàn tất khóa học.",
  },
  tu_choi: {
    label: "Từ chối",
    tone: "bg-rose-100 text-rose-700",
    description: "Yêu cầu đăng ký đã bị từ chối hoặc học viên bị loại.",
  },
  default: {
    label: "Trạng thái khác",
    tone: "bg-gray-100 text-gray-600",
    description: "Trạng thái chưa được phân loại.",
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

const getTabFromHash = (hashValue: string): CenterTabId | null => {
  if (!hashValue) return "manage";
  if (hashValue === "create" || hashValue === "manage") return hashValue;
  return null;
};

const createEmptyEditForm = (): EditFormState => ({
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  capacity: "",
});

const createEmptyProgressForm = (): ProgressFormState => ({
  attendance: "",
  tuition_confirmed: false,
  signed_at: "",
  notes: "",
});

const normalizeStatus = (status?: string | null): StatusKey => {
  const normalized = (status || "").toLowerCase();
  const values = Object.values(STUDENT_STATUS);
  return values.includes(normalized as StudentStatus)
    ? (normalized as StudentStatus)
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

const getCandidateName = (student: CourseCandidate) =>
  student?.candidate?.full_name ||
  student?.candidate?.name ||
  student?.name ||
  student?.candidate_name ||
  "Học viên chưa cập nhật";

const getCandidateContacts = (student: CourseCandidate) => {
  const email = student?.candidate?.email || student?.email || null;
  const phone = student?.candidate?.phone || student?.phone || null;
  return { email, phone };
};

const getCourseId = (course?: Course | null) =>
  course?.id || course?.course_id || "";

const getCourseCandidates = (course?: Course | null) =>
  Array.isArray(course?.candidates) ? (course?.candidates as CourseCandidate[]) : [];

const getStudentCount = (course?: Course | null) => getCourseCandidates(course).length;

const getRequestedTimestamp = (student: CourseCandidate) =>
  student?.requested_at ? new Date(student.requested_at).getTime() : 0;

const buildCandidateKey = (
  courseId?: string | null,
  candidateId?: string | null
) => `${courseId || "course"}-${candidateId || "candidate"}`;

const makeCandidateKey = (courseKey: string, candidateId: string) =>
  buildCandidateKey(courseKey, candidateId);

const summarizeCourse = (course: Course) => {
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
    { pending: 0, learning: 0, completed: 0, rejected: 0 }
  );
};

const CoursesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pathtotitle[location.pathname] || "Khóa học";

  const { data, refetch, isFetching } = useCenterCoursesQuery();
  const courses = data?.data ?? [];
  const hasCourses = courses.length > 0;

  const createCourse = useCreateCenterCourseMutation();
  const updateCourse = useUpdateCenterCourseMutation();
  const deleteCourseMutation = useDeleteCenterCourseMutation();
  const updateStudentStatus = useUpdateStudentStatusMutation();
  const removeStudent = useRemoveStudentFromCourseMutation();

  const [activeTab, setActiveTabState] = useState<CenterTabId>("manage");

  useEffect(() => {
    const hashValue = location.hash.replace("#", "");
    const tabFromHash = getTabFromHash(hashValue);
    if (tabFromHash) {
      setActiveTabState(tabFromHash);
    }
  }, [location.hash]);

  const handleTabChange = (tabId: CenterTabId) => {
    if (activeTab !== tabId) {
      setActiveTabState(tabId);
    }
    if (location.hash !== `#${tabId}`) {
      navigate({ pathname: location.pathname, hash: tabId }, { replace: false });
    }
  };
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [courseEndDate, setCourseEndDate] = useState("");
  const [courseCapacity, setCourseCapacity] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSort, setCourseSort] = useState<CourseSortKey>("students_desc");
  const [studentStatusFilter, setStudentStatusFilter] =
    useState<StudentFilterValue>("all");
  const [studentSort, setStudentSort] = useState<StudentSortKey>("recent");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(createEmptyEditForm());
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<Course | null>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<{
    course: Course;
    student: CourseCandidate;
  } | null>(null);
  const [progressForm, setProgressForm] = useState<ProgressFormState>(
    createEmptyProgressForm()
  );
  const [processingMap, setProcessingMap] = useState<Record<string, boolean>>({});
  const [removingMap, setRemovingMap] = useState<Record<string, boolean>>({});
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const isProcessing = (courseId?: string, candidateId?: string) => {
    if (!courseId || !candidateId) return false;
    return Boolean(processingMap[buildCandidateKey(courseId, candidateId)]);
  };

  const toggleProcessing = (
    courseId: string,
    candidateId: string,
    value: boolean
  ) => {
    setProcessingMap((prev) => {
      const key = buildCandidateKey(courseId, candidateId);
      if (value) return { ...prev, [key]: true };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const isRemovingCandidate = (courseId?: string, candidateId?: string) => {
    if (!courseId || !candidateId) return false;
    return Boolean(removingMap[buildCandidateKey(courseId, candidateId)]);
  };

  const toggleRemoving = (
    courseId: string,
    candidateId: string,
    value: boolean
  ) => {
    setRemovingMap((prev) => {
      const key = buildCandidateKey(courseId, candidateId);
      if (value) return { ...prev, [key]: true };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const filteredCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      if (!keyword) return true;
      const name = (course.name || "").toLowerCase();
      const description = (course.description || "").toLowerCase();
      return name.includes(keyword) || description.includes(keyword);
    });

    return filtered.sort((a, b) => {
      if (courseSort === "students_desc") {
        return getStudentCount(b) - getStudentCount(a);
      }
      if (courseSort === "students_asc") {
        return getStudentCount(a) - getStudentCount(b);
      }
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const comparison = nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
      return courseSort === "name_desc" ? -comparison : comparison;
    });
  }, [courses, courseSearch, courseSort]);

  const submitCourseCreation = async (): Promise<boolean> => {
    if (!courseName.trim()) {
      toast.info("Tên khóa học không được bỏ trống");
      return false;
    }

    const payload: Partial<Course> = {
      name: courseName.trim(),
      description: courseDesc.trim() || null,
      start_date: courseStartDate || null,
      end_date: courseEndDate || null,
      capacity: courseCapacity ? Number(courseCapacity) : null,
    };

    try {
      const res = await createCourse.mutateAsync(payload);
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã tạo khóa học");
        setCourseName("");
        setCourseDesc("");
        setCourseStartDate("");
        setCourseEndDate("");
        setCourseCapacity("");
        refetch();
        return true;
      }
      toast.error((res as any)?.mes || "Tạo khóa học thất bại");
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Tạo khóa học thất bại");
      return false;
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await submitCourseCreation();
    if (success) {
      handleTabChange("manage");
    }
  };

  const handleQuickCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await submitCourseCreation();
    if (success) {
      setShowQuickCreate(false);
      handleTabChange("manage");
    }
  };

  const handleOpenCourseDetail = (course: Course) => setSelectedCourseDetail(course);
  const handleCloseCourseDetail = () => setSelectedCourseDetail(null);

  const handleOpenCourseStudents = (course: Course) => setSelectedCourseStudents(course);
  const handleCloseCourseStudents = () => setSelectedCourseStudents(null);

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      name: course.name || "",
      description: course.description || "",
      start_date: course.start_date ? course.start_date.slice(0, 10) : "",
      end_date: course.end_date ? course.end_date.slice(0, 10) : "",
      capacity: course.capacity ? String(course.capacity) : "",
    });
  };

  const handleCloseEditCourse = () => {
    setEditingCourse(null);
    setEditForm(createEmptyEditForm());
  };

  const handleEditFieldChange = (field: keyof EditFormState, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitEditCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCourse) return;
    const targetCourseId = getCourseId(editingCourse);
    if (!targetCourseId) {
      toast.error("Không xác định được khóa học cần chỉnh sửa");
      return;
    }
    if (!editForm.name.trim()) {
      toast.info("Tên khóa học không được bỏ trống");
      return;
    }

    const payload: Partial<Course> = {
      name: editForm.name.trim(),
      description: editForm.description.trim() || null,
      start_date: editForm.start_date || null,
      end_date: editForm.end_date || null,
      capacity: editForm.capacity ? Number(editForm.capacity) : null,
    };

    try {
      const res = await updateCourse.mutateAsync({
        courseId: targetCourseId,
        payload,
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã cập nhật khóa học");
        handleCloseEditCourse();
        refetch();
      } else {
        toast.error((res as any)?.mes || "Cập nhật thất bại");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Cập nhật thất bại");
    }
  };

  const handleRequestDeleteCourse = (course: Course) => setCourseToDelete(course);
  const handleCancelDeleteCourse = () => setCourseToDelete(null);

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    const courseId = getCourseId(courseToDelete);
    if (!courseId) {
      toast.error("Không xác định được khóa học cần xóa");
      return;
    }

    try {
      const res = await deleteCourseMutation.mutateAsync(courseId);
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã xóa khóa học");
        setCourseToDelete(null);
        refetch();
      } else {
        toast.error((res as any)?.mes || "Không thể xóa khóa học");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Không thể xóa khóa học");
    }
  };

  const handleUpdateStatus = async (
    courseId?: string,
    candidateId?: string,
    status?: StudentStatus
  ) => {
    if (!courseId || !candidateId || !status) return;
    toggleProcessing(courseId, candidateId, true);
    try {
      const res = await updateStudentStatus.mutateAsync({
        courseId,
        candidateId,
        status,
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã cập nhật trạng thái");
        refetch();
      } else {
        toast.error((res as any)?.mes || "Cập nhật thất bại");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Cập nhật thất bại");
    } finally {
      toggleProcessing(courseId, candidateId, false);
    }
  };

  const handleOpenCandidateDetail = (course: Course, student: CourseCandidate) => {
    setSelectedCandidateDetail({ course, student });
    setProgressForm({
      attendance:
        typeof student.attendance === "number" ? String(student.attendance) : "",
      tuition_confirmed: Boolean(student.tuition_confirmed),
      signed_at: student.signed_at ? student.signed_at.slice(0, 10) : "",
      notes: student.notes || "",
    });
  };

  const handleCloseCandidateDetail = () => {
    setSelectedCandidateDetail(null);
    setProgressForm(createEmptyProgressForm());
  };

  const handleProgressChange = (field: keyof ProgressFormState, value: string | boolean) => {
    setProgressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProgress = async () => {
    if (!selectedCandidateDetail) return;
    const { course, student } = selectedCandidateDetail;
    const courseId = getCourseId(course);
    if (!courseId) return;
    const attendanceValue = progressForm.attendance.trim();

    toggleProcessing(courseId, student.candidate_id, true);
    try {
      const res = await updateStudentStatus.mutateAsync({
        courseId,
        candidateId: student.candidate_id,
        status: normalizeStatus(student.status),
        attendance: attendanceValue === "" ? undefined : Number(attendanceValue),
        tuition_confirmed: progressForm.tuition_confirmed,
        signed_at: progressForm.signed_at || null,
        notes: progressForm.notes.trim() || null,
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã lưu tiến độ");
        refetch();
        handleCloseCandidateDetail();
      } else {
        toast.error((res as any)?.mes || "Không thể lưu tiến độ");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Không thể lưu tiến độ");
    } finally {
      toggleProcessing(courseId, student.candidate_id, false);
    }
  };

  const handleRemoveStudent = async (course: Course, student: CourseCandidate) => {
    const courseId = getCourseId(course);
    if (!courseId || !student.candidate_id) return;
    toggleRemoving(courseId, student.candidate_id, true);
    try {
      const res = await removeStudent.mutateAsync({
        courseId,
        candidateId: student.candidate_id,
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã xóa học viên khỏi khóa");
        refetch();
      } else {
        toast.error((res as any)?.mes || "Không thể xóa học viên");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Không thể xóa học viên");
    } finally {
      toggleRemoving(courseId, student.candidate_id, false);
    }
  };

  const renderCreateCourseSection = () => (
    <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
          <GraduationCap className="h-5 w-5 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tạo khóa học mới</h2>
      </div>
      <form onSubmit={handleCreate} className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Tên khóa học <span className="text-red-500">*</span>
          </label>
          <input
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
            placeholder="VD: Lập trình Frontend với React"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
          <input
            value={courseDesc}
            onChange={(e) => setCourseDesc(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
            placeholder="Thông tin tóm tắt về khóa học"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Ngày bắt đầu</label>
          <input
            type="date"
            value={courseStartDate}
            onChange={(e) => setCourseStartDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Ngày kết thúc</label>
          <input
            type="date"
            value={courseEndDate}
            onChange={(e) => setCourseEndDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Sĩ số tối đa</label>
          <input
            type="number"
            min={0}
            value={courseCapacity}
            onChange={(e) => setCourseCapacity(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
            placeholder="VD: 30"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={createCourse.isPending}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="h-5 w-5" />
            {createCourse.isPending ? "Đang tạo khóa học..." : "Tạo khóa học"}
          </button>
        </div>
      </form>
    </section>
  );

  const renderManageSection = () => (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách khóa học</h2>
          {isFetching && (
            <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <span className="text-sm font-medium text-orange-600">Đang tải...</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowQuickCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50"
        >
          <BookOpen className="h-4 w-4" />
          Thêm khóa học nhanh
        </button>
      </div>

      {hasCourses && (
        <div className="rounded-3xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-inner">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc mô tả"
                  className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                <select
                  value={courseSort}
                  onChange={(e) => setCourseSort(e.target.value as CourseSortKey)}
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
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <Filter className="h-4 w-4 text-blue-500" />
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value as StudentFilterValue)}
                  className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                >
                  {STUDENT_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <ArrowUpDown className="h-4 w-4 text-purple-500" />
                <select
                  value={studentSort}
                  onChange={(e) => setStudentSort(e.target.value as StudentSortKey)}
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
          </div>
          <p className="mt-2 text-xs text-gray-500">Các bộ lọc học viên áp dụng cho mọi khóa học bên dưới.</p>
        </div>
      )}

      {!hasCourses ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white/50 p-16 text-center backdrop-blur-sm">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-600">Chưa có khóa học nào</p>
          <p className="mt-1 text-sm text-gray-500">Tạo khóa học đầu tiên để bắt đầu</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-white/60 p-12 text-center">
          <p className="text-base font-semibold text-gray-700">Không tìm thấy khóa học phù hợp</p>
          <p className="mt-1 text-sm text-gray-500">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCourses.map((course, index) => {
            const courseId = getCourseId(course);
            const courseKey = courseId || `${course.name}-${index}`;
            const summary = summarizeCourse(course);
            const courseHasLearning = summary.learning > 0;
            return (
              <div
                key={courseKey}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{course.name}</h3>
                        {course.description && (
                          <p className="mt-1 text-sm text-orange-100">{course.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                        <Users className="h-4 w-4 text-white" />
                        <span className="text-sm font-bold text-white">
                          {course.candidates?.length || 0} học viên
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCourseDetail(course)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCourseStudents(course)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                          <Users className="h-4 w-4" />
                          Danh sách học viên
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(course)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/60 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          disabled={courseHasLearning || deleteCourseMutation.isPending}
                          onClick={() => handleRequestDeleteCourse(course)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                          title={
                            courseHasLearning
                              ? "Không thể xóa khi còn học viên đang học"
                              : undefined
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                      {courseHasLearning && (
                        <p className="text-xs text-white/80">
                          Cần xóa hoặc chuyển toàn bộ học viên đang học trước khi xóa khóa.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50/40 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-semibold text-gray-900">
                      Yêu cầu chờ duyệt ({summary.pending})
                    </h4>
                  </div>
                  {(() => {
                    const courseKeyForPending = courseId || "pending";
                    const students = getCourseCandidates(course);
                    const pending = students
                      .filter((student) => normalizeStatus(student.status) === STUDENT_STATUS.PENDING)
                      .sort((a, b) => getRequestedTimestamp(a) - getRequestedTimestamp(b));
                    if (!pending.length) {
                      return <p className="text-sm text-gray-500">Không có yêu cầu đăng ký nào đang chờ duyệt.</p>;
                    }
                    return (
                      <div className="space-y-3">
                        {pending.map((student) => {
                          const name = getCandidateName(student);
                          const { email, phone } = getCandidateContacts(student);
                          const pendingKey = makeCandidateKey(courseKeyForPending, student.candidate_id);
                          return (
                            <div
                              key={pendingKey}
                              className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="min-w-[200px] flex-1">
                                <p className="font-semibold text-gray-900">{name}</p>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                                  {email && <span>{email}</span>}
                                  {phone && <span>{phone}</span>}
                                </div>
                                <p className="mt-1 text-xs text-amber-700">
                                  Gửi yêu cầu lúc {formatDateTime(student.requested_at)}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isProcessing(courseId, student.candidate_id)}
                                  onClick={() =>
                                    handleUpdateStatus(
                                      courseId,
                                      student.candidate_id,
                                      STUDENT_STATUS.LEARNING
                                    )
                                  }
                                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isProcessing(courseId, student.candidate_id)
                                    ? "Đang xử lý..."
                                    : "Chấp nhận"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing(courseId, student.candidate_id)}
                                  onClick={() =>
                                    handleUpdateStatus(
                                      courseId,
                                      student.candidate_id,
                                      STUDENT_STATUS.REJECTED
                                    )
                                  }
                                  className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Từ chối
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCandidateDetail(course, student)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Chi tiết
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <h4 className="font-bold text-gray-900">Học viên trong khóa</h4>
                    </div>
                    <span className="text-xs text-gray-500">
                      (Áp dụng bộ lọc: {STUDENT_FILTER_OPTIONS.find((o) => o.value === studentStatusFilter)?.label})
                    </span>
                  </div>
                  {(() => {
                    const courseKeyForManaged = courseId || "managed";
                    const students = getCourseCandidates(course);
                    const managedBase = students.filter(
                      (student) => normalizeStatus(student.status) !== STUDENT_STATUS.PENDING
                    );
                    const managedFiltered = managedBase.filter((student) =>
                      studentStatusFilter === "all"
                        ? true
                        : normalizeStatus(student.status) === studentStatusFilter
                    );
                    const managed = [...managedFiltered].sort((a, b) => {
                      if (studentSort === "recent") {
                        return getRequestedTimestamp(b) - getRequestedTimestamp(a);
                      }
                      if (studentSort === "oldest") {
                        return getRequestedTimestamp(a) - getRequestedTimestamp(b);
                      }
                      if (studentSort === "name") {
                        const compare = getCandidateName(a).localeCompare(getCandidateName(b), "vi", {
                          sensitivity: "base",
                        });
                        if (compare !== 0) return compare;
                      }
                      return (
                        STATUS_SORT_ORDER[normalizeStatus(a.status)] -
                        STATUS_SORT_ORDER[normalizeStatus(b.status)]
                      );
                    });

                    if (!managed.length) {
                      return (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                          <Users className="mb-2 h-8 w-8 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">
                            {managedBase.length
                              ? "Không có học viên khớp với bộ lọc hiện tại"
                              : "Chưa có học viên được duyệt"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {managedBase.length
                              ? "Điều chỉnh lại bộ lọc để xem danh sách khác."
                              : "Phê duyệt yêu cầu để thêm học viên vào lớp."}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {managed.map((student) => {
                          const statusKey = normalizeStatus(student.status);
                          const meta = STUDENT_STATUS_META[statusKey];
                          const name = getCandidateName(student);
                          const { email, phone } = getCandidateContacts(student);
                          const candidateKey = makeCandidateKey(courseKeyForManaged, student.candidate_id);
                          const removing = isRemovingCandidate(courseId, student.candidate_id);
                          return (
                            <div
                              key={candidateKey}
                              className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="min-w-[200px] flex-1">
                                <p className="font-bold text-gray-900">{name}</p>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                                  {email && <span>{email}</span>}
                                  {phone && <span>{phone}</span>}
                                </div>
                                {student.requested_at && (
                                  <p className="mt-1 text-[11px] text-gray-400">
                                    Đăng ký: {formatDateTime(student.requested_at)}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                                  {statusKey === STUDENT_STATUS.COMPLETED ? (
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                  ) : statusKey === STUDENT_STATUS.LEARNING ? (
                                    <Clock className="mr-1 h-3.5 w-3.5" />
                                  ) : null}
                                  {meta.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCandidateDetail(course, student)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Chi tiết
                                </button>
                                {statusKey === STUDENT_STATUS.LEARNING && (
                                  <button
                                    type="button"
                                    disabled={isProcessing(courseId, student.candidate_id)}
                                    onClick={() =>
                                      handleUpdateStatus(
                                        courseId,
                                        student.candidate_id,
                                        STUDENT_STATUS.COMPLETED
                                      )
                                    }
                                    className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Đánh dấu hoàn thành
                                  </button>
                                )}
                                {statusKey === STUDENT_STATUS.REJECTED && (
                                  <button
                                    type="button"
                                    disabled={isProcessing(courseId, student.candidate_id)}
                                    onClick={() =>
                                      handleUpdateStatus(
                                        courseId,
                                        student.candidate_id,
                                        STUDENT_STATUS.LEARNING
                                      )
                                    }
                                    className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Chấp nhận lại
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={removing}
                                  onClick={() => handleRemoveStudent(course, student)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <UserMinus className="h-3.5 w-3.5" />
                                  {removing ? "Đang xóa..." : "Xóa khỏi khóa"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderQuickCreateModal = () => {
    if (!showQuickCreate) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Thêm khóa học nhanh
                </p>
                <h3 className="text-xl font-bold text-gray-900">Thông tin khóa học</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickCreate(false)}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleQuickCreateSubmit}>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tên khóa học <span className="text-red-500">*</span>
              </label>
              <input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="VD: Lập trình Frontend với React"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="Thông tin tóm tắt về khóa học"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                value={courseStartDate}
                onChange={(e) => setCourseStartDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                value={courseEndDate}
                onChange={(e) => setCourseEndDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Sĩ số tối đa</label>
              <input
                type="number"
                min={0}
                value={courseCapacity}
                onChange={(e) => setCourseCapacity(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="VD: 30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickCreate(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createCourse.isPending}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createCourse.isPending ? "Đang tạo..." : "Tạo khóa học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDeleteCourseModal = () => {
    if (!courseToDelete) return null;
    const studentCount = getStudentCount(courseToDelete);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Xóa khóa học</p>
              <h3 className="text-xl font-bold text-gray-900">{courseToDelete.name}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Thao tác này sẽ xóa hoàn toàn khóa học khỏi hệ thống. Hiện khóa có {studentCount} học viên trong danh sách.
            Bạn vẫn muốn tiếp tục?
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelDeleteCourse}
              className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteCourse}
              disabled={deleteCourseMutation.isPending}
              className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteCourseMutation.isPending ? "Đang xóa..." : "Xóa khóa học"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditCourseModal = () => {
    if (!editingCourse) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Chỉnh sửa khóa học</p>
              <h3 className="text-xl font-bold text-gray-900">{editingCourse.name}</h3>
            </div>
            <button
              type="button"
              onClick={handleCloseEditCourse}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitEditCourse}>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Tên khóa học *</label>
              <input
                value={editForm.name}
                onChange={(e) => handleEditFieldChange("name", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="Tên khóa học"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Mô tả</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleEditFieldChange("description", e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="Mô tả ngắn gọn"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                value={editForm.start_date}
                onChange={(e) => handleEditFieldChange("start_date", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                value={editForm.end_date}
                onChange={(e) => handleEditFieldChange("end_date", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Sĩ số tối đa</label>
              <input
                type="number"
                min={0}
                value={editForm.capacity}
                onChange={(e) => handleEditFieldChange("capacity", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="VD: 30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseEditCourse}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updateCourse.isPending}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateCourse.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCandidateDetailModal = () => {
    if (!selectedCandidateDetail) return null;
    const { course, student } = selectedCandidateDetail;
    const statusKey = normalizeStatus(student.status);
    const meta = STUDENT_STATUS_META[statusKey];
    const { email, phone } = getCandidateContacts(student);
    const name = getCandidateName(student);
    const courseId = getCourseId(course);
    const processing = isProcessing(courseId, student.candidate_id);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Học viên</p>
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">Thuộc khóa học: {course.name}</p>
            </div>
            <button
              type="button"
              onClick={handleCloseCandidateDetail}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Thông tin liên hệ</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-semibold text-gray-800">{email || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="text-sm font-semibold text-gray-800">{phone || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                {statusKey === STUDENT_STATUS.COMPLETED ? (
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                ) : statusKey === STUDENT_STATUS.LEARNING ? (
                  <Clock className="mr-1 h-3.5 w-3.5" />
                ) : null}
                {meta.label}
              </span>
              <p className="text-sm text-gray-600">{meta.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Thời gian</p>
                <p className="text-sm text-gray-600">
                  Đăng ký: <span className="font-semibold text-gray-800">{formatDateTime(student.requested_at)}</span>
                </p>
                {student.signed_at && (
                  <p className="text-sm text-gray-600">
                    Ký cam kết: <span className="font-semibold text-gray-800">{formatDateTime(student.signed_at)}</span>
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Tiến độ</p>
                <p className="text-sm text-gray-600">
                  Điểm danh: <span className="font-semibold text-gray-800">{student.attendance ?? 0}%</span>
                </p>
                <p className="text-sm text-gray-600">
                  Học phí: <span className="font-semibold text-gray-800">{student.tuition_confirmed ? "Đã xác nhận" : "Chưa xác nhận"}</span>
                </p>
              </div>
            </div>

            {student.notes && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Ghi chú</p>
                <p className="mt-1 text-sm text-gray-700">{student.notes}</p>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white/90 p-4">
              <p className="text-sm font-semibold text-gray-800">Cập nhật tiến độ</p>
              <p className="mt-1 text-xs text-gray-500">Điều chỉnh thông tin học tập và xác nhận học phí cho học viên này.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Điểm danh (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progressForm.attendance}
                    onChange={(e) => handleProgressChange("attendance", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                    placeholder="VD: 85"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Ngày ký cam kết</label>
                  <input
                    type="date"
                    value={progressForm.signed_at}
                    onChange={(e) => handleProgressChange("signed_at", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Trạng thái học phí</p>
                  <p className="text-sm text-gray-700">
                    {progressForm.tuition_confirmed ? "Đã xác nhận" : "Chưa xác nhận"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleProgressChange("tuition_confirmed", !progressForm.tuition_confirmed)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    progressForm.tuition_confirmed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {progressForm.tuition_confirmed ? "Đã thu" : "Chưa thu"}
                </button>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase text-gray-500">Ghi chú</label>
                <textarea
                  rows={3}
                  value={progressForm.notes}
                  onChange={(e) => handleProgressChange("notes", e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                  placeholder="Ghi chú thêm về tiến độ, kết quả học tập, v.v."
                />
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  disabled={processing}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing ? "Đang lưu..." : "Lưu tiến độ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseDetailModal = () => {
    if (!selectedCourseDetail) return null;
    const summary = summarizeCourse(selectedCourseDetail);
    const studentCount = getStudentCount(selectedCourseDetail);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Khóa học</p>
              <h3 className="text-2xl font-bold text-gray-900">{selectedCourseDetail.name}</h3>
              {selectedCourseDetail.description && (
                <p className="mt-1 text-sm text-gray-600">{selectedCourseDetail.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCloseCourseDetail}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Thời gian</p>
              <p className="text-sm text-gray-700">
                {selectedCourseDetail.start_date || "Chưa đặt ngày"} → {selectedCourseDetail.end_date || "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Sĩ số</p>
              <p className="text-sm text-gray-700">
                {studentCount} học viên
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <p className="text-xs font-semibold uppercase text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <p className="text-xs font-semibold uppercase text-gray-500">Đang học</p>
              <p className="text-2xl font-bold text-blue-600">{summary.learning}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseStudentsModal = () => {
    if (!selectedCourseStudents) return null;
    const summary = summarizeCourse(selectedCourseStudents);
    const students = getCourseCandidates(selectedCourseStudents);
    const courseId = getCourseId(selectedCourseStudents);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Danh sách học viên
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCourseStudents.name || "Chưa đặt tên"}
              </h3>
              <p className="text-sm text-gray-500">
                {students.length} học viên • {selectedCourseStudents.start_date || "—"} → {selectedCourseStudents.end_date || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseCourseStudents}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4 text-center text-sm font-semibold">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs text-amber-600">Chờ duyệt</p>
              <p className="text-2xl text-amber-700">{summary.pending}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs text-blue-600">Đang học</p>
              <p className="text-2xl text-blue-700">{summary.learning}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600">Hoàn thành</p>
              <p className="text-2xl text-emerald-700">{summary.completed}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
              <p className="text-xs text-rose-600">Từ chối</p>
              <p className="text-2xl text-rose-700">{summary.rejected}</p>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              Chưa có học viên trong khóa học này.
            </div>
          ) : (
            <div className="mt-6 max-h-[70vh] space-y-3 overflow-y-auto pr-2">
              {students.map((student) => {
                const statusKey = normalizeStatus(student.status);
                const meta = STUDENT_STATUS_META[statusKey];
                const { email, phone } = getCandidateContacts(student);
                const name = getCandidateName(student);
                const candidateKey = makeCandidateKey(courseId || "course", student.candidate_id);
                return (
                  <div
                    key={candidateKey}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-500">ID: {student.candidate_id}</p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span>Email: {email || "Chưa cập nhật"}</span>
                      <span>Điện thoại: {phone || "Chưa cập nhật"}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Gửi yêu cầu: {formatDateTime(student.requested_at)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCandidateDetail(selectedCourseStudents, student)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <CenterLayout title={title}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="w-full px-2 py-10 space-y-8 sm:px-6">
            <header className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-xl ring-4 ring-orange-100">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
                <p className="mt-1 text-base text-gray-600">Quản lý khóa học và học viên của Trung tâm</p>
              </div>
            </header>

            {activeTab === "create" && renderCreateCourseSection()}
            {activeTab === "manage" && renderManageSection()}
          </div>
        </div>
      </CenterLayout>
      {renderQuickCreateModal()}
      {renderCourseDetailModal()}
      {renderEditCourseModal()}
      {renderDeleteCourseModal()}
      {renderCourseStudentsModal()}
      {renderCandidateDetailModal()}
    </>
  );
};

export default CoursesPage;
