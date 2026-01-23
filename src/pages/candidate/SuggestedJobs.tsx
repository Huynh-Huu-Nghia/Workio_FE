import React, { useMemo, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Clock,
  Lightbulb,
  MapPin,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import { useCandidateSuggestedJobsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation, useNavigate } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { useJobLocationResolver } from "@/hooks/useJobLocationResolver";
import path from "@/constants/path";

const CandidateSuggestedJobs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pathtotitle[location.pathname] || "Việc làm gợi ý";
  const { data, isLoading, isError, refetch, isFetching } =
    useCandidateSuggestedJobsQuery();
  const jobs = data?.data ?? [];

  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { resolveJobLocation } = useJobLocationResolver();

  // [FIX] Thêm hàm helper để xử lý dữ liệu an toàn
const ensureArray = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    // Nếu là chuỗi JSON mảng (VD: '["A", "B"]')
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Nếu là chuỗi phân cách dấu phẩy (VD: "A, B")
      return data.split(",").map((item) => item.trim());
    }
    // Nếu là chuỗi đơn (VD: "Thưởng")
    return [data];
  }
  return [];
};

  // --- HÀM FORMAT LƯƠNG CHUẨN ---
  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "")
      return "Thỏa thuận";
    const num = Number(value);
    if (isNaN(num) || num === 0) return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "—";

  const selectableFields = useMemo(() => {
    // Lấy danh sách ngành nghề từ dữ liệu jobs để làm filter
    const allFields = new Set<string>();
    jobs.forEach((job: any) => {
      // [FIX] Dùng ensureArray để lấy fields an toàn
      const fieldsArr = ensureArray(job.fields);
      fieldsArr.forEach((f) => allFields.add(f));
    });
    return Array.from(allFields);
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
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  };

  const toggleField = (value: string) => {
    setSelectedFields((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
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
              <RefreshCcw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
          </header>

          {/* Simple Filter Section for Suggested Jobs */}
          <div className="grid gap-3 md:grid-cols-3 pt-3 border-t border-gray-100">
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
                  <span className="text-sm text-gray-400">
                    Không có dữ liệu
                  </span>
                )}
                {allStatuses.map((st) => (
                  <label
                    key={st}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
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
              <p className="mb-1 text-sm font-medium text-gray-700">
                Ngành phù hợp
              </p>
              <div className="flex flex-wrap gap-2">
                {selectableFields.length === 0 && (
                  <span className="text-sm text-gray-400">Không có ngành</span>
                )}
                {selectableFields.map((field: string) => (
                  <label
                    key={field}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
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
          <div className="text-center text-gray-500 py-10">
            Đang tải gợi ý...
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500 py-10">
            Không thể tải danh sách gợi ý.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-4 space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Chưa có gợi ý phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredJobs.map((job: any) => {
                const isExpanded = expandedId === job.id;
                // Chuẩn bị dữ liệu an toàn
                const jobFields = ensureArray(job.fields);
                const jobBenefits = ensureArray(job.benefits); // [QUAN TRỌNG]
                const locationInfo = resolveJobLocation(job);
                const locationText =
                  locationInfo.label ||
                  job.location ||
                  "Chưa cập nhật địa điểm";

                // Logic check recruiter để link tới trang chi tiết
                const recruiterId = job.recruiter_id || job.recruiter?.id;
                const canViewRecruiter = Boolean(recruiterId);
                const goToRecruiter = () => {
                  if (canViewRecruiter)
                    navigate(
                      path.CANDIDATE_RECRUITER_VIEW.replace(
                        ":id",
                        String(recruiterId),
                      ),
                    );
                };

                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                          <Lightbulb className="h-6 w-6" />
                        </div>
                        <div>
                          <button
                            onClick={goToRecruiter}
                            disabled={!canViewRecruiter}
                            className="text-xs uppercase text-gray-400 hover:text-orange-500 text-left font-bold"
                          >
                            {job.recruiter_name ||
                              job.recruiter?.company_name ||
                              "Nhà tuyển dụng"}
                          </button>
                          <h3 className="text-lg font-semibold text-gray-800 mt-0.5">
                            {job.position || "Chưa có tên vị trí"}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(job.fields || []).slice(0, 3).map((f: string) => (
                              <span
                                key={f}
                                className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700"
                              >
                                {f}
                              </span>
                            ))}
                            {/* Hiển thị Match Score nếu có */}
                            {job.match_score && (
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700 border border-green-200">
                                Độ phù hợp: {Math.round(job.match_score)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {job.status || "Đang mở"}
                        </span>

                        {/* --- PHẦN HIỂN THỊ LƯƠNG ĐÃ SỬA --- */}
                        <div className="text-sm font-bold text-gray-800">
                          {formatCurrency(job.monthly_salary)}
                        </div>
                        {/* ---------------------------------- */}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === job.id ? null : job.id,
                              )
                            }
                            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-orange-600"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition ${isExpanded ? "rotate-180" : ""}`}
                            />
                            {isExpanded ? "Thu gọn" : "Xem thêm"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                path.CANDIDATE_JOB_VIEW.replace(":id", job.id),
                              )
                            }
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin chi tiết khi mở rộng */}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
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

                    {/* [FIX] Phần render chi tiết đã sử dụng jobBenefits đã xử lý */}
                    {isExpanded && (
                      <div className="mt-3 border-t border-dashed border-gray-200 pt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                              Yêu cầu công việc
                            </p>
                            <p className="whitespace-pre-line">
                              {job.requirements || "Không có mô tả chi tiết."}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                              Phúc lợi
                            </p>
                            {/* Sử dụng jobBenefits thay vì job.benefits */}
                            {jobBenefits.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {jobBenefits.map((b: string) => (
                                  <span
                                    key={b}
                                    className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 border border-green-100"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400">Chưa cập nhật</p>
                            )}

                            {job.other_requirements && (
                              <div className="mt-3">
                                <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                                  Yêu cầu khác
                                </p>
                                <p>{job.other_requirements}</p>
                              </div>
                            )}
                          </div>
                        </div>
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

export default CandidateSuggestedJobs;
