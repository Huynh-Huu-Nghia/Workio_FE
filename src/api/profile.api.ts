import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

// --- Admin profile ---
export const getAdminProfileRequest = async () => {
  const response = await axiosInstance.get("/admin/profile");
  return response.data as ApiResponse<any>;
};

export const useAdminProfileQuery = () =>
  useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfileRequest,
    staleTime: 1000 * 60 * 5,
  });

export const updateAdminProfileRequest = async (payload: any) => {
  const response = await axiosInstance.put("/admin/profile/edit", payload);
  return response.data as ApiResponse<any>;
};

export const useUpdateAdminProfileMutation = () =>
  useMutation({ mutationFn: updateAdminProfileRequest });

// --- Candidate profile ---
export const updateCandidateProfileRequest = async (payload: any) => {
  const response = await axiosInstance.put("/candidate/profile", payload);
  return response.data as ApiResponse<any>;
};

export const useUpdateCandidateProfileMutation = () =>
  useMutation({ mutationFn: updateCandidateProfileRequest });

// --- Recruiter profile ---
export const updateRecruiterProfileRequest = async (payload: any) => {
  const response = await axiosInstance.put("/recruiter/profile/update", payload);
  return response.data as ApiResponse<any>;
};

export const useUpdateRecruiterProfileMutation = () =>
  useMutation({ mutationFn: updateRecruiterProfileRequest });

