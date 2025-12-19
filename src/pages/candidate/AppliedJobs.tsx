import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  Loader2,
  Search,
  Tags,
  Clock,
} from "lucide-react";
import { useCandidateAppliedJobsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

const CandidateAppliedJobs: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc đã ứng tuyển";
  const { data, isLoading, isError } = useCandidateAppliedJobsQuery();
  const apiErr = data && (data as any).err !== 0;
  const jobs = !apiErr ? data?.data ?? [] : [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobType, setJobType] = useState("");
  const [workingTime, setWorkingTime] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");

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

  const filtered = useMemo(() => {
    return jobs
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
        if (statusFilter && job.status !== statusFilter) return false;
        if (fields.length) {
          const jf = parseFields(job.fields);
          if (!jf.some((f: string) => fields.includes(f))) return false;
        }
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
        if (sortBy === "application_deadline_to") {
          return (
            factor *
            (new Date(a.application_deadline_to || 0).getTime() -
              new Date(b.application_deadline_to || 0).getTime())
          );
        }
        if (sortBy === "created_at") {
          return (
            factor *
            (new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime())
          );
        }
        return 0;
      });
  }, [
    jobs,
    searchTerm,
    fields,
    minSalary,
    maxSalary,
    statusFilter,
    jobType,
    workingTime,
    sortBy,
    order,
  ]);

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-500">
                  Danh sách các tin tuyển dụng bạn đã nộp đơn/ứng tuyển.
                </p>
              </div>
            </header>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo vị trí, ngành nghề"
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="Lương từ"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="Lương đến"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Trạng thái tin</option>
                  <option value="Đang mở">Đang mở</option>
                  <option value="Đang xem xét">Đang xem xét</option>
                  <option value="Đã tuyển">Đã tuyển</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Không sắp xếp</option>
                  <option value="created_at">Ngày nộp</option>
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
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
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
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-40 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải...
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500">Không thể tải danh sách.</div>
        )}

        {!isLoading && !isError && apiErr && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center text-red-700">
            {(data as any)?.mes || "Không tải được danh sách đã ứng tuyển."}
          </div>
        )}

        {!isLoading && !isError && !apiErr && (
          <div className="space-y-3 px-1 py-2">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Bạn chưa ứng tuyển tin nào.
              </div>
            ) : (
              filtered.map((job) => {
                const expanded = expandedId === job.id;
                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {job.position}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Hình thức: {job.recruitment_type || "—"} | Trạng thái: {job.status || "—"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {parseFields(job.fields).slice(0, 3).map((f) => (
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
                        <div className="text-sm font-semibold text-gray-800">
                          {formatCurrency(job.monthly_salary)}
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Hạn nộp: {formatDate(job.application_deadline_to)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : job.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
                          />
                          {expanded ? "Thu gọn" : "Xem chi tiết"}
                        </button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
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
                        {job.other_requirements && (
                          <div>
                            <span className="font-semibold text-gray-800">Yêu cầu khác: </span>
                            {job.other_requirements}
                          </div>
                        )}
                        {job.benefits && (
                          <div>
                            <span className="font-semibold text-gray-800">Quyền lợi: </span>
                            {job.benefits}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

export default CandidateAppliedJobs;
