import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import {
  Building2, // Icon công ty
  MapPin,
  Shield,
  Save,
  BriefcaseBusiness, // Icon thay cho UserPlus
} from "lucide-react";

import {
  createRecruiterSchema,
  type CreateRecruiterSchema,
} from "@/schemas/recruiter.schema";
import {
  useCreateRecruiterMutation,
  type RecruiterPayload,
} from "@/api/recruiter.api";

import AdminLayout from "@/layouts/AdminLayout";

// Sections (Tái sử dụng Account & Address, Import mới CompanyInfo)
import AccountSection from "../sections/AccountSection"; // Reuse
import AddressSection from "../sections/AddressSection"; // Reuse
import CompanyInfoSection from "../sections/CompanyInfoSection"; // New

export default function CreateRecruiter() {
  const navigate = useNavigate();
  const mutation = useCreateRecruiterMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRecruiterSchema>({
    resolver: zodResolver(createRecruiterSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      recruiterInfo: {
        company_name: "",
        tax_number: "",
        phone: "",
        website: "",
        description: "",
        established_at: "",
        is_verified: false,
      },
      addressInfo: {
        street: "",
        ward: "",
        district_code: "",
        province_code: "",
      },
    },
  });

  const safeFormatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "yyyy-MM-dd") : "";
  };

  const onSubmit: SubmitHandler<CreateRecruiterSchema> = (formData) => {
    try {
      // 🟢 Mapping dữ liệu Form -> Payload Recruiter
      const payload: RecruiterPayload = {
        email: formData.email,
        password: formData.password,

        recruiterInfo: {
          company_name: formData.recruiterInfo.company_name,
          tax_number: formData.recruiterInfo.tax_number,
          phone: formData.recruiterInfo.phone,
          website: formData.recruiterInfo.website || "",
          description: formData.recruiterInfo.description || "",
          is_verified: formData.recruiterInfo.is_verified,
          // Format ngày thành lập
          established_at: safeFormatDate(formData.recruiterInfo.established_at),
        },

        addressInfo: {
          street: formData.addressInfo.street,
          // AddressSection trả về Name (Xã) và Code (Huyện/Tỉnh) như cũ
          ward: formData.addressInfo.ward,
          district_code: formData.addressInfo.district_code,
          province_code: formData.addressInfo.province_code,
        },
      };

      console.log("🚀 Payload Recruiter gửi đi:", payload);

      mutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.err === 0) {
            toast.success("Thêm nhà tuyển dụng thành công! 🎉");
            // Điều hướng về danh sách hoặc trang nào đó
            navigate("/admin/recruiters");
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
      console.error("Lỗi xử lý form:", err);
      toast.error("Dữ liệu không hợp lệ.");
    }
  };

  return (
    <AdminLayout
      title="THÊM NHÀ TUYỂN DỤNG"
      activeMenu="recruiters"
      activeSubmenu="add-recruiter"
    >
      <div className="min-h-screen bg-slate-50 pb-20 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shadow-sm">
                <BriefcaseBusiness size={26} />
              </div>
              THÊM NHÀ TUYỂN DỤNG
            </h1>
            <p className="text-gray-500 mt-1">
              Tạo tài khoản và thông tin hồ sơ cho công ty mới.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* ⬅ CỘT TRÁI - FORM NHẬP */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Account (Dùng lại của Candidate được vì giống nhau) */}
                <SectionWrapper
                  title="Thông Tin Tài Khoản"
                  description="Email & mật khẩu đăng nhập."
                  icon={<Shield className="text-orange-500" />}
                >
                  <AccountSection
                    register={register as any}
                    errors={errors as any}
                  />
                </SectionWrapper>

                {/* 2. Company Info (Mới) */}
                <SectionWrapper
                  title="Thông Tin Công Ty"
                  description="Tên, MST, Website và các thông tin pháp lý."
                  icon={<Building2 className="text-blue-500" />}
                >
                  <CompanyInfoSection register={register} errors={errors} />
                </SectionWrapper>

                {/* 3. Address (Dùng lại của Candidate) */}
                <SectionWrapper
                  title="Địa Chỉ Trụ Sở"
                  description="Địa chỉ đăng ký kinh doanh."
                  icon={<MapPin className="text-red-500" />}
                >
                  <AddressSection
                    register={register as any}
                    errors={errors as any}
                    watch={watch as any}
                    setValue={setValue as any}
                  />
                </SectionWrapper>
              </div>

              {/* ➡ CỘT PHẢI - ACTION */}
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 sticky top-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Hoàn tất hồ sơ
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Kiểm tra kỹ thông tin MST và Email trước khi lưu.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:bg-gray-300"
                    >
                      {mutation.isPending ? (
                        "Đang xử lý..."
                      ) : (
                        <>
                          <Save size={18} /> Lưu Nhà Tuyển Dụng
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
        </div>
      </div>
    </AdminLayout>
  );
}

// Wrapper Component (Giữ nguyên)
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
