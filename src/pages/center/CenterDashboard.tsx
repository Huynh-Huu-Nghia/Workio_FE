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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
            <Globe2 className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          <div>
            <Link
              to="/center/settings"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
            >
              Cài đặt tài khoản
            </Link>
          </div>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-lg transition hover:shadow-xl">
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
