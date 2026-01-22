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

export default function EducationSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "studyHistories",
  });

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="relative grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 md:grid-cols-2 hover:border-orange-300 hover:shadow-sm transition-all group"
        >
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Xóa mục này"
          >
            <Trash2 size={18} />
          </button>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tên trường
            </label>
            <input
              {...register(`studyHistories.${index}.school_name` as const)}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              placeholder="VD: ĐH Công Nghệ Thông Tin"
            />
            <p className="text-xs text-red-500 font-medium">
              {errors.studyHistories?.[index]?.school_name?.message}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Chuyên ngành
            </label>
            <input
              {...register(`studyHistories.${index}.major` as const)}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              placeholder="VD: Kỹ thuật phần mềm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bằng cấp
            </label>
            <input
              {...register(`studyHistories.${index}.degree` as const)}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              placeholder="VD: Cử nhân"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Từ năm
              </label>
              <input
                type="number"
                {...register(`studyHistories.${index}.start_year` as const)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Đến năm
              </label>
              <input
                type="number"
                {...register(`studyHistories.${index}.end_year` as const)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            school_name: "",
            major: "",
            degree: "",
            start_year: 2018,
            end_year: 2022,
          })
        }
        className="flex items-center gap-2 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-100 hover:border-orange-500 transition-all w-full justify-center"
      >
        <PlusCircle size={16} /> Thêm trường học
      </button>
    </div>
  );
}
