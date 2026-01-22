import { useNavigate } from "react-router-dom";
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
  UserPlus,
} from "lucide-react";

import {
  createCandidateSchema,
  type CreateCandidateSchema,
} from "@/schemas/candidate.schema";
import {
  useCreateCandidateMutation,
  type CandidatePayload,
} from "@/api/candidate.api";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

import AdminLayout from "@/layouts/AdminLayout";

// Sections
import AccountSection from "../sections/AccountSection";
import PersonalSection from "../sections/PersonalSection";
import AddressSection from "../sections/AddressSection";
import EducationSection from "../sections/EducationSection";
import ExperienceSection from "../sections/ExperienceSection";

export default function CreateCandidate() {
  const navigate = useNavigate();
  const mutation = useCreateCandidateMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCandidateSchema>({
    resolver: zodResolver(createCandidateSchema) as any,
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

  // Hàm helper format ngày an toàn
  const safeFormatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "yyyy-MM-dd") : "";
  };

  const onSubmit: SubmitHandler<CreateCandidateSchema> = (formData) => {
    try {
      const payload: CandidatePayload = {
        email: formData.email,
        password: formData.password,

        candidateInfo: {
          ...formData.candidateInfo,
          minimum_income: Number(formData.candidateInfo.minimum_income),
          date_of_birth: safeFormatDate(formData.candidateInfo.date_of_birth),
          languguages: formData.candidateInfo.languguages || [],
          fields_wish: (formData.candidateInfo.fields_wish || []).filter((f) =>
            INDUSTRY_OPTIONS.includes(f),
          ),
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

        // 👇 ĐÃ FIX LỖI DESCRIPTION Ở ĐÂY
        workExperiences: (formData.workExperiences || []).map((exp) => ({
          company_name: exp.company_name,
          position: exp.position,
          description: exp.description || "", // Nếu undefined thì lấy chuỗi rỗng
          start_date: safeFormatDate(exp.start_date),
          end_date: safeFormatDate(exp.end_date),
        })),
      };

      console.log("🚀 Payload gửi BE:", payload);

      mutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.err === 0) {
            toast.success(res.mes || "Thêm ứng viên thành công! 🎉");
            navigate("/admin/candidates/list");
          } else {
            toast.error(res.mes || "Có lỗi từ server");
          }
        },
        onError: (error: any) => {
          console.error("Lỗi:", error);
          const mes = error?.response?.data?.mes || "Lỗi kết nối server!";
          toast.error(mes);
        },
      });
    } catch (err) {
      console.error("Lỗi format dữ liệu:", err);
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
    }
  };

  return (
    <AdminLayout
      title="THÊM ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="add-candidate"
      fullWidth={true}
    >
      <div className="min-h-screen bg-slate-50 pb-20 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shadow-sm">
                <UserPlus size={26} />
              </div>
              THÊM ỨNG VIÊN
            </h1>
            <p className="text-gray-500 mt-1">
              Điền đầy đủ thông tin để tạo hồ sơ ứng viên mới.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* FORM NHẬP - FULL WIDTH */}
            <div className="space-y-6">
              <SectionWrapper
                title="Thông Tin Tài Khoản"
                description="Email & mật khẩu đăng nhập hệ thống."
                icon={<Shield className="text-orange-500" />}
              >
                <AccountSection register={register} errors={errors} />
              </SectionWrapper>

              <SectionWrapper
                title="Thông Tin Cá Nhân"
                description="Dữ liệu giúp xác định ứng viên."
                icon={<User className="text-blue-500" />}
              >
                <PersonalSection
                  register={register}
                  errors={errors}
                  control={control as any}
                  setValue={setValue}
                  watch={watch}
                />
              </SectionWrapper>

              <SectionWrapper
                title="Địa Chỉ Liên Hệ"
                description="Nơi ở hiện tại của ứng viên."
                icon={<MapPin className="text-red-500" />}
              >
                <AddressSection
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              </SectionWrapper>

              <SectionWrapper
                title="Lịch Sử Học Vấn"
                description="Bằng cấp & đào tạo."
                icon={<BookOpen className="text-purple-500" />}
              >
                <EducationSection
                  control={control as any}
                  register={register}
                  errors={errors}
                />
              </SectionWrapper>

              <SectionWrapper
                title="Kinh Nghiệm Làm Việc"
                description="Công việc từng đảm nhiệm."
                icon={<Briefcase className="text-green-500" />}
              >
                <ExperienceSection
                  control={control as any}
                  register={register}
                  errors={errors}
                />
              </SectionWrapper>
            </div>

            {/* NÚT SAVE Ở CUỐI */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Hoàn tất hồ sơ
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Kiểm tra lại thông tin trước khi lưu.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-md hover:bg-orange-600 transition disabled:bg-gray-300"
                >
                  {mutation.isPending ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <Save size={18} /> Lưu Hồ Sơ
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
          </form>
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
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
