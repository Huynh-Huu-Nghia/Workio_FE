import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface MeProfile {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  role?: { value: string };
}

export const getMeRequest = async (): Promise<ApiResponse<MeProfile>> => {
  const response = await axiosInstance.get("/me");
  return response.data;
};

export const useMeQuery = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: getMeRequest,
    staleTime: 1000 * 30,
  });

export const updateMeRequest = async (payload: {
  name?: string;
  avatar_url?: string;
}): Promise<ApiResponse<MeProfile>> => {
  const response = await axiosInstance.patch("/me", payload);
  return response.data;
};

export const useUpdateMeMutation = () =>
  useMutation({ mutationFn: updateMeRequest });

