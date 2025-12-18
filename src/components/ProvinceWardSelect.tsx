import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";
import React from "react";

type Props = {
  provinceCode: string;
  wardCode?: string;
  onProvinceChange: (code: string) => void;
  onWardChange: (code: string) => void;
  labelProvince?: string;
  labelWard?: string;
  required?: boolean;
};

const ProvinceWardSelect: React.FC<Props> = ({
  provinceCode,
  wardCode,
  onProvinceChange,
  onWardChange,
  labelProvince = "Tỉnh/TP",
  labelWard = "Phường/Xã",
  required = false,
}) => {
  const { data: provinces = [] } = useProvincesQuery();
  const { data: wards = [] } = useWardsQuery(true);

  const filteredWards = provinceCode
    ? wards.filter((w: any) => String(w.province_code) === String(provinceCode))
    : wards;

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {labelProvince} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={provinceCode}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          <option value="">-- Chọn Tỉnh/Thành --</option>
          {provinces.map((p: any) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {labelWard} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={wardCode || ""}
          onChange={(e) => onWardChange(e.target.value)}
          disabled={!provinceCode}
          className="w-full rounded-lg border border-gray-300 p-2.5 bg-white disabled:bg-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          <option value="">-- Chọn Phường/Xã --</option>
          {filteredWards.map((w: any) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default ProvinceWardSelect;

