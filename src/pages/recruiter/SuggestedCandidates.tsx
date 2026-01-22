// File: SuggestedCandidates.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  MapPin,
  Target,
  User,
  Search,
  Clock,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  useRecruiterJobPostsQuery,
  useSuggestedCandidatesQuery,
} from "@/api/recruiter.api";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { useProvincesQuery } from "@/api/provinces.api";

const SuggestedCandidates: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const title = pathtotitle[location.pathname] || "Gợi ý ứng viên";
  const initialJobId = searchParams.get("job_post_id") || "";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [keyword, setKeyword] = useState("");

  const { data: jobsRes } = useRecruiterJobPostsQuery();
  const jobPosts = jobsRes?.data ?? [];
  const { data: provinces } = useProvincesQuery();

  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
      return;
    }
    if (!selectedJobId && jobPosts.length > 0) {
      // Tự động chọn job đang mở đầu tiên
      const firstActiveJob = jobPosts.find((j: any) => j.status === "Đang mở");
      if (firstActiveJob) setSelectedJobId(firstActiveJob.id);
      else setSelectedJobId(jobPosts[0].id);
    }
  }, [initialJobId, jobPosts, selectedJobId]);

  const { data, isFetching } = useSuggestedCandidatesQuery(selectedJobId);
  const candidates = data?.data ?? [];

  const getProvinceName = (code: string | number) => {
    if (!provinces) return code;
    const p = provinces.find((prov) => String(prov.code) === String(code));
    return p ? p.name : code;
  };

  const filteredCandidates = useMemo(() => {
    if (!keyword.trim()) return candidates;
    const q = keyword.trim().toLowerCase();
    return candidates.filter((c: any) => {
      // Handle alias: c.candidate là User Info
      const userInfo = c.candidate || {};
      const haystack =
        `${c.full_name || ""} ${c.email || userInfo.email || ""} ${c.phone || userInfo.phone || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [candidates, keyword]);

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6 mx-auto max-w-6xl">
        {/* Header & Filter */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="text-orange-500" />
                Gợi ý ứng viên (AI Matching)
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Hệ thống tự động chấm điểm độ phù hợp dựa trên hồ sơ ứng viên và
                yêu cầu công việc.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none min-w-[200px]"
              >
                <option value="">-- Chọn tin tuyển dụng --</option>
                {jobPosts.map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.position}{" "}
                    {job.status === "Đang mở" ? "(Đang mở)" : `(${job.status})`}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm tên, email..."
                  className="w-full sm:w-64 rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section>
          {!selectedJobId ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Briefcase className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">
                Vui lòng chọn một tin tuyển dụng để bắt đầu tìm kiếm.
              </p>
            </div>
          ) : isFetching ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
              <p className="mt-4 text-gray-600 font-medium animate-pulse">
                Đang phân tích dữ liệu ứng viên...
              </p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <User className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">
                Chưa tìm thấy ứng viên phù hợp.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Thử điều chỉnh lại địa điểm hoặc yêu cầu công việc.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {filteredCandidates.map((candidate: any) => {
                const scorePercent = Math.round(
                  (candidate.match_score || 0) * 100,
                );
                const provinceCode =
                  candidate.address?.province_code || candidate.province_code;
                const expYears =
                  candidate.matching_vector?.total_experience_years || 0;
                const userInfo = candidate.candidate || {}; // Alias User info

                return (
                  <div
                    key={candidate.candidate_id || candidate.id}
                    className="group relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                  >
                    {/* Header Card */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {userInfo.avatar_url ? (
                          <img
                            src={userInfo.avatar_url}
                            alt="Avatar"
                            className="h-14 w-14 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 font-bold text-xl shadow-inner">
                            {(candidate.full_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition truncate">
                              {candidate.full_name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              {candidate.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={12} /> {candidate.email}
                                </span>
                              )}
                              {candidate.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} /> {candidate.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className={`flex flex-col items-end`}>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${
                                scorePercent >= 70
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : scorePercent >= 40
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                              }`}
                            >
                              {scorePercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span>
                          {expYears > 0 ? `${expYears} năm KN` : "Chưa có KN"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          {getProvinceName(provinceCode) || "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          {candidate.graduation_rank || "Đại học"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          {candidate.working_time || "Toàn thời gian"}
                        </span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    {(candidate.matching_vector?.fields_wish ||
                      candidate.fields_wish) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {parseArray(
                          candidate.matching_vector?.fields_wish ||
                            candidate.fields_wish,
                        )
                          .slice(0, 3)
                          .map((field: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded px-2 py-0.5 text-[11px] bg-gray-100 text-gray-600 font-medium border border-gray-200"
                            >
                              {field}
                            </span>
                          ))}
                        {parseArray(
                          candidate.matching_vector?.fields_wish ||
                            candidate.fields_wish,
                        ).length > 3 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            + thêm
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </RecruiterLayout>
  );
};

// Helper parse
const parseArray = (input: any): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String);
  if (typeof input === "string")
    return input
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

export default SuggestedCandidates;
