import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import CandidateLayout from "@/layouts/CandidateLayout";
import { pathtotitle } from "@/configs/pagetitle";
import {
  useCandidateCoursesQuery,
  useCandidateCourseRegisterMutation,
} from "@/api/candidate.api";
import type { CandidateCourse } from "@/api/candidate.api";
import {
  useProvinceByCodeQuery,
  useWardByCodeQuery,
} from "@/api/provinces.api";
import {
  BookOpen,
  GraduationCap,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Hourglass,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Info,
  Tag,
  X,
} from "lucide-react";

type StatusState =
  | "idle"
  | "pending"
  | "approved"
  | "learning"
  | "completed"
  | "rejected";

type SortKey =
  | "start_asc"
  | "start_desc"
  | "name_az"
  | "popular_desc"
  | "status_priority";

const STATUS_PRIORITY: Record<StatusState, number> = {
  pending: 0,
  learning: 1,
  approved: 2,
  completed: 3,
  idle: 4,
  rejected: 5,
};

const STATUS_FILTER_OPTIONS: { value: StatusState | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "idle", label: "Chưa đăng ký" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "learning", label: "Đang học" },
  { value: "approved", label: "Đã duyệt" },
  { value: "completed", label: "Hoàn thành" },
  { value: "rejected", label: "Bị từ chối" },
];

const SORT_OPTION_CONFIG: Record<SortKey, { label: string; helper: string }> = {
  start_asc: {
    label: "Khai giảng sớm nhất",
    helper: "Ưu tiên khóa học sắp diễn ra",
  },
  start_desc: {
    label: "Khai giảng muộn nhất",
    helper: "Ưu tiên các khóa học mới mở",
  },
  name_az: {
    label: "Tên A → Z",
    helper: "Sắp xếp theo tên khóa học",
  },
  popular_desc: {
    label: "Nhiều học viên nhất",
    helper: "Ưu tiên khóa học đông học viên",
  },
  status_priority: {
    label: "Độ ưu tiên trạng thái",
    helper: "Chờ duyệt → Đang học → Hoàn thành",
  },
};

