import React, { useEffect, useMemo, useState } from "react";
import { Building2, Save, MapPin } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import { useUser } from "@/context/user/user.context";
import { useRecruiterProfileQuery, useUpdateRecruiterProfileMutation } from "@/api/profile.api";
import { toast } from "react-toastify";
import ProvinceWardSelect from "@/components/ProvinceWardSelect";
import RecruiterLayout from "@/layouts/RecruiterLayout";

const RecruiterProfile: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Hồ sơ doanh nghiệp";
  const { user } = useUser();
  const updateProfile = useUpdateRecruiterProfileMutation();
  
  // Lấy hàm refetch để làm mới dữ liệu sau khi update
  const { data: profileRes, refetch } = useRecruiterProfileQuery();

  const storageKey = useMemo(
    () => `workio_recruiter_profile_draft_${user?.id || "guest"}`,
    [user?.id]
  );

  const [recruiterInfo, setRecruiterInfo] = useState<any>({
    company_name: "",
    description: "",
    tax_number: "",
    phone: "",
    website: "",
    established_at: "",
    is_verified: false,
  });

  const [addressInfo, setAddressInfo] = useState<any>({
    street: "",
    ward_code: "",
    province_code: "",
  });
  
  // Biến cờ: Đã load draft chưa? (Để chặn server overwrite)
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  // --- LOGIC LOAD DỮ LIỆU ---
  useEffect(() => {
    if (!user) return;

    // 1. Kiểm tra bản nháp trước
    const rawDraft = localStorage.getItem(storageKey);
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft);
        // Load nháp vào state
        if (parsed.recruiterInfo) setRecruiterInfo((prev: any) => ({ ...prev, ...parsed.recruiterInfo }));
        if (parsed.addressInfo) setAddressInfo((prev: any) => ({ ...prev, ...parsed.addressInfo }));
        
        setHasLoadedDraft(true); // Đánh dấu đã load nháp
        // console.log("Loaded draft from local storage");
        return; // Dừng lại, không load data server nữa
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }

    // 2. Nếu không có nháp (hoặc đã xóa nháp sau khi lưu) -> Load từ Server
    if (!hasLoadedDraft && profileRes?.data) {
      const profile = profileRes.data;
      setRecruiterInfo({
        company_name: profile.company_name || "",
        description: profile.description || "",
        tax_number: profile.tax_number || "",
        phone: profile.phone || "",
        website: profile.website || "",
        established_at: profile.established_at ? profile.established_at.split("T")[0] : "", // Format YYYY-MM-DD
        is_verified: profile.is_verified || false,
      });
      
      // Kiểm tra cấu trúc address từ API (có thể lồng trong object hoặc flatten)
      const addr = profile.address || {}; 
      setAddressInfo({
        street: addr.street || "",
        ward_code: addr.ward_code || "",
        province_code: addr.province_code || "",
      });
    }
  }, [storageKey, profileRes, user, hasLoadedDraft]);

  const saveDraft = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ recruiterInfo, addressInfo })
    );
    setHasLoadedDraft(true); // Đảm bảo trạng thái draft được giữ
    toast.info("Đã lưu nháp trên máy.");
  };

  const onSubmit = async () => {
    try {
      const payload = {
        recruiterInfo,
        addressInfo: {
          street: addressInfo.street,
          ward_code: addressInfo.ward_code,
          province_code: addressInfo.province_code,
        },
      };
      
      await updateProfile.mutateAsync(payload);
      toast.success("Cập nhật hồ sơ doanh nghiệp thành công.");
      
      // Quan trọng: Xóa nháp & Reset cờ để cho phép load data mới từ server
      localStorage.removeItem(storageKey);
      setHasLoadedDraft(false);
      
      // Gọi API lấy dữ liệu mới nhất
      refetch();

    } catch (e: any) {
      toast.error(e?.response?.data?.msg || "Cập nhật thất bại.");
    }
  };

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">
                  Thông tin này sẽ được hiển thị công khai với ứng viên.
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Tài khoản: <b className="text-gray-900">{user?.email || "—"}</b>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thông tin doanh nghiệp</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveDraft}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={updateProfile.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:bg-orange-200"
              >
                <Save className="h-4 w-4" />
                {updateProfile.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Tên công ty</label>
              <input
                value={recruiterInfo.company_name}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({
                    ...p,
                    company_name: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mã số thuế</label>
              <input
                value={recruiterInfo.tax_number}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({ ...p, tax_number: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                value={recruiterInfo.phone}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({ ...p, phone: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
              <input
                value={recruiterInfo.website}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({ ...p, website: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ngày thành lập</label>
              <input
                type="date"
                value={recruiterInfo.established_at}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({
                    ...p,
                    established_at: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                value={recruiterInfo.description}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({ ...p, description: e.target.value }))
                }
                className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={16}/> Địa chỉ trụ sở chính
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Số nhà, tên đường</label>
                <input
                    value={addressInfo.street}
                    onChange={(e) =>
                    setAddressInfo((p: any) => ({ ...p, street: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
                </div>
                <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <ProvinceWardSelect
                    provinceCode={addressInfo.province_code}
                    wardCode={addressInfo.ward_code}
                    onProvinceChange={(code) =>
                    setAddressInfo((p: any) => ({
                        ...p,
                        province_code: code,
                        ward_code: "",
                    }))
                    }
                    onWardChange={(code) =>
                    setAddressInfo((p: any) => ({ ...p, ward_code: code }))
                    }
                    required
                />
                </div>
            </div>
          </div>
        </section>

      </div>
    </RecruiterLayout>
  );
};

export default RecruiterProfile;