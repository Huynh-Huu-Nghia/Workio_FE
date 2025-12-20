import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface JobPost {
  id: string;
  position: string;
  recruiter_id?: string;
  recruiter_name?: string | null;
  recruiter?: {
    recruiter_id?: string;
    id?: string;
    user_id?: string;
    company_name?: string | null;
    phone?: string | null;
    website?: string | null;
    description?: string | null;
    tax_number?: string | null;
    established_at?: string | null;
    is_verified?: boolean;
    email?: string | null;
    contact_name?: string | null;
    province_code?: string | number | null;
    ward_code?: string | number | null;
    province?: {
      code?: string | number | null;
      name?: string | null;
    } | null;
    ward?: {
      code?: string | number | null;
      name?: string | null;
    } | null;
    address?: {
      province_code?: string | number | null;
      ward_code?: string | number | null;
      province?: {
        code?: string | number | null;
        name?: string | null;
      } | null;
      ward?: {
        code?: string | number | null;
        name?: string | null;
      } | null;
    } | null;
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
    } | null;
    recruiter?: {
      id?: string;
      email?: string | null;
      name?: string | null;
    } | null;
  } | null;
  available_quantity?: number | null;
  requirements?: string | null;
  duration?: string | null;
  monthly_salary?: number | string | null;
  recruitment_type?: string | null;
  languguages?: string[] | string | null;
  application_deadline_from?: string | null;
  application_deadline_to?: string | null;
  support_info?: string | null;
  benefits?: string | null;
  fields?: string[] | string | null;
  applied_candidates?: string[] | null;
  graduation_rank?: string | null;
  computer_skill?: string | null;
  job_type?: string | null;
  working_time?: string | null;
  other_requirements?: string | null;
  status?: string | null;
  province_code?: string | number | null;
  ward_code?: string | number | null;
  province?: {
    code?: string | number | null;
    name?: string | null;
  } | null;
  ward?: {
    code?: string | number | null;
    name?: string | null;
  } | null;
  address?: {
    province_code?: string | number | null;
    ward_code?: string | number | null;
    province?: {
      code?: string | number | null;
      name?: string | null;
    } | null;
    ward?: {
      code?: string | number | null;
      name?: string | null;
    } | null;
  } | null;
}

const getAdminJobPostsRequest = async (
  params: Record<string, any> = {}
): Promise<ApiResponse<JobPost[]>> => {
  const response = await axiosInstance.get("/admin/job-posts", { params });
  return response.data;
};

const getAdminJobPostDetailRequest = async (
  jobPostId: string
): Promise<ApiResponse<JobPost>> => {
  const response = await axiosInstance.get("/admin/job-post", {
    params: { job_post_id: jobPostId },
  });
  return response.data;
};

export const useGetAdminJobPostsQuery = (filters: Record<string, any> = {}) =>
  useQuery({
    queryKey: ["admin-job-posts", filters],
    queryFn: () => getAdminJobPostsRequest(filters),
    staleTime: 1000 * 60 * 5,
  });

export const useAdminJobPostDetailQuery = (jobPostId?: string) =>
  useQuery({
    queryKey: ["admin-job-post", jobPostId],
    queryFn: () => getAdminJobPostDetailRequest(jobPostId as string),
    enabled: Boolean(jobPostId),
    staleTime: 1000 * 60 * 5,
  });

// --- Admin: ứng viên của tin ---
const getAdminCandidatesOfJobRequest = async (
  jobPostId: string
): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get("/admin/candidates-of-job-post", {
    params: { job_post_id: jobPostId },
  });
  return response.data;
};

export const useAdminCandidatesOfJobQuery = (jobPostId: string) =>
  useQuery({
    queryKey: ["admin-candidates-of-job", jobPostId],
    queryFn: () => getAdminCandidatesOfJobRequest(jobPostId),
    enabled: Boolean(jobPostId),
    staleTime: 1000 * 60 * 5,
  });

