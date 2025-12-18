import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface CenterDetail {
  center_id: string;
  name?: string | null;
  address_id?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  center?: {
    id: string;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
  };
  address?: {
    id?: string;
    street?: string;
    ward_code?: string;
    province_code?: string;
  };
}

const getAdminCenterDetailRequest = async (
  centerId: string
): Promise<ApiResponse<CenterDetail>> => {
  const response = await axiosInstance.get("/admin/center", {
    params: { center_id: centerId },
  });
  return response.data;
};

const getAdminCentersRequest = async (): Promise<ApiResponse<CenterDetail[]>> => {
  const response = await axiosInstance.get("/admin/centers");
  return response.data;
};

export const useAdminCenterDetailQuery = (centerId?: string) =>
  useQuery({
    queryKey: ["admin-center", centerId],
    queryFn: () => getAdminCenterDetailRequest(centerId as string),
    enabled: Boolean(centerId),
  });

export const useAdminCentersQuery = () =>
  useQuery({
    queryKey: ["admin-centers"],
    queryFn: getAdminCentersRequest,
    staleTime: 1000 * 60 * 5,
  });

// --- Center: courses ---
export interface Course {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  candidates?: { candidate_id: string; status: string }[];
}

const getCenterCoursesRequest = async (): Promise<ApiResponse<Course[]>> => {
  const response = await axiosInstance.get("/center/courses");
  return response.data;
};

export const useCenterCoursesQuery = () =>
  useQuery({
    queryKey: ["center-courses"],
    queryFn: getCenterCoursesRequest,
    staleTime: 1000 * 60 * 3,
  });

export const createCenterCourseRequest = async (payload: Partial<Course>) => {
  const response = await axiosInstance.post("/center/courses", payload);
  return response.data as ApiResponse<Course>;
};

export const addStudentToCourseRequest = async ({
  courseId,
  candidate_id,
}: {
  courseId: string;
  candidate_id: string;
}) => {
  const response = await axiosInstance.post(
    `/center/courses/${courseId}/students`,
    { candidate_id }
  );
  return response.data as ApiResponse<any>;
};

export const updateStudentStatusRequest = async ({
  courseId,
  candidateId,
  status,
}: {
  courseId: string;
  candidateId: string;
  status: string;
}) => {
  const response = await axiosInstance.patch(
    `/center/courses/${courseId}/students/${candidateId}`,
    { status }
  );
  return response.data as ApiResponse<any>;
};

export const useCreateCenterCourseMutation = () =>
  useMutation({ mutationFn: createCenterCourseRequest });
export const useAddStudentToCourseMutation = () =>
  useMutation({ mutationFn: addStudentToCourseRequest });
export const useUpdateStudentStatusMutation = () =>
  useMutation({ mutationFn: updateStudentStatusRequest });

// --- Admin: xem khóa học của trung tâm ---
const getAdminCenterCoursesRequest = async (
  centerId: string
): Promise<ApiResponse<Course[]>> => {
  const response = await axiosInstance.get("/admin/center/courses", {
    params: { center_id: centerId },
  });
  return response.data;
};

export const useAdminCenterCoursesQuery = (centerId?: string) =>
  useQuery({
    queryKey: ["admin-center-courses", centerId],
    queryFn: () => getAdminCenterCoursesRequest(centerId as string),
    enabled: Boolean(centerId),
    staleTime: 1000 * 60 * 3,
  });
