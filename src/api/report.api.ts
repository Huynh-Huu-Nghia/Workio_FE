import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface MonthlyReport {
  jobPostStats: {
    total: number;
    active: number;
    approved: number;
    canceled: number;
  };
  totalAppliedCandidates: number;
  totalInterviewedCandidates: number;
  totalInterviews: {
    total: number;
    ongoing: number;
    ended: number;
  };
  interviewPassRate: {
    total: number;
    passed: number;
    failed: number;
  };
  employedCandidates: {
    total: number;
    employed: number;
  };
}

const getMonthlyReportRequest = async (
  month: number,
  year: number
): Promise<ApiResponse<MonthlyReport>> => {
  const response = await axiosInstance.get("/admin/report", {
    params: { month, year },
  });
  return response.data;
};

export const useMonthlyReportQuery = (month: number, year: number) =>
  useQuery({
    queryKey: ["admin-report", month, year],
    queryFn: () => getMonthlyReportRequest(month, year),
    enabled: Boolean(month && year),
    staleTime: 1000 * 60 * 5,
  });

// --- Download report DOCX (Backend: GET /admin/report-doc) ---
export const downloadMonthlyReportDoc = async (month: number, year: number) => {
  const response = await axiosInstance.get("/admin/report-doc", {
    params: { month, year },
    responseType: "blob",
  });
  return response.data as Blob;
};
