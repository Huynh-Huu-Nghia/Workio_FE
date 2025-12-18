import { useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { useForm } from "react-hook-form";
import {
  useAdminJobPostDetailQuery,
  useCreateAdminJobPostMutation,
  useUpdateAdminJobPostMutation,
} from "@/api/job-post.api";
import { useParams, useNavigate } from "react-router-dom";
import path from "@/constants/path";
import { toast } from "react-toastify";

type FormValues = {
  position: string;
  recruiter_id: string;
  available_quantity?: number | null;
  monthly_salary?: number | null;
  recruitment_type?: string | null;
  status?: string | null;
  application_deadline_to?: string | null;
  requirements?: string | null;
};

export default function JobFormAdmin() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: detailRes } = useAdminJobPostDetailQuery(id);
  const createMutation = useCreateAdminJobPostMutation();
  const updateMutation = useUpdateAdminJobPostMutation();

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      position: "",
      recruiter_id: "",
      available_quantity: undefined,
      monthly_salary: undefined,
      recruitment_type: "Phỏng vấn",
      status: "Đang mở",
      application_deadline_to: "",
      requirements: "",
    },
  });

  useEffect(() => {
    if (!detailRes?.data || !isEdit) return;
    const job = detailRes.data as any;
    reset({
      position: job.position || "",
      recruiter_id: job.recruiter_id || "",
      available_quantity: job.available_quantity ?? undefined,
      monthly_salary: job.monthly_salary ?? undefined,
      recruitment_type: job.recruitment_type || "Phỏng vấn",
      status: job.status || "Đang mở",
      application_deadline_to: job.application_deadline_to || "",
      requirements: job.requirements || "",
    });
  }, [detailRes, isEdit, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && id) {
        const res = await updateMutation.mutateAsync({
          jobPostId: id,
          payload: values,
        });
        if ((res as any)?.err === 0) {
          toast.success((res as any)?.mes || "Cập nhật tin thành công");
          navigate(path.ADMIN_JOB_LIST);
        } else toast.error((res as any)?.mes || "Cập nhật thất bại");
      } else {
        const res = await createMutation.mutateAsync({
          recruiterId: values.recruiter_id,
          payload: values,
        });
        if ((res as any)?.err === 0) {
          toast.success((res as any)?.mes || "Tạo tin thành công");
          navigate(path.ADMIN_JOB_LIST);
        } else toast.error((res as any)?.mes || "Tạo tin thất bại");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Thao tác thất bại");
    }
  });

  return (
    <AdminLayout title={isEdit ? "Sửa tin tuyển dụng" : "Thêm tin tuyển dụng"} activeMenu="jobs">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Chỉnh sửa tin" : "Thêm tin mới"}
          </h1>
          <p className="text-sm text-gray-500">
            Điền các trường cơ bản, tối thiểu vị trí và recruiter_id.
          </p>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vị trí *</label>
            <input
              {...register("position", { required: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: Nhân viên bán hàng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recruiter ID *</label>
            <input
              {...register("recruiter_id", { required: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="Nhập recruiter_id"
              disabled={isEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
            <input
              type="number"
              {...register("available_quantity")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mức lương</label>
            <input
              type="number"
              {...register("monthly_salary")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: 15000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hình thức</label>
            <select
              {...register("recruitment_type")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white"
            >
              <option value="Phỏng vấn">Phỏng vấn</option>
              <option value="Kiểm tra">Kiểm tra</option>
              <option value="Thử việc">Thử việc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              {...register("status")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white"
            >
              <option value="Đang mở">Đang mở</option>
              <option value="Đang xem xét">Đang xem xét</option>
              <option value="Đã tuyển">Đã tuyển</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hạn nộp (application_deadline_to)
            </label>
            <input
              type="date"
              {...register("application_deadline_to")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Yêu cầu</label>
            <textarea
              {...register("requirements")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              rows={4}
              placeholder="Mô tả ngắn gọn..."
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
            >
              {isEdit
                ? updateMutation.isPending
                  ? "Đang lưu..."
                  : "Lưu thay đổi"
                : createMutation.isPending
                ? "Đang tạo..."
                : "Tạo tin"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
