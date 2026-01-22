import { useEffect, useMemo, useState } from "react";
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
import { useGetAllRecruitersQuery } from "@/api/recruiter.api";
import { useQueryClient } from "@tanstack/react-query";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

type FormValues = {
  position: string;
  recruiter_id: string;
  available_quantity?: number | null;
  monthly_salary?: number | null;
  recruitment_type?: string | null;
  status?: string | null;
  duration?: string | null;
  application_deadline_from?: string | null;
  application_deadline_to?: string | null;
  requirements?: string | null;
  support_info?: string | null;
  graduation_rank?: string | null;
  computer_skill?: string | null;
  job_type?: string | null;
  working_time?: string | null;
  other_requirements?: string | null;
};

export default function JobFormAdmin() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: detailRes } = useAdminJobPostDetailQuery(id);
  const createMutation = useCreateAdminJobPostMutation();
  const updateMutation = useUpdateAdminJobPostMutation();
  const { data: recruiterRes } = useGetAllRecruitersQuery();
  const [fields, setFields] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>({
      defaultValues: {
        position: "",
        recruiter_id: "",
        available_quantity: undefined,
        monthly_salary: undefined,
        recruitment_type: "Full-time",
        status: "Đang mở",
        duration: "",
        application_deadline_from: "",
        application_deadline_to: "",
        requirements: "",
        support_info: "",
        graduation_rank: "",
        computer_skill: "",
        job_type: "",
        working_time: "",
        other_requirements: "",
      },
    });

  useEffect(() => {
    if (!detailRes?.data || !isEdit) return;
    console.log("Detail data:", detailRes.data);
    const job = detailRes.data as any;

    if (job.status === "Đã tuyển") {
      toast.error("Không thể chỉnh sửa bài đăng đã tuyển");
      navigate(path.ADMIN_JOB_LIST);
      return;
    }

    reset({
      position: job.position || "",
      recruiter_id: job.recruiter_id || "",
      available_quantity: job.available_quantity ?? undefined,
      monthly_salary: job.monthly_salary ?? undefined,
      recruitment_type: job.recruitment_type || "Full-time",
      status: job.status || "Đang mở",
      duration: job.duration || "",
      application_deadline_from: job.application_deadline_from || "",
      application_deadline_to: job.application_deadline_to || "",
      requirements: job.requirements || "",
      support_info: job.support_info || "",
      graduation_rank: job.graduation_rank || "",
      computer_skill: job.computer_skill || "",
      job_type: job.job_type || "",
      working_time: job.working_time || "",
      other_requirements: job.other_requirements || "",
    });
    setFields(
      Array.isArray(job.fields) ? job.fields : job.fields ? [job.fields] : [],
    );
    setBenefits(
      Array.isArray(job.benefits)
        ? job.benefits
        : job.benefits
          ? [job.benefits]
          : [],
    );
    setLanguages(
      Array.isArray(job.languguages)
        ? job.languguages
        : job.languguages
          ? [job.languguages]
          : [],
    );
  }, [detailRes, isEdit, reset]);

  const recruiters = useMemo(
    () => (recruiterRes as any)?.data || [],
    [recruiterRes],
  );

  const selectedRecruiterId = watch("recruiter_id");
  const selectedRecruiter = useMemo(
    () => recruiters.find((r: any) => r.recruiter_id === selectedRecruiterId),
    [recruiters, selectedRecruiterId],
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        benefits,
        fields,
        languages,
        application_deadline_from: values.application_deadline_from || null,
        application_deadline_to: values.application_deadline_to || null,
      } as any;
      console.log("Submitting payload:", payload);

      if (isEdit && id) {
        const res = await updateMutation.mutateAsync({
          jobPostId: id,
          payload,
        });

        if ((res as any)?.err === 0) {
          toast.success((res as any)?.mes || "Cập nhật tin thành công");
          await queryClient.invalidateQueries({ queryKey: ["job-posts"] });
          await queryClient.invalidateQueries({
            queryKey: ["admin-job-post", id],
          });
          navigate(path.ADMIN_JOB_LIST);
        } else {
          toast.error((res as any)?.mes || "Cập nhật thất bại");
        }
      } else {
        const res = await createMutation.mutateAsync({
          recruiterId: values.recruiter_id,
          payload,
        });

        if ((res as any)?.err === 0) {
          toast.success((res as any)?.mes || "Tạo tin thành công");
          await queryClient.invalidateQueries({ queryKey: ["job-posts"] });
          navigate(path.ADMIN_JOB_LIST);
        } else {
          toast.error((res as any)?.mes || "Tạo tin thất bại");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Thao tác thất bại");
    }
  });

  return (
    <AdminLayout
      title={isEdit ? "Sửa tin tuyển dụng" : "Thêm tin tuyển dụng"}
      activeMenu="jobs"
      fullWidth={true}
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Chỉnh sửa tin" : "Thêm tin mới"}
          </h1>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vị trí *
            </label>
            <input
              {...register("position", { required: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: Nhân viên bán hàng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nhà tuyển dụng *
            </label>
            <select
              {...register("recruiter_id", { required: true })}
              onChange={(e) => setValue("recruiter_id", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white"
              disabled={isEdit}
            >
              <option value="">Chọn nhà tuyển dụng</option>
              {recruiters.map((rec: any) => (
                <option key={rec.recruiter_id} value={rec.recruiter_id}>
                  {rec.company_name || rec.recruiter?.email || rec.recruiter_id}
                </option>
              ))}
            </select>
            {selectedRecruiter && (
              <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                <div className="font-semibold text-gray-800">
                  {selectedRecruiter.company_name || "Chưa cập nhật tên"}
                </div>
                <div>Email: {selectedRecruiter.recruiter?.email || "—"}</div>
                <div>Điện thoại: {selectedRecruiter.phone || "—"}</div>
                <div>Mã số thuế: {selectedRecruiter.tax_number || "—"}</div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số lượng
            </label>
            <input
              type="number"
              {...register("available_quantity")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mức lương
            </label>
            <input
              type="number"
              {...register("monthly_salary")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: 15000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hình thức
            </label>
            <select
              {...register("recruitment_type")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Intern">Intern</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
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
              Thời hạn
            </label>
            <input
              {...register("duration")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: 6 tháng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hạn nộp từ
            </label>
            <input
              type="date"
              {...register("application_deadline_from")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hạn nộp đến
            </label>
            <input
              type="date"
              {...register("application_deadline_to")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loại công việc
            </label>
            <select
              {...register("job_type")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white"
            >
              <option value="">Chọn</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
              <option value="Designer">Designer</option>
              <option value="Business Analyst">Business Analyst</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giờ làm việc
            </label>
            <select
              {...register("working_time")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 bg-white"
            >
              <option value="">Chọn</option>
              <option value="Giờ hành chính">Giờ hành chính</option>
              <option value="Ca kíp">Ca kíp</option>
              <option value="Linh hoạt">Linh hoạt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Xếp loại tốt nghiệp
            </label>
            <input
              {...register("graduation_rank")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="VD: Khá"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kỹ năng máy tính
            </label>
            <input
              {...register("computer_skill")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="Thành thạo JavaScript, Node.js..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Yêu cầu
            </label>
            <textarea
              {...register("requirements")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              rows={3}
              placeholder="Yêu cầu chính..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Yêu cầu khác
            </label>
            <textarea
              {...register("other_requirements")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              rows={2}
              placeholder="Khả năng teamwork, giao tiếp..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hỗ trợ
            </label>
            <input
              {...register("support_info")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="Hỗ trợ chỗ ở, đi lại..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phúc lợi (Enter để thêm)
            </label>
            <div className="mt-1 flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
              {benefits.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => setBenefits(benefits.filter((x) => x !== b))}
                    className="text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = benefitInput.trim();
                    if (val && !benefits.includes(val))
                      setBenefits([...benefits, val]);
                    setBenefitInput("");
                  }
                }}
                className="flex-1 min-w-[120px] border-none outline-none"
                placeholder={benefits.length ? "" : "Bảo hiểm, Teambuilding..."}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ngôn ngữ (Enter để thêm)
            </label>
            <div className="mt-1 flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() =>
                      setLanguages(languages.filter((l) => l !== lang))
                    }
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = languageInput.trim();
                    if (val && !languages.includes(val))
                      setLanguages([...languages, val]);
                    setLanguageInput("");
                  }
                }}
                className="flex-1 min-w-[120px] border-none outline-none"
                placeholder={languages.length ? "" : "English, Vietnamese..."}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Ngành liên quan
            </label>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-700">
              {INDUSTRY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={fields.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) setFields([...fields, opt]);
                      else setFields(fields.filter((f) => f !== opt));
                    }}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(path.ADMIN_JOB_LIST)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
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
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
