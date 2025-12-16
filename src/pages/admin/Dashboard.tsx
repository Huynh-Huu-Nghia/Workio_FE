import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Users,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useMonthlyReportQuery } from "@/api/report.api";

const Dashboard: React.FC = () => {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());

  const { data, isFetching, refetch } = useMonthlyReportQuery(month, year);

  const stats = useMemo(() => {
    const report = data?.data;
    return {
      totalJobs: report?.jobPostStats.total ?? 0,
      activeJobs: report?.jobPostStats.active ?? 0,
      interviews: report?.totalInterviews.total ?? 0,
      candidates: report?.totalAppliedCandidates ?? 0,
      hired: report?.employedCandidates.employed ?? 0,
    };
  }, [data]);

  const handleRefresh = () => refetch();

  return (
    <AdminLayout title="Tổng quan" activeMenu="dashboard">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Báo cáo tháng</p>
          <h1 className="text-2xl font-bold text-gray-800">
            {`Tháng ${month}/${year}`}
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tháng</label>
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Năm</label>
            <input
              type="number"
              min={2000}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Tin đăng"
          value={stats.totalJobs}
          icon={<Briefcase className="h-5 w-5" />}
          loading={isFetching}
          highlight={`${stats.activeJobs} đang mở`}
        />
        <StatCard
          title="Lịch phỏng vấn"
          value={stats.interviews}
          icon={<CalendarClock className="h-5 w-5" />}
          loading={isFetching}
          highlight="Tháng này"
        />
        <StatCard
          title="Ứng viên ứng tuyển"
          value={stats.candidates}
          icon={<Users className="h-5 w-5" />}
          loading={isFetching}
          highlight="Đếm theo tin đăng"
        />
        <StatCard
          title="Đã tuyển dụng"
          value={stats.hired}
          icon={<CheckCircle2 className="h-5 w-5" />}
          loading={isFetching}
          highlight="Đánh dấu đã nhận"
        />
        <StatCard
          title="Báo cáo chi tiết"
          value="Xem báo cáo"
          icon={<BarChart3 className="h-5 w-5" />}
          loading={false}
          highlight="Đi tới trang Báo cáo"
          href="/admin/reports"
        />
      </div>
    </AdminLayout>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  highlight?: string;
  loading?: boolean;
  href?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  highlight,
  loading,
  href,
}) => {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">
          {loading ? "…" : value}
        </p>
        {highlight && <p className="text-xs text-gray-400">{highlight}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
};

export default Dashboard;
