import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data?: T;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  name?: string;
}

export const createAdminAccountRequest = async (payload: CreateAdminPayload) => {
  const response = await axiosInstance.post("/admin/create-admin", payload);
  return response.data as ApiResponse<any>;
};

export const useCreateAdminAccountMutation = () =>
  useMutation({ mutationFn: createAdminAccountRequest });

// --- CENTER (ADMIN) ---
export interface CenterPayload {
  email: string;
  password: string;
  centerInfo: {
    name: string;
    code?: string;
    phone?: string;
    website?: string;
    description?: string;
  };
  addressInfo?: {
    street?: string;
    ward_code?: string;
    province_code?: string;
  };
}

const createCenterRequest = async (payload: CenterPayload) => {
  const response = await axiosInstance.post("/admin/center", payload);
  return response.data as ApiResponse<any>;
};

export const useCreateCenterMutation = () =>
  useMutation({ mutationFn: createCenterRequest });
