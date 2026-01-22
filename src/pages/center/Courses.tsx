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
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
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
type CourseSortKey = "students_desc" | "students_asc" | "name_asc" | "name_desc" | "start_date_asc" | "start_date_desc" | "duration_asc" | "duration_desc";
type CenterTabId = "create" | "manage";

type EditFormState = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  capacity: string;
  training_field: string;
  duration_hours: string;
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
  { value: "start_date_asc", label: "Bắt đầu sớm nhất" },
  { value: "start_date_desc", label: "Bắt đầu muộn nhất" },
  { value: "duration_asc", label: "Thời lượng ngắn → dài" },
  { value: "duration_desc", label: "Thời lượng dài → ngắn" },
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
  training_field: "",
  duration_hours: "",
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
  const email = student?.email || student?.candidate?.email || null;
  const phone = student?.phone || student?.candidate?.phone || null;
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
  const [trainingField, setTrainingField] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [trainingFields, setTrainingFields] = useState<Array<{id: number; name: string; code: string}>>([]);

  // Fetch training fields when component mounts
  useEffect(() => {
    const fetchTrainingFields = async () => {
      try {
        console.log('🔄 Fetching training fields from API...');
        const response = await fetch('http://localhost:3000/center/training-fields');
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          console.error('❌ Response not OK:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        console.log('📦 Raw response data:', data);
        
        if (data.err === 0 && data.data && Array.isArray(data.data)) {
          setTrainingFields(data.data);
          console.log('✅ Training fields loaded successfully:', data.data.length, 'fields');
          console.log('📋 Fields:', data.data.map(f => f.name).join(', '));
        } else {
          console.error('❌ Invalid response format:', data);
        }
      } catch (err) {
        console.error('❌ Error fetching training fields:', err);
      }
    };
    
    fetchTrainingFields();
  }, []);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSort, setCourseSort] = useState<CourseSortKey>("students_desc");
  const [trainingFieldFilter, setTrainingFieldFilter] = useState<string>("all");
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
  const [studentStatusFilter, setStudentStatusFilter] = useState<StudentStatus | "all">("all");
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
      // Filter by search keyword
      if (keyword) {
        const name = (course.name || "").toLowerCase();
        const description = (course.description || "").toLowerCase();
        if (!name.includes(keyword) && !description.includes(keyword)) {
          return false;
        }
      }
      
      // Filter by training field
      if (trainingFieldFilter !== "all") {
        const courseField = (course as any).training_field;
        if (courseField !== trainingFieldFilter) {
          return false;
        }
      }
      
      return true;
    });

    return filtered.sort((a, b) => {
      if (courseSort === "students_desc") {
        return getStudentCount(b) - getStudentCount(a);
      }
      if (courseSort === "students_asc") {
        return getStudentCount(a) - getStudentCount(b);
      }
      if (courseSort === "start_date_asc") {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return dateA - dateB;
      }
      if (courseSort === "start_date_desc") {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return dateB - dateA;
      }
      if (courseSort === "duration_asc") {
        const durationA = (a as any).duration_hours || 0;
        const durationB = (b as any).duration_hours || 0;
        return durationA - durationB;
      }
      if (courseSort === "duration_desc") {
        const durationA = (a as any).duration_hours || 0;
        const durationB = (b as any).duration_hours || 0;
        return durationB - durationA;
      }
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const comparison = nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
      return courseSort === "name_desc" ? -comparison : comparison;
    });
  }, [courses, courseSearch, courseSort, trainingFieldFilter]);

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
      training_field: trainingField || null,
      duration_hours: durationHours ? Number(durationHours) : null,
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
        setTrainingField("");
        setDurationHours("");
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

  const handleOpenCourseStudents = (course: Course) => {
    setSelectedCourseStudents(course);
    setStudentStatusFilter("all");
  };
  const handleCloseCourseStudents = () => {
    setSelectedCourseStudents(null);
    setStudentStatusFilter("all");
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      name: course.name || "",
      description: course.description || "",
      start_date: course.start_date ? course.start_date.slice(0, 10) : "",
      end_date: course.end_date ? course.end_date.slice(0, 10) : "",
      capacity: course.capacity ? String(course.capacity) : "",
      training_field: course.training_field || "",
      duration_hours: course.duration_hours ? String(course.duration_hours) : "",
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
      training_field: editForm.training_field || null,
      duration_hours: editForm.duration_hours ? Number(editForm.duration_hours) : null,
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
        <div>
          <label className="block text-sm font-semibold text-gray-700">Lĩnh vực đào tạo</label>
          <select
            value={trainingField}
            onChange={(e) => setTrainingField(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
          >
            <option value="">-- Chọn lĩnh vực --</option>
            {trainingFields.map((field) => (
              <option key={field.id} value={field.name}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Số giờ đào tạo</label>
          <input
            type="number"
            min={1}
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
            placeholder="VD: 40"
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
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-inner">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc mô tả"
                className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <select
                  value={trainingFieldFilter}
                  onChange={(e) => setTrainingFieldFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                >
                  <option value="all">Tất cả lĩnh vực</option>
                  {trainingFields.map((field) => (
                    <option key={field.id} value={field.name}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
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
          </div>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700">Lĩnh vực đào tạo</label>
              <select
                value={trainingField}
                onChange={(e) => setTrainingField(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                <option value="">-- Chọn lĩnh vực --</option>
                {trainingFields.map((field) => (
                  <option key={field.id} value={field.name}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Số giờ đào tạo</label>
              <input
                type="number"
                min={1}
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="VD: 40"
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
            <div>
              <label className="text-sm font-semibold text-gray-700">Lĩnh vực đào tạo</label>
              <select
                value={editForm.training_field}
                onChange={(e) => handleEditFieldChange("training_field", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                <option value="">-- Chọn lĩnh vực --</option>
                {trainingFields.map((field) => (
                  <option key={field.id} value={field.name}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Số giờ đào tạo</label>
              <input
                type="number"
                min={1}
                value={editForm.duration_hours}
                onChange={(e) => handleEditFieldChange("duration_hours", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="VD: 40"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl my-8">
          <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-3xl bg-white px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Học viên</p>
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">Thuộc khóa học: {course.name}</p>
            </div>
            <button
              type="button"
              onClick={handleCloseCandidateDetail}
              className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 px-6 pb-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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

            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Thời gian</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Đăng ký:</p>
                  <p className="text-sm font-semibold text-gray-800">{formatDateTime(student.requested_at)}</p>
                </div>
                {student.signed_at && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">Ký cam kết:</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(student.signed_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Tiến độ học tập</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-600">Điểm danh</p>
                    <p className="text-lg font-bold text-blue-600">{student.attendance ?? 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Học phí</p>
                    <p className={`text-sm font-semibold ${student.tuition_confirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {student.tuition_confirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Điểm danh (Buổi)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressForm.attendance}
                      onChange={(e) => handleProgressChange("attendance", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Ngày ký cam kết</label>
                    <input
                      type="date"
                      value={progressForm.signed_at}
                      onChange={(e) => handleProgressChange("signed_at", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Trạng thái học phí</p>
                    <p className={`text-sm font-semibold ${progressForm.tuition_confirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {progressForm.tuition_confirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleProgressChange("tuition_confirmed", !progressForm.tuition_confirmed)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      progressForm.tuition_confirmed
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {progressForm.tuition_confirmed ? 'Đã thu' : 'Chưa thu'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Ghi chú</label>
              <textarea
                rows={3}
                value={progressForm.notes}
                onChange={(e) => handleProgressChange("notes", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                placeholder="Thêm ghi chú về học viên..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseCandidateDetail}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={processing}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:from-blue-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? "Đang lưu..." : "Lưu thông tin"}
              </button>
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
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Ngày bắt đầu</p>
                <p className="text-sm font-semibold text-gray-700">
                  {selectedCourseDetail.start_date 
                    ? new Date(selectedCourseDetail.start_date).toLocaleDateString("vi-VN")
                    : "Chưa xác định"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Ngày kết thúc</p>
                <p className="text-sm font-semibold text-gray-700">
                  {selectedCourseDetail.end_date
                    ? new Date(selectedCourseDetail.end_date).toLocaleDateString("vi-VN")
                    : "Chưa xác định"}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Sĩ số tối đa</p>
                <p className="text-sm font-semibold text-gray-700">
                  {selectedCourseDetail.capacity || "Không giới hạn"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Số học viên hiện tại</p>
                <p className="text-sm font-semibold text-gray-700">{studentCount}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Lĩnh vực đào tạo</p>
                <p className="text-sm font-semibold text-gray-700">
                  {selectedCourseDetail.training_field || "Chưa xác định"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Số giờ đào tạo</p>
                <p className="text-sm font-semibold text-gray-700">
                  {selectedCourseDetail.duration_hours ? `${selectedCourseDetail.duration_hours} giờ` : "Chưa xác định"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-blue-50/50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Thống kê học viên</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-sm text-gray-700">Chờ duyệt: <strong>{summary.pending}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-gray-700">Đang học: <strong>{summary.learning}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm text-gray-700">Hoàn thành: <strong>{summary.completed}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span>
                  <span className="text-sm text-gray-700">Từ chối: <strong>{summary.rejected}</strong></span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseCourseDetail}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCloseCourseDetail();
                  handleOpenEditCourse(selectedCourseDetail);
                }}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700"
              >
                Chỉnh sửa
              </button>
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
    
    // Filter students based on selected status
    let filteredStudents = studentStatusFilter === "all" 
      ? students 
      : students.filter(student => normalizeStatus(student.status) === studentStatusFilter);
    
    // Sort students by first name (last word in full name) A-Z
    filteredStudents = [...filteredStudents].sort((a, b) => {
      const nameA = getCandidateName(a).trim();
      const nameB = getCandidateName(b).trim();
      
      // Get the last word (first name) from full name
      const firstNameA = nameA.split(/\s+/).pop()?.toLowerCase() || "";
      const firstNameB = nameB.split(/\s+/).pop()?.toLowerCase() || "";
      
      return firstNameA.localeCompare(firstNameB, "vi", { sensitivity: "base" });
    });
    
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

          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-4 text-center text-sm font-semibold">
              <button
                type="button"
                onClick={() => setStudentStatusFilter(STUDENT_STATUS.PENDING)}
                className={`rounded-2xl border p-3 transition-all cursor-pointer ${
                  studentStatusFilter === STUDENT_STATUS.PENDING
                    ? 'border-amber-300 bg-amber-100 ring-2 ring-amber-300'
                    : 'border-amber-100 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <p className="text-xs text-amber-600">Chờ duyệt</p>
                <p className="text-2xl text-amber-700">{summary.pending}</p>
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter(STUDENT_STATUS.LEARNING)}
                className={`rounded-2xl border p-3 transition-all cursor-pointer ${
                  studentStatusFilter === STUDENT_STATUS.LEARNING
                    ? 'border-blue-300 bg-blue-100 ring-2 ring-blue-300'
                    : 'border-blue-100 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <p className="text-xs text-blue-600">Đang học</p>
                <p className="text-2xl text-blue-700">{summary.learning}</p>
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter(STUDENT_STATUS.COMPLETED)}
                className={`rounded-2xl border p-3 transition-all cursor-pointer ${
                  studentStatusFilter === STUDENT_STATUS.COMPLETED
                    ? 'border-emerald-300 bg-emerald-100 ring-2 ring-emerald-300'
                    : 'border-emerald-100 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <p className="text-xs text-emerald-600">Hoàn thành</p>
                <p className="text-2xl text-emerald-700">{summary.completed}</p>
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter(STUDENT_STATUS.REJECTED)}
                className={`rounded-2xl border p-3 transition-all cursor-pointer ${
                  studentStatusFilter === STUDENT_STATUS.REJECTED
                    ? 'border-rose-300 bg-rose-100 ring-2 ring-rose-300'
                    : 'border-rose-100 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <p className="text-xs text-rose-600">Từ chối</p>
                <p className="text-2xl text-rose-700">{summary.rejected}</p>
              </button>
            </div>
            {studentStatusFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStudentStatusFilter("all")}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Hiển thị tất cả ({students.length} học viên)
              </button>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              {studentStatusFilter === "all" 
                ? "Chưa có học viên trong khóa học này."
                : `Không có học viên nào với trạng thái "${STUDENT_STATUS_META[studentStatusFilter]?.label}".`}
            </div>
          ) : (
            <div className="mt-6 max-h-[70vh] space-y-3 overflow-y-auto pr-2">
              {filteredStudents.map((student) => {
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
