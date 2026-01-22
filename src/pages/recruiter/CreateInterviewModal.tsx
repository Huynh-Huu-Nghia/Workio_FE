// File: src/components/CreateInterviewModal.tsx
import React, { useState } from "react";
import { X, Calendar, MapPin, FileText, Globe, Link as LinkIcon } from "lucide-react";
import { useCreateRecruiterInterviewMutation } from "@/api/recruiter.api";
import { toast } from "react-toastify";

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobPostId: string;
  candidateId: string;
  candidateName: string;
  onSuccess?: () => void;
}

const CreateInterviewModal: React.FC<CreateInterviewModalProps> = ({
  isOpen,
  onClose,
  jobPostId,
  candidateId,
  candidateName,
  onSuccess,
}) => {
  const createMutation = useCreateRecruiterInterviewMutation();
  
  const [scheduledTime, setScheduledTime] = useState("");
  const [interviewType, setInterviewType] = useState<"Online" | "Offline">("Online");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledTime) {
      toast.error("Vui lòng chọn thời gian phỏng vấn");
      return;
    }

    try {
      const payload = {
        job_post_id: jobPostId,
        candidate_id: candidateId,
        scheduled_time: new Date(scheduledTime).toISOString(),
        interview_type: interviewType,
        // Logic Location: Nếu Online mà ko nhập link -> Điền mặc định, Nếu Offline -> Lấy input
        location: location || (interviewType === "Online" ? "Google Meet / Zoom (Chờ gửi link)" : "Văn phòng công ty"),
        notes: notes,
        status: "Đang diễn ra" // FIX: Gửi đúng giá trị có trong ENUM DB
      };

      await createMutation.mutateAsync(payload);
      
      toast.success("Đã tạo lịch phỏng vấn thành công!");
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setScheduledTime("");
      setLocation("");
      setNotes("");
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Tạo lịch thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Hẹn phỏng vấn</h3>
            <p className="text-sm text-gray-500">Ứng viên: <span className="font-semibold text-orange-600">{candidateName}</span></p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Thời gian */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Thời gian diễn ra <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Hình thức */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hình thức</label>
            <div className="flex gap-4">
              <label className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition ${interviewType === "Online" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600"}`}>
                <input type="radio" name="type" value="Online" checked={interviewType === "Online"} onChange={() => setInterviewType("Online")} className="hidden"/>
                <Globe size={16} /> Online
              </label>
              <label className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition ${interviewType === "Offline" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600"}`}>
                <input type="radio" name="type" value="Offline" checked={interviewType === "Offline"} onChange={() => setInterviewType("Offline")} className="hidden"/>
                <MapPin size={16} /> Offline
              </label>
            </div>
          </div>

          {/* Địa điểm / Link - Thay đổi UI dựa vào Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {interviewType === "Online" ? "Link cuộc họp (Google Meet/Zoom)" : "Địa điểm phỏng vấn"}
            </label>
            <div className="relative">
                {interviewType === "Online" ? (
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                ) : (
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                )}
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={interviewType === "Online" ? "VD: https://meet.google.com/abc-xyz" : "VD: Phòng 201, Tòa nhà A..."}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú / Lời nhắn</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="VD: Mang theo laptop, CV bản cứng..."
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Đang xử lý..." : "Xác nhận lịch hẹn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewModal;