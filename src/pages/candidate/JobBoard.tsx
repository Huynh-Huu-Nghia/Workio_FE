import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  Loader2,
  MapPin,
  XCircle,
  ChevronDown,
  Search,
  Tags,
  Clock,
} from "lucide-react";
import { useApplyJobCandidateMutation, useCandidateJobPostsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { toast } from "react-toastify";
import { useUser } from "@/context/user/user.context";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

const CandidateJobBoard: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc làm";
  const { data, isLoading, isError } = useCandidateJobPostsQuery();
  const jobs = data?.data ?? [];
  const applyMutation = useApplyJobCandidateMutation();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [jobType, setJobType] = useState("");
  const [workingTime, setWorkingTime] = useState("");

  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(value)
    );
  };
  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa thiết lập";

  const parseFields = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return [val];
      }
    }
    return [];
  };

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j: any) => j.status && set.add(j.status));
    return Array.from(set);
  }, [jobs]);

  const filtered = useMemo(() => {
    const result = jobs
      .filter((job: any) => {
        const keyword = searchTerm.toLowerCase();
        if (
          keyword &&
          !(
            job.position?.toLowerCase().includes(keyword) ||
            (Array.isArray(job.fields)
              ? job.fields.join(" ").toLowerCase().includes(keyword)
              : "")
          )
        ) {
          return false;
        }
        if (fields.length) {
          const jf = parseFields(job.fields);
          if (!jf.some((f: string) => fields.includes(f))) return false;
        }
        if (statusFilter !== "all" && job.status !== statusFilter) return false;
        if (jobType && job.job_type !== jobType) return false;
        if (workingTime && job.working_time !== workingTime) return false;
        if (minSalary && Number(job.monthly_salary || 0) < Number(minSalary)) return false;
        if (maxSalary && Number(job.monthly_salary || 0) > Number(maxSalary)) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        if (!sortBy) return 0;
        const factor = order === "ASC" ? 1 : -1;
        if (sortBy === "monthly_salary") {
          return factor * (Number(a.monthly_salary || 0) - Number(b.monthly_salary || 0));
        }
        if (sortBy === "created_at") {
          return (
            factor *
            (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
          );
        }
        if (sortBy === "application_deadline_to") {
          return (
            factor *
            (new Date(a.application_deadline_to || 0).getTime() -
              new Date(b.application_deadline_to || 0).getTime())
          );
        }
        return 0;
      });
    return result;
  }, [
    jobs,
    searchTerm,
    fields,
    minSalary,
    maxSalary,
    statusFilter,
    sortBy,
    order,
    jobType,
    workingTime,
  ]);

  return (
    <CandidateLayout title={title}>
      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo vị trí, ngành nghề"
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              {allStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Không sắp xếp</option>
              <option value="created_at">Ngày đăng</option>
              <option value="monthly_salary">Mức lương</option>
              <option value="application_deadline_to">Hạn nộp</option>
            </select>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="DESC">Giảm dần</option>
              <option value="ASC">Tăng dần</option>
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="flex flex-wrap gap-2 text-xs text-gray-700 md:col-span-2">
            <span className="text-xs text-gray-500">Ngành:</span>
            {INDUSTRY_OPTIONS.map((opt) => (
              <label
                key={opt}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={fields.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) setFields([...fields, opt]);
                    else setFields(fields.filter((f) => f !== opt));
                  }}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                {opt}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-700 md:justify-end">
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="Lương từ"
              className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="Lương đến"
              className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Loại việc</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Intern">Intern</option>
            </select>
            <select
              value={workingTime}
              onChange={(e) => setWorkingTime(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Giờ làm</option>
              <option value="Giờ hành chính">Giờ hành chính</option>
              <option value="Linh hoạt">Linh hoạt</option>
              <option value="Ca">Ca</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
          Đang tải việc làm...
        </div>
      )}

      {isError && (
        <div className="flex h-48 items-center justify-center text-red-500">
          <XCircle className="mr-2 h-5 w-5" />
          Không thể tải danh sách việc làm.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Chưa có việc làm nào.
              </div>
            ) : (
              filtered.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-400">
                          {job.recruiter_name || "Nhà tuyển dụng"}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {job.position}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {(Array.isArray(job.fields) ? job.fields : job.fields ? [job.fields] : []).slice(
                            0,
                            3
                          ).map((f) => (
                            <span
                              key={f}
                              className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {job.status || "Đang mở"}
                      </span>
                      <div className="text-sm font-semibold text-gray-800">
                        {formatCurrency(job.monthly_salary)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Hình thức: {job.recruitment_type || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Hạn nộp: {formatDate(job.application_deadline_to)}
                    </span>
                    {job.working_time && (
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {job.working_time}
                      </span>
                    )}
                    {job.support_info && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {job.support_info}
                      </span>
                    )}
                  </div>
                  {job.requirements && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {job.requirements}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    {(Array.isArray(job.fields) ? job.fields : job.fields ? [job.fields] : []).map(
                      (f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                        >
                          <Tags className="h-3 w-3" />
                          {f}
                        </span>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) => (prev === job.id ? null : job.id))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition ${
                          expandedId === job.id ? "rotate-180" : ""
                        }`}
                      />
                      {expandedId === job.id ? "Thu gọn" : "Xem chi tiết"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setApplyingId(job.id);
                        try {
                          const res = await applyMutation.mutateAsync(job.id);
                          if ((res as any)?.err === 0) {
                            toast.success((res as any)?.mes || "Ứng tuyển thành công");
                          } else {
                            toast.error((res as any)?.mes || "Ứng tuyển thất bại");
                          }
                        } catch (e: any) {
                          toast.error(e?.response?.data?.mes || "Ứng tuyển thất bại");
                        } finally {
                          setApplyingId(null);
                        }
                      }}
                      className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                      disabled={
                        (applyMutation.isPending && applyingId === job.id) ||
                        (Array.isArray(job.applied_candidates) &&
                          Boolean(user?.id) &&
                          job.applied_candidates.includes(user!.id as string))
                      }
                    >
                      {Array.isArray(job.applied_candidates) &&
                      Boolean(user?.id) &&
                      job.applied_candidates.includes(user!.id as string)
                        ? "Đã ứng tuyển"
                        : applyMutation.isPending && applyingId === job.id
                        ? "Đang gửi..."
                        : "Ứng tuyển"}
                    </button>
                  </div>
                  {expandedId === job.id && (
                    <div className="mt-3 space-y-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      {(job.application_deadline_from || job.application_deadline_to) && (
                        <div>
                          <span className="font-semibold text-gray-800">Hạn ứng tuyển: </span>
                          {job.application_deadline_from || "—"} → {job.application_deadline_to || "—"}
                        </div>
                      )}
                      {job.duration && (
                        <div>
                          <span className="font-semibold text-gray-800">Thời lượng: </span>
                          {job.duration}
                        </div>
                      )}
                      {job.support_info && (
                        <div>
                          <span className="font-semibold text-gray-800">Địa điểm hỗ trợ: </span>
                          {job.support_info}
                        </div>
                      )}
                      {job.fields && (
                        <div>
                          <span className="font-semibold text-gray-800">Ngành nghề: </span>
                          {Array.isArray(job.fields) ? job.fields.join(", ") : job.fields}
                        </div>
                      )}
                      {job.monthly_salary && (
                        <div>
                          <span className="font-semibold text-gray-800">Mức lương: </span>
                          {formatCurrency(job.monthly_salary)}
                        </div>
                      )}
                      {job.available_quantity !== null && job.available_quantity !== undefined && (
                        <div>
                          <span className="font-semibold text-gray-800">Số lượng cần: </span>
                          {job.available_quantity}
                        </div>
                      )}
                      {job.languguages && (
                        <div>
                          <span className="font-semibold text-gray-800">Ngôn ngữ: </span>
                          {Array.isArray(job.languguages)
                            ? job.languguages.join(", ")
                            : job.languguages}
                        </div>
                      )}
                      {(job.job_type || job.working_time) && (
                        <div>
                          <span className="font-semibold text-gray-800">Hình thức làm việc: </span>
                          {job.job_type || "—"} {job.working_time ? ` • ${job.working_time}` : ""}
                        </div>
                      )}
                      {(job.graduation_rank || job.computer_skill) && (
                        <div>
                          <span className="font-semibold text-gray-800">Yêu cầu học vấn/kỹ năng: </span>
                          {job.graduation_rank || "—"}{" "}
                          {job.computer_skill ? ` • ${job.computer_skill}` : ""}
                        </div>
                      )}
                      {job.other_requirements && (
                        <div>
                          <span className="font-semibold text-gray-800">Yêu cầu khác: </span>
                          {job.other_requirements}
                        </div>
                      )}
                      {job.benefits && (
                        <div>
                          <span className="font-semibold text-gray-800">Quyền lợi: </span>
                          {Array.isArray(job.benefits) ? (
                            <div className="mt-1 flex flex-wrap gap-2">
                              {job.benefits.map((b: string) => (
                                <span
                                  key={b}
                                  className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          ) : (
                            job.benefits
                          )}
                        </div>
                      )}
                      {Array.isArray(job.applied_candidates) && (
                        <div>
                          <span className="font-semibold text-gray-800">
                            Số ứng viên đã ứng tuyển:{" "}
                          </span>
                          {job.applied_candidates.length}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </CandidateLayout>
    );
  };

export default CandidateJobBoard;
