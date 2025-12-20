import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Clock,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import {
  useDeleteRecruiterJobPostMutation,
  useRecruiterJobPostsQuery,
} from "@/api/recruiter.api";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { toast } from "react-toastify";
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";

type StatusValue = "all" | "Đang mở" | "Đang xem xét" | "Đã tuyển" | "Đã hủy";

const STATUS_TABS: Array<{ label: string; value: StatusValue }> = [
  { label: "Tất cả", value: "all" },
  { label: "Đang mở", value: "Đang mở" },
  { label: "Đang xem xét", value: "Đang xem xét" },
  { label: "Đã tuyển", value: "Đã tuyển" },
  { label: "Đã hủy", value: "Đã hủy" },
];

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
      return value
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return value ? [value] : [];
  }
  return [];
};

const formatCurrency = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "Thoả thuận";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa thiết lập";

const StatusBadge = ({ status }: { status?: string | null }) => {
  const map: Record<string, string> = {
    "Đang mở": "bg-emerald-50 text-emerald-700",
    "Đang xem xét": "bg-amber-50 text-amber-700",
    "Đã tuyển": "bg-indigo-50 text-indigo-700",
    "Đã hủy": "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status || ""] || "bg-gray-100 text-gray-600"}`}>
      {status || "Chưa cập nhật"}
    </span>
  );
};

