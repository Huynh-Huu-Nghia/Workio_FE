import React, { useMemo } from "react";
import { Briefcase, Users, UserCheck, FileText } from "lucide-react";
import { useRecruiterJobPostsQuery } from "@/api/recruiter.api";
import { Link } from "react-router-dom";
import path from "@/constants/path";
import RecruiterLayout from "@/layouts/RecruiterLayout";

const RecruiterHome: React.FC = () => {
  const { data: jobPostsResponse, isLoading } = useRecruiterJobPostsQuery();
  const jobs = jobPostsResponse?.data || [];

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(
      (job: any) => job.status === "Đang mở",
    ).length;
    const hiredJobs = jobs.filter(
      (job: any) => job.status === "Đã tuyển",
    ).length;

    // Tính tổng số ứng tuyển từ tất cả job posts
    const totalApplications = jobs.reduce((total: number, job: any) => {
      return total + (job.applied_candidates?.length || 0);
    }, 0);

    // Tính số nhân sự đã tuyển (từ các job đã tuyển)
    const hiredCount = jobs
      .filter((job: any) => job.status === "Đã tuyển")
      .reduce((total: number, job: any) => {
        return total + (job.available_quantity || 0);
      }, 0);

    return {
      totalJobs,
      activeJobs,
      hiredJobs,
      totalApplications,
      hiredCount,
    };
  }, [jobs]);

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Tổng quan về hoạt động tuyển dụng</p>
          </div>
          <Link
            to={path.RECRUITER_JOB_CREATE}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            <Briefcase size={16} />
            Đăng tin mới
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Số tin đăng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tin đang mở</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Số ứng tuyển
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Nhân sự đã tuyển
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.hiredCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to={path.RECRUITER_JOBS}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <Briefcase className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-gray-900">
                Quản lý tin đăng
              </span>
            </Link>

            <Link
              to={path.RECRUITER_JOB_CANDIDATES}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <Users className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-gray-900">Xem ứng viên</span>
            </Link>

            <Link
              to={path.RECRUITER_INTERVIEWS}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <UserCheck className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-gray-900">Lịch phỏng vấn</span>
            </Link>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterHome;
