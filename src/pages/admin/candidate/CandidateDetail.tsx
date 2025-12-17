import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  Award,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";

// --- 1. MOCK DATA (Dữ liệu giả lập - Sau này thay bằng API getOne) ---
const MOCK_DETAIL = {
  candidate_id: "uuid-123",
  full_name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone: "0909123456",
  avatar: null, // Chưa có ảnh
  gender: "Nam",
  date_of_birth: "1998-05-20",
  place_of_birth: "TP.HCM",
  ethnicity: "Kinh",

  // Địa chỉ
  addressInfo: {
    street: "123 Lê Lợi",
    ward: "Bến Thành",
    district: "Quận 1",
    province: "Hồ Chí Minh",
  },

  // Mong muốn
  job_type: "Toàn thời gian",
  working_time: "Giờ hành chính",
  minimum_income: 15000000,
  fields_wish: ["Frontend Developer", "ReactJS"],

  // Kỹ năng
  languguages: ["Tiếng Anh (IELTS 6.5)", "Tiếng Nhật (N3)"],
  computer_skill: "Thành thạo",
  other_computer_skill: "Figma, Photoshop cơ bản",
  graduation_rank: "Giỏi",

  // Trạng thái
  is_verified: true,
  is_employed: false,

  // Mảng con
  studyHistories: [
    {
      id: 1,
      school_name: "Đại học Công Nghệ Thông Tin",
      major: "Kỹ thuật phần mềm",
      degree: "Cử nhân",
      start_year: 2016,
      end_year: 2020,
    },
  ],
  workExperiences: [
    {
      id: 1,
      company_name: "FPT Software",
      position: "Junior Frontend Dev",
      start_date: "2021-01-15",
      end_date: "2023-05-30",
      description:
        "Phát triển giao diện Dashboard sử dụng ReactJS, Redux. Tối ưu hiệu năng trang web.",
    },
    {
      id: 2,
      company_name: "Freelance",
      position: "Web Developer",
      start_date: "2020-06-01",
      end_date: "2020-12-30",
      description: "Thiết kế landing page cho các shop bán hàng online.",
    },
  ],
};

