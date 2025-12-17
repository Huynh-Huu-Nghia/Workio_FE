import React, { useEffect, useMemo, useState } from "react";
import { Building2, Save } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/user/user.context";
import { useUpdateRecruiterProfileMutation } from "@/api/profile.api";
import { toast } from "react-toastify";

const RecruiterProfile: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Hồ sơ doanh nghiệp";
  const { user } = useUser();
  const updateProfile = useUpdateRecruiterProfileMutation();

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
    district_code: "",
    province_code: "",
    ward: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setRecruiterInfo((prev: any) => ({
        ...prev,
        ...(parsed.recruiterInfo || {}),
      }));
      setAddressInfo((prev: any) => ({
        ...prev,
        ...(parsed.addressInfo || {}),
      }));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const saveDraft = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ recruiterInfo, addressInfo })
    );
    toast.info("Đã lưu nháp trên máy.");
  };

  const onSubmit = async () => {
    try {
      const payload = { recruiterInfo, addressInfo };
      await updateProfile.mutateAsync(payload);
      toast.success("Cập nhật hồ sơ doanh nghiệp thành công.");
      localStorage.setItem(
        storageKey,
        JSON.stringify({ recruiterInfo, addressInfo })
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || "Cập nhật thất bại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              Cập nhật hồ sơ qua endpoint PUT `/recruiter/profile/update`.
            </p>
          </div>
          <div className="ml-auto">
            <Link
              to="/recruiter/settings"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cài đặt tài khoản
            </Link>
          </div>
        </header>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Tài khoản: <b className="text-gray-900">{user?.email || "—"}</b>
              </p>
              <p className="text-xs text-gray-400">
                Backend hiện chưa có GET profile, form dùng nháp local để điền
                lại.
              </p>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tên công ty
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mã số thuế
              </label>
              <input
                value={recruiterInfo.tax_number}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({
                    ...p,
                    tax_number: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                value={recruiterInfo.phone}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({
                    ...p,
                    phone: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                value={recruiterInfo.website}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({
                    ...p,
                    website: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày thành lập
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                value={recruiterInfo.description}
                onChange={(e) =>
                  setRecruiterInfo((p: any) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-800">Địa chỉ</h2>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Số nhà, tên đường
              </label>
              <input
                value={addressInfo.street}
                onChange={(e) =>
                  setAddressInfo((p: any) => ({ ...p, street: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Province code
              </label>
              <input
                value={addressInfo.province_code}
                onChange={(e) =>
                  setAddressInfo((p: any) => ({
                    ...p,
                    province_code: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                District code
              </label>
              <input
                value={addressInfo.district_code}
                onChange={(e) =>
                  setAddressInfo((p: any) => ({
                    ...p,
                    district_code: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phường/Xã
              </label>
              <input
                value={addressInfo.ward}
                onChange={(e) =>
                  setAddressInfo((p: any) => ({ ...p, ward: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
