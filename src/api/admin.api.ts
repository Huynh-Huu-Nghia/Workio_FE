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

