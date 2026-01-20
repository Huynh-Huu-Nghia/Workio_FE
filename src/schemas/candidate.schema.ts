import { z } from "zod";

// --- Schema con ---
const studyHistorySchema = z.object({
  school_name: z.string().min(1, "Tên trường không được để trống"),
  major: z.string().min(1, "Chuyên ngành không được để trống"),
  start_year: z.coerce.number().min(1900, "Năm bắt đầu không hợp lệ"),
  end_year: z.coerce.number().min(1900, "Năm kết thúc không hợp lệ"),
  degree: z.string().min(1, "Bằng cấp không được để trống"),
});

const workExperienceSchema = z.object({
  company_name: z.string().min(1, "Tên công ty không được để trống"),
  position: z.string().min(1, "Vị trí không được để trống"),
  start_date: z.string().min(1, "Ngày bắt đầu không được để trống"),
  end_date: z.string().min(1, "Ngày kết thúc không được để trống"),
  description: z.string().optional(),
});

// --- Schema chính ---
export const createCandidateSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  candidateInfo: z.object({
    full_name: z.string().min(1, "Họ tên không được để trống"),
    gender: z.enum(["Nam", "Nữ", "Khác"]),
    date_of_birth: z
      .string()
      .refine((date) => new Date(date).toString() !== "Invalid Date", {
        message: "Ngày sinh không hợp lệ",
      }),
    place_of_birth: z.string().min(1, "Nơi sinh không được để trống"),
    ethnicity: z.string().default("Kinh"),
    phone: z
      .string()
      .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),

    // 🔥 MẢNG: Ngôn ngữ (Lưu ý: BE trả về key 'languguages' có thể do typo, ta giữ nguyên để khớp API)
    languguages: z.array(z.string()).min(1, "Chọn ít nhất 1 ngôn ngữ"),

    // Các trường chọn (Dropdown)
    graduation_rank: z.string().min(1, "Vui lòng chọn xếp loại tốt nghiệp"),
    computer_skill: z.string().min(1, "Vui lòng chọn kỹ năng tin học"),
    other_computer_skill: z.string().optional(),

    // 🔥 MẢNG: Ngành nghề mong muốn
    fields_wish: z.array(z.string()).min(1, "Chọn ít nhất 1 ngành nghề"),

    job_type: z.string().min(1, "Vui lòng chọn loại công việc"),
    working_time: z.string().min(1, "Vui lòng chọn thời gian làm việc"),
    transport: z.string().min(1, "Vui lòng chọn phương tiện"),

    // Tiền tệ
    minimum_income: z.coerce
      .number()
      .min(0, "Mức lương mong muốn phải lớn hơn 0"),
  }),

  addressInfo: z.object({
    street: z.string().min(1, "Địa chỉ đường không được để trống"),
    ward_code: z.string().min(1, "Phường/Xã không được để trống"),
    province_code: z.string().min(1, "Chưa chọn Tỉnh/Thành"),
  }),

  studyHistories: z.array(studyHistorySchema),
  workExperiences: z.array(workExperienceSchema),
});

export const updateCandidateSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    }),

  candidateInfo: z.object({
    full_name: z.string().min(1, "Họ tên không được để trống"),
    gender: z.enum(["Nam", "Nữ", "Khác"]).optional(),
    date_of_birth: z
      .string()
      .optional()
      .refine((date) => !date || new Date(date).toString() !== "Invalid Date", {
        message: "Ngày sinh không hợp lệ",
      }),
    place_of_birth: z.string().optional(),
    ethnicity: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (phone) => !phone || /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone),
        {
          message: "Số điện thoại không hợp lệ",
        },
      ),

    // 🔥 MẢNG: Ngôn ngữ (Lưu ý: BE trả về key 'languguages' có thể do typo, ta giữ nguyên để khớp API)
    languguages: z.array(z.string()).optional(),

    // Các trường chọn (Dropdown)
    graduation_rank: z.string().optional(),
    computer_skill: z.string().optional(),
    other_computer_skill: z.string().optional(),

    // 🔥 MẢNG: Ngành nghề mong muốn
    fields_wish: z.array(z.string()).optional(),

    job_type: z.string().optional(),
    working_time: z.string().optional(),
    transport: z.string().optional(),

    // Tiền tệ
    minimum_income: z.coerce
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 0, {
        message: "Mức lương mong muốn phải lớn hơn 0",
      }),
  }),

  addressInfo: z
    .object({
      street: z.string().optional(),
      ward_code: z.string().optional(),
      province_code: z.string().optional(),
    })
    .optional(),

  studyHistories: z.array(studyHistorySchema).optional(),
  workExperiences: z.array(workExperienceSchema).optional(),
});

export type CreateCandidateSchema = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateSchema = z.infer<typeof updateCandidateSchema>;
