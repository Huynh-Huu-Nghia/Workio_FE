import React, { useMemo, useRef, useState } from "react";
import CenterLayout from "@/layouts/CenterLayout";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Target,
  TrendingUp,
  AlertCircle,
  Award,
  FileDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/context/user/user.context";
import path from "@/constants/path";
import { useCenterStatisticsQuery } from "@/api/center.api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CenterDashboard: React.FC = () => {
  const { user } = useUser();
  const {
    data: statsResponse,
    isLoading,
    isError,
  } = useCenterStatisticsQuery();
  const stats = statsResponse?.data;
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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
    [],
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

  const kpiCards: KpiCard[] = useMemo(() => {
    if (!stats) return [];

    return [
      {
        id: "courses",
        label: "Khóa học đang triển khai",
        value: stats.courses.active.toString(),
        descriptor:
          stats.courses.upcoming > 0
            ? `${stats.courses.upcoming} khóa sắp khai giảng`
            : "Không có khóa sắp khai giảng",
        trend: `Tổng ${stats.courses.total} khóa`,
        trendTone: "text-orange-700 bg-orange-100",
        accent: "from-orange-50 to-white",
        icon: BookOpen,
      },
      {
        id: "learners",
        label: "Học viên đang học",
        value: stats.learners.byStatus.learning.toString(),
        descriptor: `${stats.learners.total} học viên tổng cộng`,
        trend:
          stats.learners.byStatus.pending > 0
            ? `${stats.learners.byStatus.pending} chờ duyệt`
            : "Không có yêu cầu mới",
        trendTone: "text-green-700 bg-green-100",
        accent: "from-emerald-50 to-white",
        icon: GraduationCap,
      },
      {
        id: "completion",
        label: "Tỉ lệ hoàn thành",
        value: `${stats.completionRate}%`,
        descriptor: `${stats.learners.byStatus.completed} học viên đã tốt nghiệp`,
        trend: stats.completionRate >= 80 ? "Đạt mục tiêu" : "Cần cải thiện",
        trendTone:
          stats.completionRate >= 80
            ? "text-blue-700 bg-blue-100"
            : "text-amber-700 bg-amber-100",
        accent: "from-blue-50 to-white",
        icon: BarChart3,
      },
      {
        id: "duration",
        label: "Thời lượng trung bình",
        value: `${stats.duration.avgHours}h`,
        descriptor: `${stats.duration.coursesWithDuration} khóa có thời lượng`,
        trend: `Tổng ${stats.duration.totalHours}h`,
        trendTone: "text-purple-700 bg-purple-100",
        accent: "from-purple-50 to-white",
        icon: Clock,
      },
    ];
  }, [stats]);

  const statusBreakdown = useMemo(() => {
    if (!stats) return [];

    const total = stats.learners.total;
    return [
      {
        id: "learning",
        label: "Đang học",
        count: stats.learners.byStatus.learning,
        percent:
          total > 0
            ? Math.round((stats.learners.byStatus.learning / total) * 100)
            : 0,
        bar: "bg-blue-500",
      },
      {
        id: "pending",
        label: "Chờ duyệt",
        count: stats.learners.byStatus.pending,
        percent:
          total > 0
            ? Math.round((stats.learners.byStatus.pending / total) * 100)
            : 0,
        bar: "bg-amber-500",
      },
      {
        id: "completed",
        label: "Đã hoàn thành",
        count: stats.learners.byStatus.completed,
        percent:
          total > 0
            ? Math.round((stats.learners.byStatus.completed / total) * 100)
            : 0,
        bar: "bg-emerald-500",
      },
      {
        id: "rejected",
        label: "Từ chối",
        count: stats.learners.byStatus.rejected,
        percent:
          total > 0
            ? Math.round((stats.learners.byStatus.rejected / total) * 100)
            : 0,
        bar: "bg-rose-500",
      },
    ];
  }, [stats]);

  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return;

    setIsExporting(true);
    try {
      // Capture the content as canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f5f7fb",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Add multiple pages if needed
      let heightLeft = imgHeight * ratio;
      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio,
      );
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          position,
          imgWidth * ratio,
          imgHeight * ratio,
        );
        heightLeft -= pdfHeight;
      }

      const fileName = `Bao_cao_dao_tao_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Không thể xuất PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isError) {
    return (
      <CenterLayout title="Báo cáo đào tạo">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Không thể tải dữ liệu
            </h3>
            <p className="mt-2 text-sm text-gray-500">Vui lòng thử lại sau</p>
          </div>
        </div>
      </CenterLayout>
    );
  }

  if (isLoading || !stats) {
    return (
      <CenterLayout title="Báo cáo đào tạo">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="mt-4 text-sm text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </CenterLayout>
    );
  }

  return (
    <CenterLayout title="Báo cáo đào tạo">
      <div className="space-y-8">
        {/* Header Section */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 p-8 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm text-white/80">
                Bản cập nhật ngày {reportDate}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Báo cáo đào tạo
              </h1>
              <p className="mt-2 text-base text-white/80">
                {" "}
                <span className="font-semibold text-white">{displayName}</span>,
                Tổng quan hiệu suất các khóa học.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="h-4 w-4" />
                {isExporting ? "Đang xuất..." : "Xuất PDF"}
              </button>
              <Link
                to={`${path.CENTER_COURSES}#manage`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
              >
                <BookOpen className="h-4 w-4" />
                Xem khóa học
              </Link>
            </div>
          </div>
        </section>
        <div ref={reportRef} className="space-y-8">
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
                      <p className="text-sm font-semibold text-gray-500">
                        {card.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {card.descriptor}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-gray-900`}
                    >
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  <span
                    className={`mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${card.trendTone}`}
                  >
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
                  <h2 className="text-xl font-bold text-gray-900">
                    Phân bổ trạng thái học viên
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tổng {stats.learners.total} học viên
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Thời gian thực
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {statusBreakdown.map((status) => (
                  <div key={status.id}>
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                      <span>{status.label}</span>
                      <span>
                        {status.count} học viên ({status.percent}%)
                      </span>
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
                  <p className="text-xs font-semibold uppercase text-indigo-500">
                    Thời lượng TB
                  </p>
                  <p className="mt-2 text-2xl font-bold text-indigo-900">
                    {stats.duration.avgHours}h
                  </p>
                  <p className="text-xs text-indigo-500">
                    {stats.duration.coursesWithDuration} khóa có thời lượng
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-500">
                    Tổng thời lượng
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">
                    {stats.duration.totalHours}h
                  </p>
                  <p className="text-xs text-emerald-500">Toàn bộ khóa học</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Xu hướng tăng trưởng
                  </h3>
                  <p className="text-sm text-gray-500">Khóa học được tạo</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-gray-100 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500">
                    3 tháng gần đây
                  </p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.trends.coursesLast3Months}
                    </p>
                    <span className="text-xs font-semibold text-blue-600">
                      khóa học
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Tháng này
                  </p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.trends.coursesThisMonth}
                    </p>
                    <span className="text-xs font-semibold text-green-600">
                      khóa học
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3">
                  <p className="text-xs font-semibold text-purple-700">
                    Tổng khóa
                  </p>
                  <p className="mt-1 text-3xl font-bold text-purple-900">
                    {stats.courses.total}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Top khóa học theo học viên
                  </h2>
                  <p className="text-sm text-gray-500">
                    Xếp hạng theo số lượng đăng ký
                  </p>
                </div>
                <Link
                  to={`${path.CENTER_COURSES}#manage`}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Xem tất cả
                </Link>
              </div>
              {stats.topCourses.byLearners.length > 0 ? (
                <div className="mt-6 divide-y divide-gray-100">
                  {stats.topCourses.byLearners.map((course, index) => (
                    <div
                      key={course.course_id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {course.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {course.learners} học viên
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Hoàn thành</p>
                        <p className="text-base font-semibold text-gray-900">
                          {course.completionRate}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    Chưa có dữ liệu
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-orange-500" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Thống kê theo lĩnh vực
                  </h3>
                  <p className="text-sm text-gray-500">
                    Phân bố khóa học theo training field
                  </p>
                </div>
              </div>
              {stats.byTrainingField.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {stats.byTrainingField.slice(0, 5).map((field) => (
                    <div
                      key={field.field}
                      className="rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {field.field}
                          </p>
                          <p className="text-xs text-gray-500">
                            {field.courses} khóa • {field.learners} học viên
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">
                            {field.completionRate}%
                          </p>
                          <p className="text-xs text-gray-500">hoàn thành</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded bg-blue-50 px-2 py-1 text-center">
                          <p className="font-semibold text-blue-700">
                            {field.learning}
                          </p>
                          <p className="text-blue-600">Đang học</p>
                        </div>
                        <div className="rounded bg-amber-50 px-2 py-1 text-center">
                          <p className="font-semibold text-amber-700">
                            {field.pending}
                          </p>
                          <p className="text-amber-600">Chờ duyệt</p>
                        </div>
                        <div className="rounded bg-emerald-50 px-2 py-1 text-center">
                          <p className="font-semibold text-emerald-700">
                            {field.completed}
                          </p>
                          <p className="text-emerald-600">Hoàn thành</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <Award className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    Chưa có dữ liệu lĩnh vực
                  </p>
                </div>
              )}
            </div>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Tỷ lệ hoàn thành
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tổng quan về hiệu suất khóa học
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600">
                    Tiến độ hiện tại
                  </p>
                  <div className="mt-3 h-2.5 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${
                        stats.completionRate >= 80
                          ? "bg-emerald-500"
                          : stats.completionRate >= 60
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {stats.learners.byStatus.completed} / {stats.learners.total}{" "}
                    học viên hoàn thành
                  </p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center gap-2 rounded-3xl px-10 py-6 ${
                    stats.completionRate >= 80
                      ? "bg-emerald-50"
                      : stats.completionRate >= 60
                        ? "bg-orange-50"
                        : "bg-red-50"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      stats.completionRate >= 80
                        ? "text-emerald-500"
                        : stats.completionRate >= 60
                          ? "text-orange-500"
                          : "text-red-500"
                    }`}
                  >
                    Hiện tại
                  </span>
                  <span
                    className={`text-4xl font-bold ${
                      stats.completionRate >= 80
                        ? "text-emerald-600"
                        : stats.completionRate >= 60
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  >
                    {stats.completionRate}%
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      stats.completionRate >= 80
                        ? "text-emerald-500"
                        : stats.completionRate >= 60
                          ? "text-orange-500"
                          : "text-red-500"
                    }`}
                  >
                    {stats.completionRate >= 80
                      ? "Xuất sắc"
                      : stats.completionRate >= 60
                        ? "Tốt"
                        : "Cần cải thiện"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Top khóa học theo tỷ lệ hoàn thành
                    </h3>
                    <p className="text-sm text-gray-500">
                      Khóa học có hiệu suất cao nhất
                    </p>
                  </div>
                </div>
              </div>
              {stats.topCourses.byCompletion.length > 0 ? (
                <div className="mt-6 divide-y divide-gray-100">
                  {stats.topCourses.byCompletion.map((course, index) => (
                    <div
                      key={course.course_id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {course.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {course.learners} học viên
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">
                          {course.completionRate}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    Chưa có dữ liệu
                  </p>
                  <p className="text-xs text-gray-500">
                    Các khóa học cần tối thiểu 5 học viên
                  </p>
                </div>
              )}
            </div>
          </section>{" "}
        </div>{" "}
      </div>
    </CenterLayout>
  );
};

export default CenterDashboard;
