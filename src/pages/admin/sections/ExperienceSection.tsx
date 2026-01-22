import { useFieldArray } from "react-hook-form";
import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import type {
  CreateCandidateSchema,
  UpdateCandidateSchema,
} from "@/schemas/candidate.schema";
import { Trash2, PlusCircle } from "lucide-react";

interface Props {
  control: Control<CreateCandidateSchema | UpdateCandidateSchema>;
  register: UseFormRegister<CreateCandidateSchema | UpdateCandidateSchema>;
  errors: FieldErrors<CreateCandidateSchema | UpdateCandidateSchema>;
}

export default function ExperienceSection({
  control,
  register,
  errors,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperiences",
  });

  return (
    <div className="space-y-6">
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-5 hover:border-orange-300 hover:shadow-sm transition-all group"
        >
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Xóa mục này"
          >
            <Trash2 size={18} />
          </button>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tên công ty
              </label>
              <input
                {...register(`workExperiences.${index}.company_name` as const)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="VD: Công ty FPT Software"
              />
              <p className="text-xs text-red-500 font-medium">
                {errors.workExperiences?.[index]?.company_name?.message}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Vị trí
              </label>
              <input
                {...register(`workExperiences.${index}.position` as const)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="VD: Backend Developer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Từ ngày
                </label>
                <input
                  type="date"
                  {...register(`workExperiences.${index}.start_date` as const)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Đến ngày
                </label>
                <input
                  type="date"
                  {...register(`workExperiences.${index}.end_date` as const)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mô tả công việc
              </label>
              <textarea
                {...register(`workExperiences.${index}.description` as const)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                rows={3}
                placeholder="Mô tả các dự án đã làm, công nghệ sử dụng..."
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            company_name: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 p-3 text-orange-600 hover:bg-orange-100 hover:border-orange-500 transition-all font-medium"
      >
        <PlusCircle size={16} /> Thêm Kinh Nghiệm Làm Việc
      </button>
    </div>
  );
}
