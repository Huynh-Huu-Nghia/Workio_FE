import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import {
  User,
  MapPin,
  BookOpen,
  Briefcase,
  Shield,
  Save,
  ArrowLeft,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import {
  updateCandidateSchema,
  type UpdateCandidateSchema,
} from "@/schemas/candidate.schema";
import {
  useGetCandidateDetailAdminQuery,
  useUpdateCandidateAdminMutation,
  type UpdateCandidatePayload,
} from "@/api/candidate.api";
import { useQueryClient } from "@tanstack/react-query";

// Sections
import AccountSection from "../sections/AccountSection";
import PersonalSection from "../sections/PersonalSection";
import AddressSection from "../sections/AddressSection";
import EducationSection from "../sections/EducationSection";
import ExperienceSection from "../sections/ExperienceSection";

export default function CandidateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: detailRes, isLoading, isError } =
    useGetCandidateDetailAdminQuery(id);
  const updateMutation = useUpdateCandidateAdminMutation();
  const handleBack = () => {
    const canUseHistory = typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    const fallback = id
      ? path.ADMIN_CANDIDATE_VIEW.replace(":id", id)
      : path.ADMIN_USER_CANDIDATE_LIST;
    navigate(fallback);
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateCandidateSchema>({
    resolver: zodResolver(updateCandidateSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      studyHistories: [],
      workExperiences: [],
      candidateInfo: {
        full_name: "",
        gender: "Nam",
        date_of_birth: "",
        place_of_birth: "",
        ethnicity: "Kinh",
        phone: "",
        languguages: [],
        graduation_rank: "",
        computer_skill: "",
        other_computer_skill: "",
        fields_wish: [],
        job_type: "",
        working_time: "",
        transport: "",
        minimum_income: 0,
      },
      addressInfo: {
        street: "",
        ward_code: "",
        province_code: "",
      },
    },
  });

  const safeFormatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "yyyy-MM-dd") : "";
  };

  useEffect(() => {
    const candidate: any = detailRes?.data;
    if (!candidate) return;

    setValue("email", candidate?.candidate?.email || candidate?.email || "");
    setValue("password", "");

    setValue("candidateInfo.full_name", candidate.full_name || "");
    setValue("candidateInfo.gender", candidate.gender || "Nam");
    setValue("candidateInfo.date_of_birth", safeFormatDate(candidate.date_of_birth));
    setValue("candidateInfo.place_of_birth", candidate.place_of_birth || "");
    setValue("candidateInfo.ethnicity", candidate.ethnicity || "Kinh");
    setValue("candidateInfo.phone", candidate.phone || "");
    setValue("candidateInfo.graduation_rank", candidate.graduation_rank || "");
    setValue("candidateInfo.computer_skill", candidate.computer_skill || "");
    setValue("candidateInfo.other_computer_skill", candidate.other_computer_skill || "");
    setValue(
      "candidateInfo.languguages",
      Array.isArray(candidate.languguages) ? candidate.languguages : []
    );
    setValue(
      "candidateInfo.fields_wish",
      Array.isArray(candidate.fields_wish) ? candidate.fields_wish : []
    );
    setValue("candidateInfo.job_type", candidate.job_type || "");
    setValue("candidateInfo.working_time", candidate.working_time || "");
    setValue("candidateInfo.transport", candidate.transport || "");
    setValue("candidateInfo.minimum_income", Number(candidate.minimum_income || 0));

    setValue("addressInfo.street", candidate?.address?.street || "");
    setValue("addressInfo.ward_code", candidate?.address?.ward_code || candidate?.address?.ward || "");
    setValue("addressInfo.province_code", candidate?.address?.province_code || "");

    setValue(
      "studyHistories",
      (candidate.study_history || []).map((edu: any) => ({
        school_name: edu.school_name || "",
        major: edu.major || "",
        start_year: edu.start_year || "",
        end_year: edu.end_year || "",
        degree: edu.degree || "",
      }))
    );
    setValue(
      "workExperiences",
      (candidate.work_experience || []).map((exp: any) => ({
        company_name: exp.company_name || "",
        position: exp.position || "",
        start_date: safeFormatDate(exp.start_date),
        end_date: safeFormatDate(exp.end_date),
        description: exp.description || "",
      }))
    );
  }, [detailRes, setValue]);

  const onSubmit: SubmitHandler<UpdateCandidateSchema> = async (formData) => {
    if (!id) return;
    try {
      const payload: Partial<UpdateCandidatePayload> = {
        email: formData.email,
        candidateInfo: {
          ...formData.candidateInfo,
          minimum_income: Number(formData.candidateInfo.minimum_income),
          date_of_birth: safeFormatDate(formData.candidateInfo.date_of_birth),
          languguages: formData.candidateInfo.languguages || [],
          fields_wish: formData.candidateInfo.fields_wish || [],
        },
        addressInfo: {
          street: formData.addressInfo.street,
          ward_code: formData.addressInfo.ward_code,
          province_code: formData.addressInfo.province_code,
        },
        studyHistories: (formData.studyHistories || []).map((edu) => ({
          school_name: edu.school_name,
          major: edu.major,
          degree: edu.degree,
          start_year: Number(edu.start_year),
          end_year: Number(edu.end_year),
        })),
        workExperiences: (formData.workExperiences || []).map((exp) => ({
          company_name: exp.company_name,
          position: exp.position,
          description: exp.description || "",
          start_date: safeFormatDate(exp.start_date),
          end_date: safeFormatDate(exp.end_date),
        })),
      };

      const trimmedPassword = (formData.password || "").trim();
      if (trimmedPassword) payload.password = trimmedPassword;

      const res = await updateMutation.mutateAsync({
        candidateId: id,
        data: payload,
      });

      if (res?.err === 0) {
        toast.success(res?.mes || "Cập nhật ứng viên thành công!");
        await queryClient.invalidateQueries({ queryKey: ["candidates"] });
        await queryClient.invalidateQueries({ queryKey: ["admin-candidate", id] });
        navigate(`/admin/candidates/view/${id}`);
        return;
      }
      toast.error(res?.mes || "Cập nhật thất bại.");
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Cập nhật thất bại.");
    }
  };

  return (
    <AdminLayout
      title="CHỈNH SỬA ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="list-candidates"
    >
      <div className="min-h-screen bg-slate-50 pb-20 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          </div>

          {isLoading && (
            <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm text-gray-600">
              Đang tải dữ liệu...
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-red-700">
              Không thể tải dữ liệu ứng viên.
            </div>
          )}

          {!isLoading && !isError && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <SectionWrapper
                    title="Thông Tin Tài Khoản"
                    description="Email & (tuỳ chọn) mật khẩu đăng nhập hệ thống."
                    icon={<Shield className="text-orange-500" />}
                  >
                    <AccountSection
                      register={register as any}
                      errors={errors as any}
                      passwordRequired={false}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Nếu không muốn đổi mật khẩu, để trống.
                    </p>
                  </SectionWrapper>

                  <SectionWrapper
                    title="Thông Tin Cá Nhân"
                    description="Dữ liệu giúp xác định ứng viên."
                    icon={<User className="text-blue-500" />}
                  >
                    <PersonalSection
                      register={register as any}
                      errors={errors as any}
                      control={control as any}
                      setValue={setValue as any}
                      watch={watch as any}
                    />
                  </SectionWrapper>

                  <SectionWrapper
                    title="Địa Chỉ Liên Hệ"
                    description="Nơi ở hiện tại của ứng viên."
                    icon={<MapPin className="text-red-500" />}
                  >
                    <AddressSection
                      register={register as any}
                      errors={errors as any}
                      watch={watch as any}
                      setValue={setValue as any}
                    />
                  </SectionWrapper>

                  <SectionWrapper
                    title="Lịch Sử Học Vấn"
                    description="Bằng cấp & đào tạo."
                    icon={<BookOpen className="text-purple-500" />}
                  >
                    <EducationSection
                      control={control as any}
                      register={register as any}
                      errors={errors as any}
                    />
                  </SectionWrapper>

                  <SectionWrapper
                    title="Kinh Nghiệm Làm Việc"
                    description="Công việc từng đảm nhiệm."
                    icon={<Briefcase className="text-green-500" />}
                  >
                    <ExperienceSection
                      control={control as any}
                      register={register as any}
                      errors={errors as any}
                    />
                  </SectionWrapper>
                </div>

                <div className="space-y-6">
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 sticky top-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Hoàn tất cập nhật
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Kiểm tra lại thông tin trước khi lưu.
                    </p>

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-md hover:bg-orange-600 transition disabled:bg-gray-300"
                      >
                        {updateMutation.isPending ? (
                          "Đang xử lý..."
                        ) : (
                          <>
                            <Save size={18} /> Lưu thay đổi
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full rounded-lg border bg-gray-50 px-4 py-3 font-medium text-gray-600 hover:bg-gray-100 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const SectionWrapper = ({ title, description, icon, children }: any) => (
  <div className="overflow-hidden rounded-xl bg-white border shadow-sm hover:shadow-md transition">
    <div className="border-b bg-gray-50 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
