import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateRecruiterSchema } from "@/schemas/recruiter.schema";

interface Props {
  register: UseFormRegister<CreateRecruiterSchema>;
  errors: FieldErrors<CreateRecruiterSchema>;
}

export default function CompanyInfoSection({ register, errors }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tên Công Ty */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tên Công Ty <span className="text-red-500">*</span>
          </label>
          <input
            {...register("recruiterInfo.company_name")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="VD: Công ty TNHH ABC..."
          />
          <p className="text-xs text-red-500">
            {errors.recruiterInfo?.company_name?.message}
          </p>
        </div>

        {/* Mã Số Thuế */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mã Số Thuế <span className="text-red-500">*</span>
          </label>
          <input
            {...register("recruiterInfo.tax_number")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="VD: 0312345678"
          />
          <p className="text-xs text-red-500">
            {errors.recruiterInfo?.tax_number?.message}
          </p>
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Số điện thoại liên hệ <span className="text-red-500">*</span>
          </label>
          <input
            {...register("recruiterInfo.phone")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="VD: 0901234567"
          />
          <p className="text-xs text-red-500">
            {errors.recruiterInfo?.phone?.message}
          </p>
        </div>

        {/* Website */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Website (Nếu có)
          </label>
          <input
            {...register("recruiterInfo.website")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="https://company.com"
          />
          <p className="text-xs text-red-500">
            {errors.recruiterInfo?.website?.message}
          </p>
        </div>

        {/* Ngày thành lập */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ngày thành lập
          </label>
          <input
            type="date"
            {...register("recruiterInfo.established_at")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
          />
          <p className="text-xs text-red-500">
            {errors.recruiterInfo?.established_at?.message}
          </p>
        </div>

        {/* Mô tả - Full width */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Giới thiệu công ty
          </label>
          <textarea
            {...register("recruiterInfo.description")}
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="Mô tả về lĩnh vực hoạt động, quy mô, văn hóa..."
          />
        </div>
      </div>
    </div>
  );
}
