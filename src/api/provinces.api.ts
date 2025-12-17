import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface Province {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  phone_code?: number;
  districts?: District[];
}

export interface District {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  province_code?: number;
  wards?: Ward[];
}

export interface Ward {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  district_code?: number;
  province_code?: number;
}

const provincesAxios = axios.create({
  baseURL: "https://provinces.open-api.vn/api/v2",
  timeout: 20000,
});

export const getAllProvinces = async (): Promise<Province[]> => {
  // API v2: GET /api/v2/
  const res = await provincesAxios.get("/");
  const data = res.data as any;
  if (Array.isArray(data)) return data as Province[];
  if (Array.isArray(data?.data)) return data.data as Province[];
  if (Array.isArray(data?.provinces)) return data.provinces as Province[];
  return [];
};

export const getAllWards = async (): Promise<Ward[]> => {
  // API v2: GET /api/v2/w/
  const res = await provincesAxios.get("/w/");
  const data = res.data as any;
  if (Array.isArray(data)) return data as Ward[];
  if (Array.isArray(data?.data)) return data.data as Ward[];
  if (Array.isArray(data?.wards)) return data.wards as Ward[];
  return [];
};

export const getProvinceByCode = async (code: string | number) => {
  // API v2: GET /api/v2/p/{code}
  const res = await provincesAxios.get(`/p/${code}`);
  return res.data as Province;
};

export const getWardByCode = async (code: string | number) => {
  // API v2: GET /api/v2/w/{code}
  const res = await provincesAxios.get(`/w/${code}`);
  return res.data as Ward;
};

export const useProvincesQuery = () =>
  useQuery({
    queryKey: ["provinces-v2"],
    queryFn: getAllProvinces,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

export const useProvinceByCodeQuery = (code?: string | number) =>
  useQuery({
    queryKey: ["province-v2", code],
    queryFn: () => getProvinceByCode(code as string),
    enabled: Boolean(code),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

export const useWardsQuery = (enabled = true) =>
  useQuery({
    queryKey: ["wards-v2"],
    queryFn: getAllWards,
    enabled,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

export const useWardByCodeQuery = (code?: string | number) =>
  useQuery({
    queryKey: ["ward-v2", code],
    queryFn: () => getWardByCode(code as string),
    enabled: Boolean(code),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
