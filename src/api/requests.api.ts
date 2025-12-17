import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export type SupportRequestPriority = "low" | "medium" | "high";
export type SupportRequestStatus = "open" | "in_progress" | "resolved";

export interface SupportRequest {
  id: string;
  title: string;
  description?: string | null;
  priority: SupportRequestPriority;
  status: SupportRequestStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    role?: { value: string };
  };
}

export interface CreateSupportRequestPayload {
  title: string;
  description?: string;
  priority?: SupportRequestPriority;
}

const createSupportRequestRequest = async (
  payload: CreateSupportRequestPayload
): Promise<ApiResponse<SupportRequest>> => {
  const response = await axiosInstance.post("/requests", payload);
  return response.data;
};

export const useCreateSupportRequestMutation = () =>
  useMutation({ mutationFn: createSupportRequestRequest });

const getMySupportRequestsRequest = async (): Promise<
  ApiResponse<SupportRequest[]>
> => {
  const response = await axiosInstance.get("/requests/my");
  return response.data;
};

export const useMySupportRequestsQuery = () =>
  useQuery({
    queryKey: ["support-requests", "my"],
    queryFn: getMySupportRequestsRequest,
    staleTime: 1000 * 60,
  });

const getAllSupportRequestsAdminRequest = async (): Promise<
  ApiResponse<SupportRequest[]>
> => {
  const response = await axiosInstance.get("/admin/requests");
  return response.data;
};

export const useAdminSupportRequestsQuery = () =>
  useQuery({
    queryKey: ["support-requests", "admin"],
    queryFn: getAllSupportRequestsAdminRequest,
    staleTime: 1000 * 30,
  });

export const updateSupportRequestAdminRequest = async ({
  requestId,
  status,
  priority,
}: {
  requestId: string;
  status?: SupportRequestStatus;
  priority?: SupportRequestPriority;
}): Promise<ApiResponse<SupportRequest>> => {
  const response = await axiosInstance.patch(
    "/admin/requests",
    { status, priority },
    { params: { request_id: requestId } }
  );
  return response.data;
};

export const useUpdateSupportRequestAdminMutation = () =>
  useMutation({ mutationFn: updateSupportRequestAdminRequest });

export const deleteSupportRequestAdminRequest = async ({
  requestId,
}: {
  requestId: string;
}): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.delete("/admin/requests", {
    params: { request_id: requestId },
  });
  return response.data;
};

export const useDeleteSupportRequestAdminMutation = () =>
  useMutation({ mutationFn: deleteSupportRequestAdminRequest });

