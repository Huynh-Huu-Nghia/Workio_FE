import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  Loader2,
  Search,
  Tags,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import type { JobPost } from "@/api/job-post.api";
import { useGetAdminJobPostsQuery } from "@/api/job-post.api";

const JobList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobPost["status"]>(
    "all"
  );

  const { data, isLoading, isError } = useGetAdminJobPostsQuery();
  const jobs = data?.data ?? [];

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const keyword = search.toLowerCase();
      const matchesKeyword =
        job.position?.toLowerCase().includes(keyword) ||
        (Array.isArray(job.fields)
          ? job.fields.join(" ").toLowerCase().includes(keyword)
          : typeof job.fields === "string" &&
            job.fields.toLowerCase().includes(keyword));

      if (!matchesKeyword) return false;

      if (statusFilter === "all") return true;
      return job.status === statusFilter;
    });
  }, [jobs, search, statusFilter]);

  return (
    <AdminLayout
      title="Tin tuyển dụng"
      activeMenu="jobs"
      activeSubmenu="all-jobs"
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Quản lý tin đăng
            </h1>
            <p className="text-sm text-gray-500">
              Đồng bộ với API /admin/job-posts.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm vị trí, ngành nghề"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:min-w-[260px]"
              />
            </div>
            <select
              value={statusFilter || "all"}
              onChange={(e) =>
                setStatusFilter(
                  (e.target.value === "all" ? "all" : e.target.value) as
                    | "all"
                    | JobPost["status"]
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang mở">Đang mở</option>
              <option value="Đang xem xét">Đang xem xét</option>
              <option value="Đã tuyển">Đã tuyển</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải danh sách tin tuyển dụng.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Không có tin nào phù hợp.
              </div>
            ) : (
              filtered.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col gap-3 p-5 hover:bg-orange-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {job.position}
                        </h3>
                        <p className="text-sm text-gray-500">
                          NTD: {job.recruiter_id || "Không rõ"} | SL:{" "}
                          {job.available_quantity ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={job.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Hạn nộp:{" "}
                      {job.application_deadline_to || "Chưa thiết lập hạn"}
                    </span>
                    {job.fields && (
                      <span className="inline-flex items-center gap-2">
                        <Tags className="h-4 w-4 text-gray-400" />
                        {Array.isArray(job.fields)
                          ? job.fields.join(", ")
                          : job.fields}
                      </span>
                    )}
                  </div>

                  {job.requirements && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {job.requirements}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const StatusPill: React.FC<{ status?: string | null }> = ({ status }) => {
  let classes = "bg-gray-100 text-gray-600";
  if (status === "Đang mở") classes = "bg-green-50 text-green-700";
  else if (status === "Đang xem xét") classes = "bg-yellow-50 text-yellow-700";
  else if (status === "Đã tuyển") classes = "bg-blue-50 text-blue-700";
  else if (status === "Đã hủy") classes = "bg-red-50 text-red-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status || "Chưa đặt trạng thái"}
    </span>
  );
};

export default JobList;
