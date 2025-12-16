import React, { useMemo, useState } from "react";
import { BarChart3, FileText, RefreshCw } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useMonthlyReportQuery } from "@/api/report.api";

const ReportOverview: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isFetching, refetch } = useMonthlyReportQuery(month, year);
  const report = data?.data;

  const metrics = useMemo(
    () => [
      {
        title: "Tin đăng",
        value: report?.jobPostStats.total ?? 0,
        note: `${report?.jobPostStats.active ?? 0} đang mở`,
      },
      {
        title: "Ứng viên ứng tuyển",
        value: report?.totalAppliedCandidates ?? 0,
        note: "Tổng lượt apply trong tháng",
      },
      {
        title: "Phỏng vấn",
        value: report?.totalInterviews.total ?? 0,
        note: `${report?.totalInterviews.ongoing ?? 0} đang diễn ra`,
      },
      {
        title: "Đã tuyển",
        value: report?.employedCandidates.employed ?? 0,
        note: "Ứng viên đã nhận việc",
      },
    ],
    [report]
  );

  return (
    <AdminLayout title="Báo cáo tuyển dụng" activeMenu="reports">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Báo cáo tổng hợp</p>
            <h1 className="text-xl font-semibold text-gray-800">
              Tháng {month}/{year}
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Tháng
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Năm
              <input
                type="number"
                min={2000}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-2xl font-bold text-gray-800">
                {isFetching ? "…" : item.value}
              </p>
              <p className="text-xs text-gray-400">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-t border-gray-100 p-5 md:grid-cols-2">
          <StatBlock
            title="Hiệu quả phỏng vấn"
            rows={[
              {
                label: "Phỏng vấn hoàn tất",
                value: report?.interviewPassRate.total ?? 0,
              },
              {
                label: "Pass",
                value: report?.interviewPassRate.passed ?? 0,
              },
              {
                label: "Fail",
                value: report?.interviewPassRate.failed ?? 0,
              },
            ]}
            loading={isFetching}
          />
          <StatBlock
            title="Trạng thái tin đăng"
            rows={[
              {
                label: "Đang mở",
                value: report?.jobPostStats.active ?? 0,
              },
              {
                label: "Đã tuyển",
                value: report?.jobPostStats.approved ?? 0,
              },
              {
                label: "Đã hủy",
                value: report?.jobPostStats.canceled ?? 0,
              },
            ]}
            loading={isFetching}
          />
        </div>

        <div className="border-t border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Xuất báo cáo
              </h2>
              <p className="text-sm text-gray-500">
                Gọi API /admin/report-doc để tải file .docx (cần BE bật).
              </p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            Chưa triển khai nút tải, thêm khi BE sẵn sàng.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

interface StatRow {
  label: string;
  value: number;
}

const StatBlock: React.FC<{
  title: string;
  rows: StatRow[];
  loading?: boolean;
}> = ({ title, rows, loading }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    <div className="mt-3 space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
        >
          <span>{row.label}</span>
          <span className="font-semibold text-gray-900">
            {loading ? "…" : row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ReportOverview;
