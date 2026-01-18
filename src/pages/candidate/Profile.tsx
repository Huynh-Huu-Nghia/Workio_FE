import React, { useEffect, useMemo, useState } from "react";
import { Save, User } from "lucide-react";
import { pathtotitle } from "@/configs/pagetitle";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/context/user/user.context";
import {
  useCandidateProfileQuery,
  useUpdateCandidateProfileMutation,
} from "@/api/profile.api";
import { toast } from "react-toastify";
import ProvinceWardSelect from "@/components/ProvinceWardSelect";
import CandidateLayout from "@/layouts/CandidateLayout";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

const CandidateProfile: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Hồ sơ";
  const { user } = useUser();
  const updateProfile = useUpdateCandidateProfileMutation();
  
  // 1. Lấy thêm hàm refetch để làm mới dữ liệu từ server sau khi lưu
  const { data: profileRes, refetch } = useCandidateProfileQuery();

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
  const [studyHistories, setStudyHistories] = useState<
    { school_name: string; major: string; start_year: number | ""; end_year: number | ""; degree: string }[]
  >([
    { school_name: "", major: "", start_year: "", end_year: "", degree: "" },
  ]);
  const [workExperiences, setWorkExperiences] = useState<
    { company_name: string; position: string; start_date: string; end_date: string; description: string }[]
  >([
    { company_name: "", position: "", start_date: "", end_date: "", description: "" },
  ]);
  
  // Biến cờ này giúp ngăn chặn việc Server ghi đè nếu đã load bản nháp
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const [tagLanguage, setTagLanguage] = useState("");
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const normalizeYearInput = (value: string): number | "" =>
    value.trim() === "" ? "" : Number(value);

  // -----------------------------------------------------------
  // LOGIC LOAD DỮ LIỆU THÔNG MINH (Ưu tiên Nháp > Server)
  // -----------------------------------------------------------
  useEffect(() => {
    if (!user) return; 

    // 1. Kiểm tra bản nháp trước
    const rawDraft = localStorage.getItem(storageKey);
    
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft);
        // Load nháp vào State
        if (parsed.candidateInfo) setCandidateInfo((prev: any) => ({ ...prev, ...parsed.candidateInfo }));
        if (parsed.addressInfo) setAddressInfo((prev: any) => ({ ...prev, ...parsed.addressInfo }));
        if (Array.isArray(parsed.studyHistories)) setStudyHistories(parsed.studyHistories);
        if (Array.isArray(parsed.workExperiences)) setWorkExperiences(parsed.workExperiences);
        
        // Đánh dấu là đã load nháp -> Chặn data server
        setHasLoadedDraft(true);
        return; 
      } catch (e) {
        console.error("Lỗi đọc bản nháp", e);
      }
    }

    // 2. Nếu không có nháp (hoặc đã bị xóa) thì mới load từ Server
    // Chỉ chạy khi chưa load nháp
    if (!hasLoadedDraft) {
        const profile = profileRes?.data;
        if (profile) {
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
          if (Array.isArray(profile.study_history)) {
            setStudyHistories(
              profile.study_history.map((s: any) => ({
                school_name: s.school_name || "",
                major: s.major || "",
                start_year: s.start_year || "",
                end_year: s.end_year || "",
                degree: s.degree || "",
              }))
            );
          }
          if (Array.isArray(profile.work_experience)) {
            setWorkExperiences(
              profile.work_experience.map((w: any) => ({
                company_name: w.company_name || "",
                position: w.position || "",
                start_date: w.start_date || "",
                end_date: w.end_date || "",
                description: w.description || "",
              }))
            );
          }
        }
    }
  }, [storageKey, profileRes, user, hasLoadedDraft]); 

  const saveDraft = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ candidateInfo, addressInfo, studyHistories, workExperiences }) 
    );
    setHasLoadedDraft(true); // Đảm bảo trạng thái draft được giữ
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
        studyHistories: studyHistories
          .filter((s) => s.school_name || s.major || s.degree)
          .map((s) => ({
            ...s,
            start_year: s.start_year ? Number(s.start_year) : null,
            end_year: s.end_year ? Number(s.end_year) : null,
          })),
        workExperiences: workExperiences
          .filter((w) => w.company_name || w.position || w.description)
          .map((w) => ({
            ...w,
            start_date: w.start_date || null,
            end_date: w.end_date || null,
          })),
      };
      
      await updateProfile.mutateAsync(payload);
      toast.success("Cập nhật hồ sơ thành công.");
      
      // Xóa draft sau khi lưu thành công để đồng bộ với server
      localStorage.removeItem(storageKey); 
      setHasLoadedDraft(false); // Reset cờ để lần sau load lại từ server mới
      refetch(); // Gọi API lấy dữ liệu mới nhất
      
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || "Cập nhật hồ sơ thất bại.");
    }
  };

  // ... (Phần return JSX giữ nguyên như cũ)
  return (
    <CandidateLayout title={title}>
      {/* ... giữ nguyên nội dung JSX ... */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
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

            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngành nghề mong muốn
              </label>
              <button
                type="button"
                onClick={() => setShowFieldDropdown((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <span className="text-gray-700">
                  {(candidateInfo.fields_wish || []).length
                    ? `${(candidateInfo.fields_wish || []).length} ngành được chọn`
                    : "Chọn ngành (nhiều lựa chọn)"}
                </span>
                <span className="text-gray-400">▼</span>
              </button>
              {showFieldDropdown && (
                <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={(candidateInfo.fields_wish || []).includes(opt)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCandidateInfo((p: any) => ({
                            ...p,
                            fields_wish: checked
                              ? Array.from(new Set([...(p.fields_wish || []), opt]))
                              : (p.fields_wish || []).filter((x: string) => x !== opt),
                          }));
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
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

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-800">Thông tin nghề nghiệp</h2>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Xếp loại tốt nghiệp
              </label>
              <input
                value={candidateInfo.graduation_rank}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, graduation_rank: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Giỏi, Khá..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tin học
              </label>
              <input
                value={candidateInfo.computer_skill}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, computer_skill: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="VD: Word, Excel"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kỹ năng khác
              </label>
              <input
                value={candidateInfo.other_computer_skill}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, other_computer_skill: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Loại công việc mong muốn
              </label>
              <select
                value={candidateInfo.job_type}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, job_type: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Chọn</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Thời gian làm việc
              </label>
              <select
                value={candidateInfo.working_time}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, working_time: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Chọn</option>
                <option value="Giờ hành chính">Giờ hành chính</option>
                <option value="Linh hoạt">Linh hoạt</option>
                <option value="Ca">Ca</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phương tiện
              </label>
              <input
                value={candidateInfo.transport}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, transport: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Xe máy, xe bus..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Thu nhập mong muốn (VNĐ)
              </label>
              <input
                type="number"
                value={candidateInfo.minimum_income}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({
                    ...p,
                    minimum_income: Number(e.target.value || 0),
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-800">Học vấn</h2>
            </div>
            {studyHistories.map((s, idx) => (
              <div
                key={idx}
                className="md:col-span-2 grid gap-3 md:grid-cols-5 rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <input
                  value={s.school_name}
                  onChange={(e) =>
                    setStudyHistories((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, school_name: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Trường"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={s.major}
                  onChange={(e) =>
                    setStudyHistories((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, major: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Ngành học"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={s.degree}
                  onChange={(e) =>
                    setStudyHistories((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, degree: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Bằng cấp"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={s.start_year}
                  onChange={(e) =>
                    setStudyHistories((prev) =>
                      prev.map((item, i) =>
                        i === idx
                          ? { ...item, start_year: normalizeYearInput(e.target.value) }
                          : item
                      )
                    )
                  }
                  placeholder="Năm bắt đầu"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    value={s.end_year}
                    onChange={(e) =>
                      setStudyHistories((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? { ...item, end_year: normalizeYearInput(e.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Năm kết thúc"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setStudyHistories((prev) =>
                        prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() =>
                  setStudyHistories((prev) => [
                    ...prev,
                    { school_name: "", major: "", start_year: "", end_year: "", degree: "" },
                  ])
                }
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                + Thêm học vấn
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-800">Kinh nghiệm làm việc</h2>
            </div>
            {workExperiences.map((w, idx) => (
              <div
                key={idx}
                className="md:col-span-2 grid gap-3 md:grid-cols-5 rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <input
                  value={w.company_name}
                  onChange={(e) =>
                    setWorkExperiences((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, company_name: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Công ty"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={w.position}
                  onChange={(e) =>
                    setWorkExperiences((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, position: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Vị trí"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={w.start_date}
                  onChange={(e) =>
                    setWorkExperiences((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, start_date: e.target.value } : item
                      )
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={w.end_date}
                  onChange={(e) =>
                    setWorkExperiences((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, end_date: e.target.value } : item
                      )
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    value={w.description}
                    onChange={(e) =>
                      setWorkExperiences((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, description: e.target.value } : item
                        )
                      )
                    }
                    placeholder="Mô tả"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setWorkExperiences((prev) =>
                        prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() =>
                  setWorkExperiences((prev) => [
                    ...prev,
                    { company_name: "", position: "", start_date: "", end_date: "", description: "" },
                  ])
                }
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                + Thêm kinh nghiệm
              </button>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateProfile;