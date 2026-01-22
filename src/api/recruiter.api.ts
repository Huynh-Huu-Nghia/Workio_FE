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
  hired_count?: number;
  province_code?: string | number | null;
  ward_code?: string | number | null;
  recruiter?: {
    email?: string;
  };
  address?: {
    street?: string | null;
    province_code?: string | number | null;
    ward_code?: string | number | null;
    province?: {
      code?: string | number;
      name?: string;
    } | null;
  } | null;
  province?: {
    code?: string | number;
    name?: string;
  } | null;
  fields?: string[] | string | null;
  related_fields?: string[] | string | null;
  industry?: string[] | string | null;
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
    province_code: string;
    ward_code: string;
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
const getAllRecruitersRequest = async (
  params: Record<string, any> = {},
): Promise<ApiResponse<RecruiterResponse[]>> => {
  const response = await axiosInstance.get("/admin/recruiters", { params });
  return response.data;
};

export const useGetAllRecruitersQuery = (filters: Record<string, any> = {}) =>
  useQuery({
    queryKey: ["recruiters", filters],
    queryFn: () => getAllRecruitersRequest(filters),
    staleTime: 1000 * 60 * 5,
  });

// --- ADMIN: LẤY CHI TIẾT NTD ---
const getAdminRecruiterDetailRequest = async (recruiterId: string) => {
  const response = await axiosInstance.get("/admin/recruiter", {
    params: { recruiter_id: recruiterId },
  });
  return response.data as ApiResponse<RecruiterResponse>;
};

export const useAdminRecruiterDetailQuery = (recruiterId?: string) =>
  useQuery({
    queryKey: ["admin-recruiter", recruiterId],
    queryFn: () => getAdminRecruiterDetailRequest(recruiterId as string),
    enabled: Boolean(recruiterId),
  });

// --- ADMIN: XÓA NTD ---
const deleteRecruiterAdminRequest = async (recruiterId: string) => {
  const response = await axiosInstance.delete("/admin/recruiter", {
    data: { recruiter_id: recruiterId },
  });
  return response.data as ApiResponse<null>;
};

export const useDeleteRecruiterAdminMutation = () =>
  useMutation({ mutationFn: deleteRecruiterAdminRequest });

const getCandidateRecruiterDetailRequest = async (recruiterId: string) => {
  const response = await axiosInstance.get("/candidate/recruiter", {
    params: { recruiter_id: recruiterId },
  });
  return response.data as ApiResponse<RecruiterResponse>;
};

export const useCandidateRecruiterDetailQuery = (recruiterId?: string) =>
  useQuery({
    queryKey: ["candidate-recruiter", recruiterId],
    queryFn: () => getCandidateRecruiterDetailRequest(recruiterId as string),
    enabled: Boolean(recruiterId),
  });

// --- LẤY TIN ĐĂNG CỦA RECRUITER ---
const getRecruiterJobPostsRequest = async (): Promise<
  ApiResponse<JobPost[]>
> => {
  const response = await axiosInstance.get("/recruiter/job-posts");
  return response.data;
};

export const useRecruiterJobPostsQuery = () =>
  useQuery({
    queryKey: ["recruiter-job-posts"],
    queryFn: getRecruiterJobPostsRequest,
    staleTime: 1000 * 60 * 3,
  });

// --- LẤY CHI TIẾT TIN CỦA RECRUITER ---
const getRecruiterJobPostDetailRequest = async (
  jobPostId: string,
): Promise<ApiResponse<JobPost>> => {
  const response = await axiosInstance.get("/recruiter/job-post", {
    params: { job_post_id: jobPostId },
  });
  return response.data;
};

export const useRecruiterJobPostDetailQuery = (jobPostId?: string) =>
  useQuery({
    queryKey: ["recruiter-job-post", jobPostId],
    queryFn: () => getRecruiterJobPostDetailRequest(jobPostId as string),
    enabled: Boolean(jobPostId),
    staleTime: 1000 * 60 * 3,
  });

// --- LẤY LỊCH PHỎNG VẤN CỦA RECRUITER ---
const getRecruiterInterviewsRequest = async (): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get(
    "/recruiter/interviews-of-recruiter",
  );
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
  const response = await axiosInstance.get(
    "/recruiter/candidates-of-job-post",
    {
      params: { job_post_id: jobPostId },
    },
  );
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
  jobPostId: string,
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

// --- Recruiter: CRUD job post ---
export const createRecruiterJobPostRequest = async (
  payload: Partial<JobPost>,
) => {
  const response = await axiosInstance.post("/recruiter/job-post", payload);
  return response.data as ApiResponse<any>;
};

export const useCreateRecruiterJobPostMutation = () =>
  useMutation({ mutationFn: createRecruiterJobPostRequest });

export const updateRecruiterJobPostRequest = async ({
  jobPostId,
  payload,
}: {
  jobPostId: string;
  payload: Partial<JobPost>;
}) => {
  const response = await axiosInstance.patch("/recruiter/job-post", payload, {
    params: { job_post_id: jobPostId },
  });
  return response.data as ApiResponse<any>;
};

export const useUpdateRecruiterJobPostMutation = () =>
  useMutation({ mutationFn: updateRecruiterJobPostRequest });

export const deleteRecruiterJobPostRequest = async (jobPostId: string) => {
  const response = await axiosInstance.delete("/recruiter/job-post", {
    params: { job_post_id: jobPostId },
  });
  return response.data as ApiResponse<any>;
};

export const useDeleteRecruiterJobPostMutation = () =>
  useMutation({ mutationFn: deleteRecruiterJobPostRequest });

// --- Recruiter: CRUD interview ---
export const createRecruiterInterviewRequest = async (payload: any) => {
  const response = await axiosInstance.post("/recruiter/interview", payload, {
    params: { job_post_id: payload?.job_post_id },
  });
  return response.data as ApiResponse<any>;
};

export const useCreateRecruiterInterviewMutation = () =>
  useMutation({ mutationFn: createRecruiterInterviewRequest });

export const updateRecruiterInterviewRequest = async ({
  interviewId,
  payload,
}: {
  interviewId: string;
  payload: any;
}) => {
  const response = await axiosInstance.patch("/recruiter/interview", payload, {
    params: { interview_id: interviewId },
  });
  return response.data as ApiResponse<any>;
};

export const useUpdateRecruiterInterviewMutation = () =>
  useMutation({ mutationFn: updateRecruiterInterviewRequest });

export const deleteRecruiterInterviewRequest = async (interviewId: string) => {
  const response = await axiosInstance.delete("/recruiter/interview", {
    params: { interview_id: interviewId },
  });
  return response.data as ApiResponse<any>;
};

export const useDeleteRecruiterInterviewMutation = () =>
  useMutation({ mutationFn: deleteRecruiterInterviewRequest });
