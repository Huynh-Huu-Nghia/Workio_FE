import React, { useMemo, useState } from "react";
import { CalendarClock, Loader2, MapPin, XCircle, Filter, Search } from "lucide-react";
import { useRecruiterInterviewsQuery, useRecruiterJobPostsQuery } from "@/api/recruiter.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import RecruiterLayout from "@/layouts/RecruiterLayout";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
  default: "bg-blue-50 text-blue-700",
};

const RecruiterInterviews: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Lịch phỏng vấn";
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"scheduled_time" | "created_at">("scheduled_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { data, isLoading, isError } = useRecruiterInterviewsQuery();
  const { data: jobsRes } = useRecruiterJobPostsQuery();
  const interviews = data?.data ?? [];
  const jobPosts = jobsRes?.data ?? [];

  const jobMap = useMemo(() => {
    return jobPosts.reduce((acc: Record<string, any>, job: any) => {
      acc[job.id] = job;
      return acc;
    }, {});
  }, [jobPosts]);

  const filtered = useMemo(() => {
    return interviews.filter((itv: any) => {
      if (statusFilter !== "all" && (itv.status || "pending") !== statusFilter) return false;
      if (jobFilter !== "all" && String(itv.job_post_id) !== jobFilter) return false;
      if (timeFilter !== "all" && itv.scheduled_time) {
        const time = new Date(itv.scheduled_time).getTime();
        const now = Date.now();
        if (timeFilter === "upcoming" && time <= now) return false;
        if (timeFilter === "past" && time > now) return false;
      }
      if (searchTerm.trim()) {
        const keyword = searchTerm.trim().toLowerCase();
        const haystack = `${itv.candidate_name || ""} ${itv.candidate_id || ""} ${itv.notes || ""}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [interviews, statusFilter, jobFilter, timeFilter, searchTerm]);

  const sortedInterviews = useMemo(() => {
    const list = [...filtered];
    const direction = sortOrder === "asc" ? 1 : -1;
    const getTime = (value?: string) => (value ? new Date(value).getTime() : 0);
    list.sort((a: any, b: any) => {
      const currentSort = sortBy;
      const aVal = currentSort === "scheduled_time" ? getTime(a.scheduled_time) : getTime(a.created_at);
      const bVal = currentSort === "scheduled_time" ? getTime(b.scheduled_time) : getTime(b.created_at);
      return (aVal - bVal) * direction;
    });
    return list;
  }, [filtered, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const upcoming = interviews.filter((itv: any) => {
      if (!itv.scheduled_time) return false;
      return new Date(itv.scheduled_time).getTime() > Date.now();
    });
    const completed = interviews.filter((itv: any) => itv.status === "completed");
    const pending = interviews.filter((itv: any) => itv.status !== "completed");
    return { total: interviews.length, upcoming: upcoming.length, completed: completed.length, pending: pending.length };
  }, [interviews]);

  const resetFilters = () => {
    setStatusFilter("all");
    setJobFilter("all");
    setTimeFilter("all");
    setSearchTerm("");
    setSortBy("scheduled_time");
    setSortOrder("asc");
  };

  const isFiltered =
    statusFilter !== "all" ||
    jobFilter !== "all" ||
    timeFilter !== "all" ||
    searchTerm.trim().length > 0 ||
    sortBy !== "scheduled_time" ||
    sortOrder !== "asc";

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Quản lý lịch</p>
              <h2 className="text-xl font-bold text-gray-900">Lịch phỏng vấn ứng viên</h2>
              <p className="text-sm text-gray-500">
                Theo dõi kết quả API `/recruiter/interviews-of-recruiter` để bám sát quá trình tuyển dụng.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-gray-700">
                Tổng: {stats.total}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-gray-700">
                Sắp diễn ra: {stats.upcoming}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-gray-700">
                Đã hoàn tất: {stats.completed}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="rounded-2xl border border-dashed border-gray-100 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="h-4 w-4 text-orange-500" /> Bộ lọc & sắp xếp
              </div>
              <button
                type="button"
                onClick={resetFilters}
                disabled={!isFiltered}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition disabled:opacity-40"
              >
                Đặt lại tất cả
              </button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm ứng viên, ghi chú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Tất cả tin tuyển dụng</option>
                {jobPosts.map((job: any) => (
                  <option key={job.id} value={String(job.id)}>
                    {job.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="past">Đã diễn ra</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "scheduled_time" | "created_at")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="scheduled_time">Sắp xếp theo lịch hẹn</option>
                <option value="created_at">Theo ngày tạo</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              <Loader2 className="mr-2 inline h-5 w-5 animate-spin text-orange-500" /> Đang tải lịch...
            </div>
          )}

          {isError && (
            <div className="mt-4 rounded-xl border border-dashed border-red-200 p-6 text-center text-red-600">
              <XCircle className="mr-2 inline h-5 w-5" /> Không thể tải lịch phỏng vấn.
            </div>
          )}

          {!isLoading && !isError && sortedInterviews.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Chưa có lịch phỏng vấn phù hợp bộ lọc.
            </div>
          )}

          {!isLoading && !isError && sortedInterviews.length > 0 && (
            <div className="mt-4 space-y-3">
              {sortedInterviews.map((itv: any) => {
                const job = jobMap[String(itv.job_post_id)] || {};
                const status = itv.status || "pending";
                return (
                  <article
                    key={itv.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400">
                          Tin tuyển dụng: {job.position || itv.job_post_id || "—"}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ứng viên: {itv.candidate_name || itv.candidate_id || "—"}
                        </h3>
                        {itv.notes && (
                          <p className="text-sm text-gray-600">{itv.notes}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[status] || statusColors.default
                        }`}
                      >
                        {status === "pending"
                          ? "Đang xử lý"
                          : status === "completed"
                          ? "Hoàn thành"
                          : status === "cancelled"
                          ? "Đã hủy"
                          : status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-gray-400" />
                        {formatDateTime(itv.scheduled_time)}
                      </span>
                      {itv.location && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {itv.location}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </RecruiterLayout>
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

export default RecruiterInterviews;
