import React, { useEffect, useMemo, useState } from "react";
import { Lightbulb, Search, Target } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  useRecruiterJobPostsQuery,
  useSuggestedCandidatesQuery,
} from "@/api/recruiter.api";
import RecruiterLayout from "@/layouts/RecruiterLayout";

const SuggestedCandidates: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const title = pathtotitle[location.pathname] || "Gợi ý ứng viên";
  const initialJobId = searchParams.get("job_post_id") || "";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [keyword, setKeyword] = useState("");

  const { data: jobsRes, isLoading: jobsLoading } = useRecruiterJobPostsQuery();
  const jobPosts = jobsRes?.data ?? [];

  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
      return;
    }
    if (!selectedJobId && jobPosts.length > 0) {
      setSelectedJobId(jobPosts[0].id);
    }
  }, [initialJobId, jobPosts, selectedJobId]);

  const { data, isFetching } = useSuggestedCandidatesQuery(selectedJobId);
  const candidates = data?.data ?? [];

  const filteredCandidates = useMemo(() => {
    if (!keyword.trim()) return candidates;
    const q = keyword.trim().toLowerCase();
    return candidates.filter((c: any) => {
      const haystack =
        `${c.full_name || ""} ${c.email || c.user?.email || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [candidates, keyword]);

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Chọn tin tuyển dụng
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Gợi ý ứng viên phù hợp
              </h2>
              <p className="text-sm text-gray-500">
                Dữ liệu lấy từ API `/recruiter/suggested-candidates` dựa trên
                tiêu chí của tin.
              </p>
            </div>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:min-w-[260px]"
            >
              <option value="">Chọn tin tuyển dụng</option>
              {jobPosts
                .filter((job: any) => job.status !== "Đã tuyển")
                .map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.position} • {job.status || "Chưa rõ"}
                  </option>
                ))}
            </select>
          </div>
          {jobsLoading && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
              Đang tải danh sách tin...
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Bộ lọc
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                Danh sách gợi ý
              </h3>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên/email"
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {!selectedJobId ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Hãy chọn một tin tuyển dụng để xem gợi ý.
            </div>
          ) : isFetching ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Đang tải danh sách gợi ý...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Chưa có gợi ý phù hợp.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredCandidates.map((candidate: any) => (
                <article
                  key={candidate.candidate_id || candidate.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {candidate.full_name || "Chưa cập nhật tên"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Email:{" "}
                            {candidate.email || candidate.user?.email || "—"}
                          </p>
                        </div>
                        {typeof candidate.match_score === "number" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <Target className="h-4 w-4" />
                            {Math.round(candidate.match_score * 100)}%
                          </span>
                        )}
                      </div>
                      {candidate.skills && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {(Array.isArray(candidate.skills)
                            ? candidate.skills
                            : String(candidate.skills).split(",")
                          )
                            .filter(Boolean)
                            .slice(0, 5)
                            .map((skill: string) => (
                              <span
                                key={skill}
                                className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-gray-700"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </RecruiterLayout>
  );
};

export default SuggestedCandidates;