// --- Admin: tin mà ứng viên đã ứng tuyển ---
const getAdminPostsOfCandidateRequest = async (
  candidateId: string
): Promise<ApiResponse<JobPost[]>> => {
  const response = await axiosInstance.get("/admin/job-posts-of-candidate", {
    params: { candidate_id: candidateId },
  });
  return response.data;
};

export const useAdminPostsOfCandidateQuery = (candidateId: string) =>
  useQuery({
    queryKey: ["admin-posts-of-candidate", candidateId],
    queryFn: () => getAdminPostsOfCandidateRequest(candidateId),
    enabled: Boolean(candidateId),
    staleTime: 1000 * 60 * 5,
  });

// --- Admin: gợi ý jobs cho ứng viên ---
const getAdminSuggestedJobsRequest = async (
  candidateId: string
): Promise<ApiResponse<JobPost[]>> => {
  const response = await axiosInstance.get("/admin/suggested-jobs", {
    params: { candidate_id: candidateId },
  });
  return response.data;
};

export const useAdminSuggestedJobsQuery = (candidateId: string) =>
  useQuery({
    queryKey: ["admin-suggested-jobs", candidateId],
    queryFn: () => getAdminSuggestedJobsRequest(candidateId),
    enabled: Boolean(candidateId),
    staleTime: 1000 * 60 * 5,
  });

// --- Admin: gợi ý ứng viên cho bài đăng ---
const getAdminSuggestedCandidatesRequest = async (
  jobPostId: string
): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get("/admin/suggested-candidates", {
    params: { job_post_id: jobPostId },
  });
  return response.data;
};

export const useAdminSuggestedCandidatesQuery = (
  jobPostId: string,
  options: any = {}
) =>
  useQuery<ApiResponse<any[]>>({
    queryKey: ["admin-suggested-candidates", jobPostId],
    queryFn: () => getAdminSuggestedCandidatesRequest(jobPostId),
    enabled: Boolean(jobPostId) && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    ...options,
  });

// --- Admin: CRUD job post + apply ---
export const createAdminJobPostRequest = async ({
  recruiterId,
  payload,
}: {
  recruiterId: string;
  payload: Partial<JobPost>;
}) => {
  const response = await axiosInstance.post("/admin/job-post", payload, {
    params: { recruiter_id: recruiterId },
  });
  return response.data as ApiResponse<any>;
};

export const useCreateAdminJobPostMutation = () =>
  useMutation({ mutationFn: createAdminJobPostRequest });

export const updateAdminJobPostRequest = async ({
  jobPostId,
  payload,
}: {
  jobPostId: string;
  payload: Partial<JobPost>;
}) => {
  const response = await axiosInstance.patch("/admin/job-post", payload, {
    params: { job_post_id: jobPostId },
  });
  return response.data as ApiResponse<any>;
};

export const useUpdateAdminJobPostMutation = () =>
  useMutation({ mutationFn: updateAdminJobPostRequest });

export const deleteAdminJobPostRequest = async (jobPostId: string) => {
  const response = await axiosInstance.delete("/admin/job-post", {
    params: { job_post_id: jobPostId },
  });
  return response.data as ApiResponse<any>;
};

export const useDeleteAdminJobPostMutation = () =>
  useMutation({ mutationFn: deleteAdminJobPostRequest });

export const applyAdminJobPostRequest = async ({
  jobPostId,
  candidateId,
}: {
  jobPostId: string;
  candidateId: string;
}) => {
  const response = await axiosInstance.patch(
    "/admin/apply-job-post",
    {},
    { params: { job_post_id: jobPostId, candidate_id: candidateId } }
  );
  return response.data as ApiResponse<any>;
};

export const useApplyAdminJobPostMutation = () =>
  useMutation({ mutationFn: applyAdminJobPostRequest });

// --- Admin: filter jobs by fields (Backend: GET /admin/filter-by-fields) ---
export const filterAdminJobsByFieldsRequest = async (fields: string[]) => {
  const response = await axiosInstance.get("/admin/filter-by-fields", {
    params: { fields },
  });
  return response.data as ApiResponse<JobPost[]>;
};
