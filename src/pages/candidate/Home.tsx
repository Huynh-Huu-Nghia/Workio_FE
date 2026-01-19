// import React from "react";
// import CandidateLayout from "@/layouts/CandidateLayout";
// import path from "@/constants/path";
// import { Link } from "react-router-dom";
// import { Briefcase, ClipboardList, Calendar, LifeBuoy } from "lucide-react";

// const CandidateHome: React.FC = () => {
//   return (
//     <CandidateLayout title="Trang chủ ứng viên">
//       <div className="space-y-4">
//         <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//           <h1 className="text-2xl font-bold text-gray-800">Chào mừng bạn!</h1>
//           <p className="mt-1 text-sm text-gray-600">
//             Truy cập nhanh các tác vụ: xem việc làm, việc đã ứng tuyển, lịch phỏng vấn hoặc gửi hỗ trợ.
//           </p>
//           <div className="mt-4 flex flex-wrap gap-2">
//             <Link
//               to={path.CANDIDATE_JOBS}
//               className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
//             >
//               <Briefcase className="h-4 w-4" />
//               Việc làm
//             </Link>
//             <Link
//               to={path.CANDIDATE_APPLIED_JOBS}
//               className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//             >
//               <ClipboardList className="h-4 w-4" />
//               Đã ứng tuyển
//             </Link>
//             <Link
//               to={path.CANDIDATE_INTERVIEWS}
//               className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//             >
//               <Calendar className="h-4 w-4" />
//               Lịch phỏng vấn
//             </Link>
//             <Link
//               to={path.CANDIDATE_SUPPORT}
//               className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//             >
//               <LifeBuoy className="h-4 w-4" />
//               Hỗ trợ
//             </Link>
//           </div>
//         </div>
//       </div>
//     </CandidateLayout>
//   );
// };

// export default CandidateHome;

import { useState, useMemo } from "react";
import { useUser } from "@/context/user/user.context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar as CalendarIcon,
  Edit3,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import path from "@/constants/path";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";
import CandidateLayout from "@/layouts/CandidateLayout";
// 👇 Import API lấy địa danh
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";

import "@/styles/calendar-custom.css";

