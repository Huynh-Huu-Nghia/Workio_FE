import React from "react";
import AdminLayout from "@/layouts/AdminLayout";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  hint?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  hint,
}) => {
  return (
    <AdminLayout title={title} fullWidth={true}>
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500 text-lg font-bold">
          *
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600 mb-3 max-w-2xl mx-auto">{description}</p>
        )}
        <p className="text-sm text-gray-400">
          {hint || "Tính năng đang chờ bổ sung theo đặc tả backend."}
        </p>
      </div>
    </AdminLayout>
  );
};

export default PlaceholderPage;
