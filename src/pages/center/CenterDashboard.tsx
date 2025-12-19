import React, { useMemo } from "react";
import { Globe2, BookOpen, Users, Settings, GraduationCap, Award } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/user/user.context";
import path from "@/constants/path";

const CenterDashboard: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Trung tâm";
  const { user } = useUser();

  const displayName = useMemo(() => {
    if (!user) return "Trung tâm";
    return user.name || user.email || "Trung tâm";
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-2xl ring-4 ring-orange-100">
                <Globe2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
                <p className="mt-2 text-lg text-gray-600">
                  Xin chào, <span className="font-semibold text-orange-600">{displayName}</span>
                </p>
              </div>
            </div>
            <Link
              to="/center/settings"
              className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-md transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-lg"
            >
              <Settings className="h-5 w-5 text-gray-500 transition-colors group-hover:text-orange-600" />
              Cài đặt tài khoản
            </Link>
          </div>
        </header>

        {/* Welcome Card */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">Chào mừng đến với Trung tâm Đào tạo</h2>
              <p className="mt-3 text-orange-100">
                Quản lý khóa học, học viên và theo dõi tiến độ một cách hiệu quả
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-orange-50">
                <span className="rounded-full bg-white/20 px-3 py-1">📧 {user?.email || "—"}</span>
              </div>
            </div>
            <GraduationCap className="h-32 w-32 text-white/20" />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Manage Courses Card */}
          <Link
            to={path.CENTER_COURSES}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl"
          >
            <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
              <BookOpen className="h-24 w-24 text-orange-500" />
            </div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 ring-4 ring-orange-50">
                <BookOpen className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Quản lý Khóa học</h3>
              <p className="mt-2 text-sm text-gray-600">
                Tạo mới, chỉnh sửa và theo dõi các khóa học đào tạo
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-700">
                Truy cập ngay
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Support Requests Card */}
          <Link
            to={path.CENTER_SUPPORT_REQUESTS}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl"
          >
            <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
              <Users className="h-24 w-24 text-blue-500" />
            </div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 ring-4 ring-blue-50">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Yêu cầu Hỗ trợ</h3>
              <p className="mt-2 text-sm text-gray-600">
                Xem và xử lý các yêu cầu hỗ trợ từ học viên
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
                Xem chi tiết
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Statistics Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
              <Award className="h-24 w-24 text-purple-500" />
            </div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 ring-4 ring-purple-50">
                <Award className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Thành tích</h3>
              <p className="mt-2 text-sm text-gray-600">
                Theo dõi thống kê và hiệu suất hoạt động
              </p>
              <div className="mt-4 text-sm font-semibold text-purple-600">
                Đang phát triển
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <Globe2 className="h-4 w-4 text-orange-600" />
            </div>
            <span>Hệ thống quản lý trung tâm đào tạo - Workio Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDashboard;
