import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminCentersQuery } from "@/api/center.api";
import { Loader2, XCircle, MapPin, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const CenterList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");

  const { data, isLoading, isError, refetch } = useAdminCentersQuery({
    search: search || undefined,
    is_active: isActive || undefined,
    sort_by: sortBy || undefined,
    order,
  });
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
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên/email/sđt"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đang khóa</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Sắp xếp</option>
              <option value="name">Tên</option>
              <option value="created_at">Ngày tạo</option>
              <option value="updated_at">Ngày cập nhật</option>
            </select>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="DESC">Giảm dần</option>
              <option value="ASC">Tăng dần</option>
            </select>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Lọc
            </button>
          </div>
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
