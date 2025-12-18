import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import {
  useDeleteCandidateAdminMutation,
  useGetCandidateDetailAdminQuery,
} from "@/api/candidate.api";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function CandidateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: apiResponse, isLoading, isError } =
    useGetCandidateDetailAdminQuery(id);
  const deleteMutation = useDeleteCandidateAdminMutation();

  const candidate = apiResponse?.data;

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm("Bạn có chắc muốn xóa ứng viên này không?");
    if (!ok) return;

    try {
      const res = await deleteMutation.mutateAsync(id);
      if (res?.err === 0) {
        toast.info(res?.mes || "Đã xóa ứng viên.");
        await queryClient.invalidateQueries({ queryKey: ["candidates"] });
        navigate(path.ADMIN_USER_CANDIDATE_LIST);
        return;
      }
      toast.error(res?.mes || "Xóa thất bại.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  return (
    <AdminLayout
      title="CHI TIẾT ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="list-candidates"
    >
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(path.ADMIN_USER_CANDIDATE_LIST)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Xóa ứng viên
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 size={40} className="animate-spin text-orange-500 mb-2" />
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
            Không thể tải chi tiết ứng viên. Vui lòng thử lại sau.
          </div>
        )}

        {!isLoading && !isError && apiResponse?.err !== 0 && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
            {apiResponse?.mes || "Không tìm thấy ứng viên."}
          </div>
        )}

        {!isLoading && !isError && candidate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-bold text-xl border border-orange-100">
                  {candidate.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {candidate.full_name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {candidate.candidate?.email || candidate.email || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">SĐT</span>
                  <span className="font-medium text-gray-800">
                    {candidate.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Giới tính</span>
                  <span className="font-medium text-gray-800">
                    {candidate.gender || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Ngày sinh</span>
                  <span className="font-medium text-gray-800">
                    {candidate.date_of_birth || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Trình độ</span>
                  <span className="font-medium text-gray-800">
                    {candidate.graduation_rank || "—"}
                  </span>
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
                      {candidate.address?.street || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Phường/Xã</div>
                    <div className="font-medium text-gray-800">
                      {candidate.address?.ward || candidate.address?.ward_code || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tỉnh/TP</div>
                    <div className="font-medium text-gray-800">
                      {candidate.address?.province_code || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Học vấn / Kinh nghiệm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800 mb-2">
                      Học vấn
                    </div>
                    {Array.isArray(candidate.study_history) &&
                    candidate.study_history.length > 0 ? (
                      <ul className="space-y-2">
                        {candidate.study_history.map((item: any) => (
                          <li
                            key={item?.id || `${item?.school_name}-${item?.start_year}`}
                            className="rounded-lg bg-slate-50 p-3 border border-gray-100"
                          >
                            <div className="font-medium text-gray-800">
                              {item?.school_name || "—"}
                            </div>
                            <div className="text-gray-600">
                              {item?.field_of_study || item?.major || "—"} •{" "}
                              {item?.start_date || item?.start_year || "—"} -{" "}
                              {item?.end_date || item?.end_year || "—"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">Chưa có dữ liệu.</div>
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-gray-800 mb-2">
                      Kinh nghiệm
                    </div>
                    {Array.isArray(candidate.work_experience) &&
                    candidate.work_experience.length > 0 ? (
                      <ul className="space-y-2">
                        {candidate.work_experience.map((item: any) => (
                          <li
                            key={item?.id || `${item?.company_name}-${item?.start_date}`}
                            className="rounded-lg bg-slate-50 p-3 border border-gray-100"
                          >
                            <div className="font-medium text-gray-800">
                              {item?.company_name || "—"}
                            </div>
                            <div className="text-gray-600">
                              {item?.position || "—"} • {item?.start_date || "—"} -{" "}
                              {item?.end_date || "—"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">Chưa có dữ liệu.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Lịch phỏng vấn
                </h3>
                {Array.isArray(candidate.interview) &&
                candidate.interview.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                          <th className="p-3">Thời gian</th>
                          <th className="p-3">Hình thức</th>
                          <th className="p-3">Vị trí</th>
                          <th className="p-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {candidate.interview.map((it: any) => (
                          <tr key={it?.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              {it?.scheduled_time
                                ? new Date(it.scheduled_time).toLocaleString()
                                : "—"}
                            </td>
                            <td className="p-3">{it?.interview_type || "—"}</td>
                            <td className="p-3">
                              {it?.job_post?.position || it?.location || "—"}
                            </td>
                            <td className="p-3">{it?.status || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Chưa có dữ liệu.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
