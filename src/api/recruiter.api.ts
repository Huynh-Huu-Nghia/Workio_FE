import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";
import type { JobPost } from "@/api/job-post.api";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface RecruiterResponse {
  recruiter_id: string;
  company_name: string;
  phone?: string | null;
  website?: string | null;
  tax_number?: string | null;
  description?: string | null;
  is_verified?: boolean;
  address_id?: string | null;
  user?: {
    email?: string;
  };
}

// Interface Payload khớp JSON BE
export interface RecruiterPayload {
  email: string;
  password?: string;
  recruiterInfo: {
    company_name: string;
    description: string;
    tax_number: string;
    phone: string;
    website: string;
    established_at: string; // YYYY-MM-DD
    is_verified: boolean;
  };
  addressInfo: {
    street: string;
    district_code: string;
    province_code: string;
    ward?: string; // Optional tùy BE có lưu ward ko, nhưng cứ gửi lên
  };
}

// Gọi API
const createRecruiterRequest = async (data: RecruiterPayload) => {
  // Giả định đường dẫn là /admin/create-recruiter (bạn check lại route BE nhé)
  const response = await axiosInstance.post("/admin/create-recruiter", data);
  return response.data;
};

export const useCreateRecruiterMutation = () => {
  return useMutation({
    mutationFn: createRecruiterRequest,
  });
};

// --- LẤY DANH SÁCH NTD (ADMIN) ---
const getAllRecruitersRequest = async (): Promise<
  ApiResponse<RecruiterResponse[]>
> => {
  const response = await axiosInstance.get("/admin/recruiters");
  return response.data;
};

export const useGetAllRecruitersQuery = () =>
  useQuery({
    queryKey: ["recruiters"],
    queryFn: getAllRecruitersRequest,
    staleTime: 1000 * 60 * 5,
  });

// --- LẤY TIN ĐĂNG CỦA RECRUITER ---
const getRecruiterJobPostsRequest = async (): Promise<ApiResponse<JobPost[]>> => {
  const response = await axiosInstance.get("/recruiter/job-posts");
  return response.data;
};

export const useRecruiterJobPostsQuery = () =>
  useQuery({
    queryKey: ["recruiter-job-posts"],
    queryFn: getRecruiterJobPostsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- LẤY LỊCH PHỎNG VẤN CỦA RECRUITER ---
const getRecruiterInterviewsRequest = async (): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get("/recruiter/interviews-of-recruiter");
  return response.data;
};

export const useRecruiterInterviewsQuery = () =>
  useQuery({
    queryKey: ["recruiter-interviews"],
    queryFn: getRecruiterInterviewsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- LẤY ỨNG VIÊN ĐÃ ỨNG TUYỂN CHO 1 JOB ---
const getCandidatesOfJobRequest = async (jobPostId: string) => {
  const response = await axiosInstance.get("/recruiter/candidates-of-job-post", {
    params: { job_post_id: jobPostId },
  });
  return response.data as ApiResponse<any[]>;
};

export const useCandidatesOfJobQuery = (jobPostId: string) =>
  useQuery({
    queryKey: ["recruiter-candidates-of-job", jobPostId],
    queryFn: () => getCandidatesOfJobRequest(jobPostId),
    enabled: Boolean(jobPostId),
    staleTime: 1000 * 60 * 3,
  });

// --- GỢI Ý ỨNG VIÊN CHO JOB ---
const getSuggestedCandidatesRequest = async (
  jobPostId: string
): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get("/recruiter/suggested-candidates", {
    params: { job_post_id: jobPostId },
  });
  return response.data;
};

export const useSuggestedCandidatesQuery = (jobPostId: string) =>
  useQuery({
    queryKey: ["recruiter-suggested-candidates", jobPostId],
    queryFn: () => getSuggestedCandidatesRequest(jobPostId),
    enabled: Boolean(jobPostId),
    staleTime: 1000 * 60 * 3,
  });
