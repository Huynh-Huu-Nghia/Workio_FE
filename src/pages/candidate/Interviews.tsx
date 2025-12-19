import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  Loader2,
  MapPin,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";
import { useCandidateInterviewsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

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

const CandidateInterviews: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Lịch phỏng vấn";
  const { data, isLoading, isError } = useCandidateInterviewsQuery();
  const interviews = data?.data ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobType, setJobType] = useState("");
  const [workingTime, setWorkingTime] = useState("");
  const [sortBy, setSortBy] = useState<"scheduled_time" | "created_at">("scheduled_time");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    interviews.forEach((i: any) => {
      if (i.status) set.add(i.status);
    });
    return Array.from(set);
  }, [interviews]);

  const filtered = useMemo(() => {
    const list = interviews.filter((itv: any) => {
      const term = search.trim().toLowerCase();
      if (
        term &&
        !`${itv.job_post_title || ""} ${itv.job_post_id || ""}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (statusFilter !== "all" && itv.status !== statusFilter) {
        return false;
      }
      if (jobType && itv.job_type !== jobType) return false;
      if (workingTime && itv.working_time !== workingTime) return false;
      if (selectedFields.length) {
        const f = parseFields(itv.fields);
        if (!f.some((x) => selectedFields.includes(x))) return false;
      }
      return true;
    });

    return list.sort((a: any, b: any) => {
      const factor = order === "ASC" ? 1 : -1;
      if (sortBy === "created_at") {
        return (
          factor *
          (new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime())
        );
      }
      return (
        factor *
        (new Date(a.scheduled_time || 0).getTime() -
          new Date(b.scheduled_time || 0).getTime())
      );
    });
  }, [
    interviews,
    search,
    statusFilter,
    jobType,
    workingTime,
    selectedFields,
    sortBy,
    order,
  ]);

  const toggleField = (value: string) => {
    setSelectedFields((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-500">
                  Lọc và sắp xếp lịch phỏng vấn đang có, giao diện đồng nhất với danh sách việc làm.
                </p>
              </div>
            </header>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tìm kiếm
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Vị trí, mã tin..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  onChange={(e) =>
                    setSortBy(e.target.value as "scheduled_time" | "created_at")
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="scheduled_time">Sắp xếp theo lịch</option>
                  <option value="created_at">Theo ngày tạo</option>
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
              {(parseFields(interviews[0]?.fields || interviews[0]?.job_fields) || INDUSTRY_OPTIONS).map(
                (f: string) => (
                  <label
                    key={f}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(f)}
                      onChange={() => toggleField(f)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    {f}
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải lịch...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải lịch phỏng vấn.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có lịch phỏng vấn phù hợp.
              </div>
            ) : (
              filtered.map((itv: any) => (
                <article
                  key={itv.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-400">
                          {itv.job_post_title || itv.job_post_id || "—"}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Lịch phỏng vấn
                        </h3>
                        {itv.notes && (
                          <p className="text-sm text-gray-600">{itv.notes}</p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-2">
                          {parseFields(itv.fields || itv.job_fields).slice(0, 3).map((f) => (
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
                        {itv.status || "Đang diễn ra"}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <CalendarClock className="h-4 w-4 text-gray-400" />
                        {formatDateTime(itv.scheduled_time)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    {itv.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {itv.location}
                      </span>
                    )}
                    {itv.job_type && (
                      <span className="inline-flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        {itv.job_type}
                      </span>
                    )}
                    {itv.working_time && (
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {itv.working_time}
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        hour12: false,
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Chưa đặt lịch";

export default CandidateInterviews;
