import { useEffect } from "react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { useForm } from "react-hook-form";
import {
  useCreateRecruiterJobPostMutation,
  useUpdateRecruiterJobPostMutation,
  useRecruiterJobPostDetailQuery,
  useDeleteRecruiterJobPostMutation,
} from "@/api/recruiter.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { pathtotitle } from "@/configs/pagetitle";
import path from "@/constants/path";

type FormValues = {
  position: string;
  available_quantity?: number | null;
  monthly_salary?: number | null;
  recruitment_type?: string | null;
  status?: string | null;
  application_deadline_to?: string | null;
  requirements?: string | null;
};

export default function RecruiterJobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const title = isEdit ? "Chỉnh sửa tin" : "Thêm tin";

  const { data: detailRes } = useRecruiterJobPostDetailQuery(id);
  const job = detailRes?.data;

  const createMutation = useCreateRecruiterJobPostMutation();
  const updateMutation = useUpdateRecruiterJobPostMutation();
  const deleteMutation = useDeleteRecruiterJobPostMutation();

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      position: "",
      available_quantity: undefined,
      monthly_salary: undefined,
      recruitment_type: "Phỏng vấn",
      status: "Đang mở",
      application_deadline_to: "",
      requirements: "",
    },
  });

  useEffect(() => {
    if (!job || !isEdit) return;
    reset({
      position: job.position || "",
      available_quantity:
        job.available_quantity !== null && job.available_quantity !== undefined
          ? Number(job.available_quantity)
          : undefined,
      monthly_salary:
        job.monthly_salary !== null && job.monthly_salary !== undefined
          ? Number(job.monthly_salary)
          : undefined,
      recruitment_type: job.recruitment_type || "Phỏng vấn",
      status: job.status || "Đang mở",
      application_deadline_to: job.application_deadline_to || "",
      requirements: job.requirements || "",
    });
  }, [job, isEdit, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && id) {
        const res = await updateMutation.mutateAsync({ jobPostId: id, payload: values });
        if ((res as any)?.err === 0) {
          toast.success((res as any)?.mes || "Cập nhật tin thành công");
          navigate(path.RECRUITER_JOBS);
        } else toast.error((res as any)?.mes || "Cập nhật thất bại");
      } else {
        const res = await createMutation.mutateAsync(values as any);
        if ((res as any)?.err === 0) {
          toast.success((res as any)?.mes || "Tạo tin thành công");
          navigate(path.RECRUITER_JOBS);
        } else toast.error((res as any)?.mes || "Tạo tin thất bại");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Thao tác thất bại");
    }
  });

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Xóa tin này?")) return;
    try {
      const res = await deleteMutation.mutateAsync(id);
      if ((res as any)?.err === 0) {
        toast.info((res as any)?.mes || "Đã xóa tin.");
        navigate(path.RECRUITER_JOBS);
      } else toast.error((res as any)?.mes || "Xóa thất bại.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  return (
    <RecruiterLayout title={pathtotitle["/recruiter/jobs"] || "Tin tuyển dụng"}>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">Điền thông tin cơ bản cho tin tuyển dụng.</p>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Xóa tin
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vị trí *</label>
            <input
              {...register("position", { required: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
            <input
              type="number"
              {...register("available_quantity", { valueAsNumber: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mức lương</label>
            <input
              type="number"
              {...register("monthly_salary", { valueAsNumber: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
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
    </RecruiterLayout>
  );
}
