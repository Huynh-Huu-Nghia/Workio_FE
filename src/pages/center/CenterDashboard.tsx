import React, { useMemo } from "react";
import CenterLayout from "@/layouts/CenterLayout";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/context/user/user.context";
import path from "@/constants/path";

const CenterDashboard: React.FC = () => {
  const { user } = useUser();

  const displayName = useMemo(() => {
    if (!user) return "Trung tâm";
    return user.name || user.email || "Trung tâm";
  }, [user]);

  const reportDate = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    []
  );

  type KpiCard = {
    id: string;
    label: string;
    value: string;
    descriptor: string;
    trend: string;
    trendTone: string;
    accent: string;
    icon: LucideIcon;
  };

  const kpiCards: KpiCard[] = [
    {
      id: "courses",
      label: "Khóa học đang triển khai",
      value: "12",
      descriptor: "2 khóa chuẩn bị khai giảng",
      trend: "+2 tuần này",
      trendTone: "text-orange-700 bg-orange-100",
      accent: "from-orange-50 to-white",
      icon: BookOpen,
    },
    {
      id: "learners",
      label: "Học viên tích cực",
      value: "148",
      descriptor: "85% tham gia đầy đủ",
      trend: "+6 so với tuần trước",
      trendTone: "text-green-700 bg-green-100",
      accent: "from-emerald-50 to-white",
      icon: GraduationCap,
    },
    {
      id: "completion",
      label: "Tỉ lệ hoàn thành",
      value: "82%",
      descriptor: "Mục tiêu 90% trong tháng",
      trend: "+4% trong 30 ngày",
      trendTone: "text-blue-700 bg-blue-100",
      accent: "from-blue-50 to-white",
      icon: BarChart3,
    },
    {
      id: "satisfaction",
      label: "Chỉ số hài lòng",
      value: "4.7/5",
      descriptor: "143 phản hồi mới",
      trend: "+0.2 so với kỳ trước",
      trendTone: "text-purple-700 bg-purple-100",
      accent: "from-purple-50 to-white",
      icon: CheckCircle2,
    },
  ];

  const statusBreakdown = [
    { id: "learning", label: "Đang học", count: 68, percent: 68, bar: "bg-blue-500" },
    { id: "pending", label: "Chờ duyệt", count: 24, percent: 24, bar: "bg-amber-500" },
    { id: "completed", label: "Đã hoàn thành", count: 42, percent: 42, bar: "bg-emerald-500" },
    { id: "inactive", label: "Tạm dừng", count: 9, percent: 9, bar: "bg-rose-500" },
  ];

  const totalLearners = statusBreakdown.reduce((sum, item) => sum + item.count, 0);

  const topCourses = [
    {
      name: "React Mastery",
      completion: 92,
      learners: 48,
      satisfaction: "4.8/5",
      timeline: "Khóa 09 / 2025",
    },
    {
      name: "Business Analyst",
      completion: 85,
      learners: 36,
      satisfaction: "4.5/5",
      timeline: "Khóa 05 / 2025",
    },
    {
      name: "Data Foundation",
      completion: 80,
      learners: 28,
      satisfaction: "4.6/5",
      timeline: "Khóa 11 / 2025",
    },
  ];

  const milestones = [
    { title: "Khai giảng React Mastery (K10)", date: "24/12", note: "36 học viên đã xác nhận", tone: "bg-blue-50 text-blue-700" },
    { title: "Bế giảng Data Foundation", date: "26/12", note: "Chuẩn bị chứng chỉ", tone: "bg-emerald-50 text-emerald-700" },
    { title: "Đánh giá mentor quý IV", date: "29/12", note: "Phỏng vấn 8 mentor", tone: "bg-purple-50 text-purple-700" },
  ];

  const mentorStats = [
    { label: "Mentor đang hoạt động", value: "14", meta: "+3 so với T11" },
    { label: "Phiên coaching tuần này", value: "26", meta: "85% đúng lịch" },
    { label: "Báo cáo chất lượng", value: "4.6 / 5", meta: "Điểm trung bình" },
  ];

  const completionGoal = {
    current: 82,
    target: 90,
    delta: "+6% so với T11",
  };

  const satisfaction = {
    score: 4.7,
    delta: "+0.2",
    highlights: [
      "Học viên đánh giá cao mentor (4.9/5)",
      "70% phản hồi tích cực về tài liệu mới",
      "4 khóa học được đề xuất mở rộng quy mô",
    ],
  };

  return (
    <CenterLayout title="Báo cáo đào tạo">
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 p-8 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm text-white/80">Bản cập nhật ngày {reportDate}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Báo cáo đào tạo</h1>
              <p className="mt-2 text-base text-white/80">
                Xin chào <span className="font-semibold text-white">{displayName}</span>, đây là tổng quan hiệu suất các khóa học trong tuần này.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={path.CENTER_COURSES}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
              >
                <BookOpen className="h-4 w-4" />
                Xem danh mục khóa học
              </Link>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5">
                <TrendingUp className="h-4 w-4" />
                Xuất báo cáo PDF
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-white/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              <Calendar className="h-3.5 w-3.5" /> Chu kỳ 18 → 24/12
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              <Clock className="h-3.5 w-3.5" /> Dữ liệu cập nhật theo thời gian thực
            </span>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{card.descriptor}</p>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-gray-900`}> 
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
                <span className={`mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${card.trendTone}`}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  {card.trend}
                </span>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Phân bổ trạng thái học viên</h2>
                <p className="text-sm text-gray-500">Tổng {totalLearners} học viên được thống kê</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Cập nhật 15 phút/lần
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {statusBreakdown.map((status) => (
                <div key={status.id}>
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                    <span>{status.label}</span>
                    <span>{status.count} học viên</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${status.bar}`}
                      style={{ width: `${status.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-semibold uppercase text-indigo-500">Thời lượng trung bình</p>
                <p className="mt-2 text-2xl font-bold text-indigo-900">32 giờ / khóa</p>
                <p className="text-xs text-indigo-500">+5 giờ với chương trình nâng cao</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-500">Hoàn thành đúng hạn</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">74%</p>
                <p className="text-xs text-emerald-500">+8% sau khi bổ sung mentor</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hiệu suất mentor</h3>
                <p className="text-sm text-gray-500">Nguồn lực phụ trách đào tạo</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {mentorStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-100 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500">{stat.label}</p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span className="text-xs font-semibold text-green-600">{stat.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top khóa học nổi bật</h2>
                <p className="text-sm text-gray-500">Xếp hạng theo tỉ lệ hoàn thành và mức hài lòng</p>
              </div>
              <Link to={path.CENTER_COURSES} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Xem toàn bộ
              </Link>
            </div>
            <div className="mt-6 divide-y divide-gray-100">
              {topCourses.map((course) => (
                <div key={course.name} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.timeline}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Hoàn thành</p>
                      <p className="text-base font-semibold text-gray-900">{course.completion}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Học viên</p>
                      <p className="text-base font-semibold text-gray-900">{course.learners}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hài lòng</p>
                      <p className="text-base font-semibold text-gray-900">{course.satisfaction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mốc thời gian sắp tới</h3>
                <p className="text-sm text-gray-500">Theo dõi sự kiện quan trọng</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {milestones.map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>{item.date}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mục tiêu hoàn thành quý</h3>
                <p className="text-sm text-gray-500">Theo dõi tiến độ đạt chuẩn 90%</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600">Tiến độ hiện tại</p>
                <div className="mt-3 h-2.5 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${completionGoal.current}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Mục tiêu {completionGoal.target}% trước 31/12</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-orange-50 px-10 py-6">
                <span className="text-xs font-semibold uppercase text-orange-500">Hiện tại</span>
                <span className="text-4xl font-bold text-orange-600">{completionGoal.current}%</span>
                <span className="text-xs font-semibold text-orange-500">{completionGoal.delta}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chỉ số hài lòng học viên</h3>
                <p className="text-sm text-gray-500">Tổng hợp 143 phản hồi gần nhất</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-5xl font-bold text-emerald-600">{satisfaction.score}</p>
                <p className="text-xs text-gray-500">/ 5.0</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {satisfaction.delta} so với kỳ trước
                </span>
              </div>
              <div className="flex-1 space-y-3">
                {satisfaction.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </CenterLayout>
  );
};

export default CenterDashboard;