const CandidateCourses: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Khóa học";
  const [searchTerm, setSearchTerm] = useState("");
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CandidateCourse | null>(
    null,
  );
  const { data: province } = useProvinceByCodeQuery(
    selectedCourse?.center?.address?.province_code || undefined,
  );
  const { data: ward } = useWardByCodeQuery(
    selectedCourse?.center?.address?.ward_code || undefined,
  );
  const [lockedCourses, setLockedCourses] = useState<Record<string, boolean>>(
    {},
  );
  const [localCourseStates, setLocalCourseStates] = useState<
    Record<string, { status: string; requested_at?: string }>
  >({});
  const [statusFilter, setStatusFilter] = useState<StatusState | "all">("all");
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortKey>("start_asc");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const { data, isLoading, isError, refetch } = useCandidateCoursesQuery();
  const registerMutation = useCandidateCourseRegisterMutation();

  const courses = (data?.data ?? []) as CandidateCourse[];

  useEffect(() => {
    setLockedCourses((prev) => {
      if (!Object.keys(prev).length) return prev;
      const updated = { ...prev };
      let hasChanges = false;
      courses.forEach((course) => {
        if (course.can_register === false && updated[course.id]) {
          delete updated[course.id];
          hasChanges = true;
        }
      });
      return hasChanges ? updated : prev;
    });

    setLocalCourseStates((prev) => {
      if (!Object.keys(prev).length) return prev;
      const updated = { ...prev };
      let hasChanges = false;
      courses.forEach((course) => {
        if (course.candidate_status && updated[course.id]) {
          delete updated[course.id];
          hasChanges = true;
        }
      });
      return hasChanges ? updated : prev;
    });
  }, [courses]);

  const centerOptions = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((course) => {
      if (course.center_name) set.add(course.center_name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const fieldOptions = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((course) => {
      if (course.training_field) set.add(course.training_field);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count += 1;
    if (centerFilter !== "all") count += 1;
    if (fieldFilter !== "all") count += 1;
    if (onlyAvailable) count += 1;
    return count;
  }, [statusFilter, centerFilter, fieldFilter, onlyAvailable]);
  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật";

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

  const STATUS_META_CONFIG: Record<
    string,
    { label: string; tone: string; state: StatusState; description: string }
  > = {
    default: {
      label: "Chưa đăng ký",
      tone: "bg-slate-100 text-slate-700",
      state: "idle",
      description: "Bạn chưa gửi yêu cầu đăng ký cho khóa học này.",
    },
    pending: {
      label: "Chờ trung tâm duyệt",
      tone: "bg-orange-100 text-orange-700",
      state: "pending",
      description: "Trung tâm đang xem xét yêu cầu đăng ký của bạn.",
    },
    cho_duyet: {
      label: "Chờ trung tâm duyệt",
      tone: "bg-orange-100 text-orange-700",
      state: "pending",
      description: "Trung tâm đang xem xét yêu cầu đăng ký của bạn.",
    },
    approved: {
      label: "Đã duyệt",
      tone: "bg-green-100 text-green-700",
      state: "approved",
      description: "Trung tâm đã duyệt yêu cầu, vui lòng chờ lịch học.",
    },
    dang_hoc: {
      label: "Đang học",
      tone: "bg-blue-100 text-blue-700",
      state: "learning",
      description: "Bạn đang tham gia khóa học tại trung tâm.",
    },
    learning: {
      label: "Đang học",
      tone: "bg-blue-100 text-blue-700",
      state: "learning",
      description: "Bạn đang tham gia khóa học tại trung tâm.",
    },
    da_hoc: {
      label: "Hoàn thành",
      tone: "bg-emerald-100 text-emerald-700",
      state: "completed",
      description: "Bạn đã hoàn thành khóa học này.",
    },
    completed: {
      label: "Hoàn thành",
      tone: "bg-emerald-100 text-emerald-700",
      state: "completed",
      description: "Bạn đã hoàn thành khóa học này.",
    },
    tu_choi: {
      label: "Bị từ chối",
      tone: "bg-red-100 text-red-600",
      state: "rejected",
      description:
        "Trung tâm đã từ chối yêu cầu. Vui lòng liên hệ để biết thêm chi tiết.",
    },
    rejected: {
      label: "Bị từ chối",
      tone: "bg-red-100 text-red-600",
      state: "rejected",
      description:
        "Trung tâm đã từ chối yêu cầu. Vui lòng liên hệ để biết thêm chi tiết.",
    },
  };

  const getStatusMeta = (course: CandidateCourse) => {
    const override = localCourseStates[course.id];
    const rawStatus =
      override?.status ||
      course.candidate_status ||
      course.registration?.status ||
      undefined;
    const normalized = rawStatus?.toLowerCase();
    const baseMeta =
      normalized && STATUS_META_CONFIG[normalized]
        ? STATUS_META_CONFIG[normalized]
        : STATUS_META_CONFIG.default;

    return {
      ...baseMeta,
      requested_at:
        override?.requested_at || course.candidate_requested_at || null,
    };
  };

  const canRegisterCourse = (course: CandidateCourse) => {
    const statusMeta = getStatusMeta(course);
    return (
      course.can_register !== false &&
      !lockedCourses[course.id] &&
      statusMeta.state === "idle"
    );
  };

  const getDateValue = (
    value?: string | null,
    fallback = Number.MAX_SAFE_INTEGER,
  ) => {
    if (!value) return fallback;
    const ts = new Date(value).getTime();
    return Number.isNaN(ts) ? fallback : ts;
  };

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      const statusMeta = getStatusMeta(course);
      if (onlyAvailable && !canRegisterCourse(course)) return false;
      if (statusFilter !== "all" && statusMeta.state !== statusFilter)
        return false;
      if (
        centerFilter !== "all" &&
        (course.center_name || "Khác") !== centerFilter
      )
        return false;
      if (
        fieldFilter !== "all" &&
        (course.training_field || "Khác") !== fieldFilter
      )
        return false;

      if (keyword) {
        const haystack = [
          course.name,
          course.description,
          course.center_name,
          course.location,
        ]
          .filter(Boolean)
          .map((field) => (field as string).toLowerCase());
        if (!haystack.some((field) => field.includes(keyword))) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "start_desc":
          return (
            getDateValue(b.start_date, Number.MIN_SAFE_INTEGER) -
            getDateValue(a.start_date, Number.MIN_SAFE_INTEGER)
          );
        case "name_az":
          return (a.name || "").localeCompare(b.name || "");
        case "popular_desc":
          return (b.registered_count || 0) - (a.registered_count || 0);
        case "status_priority": {
          const orderA = STATUS_PRIORITY[getStatusMeta(a).state] ?? 99;
          const orderB = STATUS_PRIORITY[getStatusMeta(b).state] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return getDateValue(a.start_date) - getDateValue(b.start_date);
        }
        case "start_asc":
        default:
          return getDateValue(a.start_date) - getDateValue(b.start_date);
      }
    });

    return sorted;
  }, [
    courses,
    searchTerm,
    statusFilter,
    centerFilter,
    fieldFilter,
    sortOption,
    onlyAvailable,
    localCourseStates,
    lockedCourses,
  ]);

  const handleResetFilters = () => {
    setStatusFilter("all");
    setCenterFilter("all");
    setFieldFilter("all");
    setSortOption("start_asc");
    setOnlyAvailable(false);
    setSearchTerm("");
  };

  const handleRegister = async (course: CandidateCourse) => {
    if (!canRegisterCourse(course)) {
      toast.info("Bạn đã đăng ký khóa học này hoặc đang chờ duyệt.");
      return;
    }

    try {
      setRegisteringId(course.id);
      const res = await registerMutation.mutateAsync(course.id);
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã gửi yêu cầu đăng ký");
        const requestedAt = new Date().toISOString();
        setLockedCourses((prev) => ({ ...prev, [course.id]: true }));
        setLocalCourseStates((prev) => ({
          ...prev,
          [course.id]: { status: "cho_duyet", requested_at: requestedAt },
        }));
        setSelectedCourse((prev) =>
          prev?.id === course.id
            ? {
                ...prev,
                can_register: false,
                candidate_status: "cho_duyet",
                candidate_requested_at: requestedAt,
              }
            : prev,
        );
        refetch();
      } else {
        toast.error((res as any)?.mes || "Đăng ký thất bại");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Đăng ký thất bại");
    } finally {
      setRegisteringId(null);
    }
  };

  const renderCourseDetailModal = () => {
    if (!selectedCourse) return null;
    const statusMeta = getStatusMeta(selectedCourse);
    const isSubmitting = registeringId === selectedCourse.id;
    const allowRegister = canRegisterCourse(selectedCourse);
    const requestedAt = statusMeta.requested_at;
    const centerName =
      selectedCourse.center?.name ||
      selectedCourse.center_name ||
      "Chưa cập nhật";
    const centerEmail =
      selectedCourse.center?.email || selectedCourse.center_email || null;
    const centerPhone =
      selectedCourse.center?.phone || selectedCourse.center_phone || null;
    const centerWebsite =
      selectedCourse.center?.website || selectedCourse.center_website || null;
    const centerAddressParts = [
      selectedCourse.center?.address?.street,
      ward?.name || selectedCourse.center?.address?.ward_code,
      selectedCourse.center?.address?.district_code,
      province?.name || selectedCourse.center?.address?.province_code,
    ].filter(Boolean);
    const centerAddress =
      (centerAddressParts.length ? centerAddressParts.join(", ") : null) ||
      selectedCourse.location ||
      null;
    const detailLines: string[] = (() => {
      const details = selectedCourse.details;
      if (typeof details === "string") {
        return details
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
      }
      if (Array.isArray(details)) {
        return details.map((item) => String(item)).filter(Boolean);
      }
      if (details && typeof details === "object") {
        try {
          return [JSON.stringify(details, null, 2)];
        } catch {
          return [];
        }
      }
      return [];
    })();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setSelectedCourse(null)}
        />
        <div className="relative z-10 h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase text-gray-400">
                Chi tiết khóa học
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCourse.name}
              </h2>
            </div>
            <button
              aria-label="Đóng"
              className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-700"
              onClick={() => setSelectedCourse(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid h-[calc(90vh-5rem)] grid-cols-1 overflow-y-auto p-6 md:grid-cols-[1.3fr_1fr] md:gap-6">
            <div className="space-y-6">
              <section className="rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Thông tin khóa học
                </p>
                <div className="mt-4 space-y-4 text-sm text-gray-600">
                  {selectedCourse.description && (
                    <p className="text-base text-gray-700">
                      {selectedCourse.description}
                    </p>
                  )}
                  {detailLines.length > 0 && (
                    <div className="space-y-2">
                      {detailLines.map((line, idx) => (
                        <p key={idx} className="text-gray-600">
                          • {line}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Thời gian
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedCourse.start_date)} →{" "}
                        {formatDate(selectedCourse.end_date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Yêu cầu có mặt theo lịch trung tâm
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Địa điểm
                      </p>
                      <p className="font-medium text-gray-900">
                        {selectedCourse.location || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        Sĩ số hiện tại
                      </p>
                      <p className="font-medium text-gray-900">
                        {selectedCourse.registered_count || 0}/
                        {selectedCourse.capacity || "100"} học viên
                      </p>
                    </div>
                    {selectedCourse.training_field && (
                      <div>
                        <p className="text-xs uppercase text-gray-400">
                          Lĩnh vực đào tạo
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedCourse.training_field}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedCourse.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600"
                        >
                          <Tag className="h-3.5 w-3.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Trung tâm phụ trách
                </p>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <Users className="h-4 w-4 text-gray-400" />
                    {centerName}
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {centerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${centerEmail}`}
                          className="text-orange-600 hover:underline"
                        >
                          {centerEmail}
                        </a>
                      </div>
                    )}
                    {centerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${centerPhone}`}
                          className="text-orange-600 hover:underline"
                        >
                          {centerPhone}
                        </a>
                      </div>
                    )}
                    {centerWebsite && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a
                          href={centerWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:underline"
                        >
                          {centerWebsite}
                        </a>
                      </div>
                    )}
                    {centerAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                        <span>{centerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Trạng thái đăng ký
                </p>
                <p
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}
                >
                  {statusMeta.label}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {requestedAt
                    ? `Đã gửi yêu cầu lúc ${formatDateTime(requestedAt)}`
                    : "Bạn chưa gửi yêu cầu đăng ký khóa học này."}
                </p>
              </section>

              <section className="rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Hành động
                </p>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <p>
                    Trung tâm sẽ xem xét yêu cầu và liên hệ nếu thông tin phù
                    hợp.
                  </p>
                  {isSubmitting && (
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2 text-center text-sm font-semibold text-orange-600">
                      Đang gửi yêu cầu...
                    </div>
                  )}
                  {allowRegister && !isSubmitting && (
                    <button
                      type="button"
                      className="w-full rounded-2xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                      onClick={() => handleRegister(selectedCourse)}
                    >
                      Đăng ký ngay
                    </button>
                  )}
                  {!allowRegister && !isSubmitting && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-center text-xs font-semibold text-gray-600">
                      {statusMeta.description}
                    </div>
                  )}
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
                    onClick={() => setSelectedCourse(null)}
                  >
                    Đóng
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl space-y-6 py-6">
        <section className="rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-500 via-orange-400 to-pink-400 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold uppercase tracking-wide">
                <Sparkles className="h-4 w-4" />
                Nâng cấp kỹ năng
              </p>
              <h1 className="text-3xl font-bold leading-tight">
                Khóa học dành cho ứng viên
              </h1>
              <p className="text-white/90">
                Xem thông tin chi tiết và gửi yêu cầu đăng ký để Trung tâm xem
                xét, phê duyệt.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
              <div className="rounded-2xl bg-white/20 p-3">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm uppercase text-white/80">
                  Khóa học khả dụng
                </p>
                <p className="text-3xl font-extrabold">{courses.length}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên khóa học, trung tâm, địa điểm"
                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
              />
            </div>
            <p className="text-sm text-gray-500">
              Đang hiển thị {filteredCourses.length}/{courses.length} khóa học
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Trạng thái
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusState | "all")
                }
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Trung tâm
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                value={centerFilter}
                onChange={(e) => setCenterFilter(e.target.value)}
              >
                <option value="all">Tất cả trung tâm</option>
                {centerOptions.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Lĩnh vực đào tạo
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
              >
                <option value="all">Tất cả lĩnh vực</option>
                {fieldOptions.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sắp xếp
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortKey)}
              >
                {(
                  Object.entries(SORT_OPTION_CONFIG) as [
                    SortKey,
                    { label: string; helper: string },
                  ][]
                ).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                {SORT_OPTION_CONFIG[sortOption].helper}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              Chỉ hiển thị khóa học còn trống
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                  {activeFilterCount} bộ lọc đang bật
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm font-semibold text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Hourglass className="mr-2 h-5 w-5 animate-spin" />
            Đang tải khóa học...
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-red-600">
            Không thể tải danh sách khóa học. Vui lòng thử lại sau.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
                Hiện chưa có khóa học phù hợp với từ khóa.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredCourses.map((course) => {
                  const statusMeta = getStatusMeta(course);
                  const isSubmitting = registeringId === course.id;
                  const allowRegister = canRegisterCourse(course);
                  return (
                    <article
                      key={course.id}
                      className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}
                            >
                              {statusMeta.state === "approved" && (
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                              )}
                              {statusMeta.state === "pending" && (
                                <Clock className="mr-1 h-4 w-4" />
                              )}
                              {statusMeta.label}
                            </p>
                            <h3 className="mt-3 text-2xl font-bold text-gray-900">
                              {course.name}
                            </h3>
                            {course.description && (
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {course.description}
                              </p>
                            )}
                          </div>
                          <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                            <GraduationCap className="h-6 w-6" />
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                          {course.center_name && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{course.center_name}</span>
                            </div>
                          )}
                          {course.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{course.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatDate(course.start_date)} →{" "}
                              {formatDate(course.end_date)}
                            </span>
                          </div>
                          {(course.capacity || course.registered_count) && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              <span>
                                {course.registered_count || 0}/
                                {course.capacity || "100"} học viên
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-gray-500">
                          {statusMeta.description}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
                          >
                            <Info className="h-4 w-4" />
                            Xem chi tiết
                          </button>
                          {isSubmitting && (
                            <span className="text-sm font-semibold text-orange-600">
                              Đang gửi yêu cầu...
                            </span>
                          )}
                          {!isSubmitting && allowRegister && (
                            <button
                              type="button"
                              onClick={() => handleRegister(course)}
                              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                            >
                              Đăng ký khóa học
                            </button>
                          )}
                          {!allowRegister &&
                            !isSubmitting &&
                            statusMeta.state !== "idle" && (
                              <span className="text-sm font-semibold text-gray-400">
                                {statusMeta.label}
                              </span>
                            )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {renderCourseDetailModal()}
      </div>
    </CandidateLayout>
  );
};

export default CandidateCourses;
