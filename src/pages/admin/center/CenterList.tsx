import React from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminCentersQuery } from "@/api/center.api";
import { Loader2, XCircle, MapPin, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const CenterList: React.FC = () => {
  const { data, isLoading, isError } = useAdminCentersQuery();
  const centers = data?.data ?? [];

  return (
    <AdminLayout title="Trung tâm" activeMenu="center">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Danh sách Trung tâm
            </h1>
            <p className="text-sm text-gray-500">
              Quản lý tài khoản trung tâm đào tạo.
            </p>
          </div>
          <Link
            to="/admin/centers/create"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            + Thêm trung tâm
          </Link>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải danh sách trung tâm.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="divide-y divide-gray-100">
            {centers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Chưa có trung tâm nào.
              </div>
            ) : (
              centers.map((center: any) => (
                <div
                  key={center.center_id}
                  className="flex flex-col gap-3 p-5 hover:bg-orange-50/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm uppercase text-gray-400">
                      {center.code || "Chưa có mã"}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {center.name || "Chưa đặt tên"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {center.center?.email || center.email || "—"}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {center.address?.street || "—"} |{" "}
                      {center.address?.ward_code || "—"} |{" "}
                      {center.address?.province_code || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/centers/view/${center.center_id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CenterList;

