import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios"; // 👈 Đảm bảo import đúng file axios config của bạn

// Định nghĩa lại Payload để đảm bảo đúng 100% với JSON Backend yêu cầu
export interface CandidatePayload {
  email: string;
  password?: string;
  candidateInfo: {
    full_name: string;
    gender: string;
    date_of_birth: string; // Format: YYYY-MM-DD
    place_of_birth: string;
    ethnicity: string;
    phone: string;
    languguages: string[]; // ⚠️ Giữ nguyên typo theo BE
    graduation_rank: string;
    computer_skill: string;
    other_computer_skill?: string;
    fields_wish: string[];
    job_type: string;
    working_time: string;
    transport: string;
    minimum_income: number; // Phải là số
  };
  addressInfo: {
    street: string;
    ward: string;
    district_code: string;
    province_code: string;
  };
  studyHistories: {
    school_name: string;
    major: string;
    start_year: number;
    end_year: number;
    degree: string;
  }[];
  workExperiences: {
    company_name: string;
    position: string;
    start_date: string; // Format: YYYY-MM-DD
    end_date: string; // Format: YYYY-MM-DD
    description: string;
  }[];
}

interface CreateCandidateResponse {
  err: number;
  mes: string;
  data: any;
}

// Hàm gọi API
const createCandidateRequest = async (
  data: CandidatePayload
): Promise<CreateCandidateResponse> => {
  // Gọi qua proxy /admin đã cấu hình ở vite.config.ts
  const response = await axiosInstance.post("/admin/create-candidate", data);
  return response.data;
};

export const useCreateCandidateMutation = () => {
  return useMutation({
    mutationFn: createCandidateRequest,
  });
};
