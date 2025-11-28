import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";

// Interface Payload khớp JSON BE
export interface RecruiterPayload {
  email: string;
  password?: string;
  recruiterInfo: {
    company_name: string;
    description: string;
    tax_number: string;
    phone: string;
    website: string;
    established_at: string; // YYYY-MM-DD
    is_verified: boolean;
  };
  addressInfo: {
    street: string;
    district_code: string;
    province_code: string;
    ward?: string; // Optional tùy BE có lưu ward ko, nhưng cứ gửi lên
  };
}

// Gọi API
const createRecruiterRequest = async (data: RecruiterPayload) => {
  // Giả định đường dẫn là /admin/create-recruiter (bạn check lại route BE nhé)
  const response = await axiosInstance.post("/admin/create-recruiter", data);
  return response.data;
};

export const useCreateRecruiterMutation = () => {
  return useMutation({
    mutationFn: createRecruiterRequest,
  });
};
