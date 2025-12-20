import { useCallback, useMemo } from "react";
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";
import type { JobPost } from "@/api/job-post.api";

export interface JobLocationResult {
  provinceCode: string | number | null;
  wardCode: string | number | null;
  provinceName: string | null;
  wardName: string | null;
  label: string | null;
}

const getFirstValid = <T,>(...values: Array<T | undefined | null>) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return undefined;
};

export const useJobLocationResolver = () => {
  const { data: provinces } = useProvincesQuery();
  const { data: wards } = useWardsQuery(true);

  const provinceMap = useMemo(() => {
    const map = new Map<string, string>();
    provinces?.forEach((province) => {
      map.set(String(province.code), province.name);
    });
    return map;
  }, [provinces]);

  const wardMap = useMemo(() => {
    const map = new Map<string, string>();
    wards?.forEach((ward) => {
      map.set(String(ward.code), ward.name);
    });
    return map;
  }, [wards]);

  const resolveJobLocation = useCallback(
    (job: Partial<JobPost> | Record<string, any>): JobLocationResult => {
      const jobAny = job as any;

      const provinceCode = getFirstValid(
        jobAny?.address?.province_code,
        jobAny?.address?.province?.code,
        jobAny?.province?.code,
        jobAny?.province_code,
        jobAny?.recruiter?.address?.province_code,
        jobAny?.recruiter?.address?.province?.code,
        jobAny?.recruiter?.province?.code,
        jobAny?.recruiter?.province_code
      );

      const wardCode = getFirstValid(
        jobAny?.address?.ward_code,
        jobAny?.address?.ward?.code,
        jobAny?.ward?.code,
        jobAny?.ward_code,
        jobAny?.recruiter?.address?.ward_code,
        jobAny?.recruiter?.address?.ward?.code,
        jobAny?.recruiter?.ward?.code,
        jobAny?.recruiter?.ward_code
      );

      const provinceName =
        (getFirstValid(
          jobAny?.address?.province?.name,
          jobAny?.province?.name,
          jobAny?.recruiter?.address?.province?.name,
          jobAny?.recruiter?.province?.name,
          provinceCode ? provinceMap.get(String(provinceCode)) : undefined
        ) as string | undefined) || null;

      const wardName =
        (getFirstValid(
          jobAny?.address?.ward?.name,
          jobAny?.ward?.name,
          jobAny?.recruiter?.address?.ward?.name,
          jobAny?.recruiter?.ward?.name,
          wardCode ? wardMap.get(String(wardCode)) : undefined
        ) as string | undefined) || null;

      const label = [wardName, provinceName].filter(Boolean).join(", ");

      return {
        provinceCode: (provinceCode as string | number | null) ?? null,
        wardCode: (wardCode as string | number | null) ?? null,
        provinceName,
        wardName,
        label: label || null,
      };
    },
    [provinceMap, wardMap]
  );

  return { resolveJobLocation };
};
