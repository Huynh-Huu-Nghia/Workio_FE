import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

interface ApiResponse<T> {
  err: number;
  mes: string;
  data: T;
}

export interface SocialInsurance {
  id: string;
  identify_number: string;
  salary_base?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  company_name?: string | null;
}

export interface UnemploymentBenefits {
  totalMonths: number;
  totalBenefits: number;
}

const getSocialInsurancesRequest = async (
  identifyNumber: string
): Promise<ApiResponse<SocialInsurance[]>> => {
  const response = await axiosInstance.get("/admin/social-insurances", {
    params: { identify_number: identifyNumber },
  });
  return response.data;
};

const getUnemploymentBenefitsRequest = async (
  identifyNumber: string
): Promise<ApiResponse<UnemploymentBenefits>> => {
  const response = await axiosInstance.get("/admin/unemployed-benefits", {
    params: { identify_number: identifyNumber },
  });
  return response.data;
};

export const useSocialInsurancesQuery = (identifyNumber: string) =>
  useQuery({
    queryKey: ["social-insurances", identifyNumber],
    queryFn: () => getSocialInsurancesRequest(identifyNumber),
    enabled: Boolean(identifyNumber),
  });

export const useUnemploymentBenefitsQuery = (identifyNumber: string) =>
  useQuery({
    queryKey: ["unemployment-benefits", identifyNumber],
    queryFn: () => getUnemploymentBenefitsRequest(identifyNumber),
    enabled: Boolean(identifyNumber),
  });
