import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useCreateSupportRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupportRequestRequest,
    onSuccess: () => {
      // Invalidate both user's requests and admin requests list
      queryClient.invalidateQueries({ queryKey: ["support-requests", "my"] });
      queryClient.invalidateQueries({ queryKey: ["support-requests", "admin"] });
    },
  });
};

const getMySupportRequestsRequest = async (): Promise<
  ApiResponse<SupportRequest[]>
> => {
  const response = await axiosInstance.get("/requests/my");
  return response.data;
};

// export const useMySupportRequestsQuery = () =>
//   useQuery({
//     queryKey: ["support-requests", "my"],
//     queryFn: getMySupportRequestsRequest,
//     staleTime: 1000 * 60,
//   });
  
  export const useMySupportRequestsQuery = (userId?: string) =>
  useQuery({
    // QUAN TRỌNG: Thêm userId vào queryKey để phân biệt cache giữa các user
    queryKey: ["my-support-requests", userId], 
    queryFn: getMySupportRequestsRequest,
    // Chỉ fetch khi có userId (đã đăng nhập)
    enabled: !!userId, 
    // Không dùng cache cũ khi đổi user (thời gian cache = 0 cho key này nếu cần thiết)
    staleTime: 1000 * 60, 
  });

const getAllSupportRequestsAdminRequest = async (): Promise<
  ApiResponse<SupportRequest[]>
> => {
  try {
    const response = await axiosInstance.get("/admin/requests");
    // Kiểm tra dữ liệu trả về
    if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      const item = response.data.data[0];
      console.log("[DEBUG] Sample request item:", {
        id: item.id,
        title: item.title,
        created_at: item.created_at,
        hasCreatedAt: "created_at" in item,
      });
    }
    return response.data;
  } catch (error: any) {
    // Nếu BE trả về response có structure (err, mes, data) -> dùng nó
    if (error.response?.data?.err !== undefined) {
      return error.response.data;
    }
    // Nếu không có data structure -> throw error
    throw error;
  }
};

export const useAdminSupportRequestsQuery = () =>
  useQuery({
    queryKey: ["support-requests", "admin"],
    queryFn: getAllSupportRequestsAdminRequest,
    staleTime: 1000 * 10, // 10 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
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

export const useUpdateSupportRequestAdminMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupportRequestAdminRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-requests", "admin"] });
    },
  });
};

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

export const useDeleteSupportRequestAdminMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupportRequestAdminRequest,
    onSuccess: (_data, { requestId }) => {
      // Update cache: remove the deleted request from list
      queryClient.setQueryData(
        ["support-requests", "admin"],
        (oldData: ApiResponse<SupportRequest[]> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data?.filter((item) => item.id !== requestId) || [],
          };
        }
      );
    },
  });
};

