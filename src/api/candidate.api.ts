import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";
import type { JobPost } from "@/api/job-post.api";

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

export interface UpdateCandidatePayload extends Omit<CandidatePayload, "password"> {
  password?: string;
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

export interface AdminCandidateDetail {
  candidate_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  ethnicity?: string | null;
  national?: string | null;
  graduation_rank?: string | null;
  computer_skill?: string | null;
  other_computer_skill?: string | null;
  fields_wish?: any;
  languguages?: any;
  job_type?: string | null;
  working_time?: string | null;
  transport?: string | null;
  minimum_income?: string | number | null;
  is_verified?: boolean;
  is_employed?: boolean;
  created_at?: string;
  updated_at?: string;
  candidate?: {
    id: string;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    role_id?: string;
  } | null;
  address?: {
    id?: string;
    street?: string;
    ward?: string;
    ward_code?: string;
    district_code?: string;
    province_code?: string;
  } | null;
  study_history?: any[];
  work_experience?: any[];
  interview?: any[];
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

// --- C. ADMIN: LẤY CHI TIẾT ỨNG VIÊN ---
const getCandidateDetailAdminRequest = async (
  candidateId: string
): Promise<ApiResponse<AdminCandidateDetail>> => {
  const response = await axiosInstance.get("/admin/candidate", {
    params: { candidate_id: candidateId },
  });
  return response.data;
};

// --- D. ADMIN: XÓA ỨNG VIÊN ---
const deleteCandidateAdminRequest = async (
  candidateId: string
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.delete("/admin/candidate", {
    params: { candidate_id: candidateId },
  });
  return response.data;
};

// --- E. ADMIN: CẬP NHẬT ỨNG VIÊN ---
const updateCandidateAdminRequest = async ({
  candidateId,
  data,
}: {
  candidateId: string;
  data: Partial<UpdateCandidatePayload>;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.put("/admin/candidate", data, {
    params: { candidate_id: candidateId },
  });
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

export const useGetCandidateDetailAdminQuery = (candidateId?: string) =>
  useQuery({
    queryKey: ["admin-candidate", candidateId],
    queryFn: () => getCandidateDetailAdminRequest(candidateId as string),
    enabled: Boolean(candidateId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

export const useDeleteCandidateAdminMutation = () =>
  useMutation({
    mutationFn: deleteCandidateAdminRequest,
  });

export const useUpdateCandidateAdminMutation = () =>
  useMutation({
    mutationFn: updateCandidateAdminRequest,
  });

// --- C. Candidate tự xem tin tuyển dụng ---
const getCandidateJobPostsRequest = async (): Promise<
  ApiResponse<JobPost[]>
> => {
  const response = await axiosInstance.get("/candidate/job-posts");
  return response.data;
};

export const useCandidateJobPostsQuery = () =>
  useQuery({
    queryKey: ["candidate-job-posts"],
    queryFn: getCandidateJobPostsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- D. Candidate xem lịch phỏng vấn ---
const getCandidateInterviewsRequest = async (): Promise<
  ApiResponse<any[]>
> => {
  const response = await axiosInstance.get("/candidate/interviews-of-candidate");
  return response.data;
};

export const useCandidateInterviewsQuery = () =>
  useQuery({
    queryKey: ["candidate-interviews"],
    queryFn: getCandidateInterviewsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- E. Candidate: danh sách tin đã ứng tuyển ---
const getAppliedJobPostsRequest = async (): Promise<ApiResponse<JobPost[]>> => {
  const response = await axiosInstance.get("/candidate/job-posts-of-candidate");
  return response.data;
};

export const useCandidateAppliedJobsQuery = () =>
  useQuery({
    queryKey: ["candidate-applied-jobs"],
    queryFn: getAppliedJobPostsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- F. Candidate: lọc theo ngành nghề ---
const filterJobsByFieldsRequest = async (fields: string[]) => {
  const response = await axiosInstance.get("/candidate/filter-by-fields", {
    params: { fields },
  });
  return response.data as ApiResponse<JobPost[]>;
};

export const useCandidateFilterJobsQuery = (fields: string[]) =>
  useQuery({
    queryKey: ["candidate-filter-jobs", fields],
    queryFn: () => filterJobsByFieldsRequest(fields),
    enabled: fields.length > 0,
  });

// --- G. Candidate: gợi ý việc làm ---
const getSuggestedJobsRequest = async (): Promise<ApiResponse<JobPost[]>> => {
  const response = await axiosInstance.get("/candidate/suggested-jobs");
  return response.data;
};

export const useCandidateSuggestedJobsQuery = () =>
  useQuery({
    queryKey: ["candidate-suggested-jobs"],
    queryFn: getSuggestedJobsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- Candidate: apply job post (Backend: POST /candidate/apply-job-post?job_post_id=...) ---
export const applyJobCandidateRequest = async (jobPostId: string) => {
  const response = await axiosInstance.post(
    "/candidate/apply-job-post",
    {},
    { params: { job_post_id: jobPostId } }
  );
  return response.data as ApiResponse<any>;
};

export const useApplyJobCandidateMutation = () =>
  useMutation({ mutationFn: applyJobCandidateRequest });
