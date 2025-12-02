import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

// ==========================================
// 1. CÁC INTERFACE CHO PAYLOAD (GỬI ĐI)
// ==========================================

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
    languguages: string[]; // ⚠️ Giữ nguyên typo "languguages" theo BE
    graduation_rank: string;
    computer_skill: string;
    other_computer_skill?: string;
    fields_wish: string[];
    job_type: string;
    working_time: string;
    transport: string;
    minimum_income: number;
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
    start_date: string;
    end_date: string;
    description: string;
  }[];
}

// ==========================================
// 2. CÁC INTERFACE CHO RESPONSE (NHẬN VỀ)
// ==========================================

// Dữ liệu 1 ứng viên trả về từ Server (để hiển thị List)
export interface CandidateResponse {
  candidate_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  // Các trường JSON/Enum
  fields_wish: any; // Có thể là string JSON hoặc mảng tùy BE xử lý
  languguages: any;
  graduation_rank: string | null;
  minimum_income: string | number | null;
  // Trạng thái
  is_verified: boolean;
  is_employed: boolean;
  created_at: string;
  // Thông tin liên kết (nếu có)
  address?: {
    street?: string;
    ward?: string;
    district_code?: string;
    province_code?: string;
  };
}

// Cấu trúc phản hồi chung từ Backend (Standard Response)
interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

// ==========================================
// 3. CÁC HÀM GỌI API (AXIOS)
// ==========================================

// --- A. TẠO ỨNG VIÊN ---
const createCandidateRequest = async (
  data: CandidatePayload
): Promise<ApiResponse<any>> => {
  // Gọi qua proxy /admin -> localhost:3000/api/admin/create-candidate (tùy route BE)
  // Dựa vào file router BE bạn gửi là: router.post('/create-candidate')
  const response = await axiosInstance.post("/admin/create-candidate", data);
  return response.data;
};

// --- B. LẤY DANH SÁCH ỨNG VIÊN ---
const getAllCandidatesRequest = async (): Promise<
  ApiResponse<CandidateResponse[]>
> => {
  // Dựa vào file router BE: router.get('/candidates')
  const response = await axiosInstance.get("/admin/candidates");
  return response.data;
};

// ==========================================
// 4. REACT QUERY HOOKS (DÙNG TRONG COMPONENT)
// ==========================================

// Hook cho nút "Lưu" (Mutation)
export const useCreateCandidateMutation = () => {
  return useMutation({
    mutationFn: createCandidateRequest,
  });
};

// Hook cho trang "Danh sách" (Query)
export const useGetAllCandidatesQuery = () => {
  return useQuery({
    queryKey: ["candidates"], // Key định danh cache
    queryFn: getAllCandidatesRequest,
    staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
    retry: 1, // Thử lại 1 lần nếu lỗi mạng
  });
};