export default function CandidateHome() {
  const { user } = useUser();
  const [date, setDate] = useState<any>(new Date());

  // 1. Gọi API lấy danh sách Tỉnh/Phường
  const { data: provinces } = useProvincesQuery();
  const { data: wards } = useWardsQuery(true); // true để lấy tất cả phường

  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ["candidate-dashboard"],
    queryFn: async () => {
      const res = await axiosInstance.get("/candidate/dashboard");
      return res.data;
    },
    enabled: !!user,
  });

  const stats = dashboardRes?.data || {
    jobStats: { total: 0, data: [] },
    interviewStats: { total: 0, chartData: [], events: [] },
    profile: {},
  };

  const profile = stats.profile || {};
  const addrInfo = profile.address_info || {};

  // 2. Logic "Dịch" mã địa chỉ thành tên
  const fullAddress = useMemo(() => {
    if (!addrInfo.province_code && !addrInfo.street)
      return "Chưa cập nhật địa chỉ";

    const pName = provinces?.find(
      (p: any) => p.code == addrInfo.province_code,
    )?.name;
    const wName = wards?.find((w: any) => w.code == addrInfo.ward_code)?.name;

    // Ghép chuỗi: Đường, Phường, Tỉnh
    return [addrInfo.street, wName, pName].filter(Boolean).join(", ");
  }, [addrInfo, provinces, wards]);

  // ... (Phần logic biểu đồ & lịch giữ nguyên) ...
  const tileContent = ({ date, view }: any) => {
    if (view === "month" && stats.interviewStats.events.length > 0) {
      const hasEvent = stats.interviewStats.events.some(
        (e: any) => new Date(e.date).toDateString() === date.toDateString(),
      );
      if (hasEvent)
        return (
          <div className="h-1.5 w-1.5 bg-red-500 rounded-full mx-auto mt-1"></div>
        );
    }
    return null;
  };

  const selectedDateEvent = stats.interviewStats.events.find(
    (e: any) =>
      new Date(e.date).toDateString() === new Date(date).toDateString(),
  );

  if (isLoading) {
    return (
      <CandidateLayout title="Tổng quan">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout title="Tổng quan">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- CỘT TRÁI (1/3): PROFILE --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center h-full">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-4xl font-bold mb-4 border-4 border-white shadow-md overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile.full_name || user?.name || "U")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <Link
                to={path.CANDIDATE_PROFILE}
                className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full shadow border border-gray-200 text-gray-500 hover:text-orange-500"
              >
                <Edit3 size={14} />
              </Link>
            </div>

            <h2 className="text-xl font-bold text-gray-800 break-words w-full px-2">
              {profile.full_name || user?.name}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">Ứng viên</p>

            <div className="w-full space-y-4 text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={18} className="text-orange-500 flex-shrink-0" />
                <span className="truncate text-sm" title={profile.email}>
                  {profile.email}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm">
                  {profile.phone || (
                    <span className="text-gray-400 italic">
                      Chưa cập nhật SĐT
                    </span>
                  )}
                </span>
              </div>

              {/* HIỂN THỊ ĐỊA CHỈ FULL (Đã xử lý ở useMemo) */}
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin
                  size={18}
                  className="text-orange-500 flex-shrink-0 mt-0.5"
                />
                <span className="text-sm leading-tight">{fullAddress}</span>
              </div>
            </div>

            <div className="mt-auto w-full pt-6">
              <Link
                to={path.CANDIDATE_PROFILE}
                className="block w-full py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-orange-200 shadow-lg text-center"
              >
                Cập nhật hồ sơ
              </Link>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI (2/3): THỐNG KÊ & LỊCH (Giữ nguyên) --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... Giữ nguyên phần biểu đồ ... */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center relative min-h-[300px]">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 w-full mb-2">
                <Briefcase size={20} className="text-blue-500" /> Việc làm đã
                ứng tuyển
              </h3>
              {stats.jobStats.total > 0 ? (
                <>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.jobStats.data}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.jobStats.data.map(
                            (entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ),
                          )}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-extrabold text-gray-800">
                        {stats.jobStats.total}
                      </span>
                      <span className="text-xs text-gray-500">Tin</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-xs mt-4">
                    {stats.jobStats.data.map((item: any) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: item.color }}
                        ></span>
                        <span className="text-gray-600">
                          {item.name}: <b>{item.value}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p>Chưa có dữ liệu ứng tuyển</p>
                  <Link
                    to={path.CANDIDATE_JOBS}
                    className="text-orange-500 text-sm hover:underline mt-1"
                  >
                    Tìm việc ngay
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center relative min-h-[300px]">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 w-full mb-2">
                <CalendarIcon size={20} className="text-purple-500" /> Lịch
                phỏng vấn
              </h3>
              {stats.interviewStats.total > 0 ? (
                <>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.interviewStats.chartData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.interviewStats.chartData.map(
                            (entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ),
                          )}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-extrabold text-gray-800">
                        {stats.interviewStats.total}
                      </span>
                      <span className="text-xs text-gray-500">Lịch</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-xs mt-4">
                    {stats.interviewStats.chartData.map((item: any) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: item.color }}
                        ></span>
                        <span className="text-gray-600">
                          {item.name}: <b>{item.value}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p>Chưa có lịch phỏng vấn</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <CalendarIcon size={18} /> Lịch phỏng vấn & sự kiện
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  onChange={setDate}
                  value={date}
                  tileContent={tileContent}
                  className="w-full border-none !font-sans rounded-lg shadow-sm p-2"
                />
              </div>
              <div className="md:w-1/3 bg-blue-50 rounded-xl p-4 flex flex-col">
                <h4 className="font-bold text-blue-800 text-sm mb-3 border-b border-blue-100 pb-2">
                  Sự kiện ngày {format(date, "dd/MM/yyyy")}
                </h4>
                {selectedDateEvent ? (
                  <div className="animate-fadeIn">
                    <p className="font-bold text-gray-800 mb-1">
                      {selectedDateEvent.title}
                    </p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        🕒{" "}
                        {new Date(selectedDateEvent.date).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </p>
                      <p>📍 {selectedDateEvent.location}</p>
                      {selectedDateEvent.status && (
                        <p>🏷️ {selectedDateEvent.status}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic text-center my-auto">
                    Không có sự kiện nào trong ngày này.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}
