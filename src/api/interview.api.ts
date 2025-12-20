import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface Interview {
  id: string;
  candidate_id: string;
  job_post_id?: string | null;
  recruiter_id?: string | null;
  scheduled_time: string;
  location?: string | null;
  interview_type?: string | null;
  status?: string | null;
  notes?: string | null;
  job_post?: {
    position?: string | null;
    recruiter?: {
      company_name?: string | null;
    } | null;
  } | null;
  candidate?: {
    full_name?: string | null;
  } | null;
}

const getAllInterviewsRequest = async (): Promise<ApiResponse<Interview[]>> => {
  const response = await axiosInstance.get("/admin/all-interviews");
  return response.data;
};

export const useGetAdminInterviewsQuery = () =>
  useQuery({
    queryKey: ["admin-interviews"],
    queryFn: getAllInterviewsRequest,
    staleTime: 1000 * 60 * 5,
  });

// --- Admin: interview theo candidate ---
const getInterviewsOfCandidateRequest = async (
  candidateId: string
): Promise<ApiResponse<Interview[]>> => {
  const response = await axiosInstance.get("/admin/interviews-of-candidate", {
    params: { candidate_id: candidateId },
  });
  return response.data;
};

export const useAdminInterviewsOfCandidateQuery = (candidateId: string) =>
  useQuery({
    queryKey: ["admin-interviews-candidate", candidateId],
    queryFn: () => getInterviewsOfCandidateRequest(candidateId),
    enabled: Boolean(candidateId),
    staleTime: 1000 * 60 * 5,
  });

// --- Admin: CRUD interview ---
export type AdminInterviewPayload = Omit<Interview, "id"> & {
  id?: string;
};

const createAdminInterviewRequest = async (payload: AdminInterviewPayload) => {
  const response = await axiosInstance.post("/admin/interview", payload);
  return response.data as ApiResponse<Interview>;
};

export const useCreateAdminInterviewMutation = () =>
  useMutation({ mutationFn: createAdminInterviewRequest });

const updateAdminInterviewRequest = async ({
  interviewId,
  payload,
}: {
  interviewId: string;
  payload: AdminInterviewPayload;
}) => {
  const response = await axiosInstance.patch("/admin/interview", payload, {
    params: { interview_id: interviewId },
  });
  return response.data as ApiResponse<Interview>;
};

export const useUpdateAdminInterviewMutation = () =>
  useMutation({ mutationFn: updateAdminInterviewRequest });

const deleteAdminInterviewRequest = async (interviewId: string) => {
  const response = await axiosInstance.delete("/admin/interview", {
    params: { interview_id: interviewId },
  });
  return response.data as ApiResponse<null>;
};

export const useDeleteAdminInterviewMutation = () =>
  useMutation({ mutationFn: deleteAdminInterviewRequest });
