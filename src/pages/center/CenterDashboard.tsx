import React, { useMemo } from "react";
import { Globe2 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              Khu vực Center (đã có role + login). Các module sẽ gắn khi backend
              mở API.
            </p>
          </div>
          <div className="ml-auto">
            <Link
              to="/center/settings"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cài đặt tài khoản
            </Link>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800">Thông tin</h2>
            <p className="mt-2 text-sm text-gray-600">
              Xin chào <b className="text-gray-900">{displayName}</b>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Email: {user?.email || "—"}
            </p>
            <Link
              to={path.CENTER_COURSES}
              className="mt-4 inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Quản lý khóa học
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800">Trạng thái</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span>API Center</span>
                <span className="font-semibold text-gray-500">Chưa có</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span>Đăng nhập Center</span>
                <span className="font-semibold text-green-700">OK</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span>Routing /center</span>
                <span className="font-semibold text-green-700">OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDashboard;
