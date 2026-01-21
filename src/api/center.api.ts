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

export interface CenterProfile {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  address_id?: string | null;
}

const getAdminCenterDetailRequest = async (
  centerId: string
): Promise<ApiResponse<CenterDetail>> => {
  const response = await axiosInstance.get("/admin/center", {
    params: { center_id: centerId },
  });
  return response.data;
};

const getAdminCentersRequest = async (
  params: Record<string, any> = {}
): Promise<ApiResponse<CenterDetail[]>> => {
  const response = await axiosInstance.get("/admin/centers", { params });
  return response.data;
};

export const useAdminCenterDetailQuery = (centerId?: string) =>
  useQuery({
    queryKey: ["admin-center", centerId],
    queryFn: () => getAdminCenterDetailRequest(centerId as string),
    enabled: Boolean(centerId),
  });

export const useAdminCentersQuery = (filters: Record<string, any> = {}) =>
  useQuery({
    queryKey: ["admin-centers", filters],
    queryFn: () => getAdminCentersRequest(filters),
    staleTime: 1000 * 60 * 5,
  });

// --- Center: courses ---
export interface CourseCandidate {
  candidate_id: string;
  status?: string | null;
  requested_at?: string | null;
  attendance?: number | null;
  tuition_confirmed?: boolean | null;
  signed_at?: string | null;
  notes?: string | null;
  name?: string | null;
  candidate_name?: string | null;
  email?: string | null;
  phone?: string | null;
  candidate?: {
    id?: string;
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export interface Course {
  id?: string;
  course_id?: string;
  name: string;
  description?: string | null;
  summary?: string | null;
  details?: unknown;
  start_date?: string | null;
  end_date?: string | null;
  capacity?: number | null;
  registered_count?: number | null;
  candidates?: CourseCandidate[];
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

export const updateCenterCourseRequest = async ({
  courseId,
  payload,
}: {
  courseId: string;
  payload: Partial<Course>;
}) => {
  const response = await axiosInstance.patch(`/center/courses/${courseId}`, payload);
  return response.data as ApiResponse<Course>;
};

export const deleteCenterCourseRequest = async (courseId: string) => {
  const response = await axiosInstance.delete(`/center/courses/${courseId}`);
  return response.data as ApiResponse<any>;
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
  attendance,
  tuition_confirmed,
  signed_at,
  notes,
}: {
  courseId: string;
  candidateId: string;
  status: string;
  attendance?: number | null;
  tuition_confirmed?: boolean | null;
  signed_at?: string | null;
  notes?: string | null;
}) => {
  const response = await axiosInstance.patch(
    `/center/courses/${courseId}/students/${candidateId}`,
    { status, attendance, tuition_confirmed, signed_at, notes }
  );
  return response.data as ApiResponse<any>;
};

export const removeStudentFromCourseRequest = async ({
  courseId,
  candidateId,
}: {
  courseId: string;
  candidateId: string;
}) => {
  const response = await axiosInstance.delete(
    `/center/courses/${courseId}/students/${candidateId}`
  );
  return response.data as ApiResponse<any>;
};

export const useCreateCenterCourseMutation = () =>
  useMutation({ mutationFn: createCenterCourseRequest });
export const useUpdateCenterCourseMutation = () =>
  useMutation({ mutationFn: updateCenterCourseRequest });
export const useDeleteCenterCourseMutation = () =>
  useMutation({ mutationFn: deleteCenterCourseRequest });
export const useAddStudentToCourseMutation = () =>
  useMutation({ mutationFn: addStudentToCourseRequest });
export const useUpdateStudentStatusMutation = () =>
  useMutation({ mutationFn: updateStudentStatusRequest });
export const useRemoveStudentFromCourseMutation = () =>
  useMutation({ mutationFn: removeStudentFromCourseRequest });

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

// --- Center: profile ---
const getCenterProfileRequest = async (): Promise<ApiResponse<CenterProfile>> => {
  const response = await axiosInstance.get("/center/profile");
  return response.data;
};

const updateCenterProfileRequest = async (
  payload: Partial<CenterProfile>
): Promise<ApiResponse<CenterProfile>> => {
  const response = await axiosInstance.put("/center/profile/update", payload);
  return response.data;
};

export const useCenterProfileQuery = () =>
  useQuery({
    queryKey: ["center-profile"],
    queryFn: getCenterProfileRequest,
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateCenterProfileMutation = () =>
  useMutation({ mutationFn: updateCenterProfileRequest });

// --- Center: statistics ---
export interface CenterStatistics {
  courses: {
    total: number;
    active: number;
    upcoming: number;
  };
  learners: {
    total: number;
    active: number;
    byStatus: {
      learning: number;
      pending: number;
      completed: number;
      rejected: number;
    };
  };
  completionRate: number;
  duration: {
    totalHours: number;
    avgHours: number;
    coursesWithDuration: number;
  };
  byTrainingField: Array<{
    field: string;
    courses: number;
    learners: number;
    learning: number;
    completed: number;
    pending: number;
    rejected: number;
    completionRate: number;
  }>;
  topCourses: {
    byLearners: Array<{
      course_id: string;
      name: string;
      learners: number;
      completionRate: number;
    }>;
    byCompletion: Array<{
      course_id: string;
      name: string;
      learners: number;
      completionRate: number;
    }>;
  };
  trends: {
    coursesLast3Months: number;
    coursesThisMonth: number;
  };
}

const getCenterStatisticsRequest = async (): Promise<ApiResponse<CenterStatistics>> => {
  const response = await axiosInstance.get("/center/statistics");
  return response.data;
};

export const useCenterStatisticsQuery = () =>
  useQuery({
    queryKey: ["center-statistics"],
    queryFn: getCenterStatisticsRequest,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto refetch every 5 minutes
  });

// --- Center: notifications ---
export interface CenterNotification {
  id: string;
  course_id: string;
  course_name: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email?: string | null;
  candidate_phone?: string | null;
  requested_at: string;
  type: 'pending_enrollment';
}

export interface CenterNotificationsResponse {
  count: number;
  notifications: CenterNotification[];
}

const getCenterNotificationsRequest = async (): Promise<ApiResponse<CenterNotificationsResponse>> => {
  const response = await axiosInstance.get("/center/notifications");
  return response.data;
};

export const useCenterNotificationsQuery = () =>
  useQuery({
    queryKey: ["center-notifications"],
    queryFn: getCenterNotificationsRequest,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Auto refetch every 1 minute
  });