export default function CandidateDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<any>(null);

  useEffect(() => {
    // Giả lập gọi API
    setTimeout(() => {
      setCandidate(MOCK_DETAIL);
    }, 500);
  }, [id]);

  // Helper format tiền
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Helper format ngày
  const formatDate = (dateString: string) => {
    if (!dateString) return "Hiện tại";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!candidate) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center text-gray-500">
          Đang tải thông tin hồ sơ...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="CHI TIẾT ỨNG VIÊN"
      activeMenu="candidates"
      activeSubmenu="list-candidates"
    >
      <div className="min-h-screen bg-slate-50 p-6 pb-20">
        {/* --- TOP BAR: Nút Back & Action --- */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition"
          >
            <ArrowLeft size={20} /> Quay lại danh sách
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/candidates/edit/${id}`)}
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <Pencil size={16} /> Chỉnh sửa
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 transition">
              <Trash2 size={16} /> Xóa hồ sơ
            </button>
          </div>
        </div>

        {/* --- 🔥 HEADER PROFILE CARD (ĐÃ CẬP NHẬT CSS) --- */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 group">
          {/* Cover Background (Cao hơn để thoáng) */}
          <div className="h-40 bg-gradient-to-r from-orange-400 to-red-500 relative">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="px-8 pb-6">
            <div className="relative flex flex-col md:flex-row gap-6">
              {/* Avatar (Margin âm để đè lên cover + Viền trắng dày) */}
              <div className="-mt-16 flex-shrink-0">
                <div className="h-32 w-32 rounded-full border-[5px] border-white bg-white shadow-md flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 text-5xl font-bold text-orange-600">
                  {candidate.full_name?.charAt(0)}
                </div>
              </div>

              {/* Thông tin chính (Đẩy xuống bằng margin-top để không sát đường viền) */}
              <div className="flex-1 pt-3 md:pt-0 md:mt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Tên & Job Title */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                        {candidate.full_name}
                      </h1>
                      {candidate.is_verified && (
                        <span
                          className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 border border-blue-100 shadow-sm"
                          title="Tài khoản đã xác thực"
                        >
                          <CheckCircle2 size={12} strokeWidth={3} />{" "}
                          <span className="hidden sm:inline">Verified</span>
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 flex items-center gap-2 text-sm font-medium">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-gray-600">
                        <Briefcase size={14} className="text-orange-500" />
                        {candidate.fields_wish?.join(" • ") ||
                          "Chưa cập nhật ngành nghề"}
                      </span>
                    </p>
                  </div>

                  {/* Contact Box (Tách biệt gọn gàng) */}
                  <div className="flex flex-col gap-2 min-w-[220px] text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white rounded-full text-gray-400 shadow-sm">
                        <Mail size={14} />
                      </div>
                      <span className="font-medium">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white rounded-full text-gray-400 shadow-sm">
                        <Phone size={14} />
                      </div>
                      <span className="font-medium">
                        {candidate.phone || "Chưa cập nhật SĐT"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ⬅ CỘT TRÁI (2 phần) - Kinh nghiệm & Học vấn */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Kinh Nghiệm Làm Việc */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Briefcase className="text-orange-500" size={20} /> Kinh Nghiệm
                Làm Việc
              </h2>

              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-2">
                {candidate.workExperiences.map((exp: any, index: number) => (
                  <div key={index} className="relative pl-8">
                    {/* Dot timeline */}
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-orange-400 shadow-sm"></span>

                    <h3 className="text-base font-bold text-gray-800">
                      {exp.position}
                    </h3>
                    <p className="font-medium text-orange-600">
                      {exp.company_name}
                    </p>
                    <p className="mb-2 text-xs text-gray-400">
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
                {candidate.workExperiences.length === 0 && (
                  <p className="pl-8 text-sm text-gray-400 italic">
                    Chưa cập nhật kinh nghiệm.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Lịch Sử Học Vấn */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <GraduationCap className="text-blue-500" size={20} /> Lịch Sử
                Học Vấn
              </h2>
              <div className="space-y-4">
                {candidate.studyHistories.map((edu: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold border border-blue-100">
                      {edu.start_year}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {edu.school_name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {edu.major} • {edu.degree}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Niên khóa: {edu.start_year} - {edu.end_year}
                      </p>
                    </div>
                  </div>
                ))}
                {candidate.studyHistories.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    Chưa cập nhật học vấn.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ➡ CỘT PHẢI (1 phần) - Thông tin cá nhân */}
          <div className="space-y-6">
            {/* Thông Tin Chung */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <User className="text-purple-500" size={20} /> Thông Tin Cá Nhân
              </h2>
              <ul className="space-y-4 text-sm">
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Ngày sinh</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(candidate.date_of_birth)}
                  </span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Giới tính</span>
                  <span className="font-medium text-gray-900">
                    {candidate.gender}
                  </span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Dân tộc</span>
                  <span className="font-medium text-gray-900">
                    {candidate.ethnicity}
                  </span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Quê quán</span>
                  <span className="font-medium text-gray-900">
                    {candidate.place_of_birth}
                  </span>
                </li>
                <li className="flex flex-col gap-1 pt-1">
                  <span className="text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> Địa chỉ hiện tại
                  </span>
                  <span className="font-medium text-gray-800 leading-snug">
                    {candidate.addressInfo.street}, {candidate.addressInfo.ward}
                    , {candidate.addressInfo.district},{" "}
                    {candidate.addressInfo.province}
                  </span>
                </li>
              </ul>
            </div>

            {/* Kỹ năng & Ngôn ngữ */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Award className="text-green-500" size={20} /> Kỹ Năng
              </h2>

              <div className="mb-5">
                <p className="text-[11px] text-gray-400 mb-2 uppercase font-bold tracking-wider">
                  Ngoại ngữ
                </p>
                <div className="flex flex-wrap gap-2">
                  {candidate.languguages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-100"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[11px] text-gray-400 mb-2 uppercase font-bold tracking-wider">
                  Tin học
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {candidate.computer_skill}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {candidate.other_computer_skill}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-gray-400 mb-2 uppercase font-bold tracking-wider">
                  Xếp loại TN
                </p>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold border border-gray-200">
                  {candidate.graduation_rank}
                </span>
              </div>
            </div>

            {/* Mong muốn */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <DollarSign className="text-yellow-500" size={20} /> Mong Muốn
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">
                    Mức lương tối thiểu
                  </p>
                  <p className="font-bold text-orange-600 text-xl tracking-tight">
                    {formatCurrency(candidate.minimum_income)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Loại công việc</p>
                    <p className="font-medium text-gray-800">
                      {candidate.job_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Thời gian</p>
                    <p className="font-medium text-gray-800">
                      {candidate.working_time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
