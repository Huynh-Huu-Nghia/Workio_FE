import { useEffect, useMemo, useState } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { CreateCandidateSchema } from "@/schemas/candidate.schema";
import { useProvinceByCodeQuery, useProvincesQuery, useWardsQuery } from "@/api/provinces.api";

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
  const [districts, setDistricts] = useState<any[]>([]);

  // Lấy giá trị hiện tại (Đây là CODE đối với Tỉnh/Huyện, là NAME đối với Xã)
  const provinceCode = watch("addressInfo.province_code");
  const districtCode = watch("addressInfo.district_code");

  const { data: provinces = [] } = useProvincesQuery();
  const { data: provinceDetail } = useProvinceByCodeQuery(provinceCode);

  const shouldFetchAllWards = useMemo(() => {
    if (!districtCode) return false;
    const firstDistrict = (provinceDetail as any)?.districts?.[0];
    return !firstDistrict || !("wards" in firstDistrict);
  }, [districtCode, provinceDetail]);

  const { data: allWards = [] } = useWardsQuery(shouldFetchAllWards);

  /** 2. Khi chọn Tỉnh (có Code) -> Load Huyện */
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }

    setDistricts((provinceDetail as any)?.districts || []);
  }, [provinceCode, provinceDetail]);

  const wards = useMemo(() => {
    if (!districtCode) return [];
    const district = districts.find((d) => String(d.code) === String(districtCode));
    if (district?.wards) return district.wards;
    return allWards.filter((w) => String((w as any).district_code) === String(districtCode));
  }, [allWards, districtCode, districts]);

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
              // Khi đổi tỉnh -> Reset huyện và xã
              setValue("addressInfo.district_code", "");
              setValue("addressInfo.ward", "");
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

      {/* 📍 Quận / Huyện */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Quận / Huyện <span className="text-red-500">*</span>
        </label>
        <select
          {...register("addressInfo.district_code", {
            onChange: () => setValue("addressInfo.ward", ""),
          })}
          disabled={!provinceCode}
          className="w-full rounded-lg border border-gray-300 p-2.5 bg-white disabled:bg-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map((d) => (
            // 🔥 value={d.code} -> Form lưu Mã (VD: 760)
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-red-500 mt-1">
          {errors.addressInfo?.district_code?.message}
        </p>
      </div>

      {/* 🏡 Phường / Xã */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Phường / Xã <span className="text-red-500">*</span>
        </label>
        <select
          {...register("addressInfo.ward")}
          disabled={!districtCode}
          className="w-full rounded-lg border border-gray-300 p-2.5 bg-white disabled:bg-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          <option value="">-- Chọn Phường/Xã --</option>
          {wards.map((w: any) => (
            // 🔥 RIÊNG CÁI NÀY: JSON BE ghi "ward": "Bến Thành"
            // Nên ta để value={w.name} luôn để lưu tên.
            <option key={w.code} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-red-500 mt-1">
          {errors.addressInfo?.ward?.message}
        </p>
      </div>
    </div>
  );
}
