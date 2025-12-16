import React from "react";
import { Building2 } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";

const RecruiterProfile: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Hồ sơ doanh nghiệp";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              Endpoint PUT /recruiter/profile/update (sẽ thêm form khi có field
              chi tiết).
            </p>
          </div>
        </header>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-600">
          Chưa có form chỉnh sửa hồ sơ doanh nghiệp. Bổ sung khi đặc tả rõ ràng.
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