const RecruiterJobPosts: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Tin tuyển dụng";
  const { data, isLoading, isError, refetch } = useRecruiterJobPostsQuery();
  const jobs = data?.data ?? [];
  const deleteMutation = useDeleteRecruiterJobPostMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusValue>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [workingTimeFilter, setWorkingTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated_at" | "created_at" | "position" | "deadline">("updated_at");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const { data: provinceData } = useProvincesQuery();
  const { data: wardData } = useWardsQuery(true);

  useEffect(() => {
    if (!provinceFilter) setWardFilter("");
  }, [provinceFilter]);

  const filteredWardOptions = useMemo(() => {
    if (!wardData) return [];
    return wardData.filter((ward) =>
      provinceFilter ? String(ward.province_code) === String(provinceFilter) : true
    );
  }, [wardData, provinceFilter]);

  const stats = useMemo(() => {
    const active = jobs.filter((job: any) => job.status === "Đang mở");
    const pending = jobs.filter((job: any) => job.status === "Đang xem xét");
    const hired = jobs.filter((job: any) => job.status === "Đã tuyển");
    const closingSoon = jobs.filter((job: any) => {
      if (!job.application_deadline_to) return false;
      const diff = new Date(job.application_deadline_to).getTime();
      return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 7;
    });
    return { total: jobs.length, active: active.length, pending: pending.length, hired: hired.length, closingSoon: closingSoon.length };
  }, [jobs]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusValue, number> = {
      all: jobs.length,
      "Đang mở": 0,
      "Đang xem xét": 0,
      "Đã tuyển": 0,
      "Đã hủy": 0,
    };
    jobs.forEach((job: any) => {
      const statusKey = STATUS_TABS.find((tab) => tab.value === job.status)?.value;
      if (statusKey && statusKey !== "all") {
        counts[statusKey] += 1;
      }
    });
    return counts;
  }, [jobs]);

  const recruitmentTypes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job: any) => {
      if (job.recruitment_type) set.add(job.recruitment_type);
    });
    return Array.from(set);
  }, [jobs]);

  const workingTimes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job: any) => {
      if (job.working_time) set.add(job.working_time);
    });
    return Array.from(set);
  }, [jobs]);

  const jobTypes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job: any) => {
      if (job.job_type) set.add(job.job_type);
    });
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (typeFilter !== "all" && job.recruitment_type !== typeFilter) return false;
      if (workingTimeFilter !== "all" && job.working_time !== workingTimeFilter) return false;
      if (jobTypeFilter !== "all" && job.job_type !== jobTypeFilter) return false;
      const salaryValue = Number(job.monthly_salary || 0);
      if (minSalary && salaryValue < Number(minSalary)) return false;
      if (maxSalary && salaryValue > Number(maxSalary)) return false;
      if (search.trim()) {
        const keyword = search.trim().toLowerCase();
        const fields = parseTags(job.fields).join(" ").toLowerCase();
        const haystack = `${job.position || ""} ${job.requirements || ""} ${fields}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      const jobProvince =
        job.address?.province_code ??
        job.recruiter?.address?.province_code ??
        job.recruiter?.province_code ??
        job.province_code ??
        null;
      if (provinceFilter && String(jobProvince || "") !== String(provinceFilter)) return false;
      const jobWard =
        job.address?.ward_code ??
        job.recruiter?.address?.ward_code ??
        job.recruiter?.ward_code ??
        job.ward_code ??
        null;
      if (wardFilter && String(jobWard || "") !== String(wardFilter)) return false;
      return true;
    });
  }, [
    jobs,
    search,
    statusFilter,
    typeFilter,
    workingTimeFilter,
    jobTypeFilter,
    minSalary,
    maxSalary,
    provinceFilter,
    wardFilter,
  ]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    const direction = sortOrder === "asc" ? 1 : -1;
    const parseDate = (value?: string | null) => (value ? new Date(value).getTime() : 0);
    list.sort((a: any, b: any) => {
      let comparison = 0;
      switch (sortBy) {
        case "position":
          comparison = (a.position || "").localeCompare(b.position || "", "vi", { sensitivity: "base" });
          break;
        case "created_at":
          comparison = parseDate(a.created_at) - parseDate(b.created_at);
          break;
        case "deadline":
          comparison = parseDate(a.application_deadline_to) - parseDate(b.application_deadline_to);
          break;
        case "updated_at":
        default:
          comparison = parseDate(a.updated_at) - parseDate(b.updated_at);
          break;
      }
      return comparison * direction;
    });
    return list;
  }, [filteredJobs, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setWorkingTimeFilter("all");
    setJobTypeFilter("all");
    setMinSalary("");
    setMaxSalary("");
    setProvinceFilter("");
    setWardFilter("");
    setSortBy("updated_at");
    setSortOrder("desc");
  };

  const handleDelete = async (jobId: string) => {
    const ok = window.confirm("Xóa tin tuyển dụng này?");
    if (!ok) return;
    try {
      const res = await deleteMutation.mutateAsync(jobId);
      if ((res as any)?.err === 0) {
        toast.info((res as any)?.mes || "Đã xóa tin.");
        await refetch();
      } else {
        toast.error((res as any)?.mes || "Xóa thất bại.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  const isFiltered =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    workingTimeFilter !== "all" ||
    jobTypeFilter !== "all" ||
    minSalary !== "" ||
    maxSalary !== "" ||
    provinceFilter !== "" ||
    wardFilter !== "" ||
    sortBy !== "updated_at" ||
    sortOrder !== "desc";

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Quản lý tin tuyển dụng
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">
                Theo dõi trạng thái, lọc nhanh và quản lý các tin đăng hiện tại.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Làm mới
              </button>
              <Link
                to={path.RECRUITER_JOB_CREATE}
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                + Đăng tin mới
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tin đang mở", value: stats.active },
              { label: "Chờ duyệt", value: stats.pending },
              { label: "Đã tuyển", value: stats.hired },
              { label: "Sắp hết hạn", value: stats.closingSoon },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <nav className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-orange-200 bg-orange-50 text-orange-600"
                      : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600"
                  }`}
                >
                  {tab.label}
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-500">
                    {statusCounts[tab.value] ?? 0}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="mt-6 rounded-2xl border border-dashed border-gray-100 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="h-4 w-4 text-orange-500" /> Bộ lọc & sắp xếp
              </div>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!isFiltered}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition disabled:opacity-40"
              >
                Đặt lại tất cả
              </button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm vị trí, yêu cầu, ngành nghề"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Hình thức tuyển</option>
                {recruitmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-4">
              <select
                value={workingTimeFilter}
                onChange={(e) => setWorkingTimeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Thời gian làm việc</option>
                {workingTimes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Loại công việc</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="Lương tối thiểu"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="number"
                min={0}
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="Lương tối đa"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-4">
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Tỉnh/TP</option>
                {provinceData?.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                disabled={!provinceFilter}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">Phường/Xã</option>
                {filteredWardOptions.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "updated_at" | "created_at" | "position" | "deadline")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="updated_at">Sắp xếp theo ngày cập nhật</option>
                <option value="created_at">Sắp xếp theo ngày tạo</option>
                <option value="deadline">Theo hạn nộp</option>
                <option value="position">Theo vị trí A-Z</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="desc">Mới nhất trước</option>
                <option value="asc">Cũ nhất trước</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {isLoading && (
            <div className="flex h-48 items-center justify-center text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
              Đang tải tin đăng...
            </div>
          )}

          {isError && (
            <div className="flex h-48 items-center justify-center text-red-500">
              <XCircle className="mr-2 h-5 w-5" />
              Không thể tải tin đăng.
            </div>
          )}

          {!isLoading && !isError && sortedJobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
              Không tìm thấy tin phù hợp với bộ lọc hiện tại.
            </div>
          )}

          {!isLoading && !isError &&
            sortedJobs.map((job: any) => {
              const tags = parseTags(job.fields);
              return (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Vị trí tuyển dụng
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.position || "Chưa cập nhật"}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" /> SL cần: {job.available_quantity ?? "—"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" /> {job.working_time || "Chưa rõ"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {job.recruitment_type || "Hình thức khác"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-gray-500">
                        Hạn nộp: {formatDate(job.application_deadline_to)}
                      </span>
                    </div>
                  </div>

                  {job.requirements && (
                    <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                      {job.requirements}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {tags.slice(0, 6).map((tag) => (
                      <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-[11px] text-orange-700">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                    <div>
                      <p className="text-gray-400">Thu nhập dự kiến</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(job.monthly_salary)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Thời lượng tuyển</p>
                      <p className="font-semibold text-gray-900">{job.duration || "Không rõ"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Ngày cập nhật</p>
                      <p className="font-semibold text-gray-900">{formatDate(job.updated_at)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <Link
                      to={path.RECRUITER_JOB_EDIT.replace(":id", job.id)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Chỉnh sửa
                    </Link>
                    <Link
                      to={`${path.RECRUITER_JOB_CANDIDATES}?job_post_id=${job.id}`}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Ứng viên cho tin
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(job.id)}
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Xóa tin
                    </button>
                  </div>
                </article>
              );
            })}
        </section>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterJobPosts;
