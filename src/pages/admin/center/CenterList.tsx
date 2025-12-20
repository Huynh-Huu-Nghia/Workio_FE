import React, { useMemo, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAdminCentersQuery } from "@/api/center.api";
import { Loader2, XCircle, MapPin, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import ProvinceWardSelect from "@/components/ProvinceWardSelect";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

const CenterList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [trainingField, setTrainingField] = useState("");

  const filters = useMemo(
    () => ({
      search: search || undefined,
      is_active: isActive || undefined,
      province_code: provinceCode || undefined,
      ward_code: wardCode || undefined,
      sort_by: sortBy || undefined,
      order,
      training_field: trainingField || undefined,
    }),
    [search, isActive, provinceCode, wardCode, sortBy, order, trainingField]
  );

  const { data, isLoading, isError, refetch } = useAdminCentersQuery(filters);
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
          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
            <Link
              to="/admin/centers/create"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              + Thêm trung tâm
            </Link>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-4">
          <div className="space-y-4">
            {/* Hàng 1: Tìm kiếm + nút áp dụng */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600">Tìm kiếm</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên/email/số điện thoại trung tâm"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => refetch()}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:w-auto"
                >
                  Áp dụng lọc
                </button>
              </div>
            </div>

            {/* Hàng 2: Bộ lọc vị trí, ngành, trạng thái + sắp xếp tách hàng để tránh tràn */}
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 xl:grid-cols-4">
                <div className="xl:col-span-2">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProvinceWardSelect
                      provinceCode={provinceCode}
                      wardCode={wardCode}
                      onProvinceChange={(code) => {
                        setProvinceCode(code);
                        setWardCode("");
                      }}
                      onWardChange={(code) => setWardCode(code)}
                      labelProvince="Tỉnh/Thành phố"
                      labelWard="Phường/Xã"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Ngành đào tạo</label>
                  <select
                    value={trainingField}
                    onChange={(e) => setTrainingField(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Tất cả ngành</option>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Trạng thái</label>
                  <select
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Đang khóa</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Sắp xếp theo</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Mặc định</option>
                    <option value="name">Tên</option>
                    <option value="created_at">Ngày tạo</option>
                    <option value="updated_at">Ngày cập nhật</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Thứ tự</label>
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="DESC">Giảm dần</option>
                    <option value="ASC">Tăng dần</option>
                  </select>
                </div>
              </div>
            </div>
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
