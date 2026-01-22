import React, { useEffect, useMemo, useRef, useState } from "react";
import { Save, User, Camera, Upload, X } from "lucide-react"; // Import thêm icon
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

// [UPDATE] Định nghĩa options khớp với ENUM trong Model Candidate
const GRADUATION_RANK_OPTIONS = ["Cấp 1", "Cấp 2", "Cấp 3", "Đại học"];
const COMPUTER_SKILL_OPTIONS = ["Văn phòng", "Kỹ thuật viên", "Trung cấp", "Khác"];

const CandidateProfile: React.FC = () => {
  // ... (Giữ nguyên các hook và state cũ không thay đổi)
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Hồ sơ";
  const { user } = useUser();
  const updateProfile = useUpdateCandidateProfileMutation();
  const { data: profileRes, refetch } = useCandidateProfileQuery();
  // [MỚI] State cho Avatar
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ... (Giữ nguyên logic useEffect load data/draft và saveDraft, onSubmit)
    const [addressInfo, setAddressInfo] = useState<any>({
    street: "",
    ward_code: "",
    province_code: "",
  });
  // [SỬA] Cập nhật state StudyHistory để dùng date string thay vì year number
  const [studyHistories, setStudyHistories] = useState<
    { school_name: string; major: string; start_date: string; end_date: string; degree: string }[]
  >([
    { school_name: "", major: "", start_date: "", end_date: "", degree: "" },
  ]);
  const [workExperiences, setWorkExperiences] = useState<
    { company_name: string; position: string; start_date: string; end_date: string; description: string }[]
  >([
    { company_name: "", position: "", start_date: "", end_date: "", description: "" },
  ]);
  
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [tagLanguage, setTagLanguage] = useState("");
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const normalizeYearInput = (value: string): number | "" =>
    value.trim() === "" ? "" : Number(value);


  useEffect(() => {
    if (!user) return; 

    // 1. Load Draft
    const rawDraft = localStorage.getItem(storageKey);
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft);
        if (parsed.candidateInfo) setCandidateInfo((prev: any) => ({ ...prev, ...parsed.candidateInfo }));
        if (parsed.addressInfo) setAddressInfo((prev: any) => ({ ...prev, ...parsed.addressInfo }));
        if (Array.isArray(parsed.studyHistories)) setStudyHistories(parsed.studyHistories);
        if (Array.isArray(parsed.workExperiences)) setWorkExperiences(parsed.workExperiences);
        setHasLoadedDraft(true);
        return; 
      } catch (e) { console.error(e); }
    }

    // 2. Load API
    if (!hasLoadedDraft) {
        const profile = profileRes?.data;
        if (profile) {
          setAvatarUrl(profile.candidate?.avatar_url || user.avatar_url || "");
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

          // [SỬA] Bind dữ liệu StudyHistory từ API (start_date/end_date)
          if (Array.isArray(profile.study_history)) {
            setStudyHistories(
              profile.study_history.map((s: any) => ({
                school_name: s.school_name || "",
                // Map field_of_study (DB) -> major (Frontend)
                major: s.field_of_study || s.major || "", 
                start_date: s.start_date || "", 
                end_date: s.end_date || "",
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
    setHasLoadedDraft(true); 
    toast.info("Đã lưu nháp trên máy.");
  };

  // Thêm hàm convert file sang Base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Trong component:
const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Convert sang Base64
        const base64 = await convertToBase64(file);
        setAvatarUrl(base64); // Hiển thị preview ngay lập tức
        // Lưu ý: Lúc này avatarUrl chứa chuỗi rất dài "data:image/png;base64,..."
    }
};

  const onSubmit = async () => {
    try {
      const payload = {
        avatar_url: avatarUrl,
        candidateInfo,
        addressInfo,
        // [SỬA] Payload gửi đi giữ nguyên định dạng ngày tháng
        studyHistories: studyHistories
          .filter((s) => s.school_name.trim()) // Chỉ lấy dòng có tên trường
          .map((s) => ({
            school_name: s.school_name,
            major: s.major,
            degree: s.degree,
            start_date: s.start_date || null,
            end_date: s.end_date || null,
          })),
        workExperiences: workExperiences
          .filter((w) => w.company_name.trim())
          .map((w) => ({
            ...w,
            start_date: w.start_date || null,
            end_date: w.end_date || null,
          })),
      };
      
      await updateProfile.mutateAsync(payload);
      toast.success("Cập nhật hồ sơ thành công.");
      localStorage.removeItem(storageKey); 
      setHasLoadedDraft(false); 
      refetch(); 
      
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || "Cập nhật hồ sơ thất bại.");
    }
  };
  

  return (
    <CandidateLayout title={title}>
      {/* ... (Header và các phần input Text giữ nguyên) ... */}
       <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
          <div className="ml-auto">
            <Link to="/candidate/support" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Hỗ trợ</Link>
          </div>
        </header>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
           {/* ... (Phần nút Save/Draft giữ nguyên) ... */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm text-gray-600">Tài khoản: <b className="text-gray-900">{user?.email || "—"}</b></p></div>
            <div className="flex gap-2">
              <button type="button" onClick={saveDraft} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Lưu nháp</button>
              <button type="button" onClick={onSubmit} disabled={updateProfile.isPending} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:bg-orange-200">
                <Save className="h-4 w-4" />{updateProfile.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </div>

          {/* AVATAR UPLOAD */}
          <div className="mb-8 flex flex-col items-center justify-center border-b border-gray-100 pb-6">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full border-4 border-orange-50 overflow-hidden bg-gray-100">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <User size={40} />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 rounded-full bg-orange-500 p-2 text-white shadow-md hover:bg-orange-600 transition-colors">
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
          </div>
          
           {/* ... (Phần Họ tên, SĐT, Giới tính, Ngày sinh giữ nguyên) ... */}
           <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Họ và tên</label>
              <input value={candidateInfo.full_name} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, full_name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input value={candidateInfo.phone} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, phone: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="0901234567" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Giới tính</label>
              <select value={candidateInfo.gender} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, gender: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input type="date" value={candidateInfo.date_of_birth} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, date_of_birth: e.target.value, }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

           {/* ... (Phần Địa chỉ, Ngôn ngữ, Ngành nghề giữ nguyên) ... */}
           {/* ... Tôi rút gọn phần này để tập trung vào phần thay đổi ... */}
           <div className="mt-6 grid gap-4 md:grid-cols-2">
             {/* ...Address inputs... */}
             <div className="md:col-span-2"><h2 className="text-sm font-semibold text-gray-800">Địa chỉ</h2></div>
             <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Số nhà, tên đường</label>
              <input value={addressInfo.street} onChange={(e) => setAddressInfo((p: any) => ({ ...p, street: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              <ProvinceWardSelect provinceCode={addressInfo.province_code} wardCode={addressInfo.ward_code} onProvinceChange={(code) => setAddressInfo((p: any) => ({ ...p, province_code: code, ward_code: "", }))} onWardChange={(code) => setAddressInfo((p: any) => ({ ...p, ward_code: code }))} required />
            </div>
           </div>
           
           <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* ...Language & Field inputs... */}
              {/* ... (Giữ nguyên logic thêm/xóa tag) ... */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ngôn ngữ</label>
                <div className="flex gap-2">
                  <input value={tagLanguage} onChange={(e) => setTagLanguage(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="VD: Tiếng Anh" />
                  <button type="button" onClick={() => { const v = tagLanguage.trim(); if (!v) return; setCandidateInfo((p: any) => ({ ...p, languguages: Array.from(new Set([...(p.languguages || []), v])), })); setTagLanguage(""); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Thêm</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{(candidateInfo.languguages || []).map((t: string) => (<button key={t} type="button" onClick={() => setCandidateInfo((p: any) => ({ ...p, languguages: (p.languguages || []).filter((x: string) => x !== t), }))} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700" title="Bấm để xoá">{t}</button>))}</div>
              </div>
              
              <div className="relative">
                 {/* ... (Giữ nguyên dropdown ngành nghề) ... */}
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ngành nghề mong muốn</label>
                  <button type="button" onClick={() => setShowFieldDropdown((v) => !v)} className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100">
                    <span className="text-gray-700">{(candidateInfo.fields_wish || []).length ? `${(candidateInfo.fields_wish || []).length} ngành được chọn` : "Chọn ngành (nhiều lựa chọn)"}</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  {showFieldDropdown && (<div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">{INDUSTRY_OPTIONS.map((opt) => (<label key={opt} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><input type="checkbox" checked={(candidateInfo.fields_wish || []).includes(opt)} onChange={(e) => { const checked = e.target.checked; setCandidateInfo((p: any) => ({ ...p, fields_wish: checked ? Array.from(new Set([...(p.fields_wish || []), opt])) : (p.fields_wish || []).filter((x: string) => x !== opt), })); }} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />{opt}</label>))}</div>)}
                  <div className="mt-2 flex flex-wrap gap-2">{(candidateInfo.fields_wish || []).map((t: string) => (<button key={t} type="button" onClick={() => setCandidateInfo((p: any) => ({ ...p, fields_wish: (p.fields_wish || []).filter((x: string) => x !== t), }))} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700" title="Bấm để xoá">{t}</button>))}</div>
              </div>
           </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-800">Thông tin nghề nghiệp</h2>
            </div>
            
            {/* [UPDATE] Chuyển graduation_rank thành SELECT */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Xếp loại tốt nghiệp
              </label>
              <select
                value={candidateInfo.graduation_rank}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, graduation_rank: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Chọn xếp loại</option>
                {GRADUATION_RANK_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* [UPDATE] Chuyển computer_skill thành SELECT */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tin học
              </label>
              <select
                value={candidateInfo.computer_skill}
                onChange={(e) =>
                  setCandidateInfo((p: any) => ({ ...p, computer_skill: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Chọn trình độ</option>
                {COMPUTER_SKILL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
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
            {/* ...Các trường JobType, WorkingTime, Transport, Income giữ nguyên... */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Loại công việc mong muốn</label>
              <select value={candidateInfo.job_type} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, job_type: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100">
                <option value="">Chọn</option><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Thời gian làm việc</label>
              <select value={candidateInfo.working_time} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, working_time: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100">
                <option value="">Chọn</option><option value="Giờ hành chính">Giờ hành chính</option><option value="Linh hoạt">Linh hoạt</option><option value="Ca">Ca</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phương tiện</label>
              <input value={candidateInfo.transport} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, transport: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Xe máy, xe bus..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Thu nhập mong muốn (VNĐ)</label>
              <input type="number" value={candidateInfo.minimum_income} onChange={(e) => setCandidateInfo((p: any) => ({ ...p, minimum_income: Number(e.target.value || 0), }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          {/* [SỬA] UI HỌC VẤN (Giống UI Kinh nghiệm làm việc) */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="text-sm font-semibold text-gray-800">Học vấn</h2></div>
            {studyHistories.map((s, idx) => (
              <div key={idx} className="md:col-span-2 grid gap-3 md:grid-cols-5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <input value={s.school_name} onChange={(e) => setStudyHistories((prev) => prev.map((item, i) => i === idx ? { ...item, school_name: e.target.value } : item))} placeholder="Trường" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <input value={s.major} onChange={(e) => setStudyHistories((prev) => prev.map((item, i) => i === idx ? { ...item, major: e.target.value } : item))} placeholder="Ngành học" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <input value={s.degree} onChange={(e) => setStudyHistories((prev) => prev.map((item, i) => i === idx ? { ...item, degree: e.target.value } : item))} placeholder="Bằng cấp" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                
                {/* [THAY ĐỔI] Input Date cho ngày bắt đầu */}
                <input 
                    type="date" 
                    value={s.start_date} 
                    onChange={(e) => setStudyHistories((prev) => prev.map((item, i) => i === idx ? { ...item, start_date: e.target.value } : item))} 
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" 
                />

                {/* [THAY ĐỔI] Input Date cho ngày kết thúc */}
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={s.end_date} 
                    onChange={(e) => setStudyHistories((prev) => prev.map((item, i) => i === idx ? { ...item, end_date: e.target.value } : item))} 
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" 
                  />
                  <button type="button" onClick={() => setStudyHistories((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Xoá</button>
                </div>
              </div>
            ))}
            <div className="md:col-span-2"><button type="button" onClick={() => setStudyHistories((prev) => [...prev, { school_name: "", major: "", start_date: "", end_date: "", degree: "" },])} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">+ Thêm học vấn</button></div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="text-sm font-semibold text-gray-800">Kinh nghiệm làm việc</h2></div>
            {workExperiences.map((w, idx) => (
              <div key={idx} className="md:col-span-2 grid gap-3 md:grid-cols-5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <input value={w.company_name} onChange={(e) => setWorkExperiences((prev) => prev.map((item, i) => i === idx ? { ...item, company_name: e.target.value } : item))} placeholder="Công ty" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <input value={w.position} onChange={(e) => setWorkExperiences((prev) => prev.map((item, i) => i === idx ? { ...item, position: e.target.value } : item))} placeholder="Vị trí" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <input type="date" value={w.start_date} onChange={(e) => setWorkExperiences((prev) => prev.map((item, i) => i === idx ? { ...item, start_date: e.target.value } : item))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <input type="date" value={w.end_date} onChange={(e) => setWorkExperiences((prev) => prev.map((item, i) => i === idx ? { ...item, end_date: e.target.value } : item))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input value={w.description} onChange={(e) => setWorkExperiences((prev) => prev.map((item, i) => i === idx ? { ...item, description: e.target.value } : item))} placeholder="Mô tả" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <button type="button" onClick={() => setWorkExperiences((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Xoá</button>
                </div>
              </div>
            ))}
            <div className="md:col-span-2"><button type="button" onClick={() => setWorkExperiences((prev) => [...prev, { company_name: "", position: "", start_date: "", end_date: "", description: "" },])} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">+ Thêm kinh nghiệm</button></div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateProfile;