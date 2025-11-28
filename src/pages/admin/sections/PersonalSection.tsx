import React, { useState } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { CreateCandidateSchema } from "@/schemas/candidate.schema";
import { X } from "lucide-react";

interface Props {
  register: UseFormRegister<CreateCandidateSchema>;
  errors: FieldErrors<CreateCandidateSchema>;
  control: Control<CreateCandidateSchema>;
  setValue: UseFormSetValue<CreateCandidateSchema>;
  watch: UseFormWatch<CreateCandidateSchema>;
}

// Dữ liệu mẫu cho Dropdown
const OPTIONS = {
  graduation_rank: ["Cấp 1", "Cấp 2", "Cấp 3", "Đại học"],
  computer_skill: ["Văn phòng", "Kỹ thuật viên", "Trung cấp", "Khác"],
  job_type: ["Văn phòng", "Sản xuất", "Giao dịch"],
  working_time: ["Giờ hành chính", "Ca kíp", "Khác"],
  transport: ["Xe gắn máy", "Khác"],
};

export default function PersonalSection({
  register,
  errors,
  setValue,
  watch,
}: Props) {
  // --- COMPONENT CON: TAG INPUT (Đã cập nhật để nhận errorMessage từ ngoài vào) ---
  const TagInput = ({
    label,
    fieldName,
    placeholder,
    errorMessage, // ✅ FIX: Nhận lỗi trực tiếp từ props thay vì tự tính toán
  }: {
    label: string;
    fieldName: "candidateInfo.languguages" | "candidateInfo.fields_wish";
    placeholder: string;
    errorMessage?: string; // ✅ FIX: Type string hoặc undefined
  }) => {
    const [inputValue, setInputValue] = useState("");
    const values = watch(fieldName) || [];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (inputValue.trim()) {
          if (!values.includes(inputValue.trim())) {
            setValue(fieldName, [...values, inputValue.trim()], {
              shouldValidate: true,
            });
          }
          setInputValue("");
        }
      }
    };

    const removeTag = (tagToRemove: string) => {
      setValue(
        fieldName,
        values.filter((t) => t !== tagToRemove),
        { shouldValidate: true }
      );
    };

    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="rounded-lg border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 bg-white min-h-[42px] flex flex-wrap gap-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-1 outline-none text-sm min-w-[120px]"
            placeholder={values.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Nhấn Enter để thêm thẻ</p>
        {/* ✅ FIX: Hiển thị lỗi từ props */}
        {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* --- CÁC TRƯỜNG CƠ BẢN --- */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register("candidateInfo.full_name")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="Nguyễn Văn A"
          />
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.full_name?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ngày sinh <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("candidateInfo.date_of_birth")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
          />
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.date_of_birth?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Giới tính
          </label>
          <select
            {...register("candidateInfo.gender")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500 bg-white"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Dân tộc
          </label>
          <input
            {...register("candidateInfo.ethnicity")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="Kinh"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            {...register("candidateInfo.phone")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="0901234567"
          />
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.phone?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nơi sinh <span className="text-red-500">*</span>
          </label>
          <input
            {...register("candidateInfo.place_of_birth")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="TP.HCM"
          />
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.place_of_birth?.message}
          </p>
        </div>
      </div>

      <hr className="border-gray-100" />
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
        Kỹ năng & Mong muốn
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* --- CÁC TRƯỜNG SELECT --- */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Xếp loại tốt nghiệp
          </label>
          <select
            {...register("candidateInfo.graduation_rank")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500 bg-white"
          >
            <option value="">-- Chọn xếp loại --</option>
            {OPTIONS.graduation_rank.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.graduation_rank?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Kỹ năng tin học
          </label>
          <select
            {...register("candidateInfo.computer_skill")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500 bg-white"
          >
            <option value="">-- Chọn kỹ năng --</option>
            {OPTIONS.computer_skill.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.computer_skill?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Loại công việc
          </label>
          <select
            {...register("candidateInfo.job_type")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500 bg-white"
          >
            <option value="">-- Chọn loại hình --</option>
            {OPTIONS.job_type.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.job_type?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Thời gian làm việc
          </label>
          <select
            {...register("candidateInfo.working_time")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500 bg-white"
          >
            <option value="">-- Chọn thời gian --</option>
            {OPTIONS.working_time.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.working_time?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phương tiện đi lại
          </label>
          <select
            {...register("candidateInfo.transport")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500 bg-white"
          >
            <option value="">-- Chọn phương tiện --</option>
            {OPTIONS.transport.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.transport?.message}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mức lương mong muốn (VNĐ)
          </label>
          <div className="relative">
            <input
              type="number"
              {...register("candidateInfo.minimum_income")}
              className="w-full rounded-lg border border-gray-300 p-2.5 pr-12 focus:border-orange-500 focus:ring-orange-500"
              placeholder="15000000"
            />
            <span className="absolute right-3 top-2.5 text-gray-500 text-sm">
              VNĐ
            </span>
          </div>
          <p className="text-xs text-red-500">
            {errors.candidateInfo?.minimum_income?.message}
          </p>
        </div>

        {/* --- TAG INPUTS --- */}
        <div className="md:col-span-2">
          <TagInput
            label="Ngôn ngữ sử dụng"
            fieldName="candidateInfo.languguages"
            placeholder="VD: Tiếng Anh, Tiếng Nhật (Enter để thêm)"
            // ✅ FIX: Truyền lỗi cụ thể vào đây
            errorMessage={errors.candidateInfo?.languguages?.message}
          />
        </div>

        <div className="md:col-span-2">
          <TagInput
            label="Ngành nghề mong muốn"
            fieldName="candidateInfo.fields_wish"
            placeholder="VD: IT Phần mềm, Thiết kế (Enter để thêm)"
            // ✅ FIX: Truyền lỗi cụ thể vào đây
            errorMessage={errors.candidateInfo?.fields_wish?.message}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Kỹ năng máy tính khác (nếu có)
          </label>
          <input
            {...register("candidateInfo.other_computer_skill")}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-orange-500"
            placeholder="VD: Photoshop, AI, Figma..."
          />
        </div>
      </div>
    </div>
  );
}
