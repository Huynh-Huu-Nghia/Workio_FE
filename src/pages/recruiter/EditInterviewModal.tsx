// File: src/components/EditInterviewModal.tsx
import React, { useEffect, useState } from "react";
import { X, Calendar, MapPin, FileText, Globe, Link as LinkIcon } from "lucide-react";
import { useUpdateRecruiterInterviewMutation } from "@/api/recruiter.api";
import { toast } from "react-toastify";

interface EditInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any; 
}

const EditInterviewModal: React.FC<EditInterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
}) => {
  const updateMutation = useUpdateRecruiterInterviewMutation();
  
  const [scheduledTime, setScheduledTime] = useState("");
  const [interviewType, setInterviewType] = useState<"Online" | "Offline">("Online");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Đang diễn ra");

  useEffect(() => {
    if (interview && isOpen) {
        try {
            // Convert to Local ISO String for input
            const date = new Date(interview.scheduled_time);
            // Trick để lấy định dạng YYYY-MM-DDTHH:mm theo giờ địa phương
            const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            setScheduledTime(localIso);
        } catch (e) {
            setScheduledTime("");
        }

        setInterviewType(interview.interview_type || "Online");
        setLocation(interview.location || "");
        setNotes(interview.notes || "");
        setStatus(interview.status || "Đang diễn ra");
    }
  }, [interview, isOpen]);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        scheduled_time: new Date(scheduledTime).toISOString(), // Convert back to UTC ISO
        interview_type: interviewType,
        location: location,
        notes: notes,
        status: status
      };

      await updateMutation.mutateAsync({
          interviewId: interview.id,
          payload
      });
      
      toast.success("Cập nhật lịch phỏng vấn thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.mes || "Cập nhật thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa lịch hẹn</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Trạng thái */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
            <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 outline-none"
            >
                <option value="Đang diễn ra">Đang diễn ra</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>

          {/* Thời gian */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Thời gian</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Hình thức & Địa điểm */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hình thức</label>
            <div className="flex gap-4 mb-3">
              <label className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${interviewType === "Online" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200"}`}>
                <input type="radio" value="Online" checked={interviewType === "Online"} onChange={() => setInterviewType("Online")} className="hidden"/>
                <Globe size={16} /> Online
              </label>
              <label className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${interviewType === "Offline" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200"}`}>
                <input type="radio" value="Offline" checked={interviewType === "Offline"} onChange={() => setInterviewType("Offline")} className="hidden"/>
                <MapPin size={16} /> Offline
              </label>
            </div>
            
            <div className="relative">
                {interviewType === "Online" ? <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /> : <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={interviewType === "Online" ? "Link cuộc họp" : "Địa điểm văn phòng"}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 outline-none"
                />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Hủy bỏ</button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInterviewModal;