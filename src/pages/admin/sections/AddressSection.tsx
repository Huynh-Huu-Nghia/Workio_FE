import { useMemo } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { CreateCandidateSchema } from "@/schemas/candidate.schema";
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";

interface Props {
  register: UseFormRegister<CreateCandidateSchema>;
  errors: FieldErrors<CreateCandidateSchema>;
  setValue: UseFormSetValue<CreateCandidateSchema>;
  watch: UseFormWatch<CreateCandidateSchema>;
}

export default function AddressSection({
  register,
  errors,
  watch,
  setValue,
}: Props) {
  // Lấy giá trị hiện tại (Đây là CODE đối với Tỉnh/Huyện, là NAME đối với Xã)
  const provinceCode = watch("addressInfo.province_code");

  const { data: provinces = [] } = useProvincesQuery();
  const { data: allWards = [] } = useWardsQuery(true);

  const wards = useMemo(() => {
    if (!provinceCode) return [];
    return allWards.filter(
      (w: any) => String((w as any).province_code) === String(provinceCode)
    );
  }, [allWards, provinceCode]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 🏠 Số nhà + Đường */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Số nhà, tên đường <span className="text-red-500">*</span>
        </label>
        <input
          {...register("addressInfo.street")}
          placeholder="VD: 123 Lê Lợi"
          className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        />
        <p className="text-xs text-red-500 mt-1">
          {errors.addressInfo?.street?.message}
        </p>
      </div>

      {/* 🏙 Tỉnh / Thành phố */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tỉnh / Thành phố <span className="text-red-500">*</span>
        </label>
        <select
          {...register("addressInfo.province_code", {
            onChange: () => {
              // Khi đổi tỉnh -> Reset phường
              setValue("addressInfo.ward_code", "");
            },
          })}
          className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          <option value="">-- Chọn Tỉnh/Thành --</option>
          {provinces.map((p) => (
            // 🔥 MẤU CHỐT Ở ĐÂY:
            // value={p.code} -> Form lưu Mã (VD: 79)
            // {p.name} -> Người dùng thấy Chữ (VD: Hồ Chí Minh)
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-red-500 mt-1">
          {errors.addressInfo?.province_code?.message}
        </p>
      </div>

      {/* 🏡 Phường / Xã */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Phường / Xã <span className="text-red-500">*</span>
        </label>
        <select
          {...register("addressInfo.ward_code")}
          disabled={!provinceCode}
          className="w-full rounded-lg border border-gray-300 p-2.5 bg-white disabled:bg-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          <option value="">-- Chọn Phường/Xã --</option>
          {wards.map((w: any) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-red-500 mt-1">
          {errors.addressInfo?.ward_code?.message}
        </p>
      </div>
    </div>
  );
}
