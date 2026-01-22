// File: src/components/CandidateDetailModal.tsx
import React from "react";
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any; // Type any cho nhanh, nên define interface kỹ hơn
}

const CandidateDetailModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Hồ sơ ứng viên</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-gray-100 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="flex gap-5 items-start">
            <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600 shrink-0">
              {(candidate.full_name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {candidate.full_name}
              </h2>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail size={16} /> {candidate.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} /> {candidate.phone || "Chưa cập nhật"}
                </p>
                {candidate.address && (
                  <p className="flex items-center gap-2">
                    <MapPin size={16} /> {candidate.address.street || "..."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase size={18} /> Thông tin nghề nghiệp
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <strong>Ngành nghề:</strong> {candidate.major || "Chưa rõ"}
                </li>
                <li>
                  <strong>Kinh nghiệm:</strong>{" "}
                  {candidate.experience_years || 0} năm
                </li>
                <li>
                  <strong>Loại công việc:</strong>{" "}
                  {candidate.job_type || "Toàn thời gian"}
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <GraduationCap size={18} /> Học vấn & Kỹ năng
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <strong>Trình độ:</strong>{" "}
                  {candidate.graduation_rank || "Đại học"}
                </li>
                <li>
                  <strong>Tin học:</strong>{" "}
                  {candidate.computer_skill || "Cơ bản"}
                </li>
                <li>
                  <strong>Ngày nộp đơn:</strong>{" "}
                  {candidate.applied_at
                    ? new Date(candidate.applied_at).toLocaleDateString("vi-VN")
                    : "—"}
                </li>
              </ul>
            </div>
          </div>

          {/* Note: Có thể thêm phần hiển thị CV PDF nếu có link */}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
