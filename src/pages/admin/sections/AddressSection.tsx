import { useEffect, useMemo, useState } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { CreateCandidateSchema } from "@/schemas/candidate.schema";
// Sử dụng Hook chuẩn của dự án
import {
  useProvinceByCodeQuery,
  useProvincesQuery,
  useWardsQuery,
} from "@/api/provinces.api";

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

  // Lấy giá trị hiện tại từ Form
  const provinceCode = watch("addressInfo.province_code");
  const districtCode = watch("addressInfo.district_code");

  // 1. Load danh sách Tỉnh (Dùng Hook API dự án)
  const { data: provinces = [] } = useProvincesQuery();

  // 2. Load chi tiết Tỉnh (để lấy Huyện) khi provinceCode thay đổi
  const { data: provinceDetail } = useProvinceByCodeQuery(provinceCode);

  // Logic kiểm tra xem có cần fetch tất cả xã không (nếu huyện không có sẵn xã)
  const shouldFetchAllWards = useMemo(() => {
    if (!districtCode) return false;
    const firstDistrict = (provinceDetail as any)?.districts?.[0];
    return !firstDistrict || !("wards" in firstDistrict);
  }, [districtCode, provinceDetail]);

  const { data: allWards = [] } = useWardsQuery(shouldFetchAllWards);

  // Cập nhật danh sách Huyện khi chọn Tỉnh
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }
    setDistricts((provinceDetail as any)?.districts || []);
  }, [provinceCode, provinceDetail]);

  // 3. Tính toán danh sách Xã dựa trên Huyện đã chọn
  const wards = useMemo(() => {
    if (!districtCode) return [];

    // Tìm huyện hiện tại trong list
    const district = districts.find(
      (d) => String(d.code) === String(districtCode)
    );

    // Nếu huyện đó đã có sẵn wards thì dùng luôn
    if (district?.wards) return district.wards;

    // Nếu không thì lọc từ danh sách allWards
    return allWards.filter(
      (w) => String((w as any).district_code) === String(districtCode)
    );
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
          {provinces.map((p: any) => (
            // Lưu ý: API nội bộ thường dùng 'code' và 'name'
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
          {districts.map((d: any) => (
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
            // BE thường lưu tên xã thẳng vào DB thay vì code xã
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
