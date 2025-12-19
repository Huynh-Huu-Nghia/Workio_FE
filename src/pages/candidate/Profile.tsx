import React, { useEffect, useMemo, useState } from "react";
import { Save, User } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/user/user.context";
import { useCandidateProfileQuery, useUpdateCandidateProfileMutation } from "@/api/profile.api";
import { toast } from "react-toastify";
import ProvinceWardSelect from "@/components/ProvinceWardSelect";
import CandidateLayout from "@/layouts/CandidateLayout";

const CandidateProfile: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Hồ sơ";
  const { user } = useUser();
  const updateProfile = useUpdateCandidateProfileMutation();
  const { data: profileRes } = useCandidateProfileQuery();

  const storageKey = useMemo(
    () => `workio_candidate_profile_draft_${user?.id || "guest"}`,
    [user?.id]
  );

  const [candidateInfo, setCandidateInfo] = useState<any>({
    full_name: "",
    phone: "",
    place_of_birth: "",
    ethnicity: "Kinh",
    gender: "Nam",
    date_of_birth: "",
    graduation_rank: "",
    computer_skill: "",
    other_computer_skill: "",
    job_type: "",
    working_time: "",
    transport: "",
    minimum_income: 0,
    languguages: [],
    fields_wish: [],
  });

  const [addressInfo, setAddressInfo] = useState<any>({
    street: "",
    ward_code: "",
    province_code: "",
  });
  const [prefilled, setPrefilled] = useState(false);

  const [tagLanguage, setTagLanguage] = useState("");
  const [tagField, setTagField] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setCandidateInfo((prev: any) => ({ ...prev, ...(parsed.candidateInfo || {}) }));
      setAddressInfo((prev: any) => ({ ...prev, ...(parsed.addressInfo || {}) }));
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    if (prefilled) return;
    const profile = profileRes?.data;
    if (!profile) return;
    setPrefilled(true);
    setCandidateInfo((prev: any) => ({
      ...prev,
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      place_of_birth: profile.place_of_birth || "",
      ethnicity: profile.ethnicity || "Kinh",
      gender: profile.gender || "Nam",
      date_of_birth: profile.date_of_birth || "",
      graduation_rank: profile.graduation_rank || "",
      computer_skill: profile.computer_skill || "",
      other_computer_skill: profile.other_computer_skill || "",
      job_type: profile.job_type || "",
      working_time: profile.working_time || "",
      transport: profile.transport || "",
      minimum_income: profile.minimum_income || 0,
      languguages: profile.languguages || [],
      fields_wish: profile.fields_wish || [],
    }));
    setAddressInfo({
      street: profile.address?.street || "",
      ward_code: profile.address?.ward_code || "",
      province_code: profile.address?.province_code || "",
    });
  }, [profileRes, prefilled]);

  const saveDraft = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ candidateInfo, addressInfo })
    );
    toast.info("Đã lưu nháp trên máy.");
  };

  const onSubmit = async () => {
    try {
      const payload = {
        candidateInfo,
        addressInfo: {
          street: addressInfo.street,
          ward_code: addressInfo.ward_code,
          province_code: addressInfo.province_code,
        },
        studyHistories: [],
        workExperiences: [],
      };
      await updateProfile.mutateAsync(payload);
      toast.success("Cập nhật hồ sơ thành công.");
      localStorage.setItem(
        storageKey,
        JSON.stringify({ candidateInfo, addressInfo })
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || "Cập nhật hồ sơ thất bại.");
    }
  };

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              Cập nhật hồ sơ qua endpoint PUT `/candidate/profile`.
            </p>
          </div>
          <div className="ml-auto">
            <Link
              to="/candidate/support"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hỗ trợ
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
                Backend hiện chưa có GET profile, form dùng nháp local để điền lại.
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                value={candidateInfo.full_name}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, full_name: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                value={candidateInfo.phone}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, phone: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="0901234567"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Giới tính
              </label>
              <select
                value={candidateInfo.gender}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, gender: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày sinh
              </label>
              <input
                type="date"
                value={candidateInfo.date_of_birth}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({
                    ...p,
                    date_of_birth: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
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

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-800">Tags</h2>
              <p className="text-xs text-gray-500">
                Backend dùng key `languguages` và `fields_wish` (mảng string).
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngôn ngữ
              </label>
              <div className="flex gap-2">
                <input
                  value={tagLanguage}
                  onChange={(e) => setTagLanguage(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="VD: Tiếng Anh"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = tagLanguage.trim();
                    if (!v) return;
                    setCandidateInfo((p: any) => ({
                      ...p,
                      languguages: Array.from(new Set([...(p.languguages || []), v])),
                    }));
                    setTagLanguage("");
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Thêm
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(candidateInfo.languguages || []).map((t: string) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setCandidateInfo((p: any) => ({
                        ...p,
                        languguages: (p.languguages || []).filter((x: string) => x !== t),
                      }))
                    }
                    className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
                    title="Bấm để xoá"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngành nghề mong muốn
              </label>
              <div className="flex gap-2">
                <input
                  value={tagField}
                  onChange={(e) => setTagField(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="VD: IT Phần mềm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = tagField.trim();
                    if (!v) return;
                    setCandidateInfo((p: any) => ({
                      ...p,
                      fields_wish: Array.from(new Set([...(p.fields_wish || []), v])),
                    }));
                    setTagField("");
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Thêm
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(candidateInfo.fields_wish || []).map((t: string) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setCandidateInfo((p: any) => ({
                        ...p,
                        fields_wish: (p.fields_wish || []).filter((x: string) => x !== t),
                      }))
                    }
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    title="Bấm để xoá"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateProfile;
