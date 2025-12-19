import React, { useMemo } from "react";
import { Globe2 } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { pathtotitle } from "@/configs/pagetitle";
import { useUser } from "@/context/user/user.context";
import CenterLayout from "@/layouts/CenterLayout";
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
    <CenterLayout title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Xin chào</p>
              <p className="text-lg font-bold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-400">Email: {user?.email || "—"}</p>
            </div>
          </div>
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
              <span className="font-semibold text-green-700">OK</span>
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
    </CenterLayout>
  );
};

export default CenterDashboard;
