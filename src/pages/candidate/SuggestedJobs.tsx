import React, { useMemo, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Clock,
  Lightbulb,
  MapPin,
  RefreshCcw,
} from "lucide-react";
import { useCandidateSuggestedJobsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { useJobLocationResolver } from "@/hooks/useJobLocationResolver";

const CandidateSuggestedJobs: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc làm gợi ý";
  const { data, isLoading, isError, refetch, isFetching } =
    useCandidateSuggestedJobsQuery();
  const jobs = data?.data ?? [];
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { resolveJobLocation } = useJobLocationResolver();
  const selectableFields = useMemo(() => {
    const raw = jobs[0]?.fields;
    if (Array.isArray(raw) && raw.length) return raw;
    if (typeof raw === "string" && raw.trim()) return [raw];
    return ["CNTT", "Kinh doanh", "Ngân hàng"];
  }, [jobs]);

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j: any) => {
      if (j.status) set.add(j.status);
    });
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const term = search.trim().toLowerCase();
      if (
        term &&
        !`${job.position || ""} ${job.recruiter_name || ""}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (statuses.length && (!job.status || !statuses.includes(job.status))) {
        return false;
      }
      if (
        selectedFields.length &&
        !selectedFields.every((f) => (job.fields || []).includes(f))
      ) {
        return false;
      }
      return true;
    });
  }, [jobs, search, statuses, selectedFields]);

  const toggleStatus = (value: string) => {
    setStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleField = (value: string) => {
    setSelectedFields((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-500">
                Danh sách việc làm phù hợp được hệ thống gợi ý theo hồ sơ của
                bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              title="Làm mới gợi ý"
            >
              <RefreshCcw className="h-4 w-4" />
              Làm mới
            </button>
          </header>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Vị trí, nhà tuyển dụng..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Trạng thái
              </p>
              <div className="flex flex-wrap gap-2">
                {allStatuses.length === 0 && (
                  <span className="text-sm text-gray-400">Không có dữ liệu</span>
                )}
                {allStatuses.map((st) => (
                  <label
                    key={st}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      checked={statuses.includes(st)}
                      onChange={() => toggleStatus(st)}
                    />
                    {st}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Ngành</p>
              <div className="flex flex-wrap gap-2">
                {selectableFields.map((field: string) => (
                  <label
                    key={field}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      checked={selectedFields.includes(field)}
                      onChange={() => toggleField(field)}
                    />
                    {field}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-500">Đang tải...</div>
        )}
        {isError && (
          <div className="text-center text-red-500">
            Không thể tải danh sách.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-4 space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có gợi ý phù hợp.
              </div>
            ) : (
              filteredJobs.map((job: any) => {
                const isExpanded = expandedId === job.id;
                const locationInfo = resolveJobLocation(job);
                const locationText =
                  locationInfo.label || job.location || "Chưa cập nhật địa điểm";
                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <Lightbulb className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400">
                            {job.recruiter_name || "Nhà tuyển dụng"}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {job.position || "Chưa có tên"}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {(job.fields || []).slice(0, 3).map((f: string) => (
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
                        <div className="text-sm text-gray-600">
                          Lương: {formatCurrency(job.monthly_salary)}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId((prev) => (prev === job.id ? null : job.id))
                          }
                          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      {job.application_deadline_to && (
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          Hạn: {formatDate(job.application_deadline_to)}
                        </span>
                      )}
                      {job.job_type && (
                        <span className="inline-flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          {job.job_type}
                        </span>
                      )}
                      {job.working_time && (
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {job.working_time}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {locationText}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 border-t border-dashed border-gray-200 pt-3 text-sm text-gray-700">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Yêu cầu
                            </p>
                            <p>{job.requirements || "Không có"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Phúc lợi
                            </p>
                            {job.benefits?.length ? (
                              <div className="flex flex-wrap gap-2">
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
                              <p>—</p>
                            )}
                          </div>
                        </div>
                        {job.other_requirements && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Khác
                            </p>
                            <p>{job.other_requirements}</p>
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

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "Thỏa thuận";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

export default CandidateSuggestedJobs;
