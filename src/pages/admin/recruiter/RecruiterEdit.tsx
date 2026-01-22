import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Building2, MapPin, Shield } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { axiosInstance } from "@/utils/axios";
import useBack from "@/hooks/useBack";

import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import {
  createRecruiterSchema,
  type CreateRecruiterSchema,
} from "@/schemas/recruiter.schema";
import { useAdminRecruiterDetailQuery } from "@/api/recruiter.api";
import AddressSection from "../sections/AddressSection";
import AccountSection from "../sections/AccountSection";
import CompanyInfoSection from "../sections/CompanyInfoSection";
import { useQueryClient } from "@tanstack/react-query";

export default function RecruiterEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: detailRes } = useAdminRecruiterDetailQuery(id as string);

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
        ward_code: "",
        province_code: "",
      },
    },
  });

  useEffect(() => {
    const recruiter: any = detailRes?.data;
    if (!recruiter) return;

    setValue("email", recruiter?.recruiter?.email || "");
    setValue("recruiterInfo.company_name", recruiter.company_name || "");
    setValue("recruiterInfo.tax_number", recruiter.tax_number || "");
    setValue("recruiterInfo.phone", recruiter.phone || "");
    setValue("recruiterInfo.website", recruiter.website || "");
    setValue("recruiterInfo.description", recruiter.description || "");
    setValue(
      "addressInfo.street",
      recruiter?.address?.street || recruiter?.address?.street || "",
    );
    setValue(
      "addressInfo.ward_code",
      recruiter?.address?.ward_code || recruiter?.ward_code || "",
    );
    setValue(
      "addressInfo.province_code",
      recruiter?.address?.province_code || recruiter?.province_code || "",
    );
  }, [detailRes, setValue]);

  const onSubmit = async (formData: CreateRecruiterSchema) => {
    if (!id) {
      toast.error("Không xác định nhà tuyển dụng");
      return;
    }
    try {
      const payload: any = {
        recruiter_id: id,
        recruiterInfo: {
          company_name: formData.recruiterInfo.company_name,
          tax_number: formData.recruiterInfo.tax_number,
          phone: formData.recruiterInfo.phone,
          website: formData.recruiterInfo.website || "",
          description: formData.recruiterInfo.description || "",
          is_verified: formData.recruiterInfo.is_verified,
          established_at: formData.recruiterInfo.established_at || "",
        },
        addressInfo: {
          street: formData.addressInfo.street,
          ward_code: formData.addressInfo.ward_code,
          province_code: formData.addressInfo.province_code,
        },
      };

      const res = await axiosInstance.patch("/admin/recruiter", payload);
      const data = res?.data;
      if (data && data.err === 0) {
        toast.success(data.mes || "Cập nhật nhà tuyển dụng thành công");
        await queryClient.invalidateQueries({ queryKey: ["recruiters"] });
        await queryClient.invalidateQueries({
          queryKey: ["admin-recruiter", id],
        });
        navigate(path.ADMIN_RECRUITER_VIEW.replace(":id", String(id)));
        return;
      }
      toast.error(data?.mes || "Cập nhật thất bại hoặc endpoint không tồn tại");
    } catch (err: any) {
      console.error(err);
      const mes =
        err?.response?.data?.mes || err?.message || "Lỗi kết nối server";
      toast.error(mes);
    }
  };

  const handleBack = useBack(() => path.ADMIN_RECRUITER_LIST);

  return (
    <AdminLayout
      title="Chỉnh sửa Nhà tuyển dụng"
      activeMenu="recruiters"
      activeSubmenu="all-recruiters"
      fullWidth={true}
    >
      <div className="min-h-screen bg-slate-50 pb-20 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <BackButton
              text="Quay lại danh sách"
              to={path.ADMIN_RECRUITER_LIST}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            />
          </div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chỉnh sửa Nhà tuyển dụng
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-xl bg-white border shadow-sm">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200">
                      <Shield className="text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Thông Tin Tài Khoản
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <AccountSection
                    register={register as any}
                    errors={errors as any}
                    setValue={setValue as any}
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-white border shadow-sm">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200">
                      <Building2 className="text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Thông Tin Công Ty
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <CompanyInfoSection
                    register={register as any}
                    errors={errors as any}
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-white border shadow-sm">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200">
                      <MapPin className="text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Địa Chỉ Trụ Sở
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <AddressSection
                    register={register as any}
                    errors={errors as any}
                    watch={watch as any}
                    setValue={setValue as any}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Hoàn tất</h3>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white"
                >
                  <Save size={16} /> Lưu
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border px-4 py-3 bg-gray-50"
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
