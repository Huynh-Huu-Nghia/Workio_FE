import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  Loader2,
  MapPin,
  Search,
  Building2,
} from "lucide-react";
import { useCandidateAppliedJobsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation, useNavigate } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { INDUSTRY_OPTIONS } from "@/constants/industries";
import { useJobLocationResolver } from "@/hooks/useJobLocationResolver";
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";
import path from "@/constants/path";

const CandidateAppliedJobs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const { resolveJobLocation } = useJobLocationResolver();
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

  const statusCounts = useMemo(() => {
    const counts = {
      total: jobs.length,
      active: 0,
      reviewing: 0,
      hired: 0,
    };
    jobs.forEach((job: any) => {
      const status = (job.status || "").toLowerCase();
      if (status.includes("đang mở")) counts.active += 1;
      if (status.includes("xem xét")) counts.reviewing += 1;
      if (status.includes("tuyển") || status.includes("nhận")) counts.hired += 1;
    });
    return counts;
  }, [jobs]);

  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(value)
    );
  };
  const formatDate = (value?: string | null) =>
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
        const locationInfo = resolveJobLocation(job);
        if (
          provinceFilter &&
          String(locationInfo.provinceCode || "") !== String(provinceFilter)
        ) {
          return false;
        }
        if (wardFilter && String(locationInfo.wardCode || "") !== String(wardFilter)) {
          return false;
        }
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
      provinceFilter,
      wardFilter,
      resolveJobLocation,
    ]);

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              Danh sách các tin tuyển dụng bạn đã nộp đơn/ứng tuyển.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="rounded-2xl border border-gray-200 px-4 py-2">
              <p className="text-xs text-gray-500">Tổng tin đã ứng tuyển</p>
              <p className="text-xl font-semibold text-gray-800">{statusCounts.total}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-2">
              <p className="text-xs text-gray-500">Đang mở</p>
              <p className="text-xl font-semibold text-gray-800">{statusCounts.active}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-2">
              <p className="text-xs text-gray-500">Đang xem xét</p>
              <p className="text-xl font-semibold text-gray-800">{statusCounts.reviewing}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-2">
              <p className="text-xs text-gray-500">Đã tuyển/Nhận</p>
              <p className="text-xl font-semibold text-gray-800">{statusCounts.hired}</p>
            </div>
          </div>
        </div>
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Vị trí, ngành nghề"
                  className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                <option value="Đang mở">Đang mở</option>
                <option value="Đang xem xét">Đang xem xét</option>
                <option value="Đã tuyển">Đã tuyển</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">Mặc định</option>
                <option value="created_at">Ngày nộp</option>
                <option value="monthly_salary">Mức lương</option>
                <option value="application_deadline_to">Hạn nộp</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Thứ tự</label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tỉnh / TP</label>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                {provinceData?.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phường / Xã</label>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                disabled={!provinceFilter}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
              >
                <option value="">Tất cả</option>
                {filteredWardOptions.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Lương từ</label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Lương đến</label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Loại việc</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Giờ làm</label>
              <select
                value={workingTime}
                onChange={(e) => setWorkingTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                <option value="Giờ hành chính">Giờ hành chính</option>
                <option value="Linh hoạt">Linh hoạt</option>
                <option value="Ca">Ca</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-1 text-sm font-medium text-gray-700">Ngành</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              {INDUSTRY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1"
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
                const locationInfo = resolveJobLocation(job);
                const locationText = locationInfo.label || "Chưa cập nhật địa điểm";
                const recruiterId =
                  job.recruiter_id ||
                  job.recruiter?.recruiter_id ||
                  job.recruiter?.id ||
                  job.recruiter?.user_id;
                const recruiterLabel =
                  job.recruiter?.company_name ||
                  job.recruiter_name ||
                  job.recruiter?.user?.email ||
                  job.recruiter?.contact_name ||
                  "Nhà tuyển dụng";
                const canViewRecruiter = Boolean(recruiterId);
                const recruiterIdStr = recruiterId ? String(recruiterId) : "";
                const goToRecruiter = () => {
                  if (!canViewRecruiter) return;
                  navigate(path.CANDIDATE_RECRUITER_VIEW.replace(":id", recruiterIdStr));
                };
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
                          {(job.recruiter_name || job.recruiter?.company_name || canViewRecruiter) && (
                            <button
                              type="button"
                              onClick={goToRecruiter}
                              className="text-left text-xs font-semibold uppercase text-gray-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:text-gray-400"
                              disabled={!canViewRecruiter}
                            >
                              {recruiterLabel}
                            </button>
                          )}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {locationText}
                        </span>
                        {job.support_info && (
                          <span className="text-xs text-gray-500">
                            Hỗ trợ: {job.support_info}
                          </span>
                        )}
                      </div>
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
                        {canViewRecruiter && (
                          <button
                            type="button"
                            onClick={goToRecruiter}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <Building2 className="h-4 w-4" />
                            Xem nhà tuyển dụng
                          </button>
                        )}
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
                        {(job.recruiter_name || job.recruiter?.company_name || canViewRecruiter) && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-800">Nhà tuyển dụng:</span>
                            <span className="text-gray-700">{recruiterLabel}</span>
                            {canViewRecruiter && (
                              <button
                                type="button"
                                onClick={goToRecruiter}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-white"
                              >
                                <Building2 className="h-3.5 w-3.5" />
                                Xem hồ sơ
                              </button>
                            )}
                          </div>
                        )}
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
