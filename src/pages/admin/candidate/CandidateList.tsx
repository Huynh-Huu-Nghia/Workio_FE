import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Eye,
  Pencil,
  Search,
  CheckCircle2,
  XCircle,
  Briefcase,
  Sparkles,
  Printer,
  Loader2, // Icon xoay xoay khi loading
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  useDeleteCandidateAdminMutation,
  useGetAllCandidatesQuery,
  useCreateCandidateMutation,
} from "@/api/candidate.api"; // 👈 Import Hook
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { INDUSTRY_OPTIONS } from "@/constants/industries";
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";

export default function CandidateList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [verified, setVerified] = useState("");
  const [minIncome, setMinIncome] = useState("");
  const [maxIncome, setMaxIncome] = useState("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [graduationRank, setGraduationRank] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [awaitingInterview, setAwaitingInterview] = useState(false);
  const [employed, setEmployed] = useState("");

  // 🔥 GỌI API LẤY DANH SÁCH
  const { data: apiResponse, isLoading, isError, refetch } = useGetAllCandidatesQuery({
    search: searchTerm || undefined,
    sort_by: sortBy || undefined,
    order,
    is_verified: verified || undefined,
    graduation_rank: graduationRank || undefined,
    minimum_income_from: minIncome || undefined,
    minimum_income_to: maxIncome || undefined,
    experience_years_from: minExp || undefined,
    experience_years_to: maxExp || undefined,
    fields: fields.length ? fields : undefined,
    awaiting_interview: awaitingInterview || undefined,
    is_employed: employed || undefined,
  });
  const deleteMutation = useDeleteCandidateAdminMutation();
  const createMutation = useCreateCandidateMutation();

  // Lấy mảng ứng viên từ cục data trả về (cấu trúc { err, mes, data: [] })
  const candidates = apiResponse?.data || [];

  // --- HELPER FUNCTIONS ---

  const formatCurrency = (value: string | number | null) => {
    if (!value) return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  // Helper parse JSON field_wish (Vì MySQL lưu mảng dưới dạng chuỗi JSON)
  const parseTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        return JSON.parse(tags);
      } catch {
        return [];
      }
    }
    return [];
  };

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === candidates.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(candidates.map((u) => u.candidate_id));
    }
  };

  // Lọc theo search term
  const filteredCandidates = candidates.filter((c) => {
    if (fields.length) {
      const hasField = parseTags(c.fields_wish).some((f) => fields.includes(f));
      if (!hasField) return false;
    }
    return true;
  });

  const printCandidateProfile = (user: any, password?: string) => {
    const html = `
      <html>
        <head>
          <title>Hồ sơ ứng viên - ${user.full_name || ""}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 8px; }
            .section { margin-bottom: 16px; }
            .label { font-weight: bold; }
            .tag { display: inline-block; padding: 4px 8px; background: #eef2ff; color: #4338ca; border-radius: 6px; margin-right: 4px; margin-bottom: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Hồ sơ ứng viên</h1>
          <div class="section">
            <div><span class="label">Họ tên:</span> ${user.full_name || ""}</div>
            <div><span class="label">Email:</span> ${user.email || ""}</div>
            <div><span class="label">SĐT:</span> ${user.phone || ""}</div>
            <div><span class="label">Mật khẩu:</span> ${password || "—"}</div>
            <div><span class="label">Giới tính:</span> ${user.gender || "—"}</div>
            <div><span class="label">Ngày sinh:</span> ${user.date_of_birth || "—"}</div>
            <div><span class="label">Nơi sinh:</span> ${user.place_of_birth || "—"}</div>
            <div><span class="label">Dân tộc:</span> ${user.ethnicity || "—"}</div>
          </div>
          <div class="section">
            <div><span class="label">Trình độ:</span> ${user.graduation_rank || "-"}</div>
            <div><span class="label">Mức lương mong muốn:</span> ${formatCurrency(user.minimum_income)}</div>
            <div><span class="label">Loại công việc:</span> ${user.job_type || "-"}</div>
            <div><span class="label">Thời gian làm việc:</span> ${user.working_time || "-"}</div>
            <div><span class="label">Phương tiện:</span> ${user.transport || "-"}</div>
            <div><span class="label">Kỹ năng tin học:</span> ${user.computer_skill || "-"}</div>
            <div><span class="label">Tin học khác:</span> ${user.other_computer_skill || "-"}</div>
          </div>
          <div class="section">
            <div><span class="label">Ngôn ngữ:</span> ${(user.languguages || []).join(", ") || "-"}</div>
            <div class="label">Ngành mong muốn:</div>
            <div>${parseTags(user.fields_wish)
              .map((t: string) => `<span class="tag">${t}</span>`)
              .join("") || "-"}</div>
          </div>
          <div class="section">
            <div class="label">Học vấn:</div>
            <div>
              ${(user.studyHistories || [])
                .map(
                  (edu: any) =>
                    `<div> - ${edu.degree || ""} tại ${edu.school_name || ""} (${edu.start_year || ""} - ${edu.end_year || ""})</div>`
                )
                .join("") || "—"}
            </div>
          </div>
          <div class="section">
            <div class="label">Kinh nghiệm:</div>
            <div>
              ${(user.workExperiences || [])
                .map(
                  (exp: any) =>
                    `<div> - ${exp.position || ""} @ ${exp.company_name || ""} (${exp.start_date || ""} - ${exp.end_date || ""})</div>`
                )
                .join("") || "—"}
            </div>
          </div>
          <div class="section">
            <div><span class="label">Địa chỉ:</span> ${user.street || ""} ${user.ward_code || ""} ${user.province_code || ""}</div>
          </div>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleDeleteOne = async (candidateId: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa ứng viên này không?");
    if (!ok) return;

    try {
      const res = await deleteMutation.mutateAsync(candidateId);
      if (res?.err === 0) {
        toast.info(res?.mes || "Đã xóa ứng viên.");
        setSelectedRows((prev) => prev.filter((id) => id !== candidateId));
        await queryClient.invalidateQueries({ queryKey: ["candidates"] });
        return;
      }
      toast.error(res?.mes || "Xóa thất bại.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    const ok = window.confirm(
      `Bạn có chắc muốn xóa ${selectedRows.length} ứng viên đã chọn không?`
    );
    if (!ok) return;

    try {
      const ids = [...selectedRows];
      for (const id of ids) {
        await deleteMutation.mutateAsync(id);
      }
      toast.info("Đã xóa các ứng viên đã chọn.");
      setSelectedRows([]);
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123456Aa!");
  const [newPhone, setNewPhone] = useState("");
  const [newGender, setNewGender] = useState("Nam");
  const [newDob, setNewDob] = useState("");
  const [newBirthPlace, setNewBirthPlace] = useState("");
  const [newEthnicity, setNewEthnicity] = useState("Kinh");
  const [newLanguages, setNewLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");
  const [newGraduation, setNewGraduation] = useState("");
  const [newComputerSkill, setNewComputerSkill] = useState("");
  const [newOtherComputerSkill, setNewOtherComputerSkill] = useState("");
  const [newJobType, setNewJobType] = useState("");
  const [newWorkingTime, setNewWorkingTime] = useState("");
  const [newTransport, setNewTransport] = useState("");
  const [newMinimumIncome, setNewMinimumIncome] = useState("");
  const [newExperienceYears, setNewExperienceYears] = useState("");
  const [newFields, setNewFields] = useState<string[]>([]);
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [newAddressStreet, setNewAddressStreet] = useState("");
  const [newAddressProvince, setNewAddressProvince] = useState("");
  const [newAddressWard, setNewAddressWard] = useState("");
  const [educations, setEducations] = useState([
    { school_name: "", major: "", degree: "", start_year: "", end_year: "" },
  ]);
  const [experiences, setExperiences] = useState([
    { company_name: "", position: "", description: "", start_date: "", end_date: "" },
  ]);
  const SELECT_OPTIONS = {
    graduation_rank: ["Cấp 1", "Cấp 2", "Cấp 3", "Đại học"],
    computer_skill: ["Văn phòng", "Kỹ thuật viên", "Trung cấp", "Khác"],
    job_type: ["Văn phòng", "Sản xuất", "Giao dịch"],
    working_time: ["Giờ hành chính", "Ca kíp", "Khác"],
    transport: ["Xe gắn máy", "Khác"],
  };
  const { data: provinceData } = useProvincesQuery();
  const { data: wardData } = useWardsQuery(true);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
      ""
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.info("Nhập tối thiểu họ tên và email");
      return;
    }
    try {
      const res = await createMutation.mutateAsync({
        email: newEmail.trim(),
        password: newPassword || "123456Aa!",
        candidateInfo: {
          full_name: newName.trim(),
          gender: newGender || "Nam",
          date_of_birth: newDob || undefined,
          place_of_birth: newBirthPlace || "",
          ethnicity: newEthnicity || "Kinh",
          phone: newPhone || null,
          languguages: newLanguages.length ? newLanguages : [],
          graduation_rank: newGraduation || undefined,
          computer_skill: newComputerSkill || undefined,
          other_computer_skill: newOtherComputerSkill || undefined,
          job_type: newJobType || undefined,
          working_time: newWorkingTime || undefined,
          transport: newTransport || undefined,
          minimum_income: newMinimumIncome ? Number(newMinimumIncome) : undefined,
          experience_years: newExperienceYears ? Number(newExperienceYears) : undefined,
          fields_wish: newFields.length ? newFields : undefined,
        },
        addressInfo: {
          street: newAddressStreet || "",
          province_code: newAddressProvince || "",
          ward_code: newAddressWard || "",
        },
        studyHistories: educations
          .filter(
            (e) =>
              e.school_name || e.major || e.degree || e.start_year || e.end_year
          )
          .map((e) => ({
            school_name: e.school_name,
            major: e.major,
            degree: e.degree,
            start_year: e.start_year ? Number(e.start_year) : undefined,
            end_year: e.end_year ? Number(e.end_year) : undefined,
          })),
        workExperiences: experiences
          .filter(
            (w) =>
              w.company_name || w.position || w.start_date || w.end_date || w.description
          )
          .map((w) => ({
            company_name: w.company_name,
            position: w.position,
            description: w.description || "",
            start_date: w.start_date || undefined,
            end_date: w.end_date || undefined,
          })),
      } as any);
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã tạo ứng viên");
        setShowCreate(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("123456Aa!");
        setNewPhone("");
        setNewGender("Nam");
        setNewDob("");
        setNewBirthPlace("");
        setNewEthnicity("Kinh");
        setNewLanguages([]);
        setLanguageInput("");
        setNewGraduation("");
        setNewComputerSkill("");
        setNewOtherComputerSkill("");
        setNewJobType("");
        setNewWorkingTime("");
        setNewTransport("");
        setNewMinimumIncome("");
        setNewExperienceYears("");
        setNewFields([]);
        setShowFieldDropdown(false);
        setNewAddressStreet("");
        setNewAddressProvince("");
        setNewAddressWard("");
        setEducations([{ school_name: "", major: "", degree: "", start_year: "", end_year: "" }]);
        setExperiences([
          { company_name: "", position: "", description: "", start_date: "", end_date: "" },
        ]);
        await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      } else {
        toast.error((res as any)?.mes || "Tạo thất bại");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.mes || "Tạo thất bại");
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <AdminLayout
      title="DANH SÁCH ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="list-candidates"
    >
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Ứng viên</h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi nguồn ứng viên, trạng thái xác thực và nhu cầu việc làm.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleRefresh}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Làm mới
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 sm:w-auto"
            >
              + Thêm nhanh
            </button>
          </div>
        </div>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-10">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Thêm ứng viên nhanh
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Họ tên *</label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email *</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="email@domain.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Mật khẩu</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        placeholder="123456Aa!"
                      />
                      <button
                        type="button"
                        onClick={() => setNewPassword(generatePassword())}
                        className="whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Tạo ngẫu nhiên
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          printCandidateProfile(
                            {
                              full_name: newName,
                              email: newEmail,
                              phone: newPhone,
                              gender: newGender,
                              date_of_birth: newDob,
                              place_of_birth: newBirthPlace,
                              ethnicity: newEthnicity,
                              languguages: newLanguages,
                              graduation_rank: newGraduation,
                              job_type: newJobType,
                              working_time: newWorkingTime,
                              transport: newTransport,
                              experience_years: newExperienceYears,
                              minimum_income: newMinimumIncome,
                              fields_wish: newFields,
                              computer_skill: newComputerSkill,
                              other_computer_skill: newOtherComputerSkill,
                              street: newAddressStreet,
                              ward_code: newAddressWard,
                              province_code: newAddressProvince,
                            },
                            newPassword
                          )
                        }
                        className="whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        In PDF
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Số điện thoại</label>
                    <input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Giới tính</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Ngày sinh</label>
                    <input
                      type="date"
                      value={newDob}
                      onChange={(e) => setNewDob(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nơi sinh</label>
                    <input
                      value={newBirthPlace}
                      onChange={(e) => setNewBirthPlace(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Hà Nội..."
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Dân tộc</label>
                    <input
                      value={newEthnicity}
                      onChange={(e) => setNewEthnicity(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Kinh"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Ngôn ngữ (Enter để thêm)
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                      {newLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-700"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() =>
                              setNewLanguages(newLanguages.filter((l) => l !== lang))
                            }
                            className="text-orange-500 hover:text-orange-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = languageInput.trim();
                            if (val && !newLanguages.includes(val)) {
                              setNewLanguages([...newLanguages, val]);
                            }
                            setLanguageInput("");
                          }
                        }}
                        className="flex-1 min-w-[120px] border-none outline-none"
                        placeholder={newLanguages.length ? "" : "Ví dụ: Tiếng Việt, Tiếng Anh"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Trình độ</label>
                    <select
                      value={newGraduation}
                      onChange={(e) => setNewGraduation(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">-- Chọn xếp loại --</option>
                      {SELECT_OPTIONS.graduation_rank.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Kỹ năng tin học</label>
                    <select
                      value={newComputerSkill}
                      onChange={(e) => setNewComputerSkill(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">-- Chọn kỹ năng --</option>
                      {SELECT_OPTIONS.computer_skill.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tin học khác</label>
                    <input
                      value={newOtherComputerSkill}
                      onChange={(e) => setNewOtherComputerSkill(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="VD: Photoshop"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Loại công việc</label>
                    <select
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">-- Chọn loại hình --</option>
                      {SELECT_OPTIONS.job_type.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Thời gian làm việc</label>
                    <select
                      value={newWorkingTime}
                      onChange={(e) => setNewWorkingTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">-- Chọn thời gian --</option>
                      {SELECT_OPTIONS.working_time.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phương tiện</label>
                    <select
                      value={newTransport}
                      onChange={(e) => setNewTransport(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">-- Chọn phương tiện --</option>
                      {SELECT_OPTIONS.transport.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Mức lương mong muốn</label>
                    <input
                      type="number"
                      value={newMinimumIncome}
                      onChange={(e) => setNewMinimumIncome(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Ví dụ: 12000000"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Số năm kinh nghiệm</label>
                    <input
                      type="number"
                      value={newExperienceYears}
                      onChange={(e) => setNewExperienceYears(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Ví dụ: 2"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-600">Ngành mong muốn *</label>
                  <button
                    type="button"
                    onClick={() => setShowFieldDropdown((v) => !v)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-left focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                  >
                    {newFields.length ? `${newFields.length} ngành đã chọn` : "Chọn ngành"}
                  </button>
                  {showFieldDropdown && (
                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        >
                          <input
                            type="checkbox"
                            checked={newFields.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) setNewFields([...newFields, opt]);
                              else setNewFields(newFields.filter((f) => f !== opt));
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn một hoặc nhiều ngành (checkbox trong dropdown).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Học vấn</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEducations([
                            ...educations,
                            { school_name: "", major: "", degree: "", start_year: "", end_year: "" },
                          ])
                        }
                        className="text-xs text-orange-600 hover:underline"
                      >
                        + Thêm
                      </button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {educations.map((edu, idx) => (
                        <div key={idx} className="grid grid-cols-1 gap-2 border rounded-md p-2 bg-white">
                          <input
                            placeholder="Trường"
                            value={edu.school_name}
                            onChange={(e) =>
                              setEducations(
                                educations.map((item, i) =>
                                  i === idx ? { ...item, school_name: e.target.value } : item
                                )
                              )
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                          <input
                            placeholder="Chuyên ngành"
                            value={edu.major}
                            onChange={(e) =>
                              setEducations(
                                educations.map((item, i) =>
                                  i === idx ? { ...item, major: e.target.value } : item
                                )
                              )
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                          <input
                            placeholder="Bằng cấp"
                            value={edu.degree}
                            onChange={(e) =>
                              setEducations(
                                educations.map((item, i) =>
                                  i === idx ? { ...item, degree: e.target.value } : item
                                )
                              )
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              placeholder="Năm bắt đầu"
                              value={edu.start_year}
                              onChange={(e) =>
                                setEducations(
                                  educations.map((item, i) =>
                                    i === idx ? { ...item, start_year: e.target.value } : item
                                  )
                                )
                              }
                              className="rounded border border-gray-200 px-2 py-1 text-xs"
                            />
                            <input
                              placeholder="Năm kết thúc"
                              value={edu.end_year}
                              onChange={(e) =>
                                setEducations(
                                  educations.map((item, i) =>
                                    i === idx ? { ...item, end_year: e.target.value } : item
                                  )
                                )
                              }
                              className="rounded border border-gray-200 px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Kinh nghiệm</span>
                      <button
                        type="button"
                        onClick={() =>
                          setExperiences([
                            ...experiences,
                            {
                              company_name: "",
                              position: "",
                              description: "",
                              start_date: "",
                              end_date: "",
                            },
                          ])
                        }
                        className="text-xs text-orange-600 hover:underline"
                      >
                        + Thêm
                      </button>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {experiences.map((exp, idx) => (
                        <div key={idx} className="grid grid-cols-1 gap-2 border rounded-md p-2 bg-white">
                          <input
                            placeholder="Công ty"
                            value={exp.company_name}
                            onChange={(e) =>
                              setExperiences(
                                experiences.map((item, i) =>
                                  i === idx ? { ...item, company_name: e.target.value } : item
                                )
                              )
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                          <input
                            placeholder="Vị trí"
                            value={exp.position}
                            onChange={(e) =>
                              setExperiences(
                                experiences.map((item, i) =>
                                  i === idx ? { ...item, position: e.target.value } : item
                                )
                              )
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                          />
                          <textarea
                            placeholder="Mô tả"
                            value={exp.description}
                            onChange={(e) =>
                              setExperiences(
                                experiences.map((item, i) =>
                                  i === idx ? { ...item, description: e.target.value } : item
                                )
                              )
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              placeholder="Bắt đầu"
                              value={exp.start_date}
                              onChange={(e) =>
                                setExperiences(
                                  experiences.map((item, i) =>
                                    i === idx ? { ...item, start_date: e.target.value } : item
                                  )
                                )
                              }
                              className="rounded border border-gray-200 px-2 py-1 text-xs"
                            />
                            <input
                              type="date"
                              placeholder="Kết thúc"
                              value={exp.end_date}
                              onChange={(e) =>
                                setExperiences(
                                  experiences.map((item, i) =>
                                    i === idx ? { ...item, end_date: e.target.value } : item
                                  )
                                )
                              }
                              className="rounded border border-gray-200 px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Đường</label>
                    <input
                      value={newAddressStreet}
                      onChange={(e) => setNewAddressStreet(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Số nhà, đường"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-600">Tỉnh/TP</label>
                      <select
                        value={newAddressProvince}
                        onChange={(e) => setNewAddressProvince(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {provinceData?.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phường/Xã</label>
                      <select
                        value={newAddressWard}
                        onChange={(e) => setNewAddressWard(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                      >
                        <option value="">Chọn phường/xã</option>
                        {wardData
                          ?.filter(
                            (w) =>
                              !newAddressProvince ||
                              String(w.province_code) === String(newAddressProvince)
                          )
                          .map((w) => (
                            <option key={w.code} value={w.code}>
                              {w.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                  >
                    {createMutation.isPending ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          {/* TOOLBAR */}
          <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
            <div className="flex flex-1 w-full md:w-auto items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={verified}
                onChange={(e) => setVerified(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Xác thực (tất cả)</option>
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Sắp xếp</option>
                <option value="full_name">Tên</option>
                <option value="created_at">Ngày tạo</option>
                <option value="updated_at">Ngày cập nhật</option>
              </select>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  value={minIncome}
                  onChange={(e) => setMinIncome(e.target.value)}
                  placeholder="Lương tối thiểu"
                  className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={maxIncome}
                  onChange={(e) => setMaxIncome(e.target.value)}
                  placeholder="Lương tối đa"
                  className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  placeholder="Exp từ (năm)"
                  className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={maxExp}
                  onChange={(e) => setMaxExp(e.target.value)}
                  placeholder="Exp đến (năm)"
                  className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <select
                  value={graduationRank}
                  onChange={(e) => setGraduationRank(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Trình độ</option>
                  <option value="Cấp 1">Cấp 1</option>
                  <option value="Cấp 2">Cấp 2</option>
                  <option value="Cấp 3">Cấp 3</option>
                  <option value="Đại học">Đại học</option>
                </select>
                <select
                  value={employed}
                  onChange={(e) => setEmployed(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Tình trạng việc làm</option>
                  <option value="true">Đã có việc</option>
                  <option value="false">Chưa có việc</option>
                </select>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={awaitingInterview}
                    onChange={(e) => setAwaitingInterview(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  Đang chờ phỏng vấn
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Ngành mong muốn:</span>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={fields.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) setFields([...fields, opt]);
                        else setFields(fields.filter((f) => f !== opt));
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {selectedRows.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors animate-in fade-in disabled:opacity-60"
                >
                  <Trash2 size={16} /> Xóa ({selectedRows.length})
                </button>
              )}
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto min-h-[400px]">
            {/* 1. TRƯỜNG HỢP LOADING */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2
                  size={40}
                  className="animate-spin text-orange-500 mb-2"
                />
                <p>Đang tải dữ liệu...</p>
              </div>
            )}

            {/* 2. TRƯỜNG HỢP LỖI */}
            {isError && (
              <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <XCircle size={40} className="mb-2" />
                <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
              </div>
            )}

            {/* 3. TRƯỜNG HỢP CÓ DỮ LIỆU */}
            {!isLoading && !isError && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer w-4 h-4"
                        checked={
                          candidates.length > 0 &&
                          selectedRows.length === candidates.length
                        }
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="p-4">Thông tin ứng viên</th>
                    <th className="p-4">Mong muốn & Kỹ năng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-gray-500"
                      >
                        Không tìm thấy ứng viên nào.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((user) => (
                      <tr
                        key={user.candidate_id}
                        className={`hover:bg-orange-50/40 transition-colors group ${
                          selectedRows.includes(user.candidate_id)
                            ? "bg-orange-50/30"
                            : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer w-4 h-4"
                            checked={selectedRows.includes(user.candidate_id)}
                            onChange={() => toggleRow(user.candidate_id)}
                          />
                        </td>

                        {/* Info Column */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-100 shadow-sm shrink-0">
                              {user.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">
                                {user.full_name}
                              </p>
                              <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-3">
                                <span>{user.email}</span>
                                <span className="hidden sm:inline text-gray-300">
                                  |
                                </span>
                                <span>{user.phone || "Chưa cập nhật"}</span>
                              </div>
                              <div className="mt-1 inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                {user.graduation_rank || "Chưa cập nhật"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Career/Wish Column */}
                        <td className="p-4 max-w-xs">
                          <div className="mb-1 font-bold text-orange-600">
                            {formatCurrency(user.minimum_income)}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {parseTags(user.fields_wish)
                              .slice(0, 3)
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            {parseTags(user.fields_wish).length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{parseTags(user.fields_wish).length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="p-4 space-y-2">
                          {user.is_verified ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit border border-green-100">
                              <CheckCircle2 size={12} /> Đã xác thực
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit border border-gray-200">
                              <XCircle size={12} /> Chưa xác thực
                            </div>
                          )}

                          {user.is_employed && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full w-fit border border-purple-100">
                              <Briefcase size={12} /> Đã có việc
                            </div>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/candidates/view/${user.candidate_id}`
                                )
                              }
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => printCandidateProfile(user)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="In"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/candidates/edit/${user.candidate_id}`
                                )
                              }
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/jobs/suggested?candidate_id=${user.candidate_id}`
                                )
                              }
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="Gợi ý việc làm"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Xóa"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDeleteOne(user.candidate_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION (Giữ nguyên hoặc làm sau) */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 gap-4 bg-gray-50/50">
            <span className="font-medium">
              Tổng số: {filteredCandidates.length} ứng viên
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
