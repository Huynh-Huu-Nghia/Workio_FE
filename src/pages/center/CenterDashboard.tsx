import React from "react";
import { Globe2 } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";

const CenterDashboard: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Trung tâm";

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
              Chưa có endpoint backend cho Center. Hiển thị placeholder để tránh
              404.
            </p>
          </div>
        </header>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-600">
          Sẽ bổ sung khi backend cung cấp API cho Trung tâm.
        </div>
      </div>
    </div>
  );
};

export default CenterDashboard;
