import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import {
  useAdminCenterCoursesQuery,
  useAdminCenterDetailQuery,
} from "@/api/center.api";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CenterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminCenterDetailQuery(id);
  const {
    data: coursesRes,
    isLoading: loadingCourses,
    isError: errorCourses,
  } = useAdminCenterCoursesQuery(id);
  const center = data?.data as any;
  const courses = coursesRes?.data ?? [];

  return (
    <AdminLayout title="Chi tiết Trung tâm" activeMenu="center">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(path.ADMIN_DASHBOARD)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-red-700">
            Không thể tải dữ liệu trung tâm.
          </div>
        )}

        {!isLoading && !isError && center && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-1 rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-100">
                  {center.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {center.name || "Chưa cập nhật"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {center.center?.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Địa chỉ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Đường</div>
                    <div className="font-medium text-gray-800">
                      {center.address?.street || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Phường/Xã</div>
                    <div className="font-medium text-gray-800">
                      {center.address?.ward_code || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tỉnh/TP</div>
                    <div className="font-medium text-gray-800">
                      {center.address?.province_code || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">
                    Khóa học & học viên
                  </h3>
                  {loadingCourses && (
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải
                    </span>
                  )}
                </div>
                {errorCourses ? (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                    Không tải được danh sách khóa học.
                  </div>
                ) : courses.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                    Trung tâm chưa có khóa học.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course: any) => (
                      <div
                        key={course.id}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {course.name}
                            </p>
                            {course.description && (
                              <p className="text-xs text-gray-600">
                                {course.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {course.start_date} - {course.end_date || "—"}
                          </span>
                        </div>
                        <div className="mt-2 rounded border border-gray-200 bg-white p-2">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            Học viên
                          </p>
                          {course.candidates?.length ? (
                            <div className="space-y-2">
                              {course.candidates.map((c: any) => (
                                <div
                                  key={c.candidate_id}
                                  className="flex flex-wrap items-center gap-2 text-xs text-gray-700"
                                >
                                  <span className="font-semibold text-gray-900">
                                    {c.candidate_id}
                                  </span>
                                  <span className="rounded-full bg-orange-50 px-2 py-1 font-semibold text-orange-700">
                                    {c.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Chưa có học viên.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Thông tin chi tiết
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Email</div>
                    <div className="font-medium text-gray-800">
                      {center.center?.email || center.email || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Điện thoại</div>
                    <div className="font-medium text-gray-800">
                      {center.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Website</div>
                    <div className="font-medium text-gray-800">
                      {center.website || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trạng thái</div>
                    <div className="font-medium text-gray-800">
                      {center.is_active ? "Hoạt động" : "Đang khóa"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
