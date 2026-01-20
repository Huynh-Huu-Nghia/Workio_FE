import React, { useEffect, useState } from "react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { useForm } from "react-hook-form";
import {
  useCreateRecruiterJobPostMutation,
  useUpdateRecruiterJobPostMutation,
  useRecruiterJobPostDetailQuery,
  useDeleteRecruiterJobPostMutation,
} from "@/api/recruiter.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import path from "@/constants/path";
import { ArrowLeft, Trash2, Save, Plus, X } from "lucide-react";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

// --- CONSTANTS ĐỒNG BỘ 100% VỚI MODEL ---
const RECRUITMENT_TYPES = ["Phỏng vấn", "Kiểm tra", "Thử việc"];
const JOB_TYPES = ["Văn phòng", "Sản xuất", "Giao dịch"];
const WORKING_TIMES = ["Giờ hành chính", "Ca kíp", "Khác"];
const RANKS = ["Cấp 1", "Cấp 2", "Cấp 3", "Đại học"];
const COMPUTER_SKILLS = ["Văn phòng", "Kỹ thuật viên", "Trung cấp", "Khác"];
const BENEFITS = ["Bảo hiểm y tế", "Chương trình đào tạo", "Thưởng"];

// Helper Components
const FormSection = ({ title, children }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InputGroup = ({ label, required, children, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <span className="text-xs text-red-500 mt-1">{error.message}</span>}
  </div>
);

type FormValues = {
  position: string;
  available_quantity: number;
  monthly_salary: number;
  
  recruitment_type: string;
  duration: string;
  benefits: string; // Model là ENUM nhưng FE thường cho chọn 1, ở đây ta map select
  graduation_rank: string;
  computer_skill: string;
  job_type: string;
  working_time: string;
  status: string;
  
  application_deadline_to: string;
  requirements: string;
  other_requirements: string;
  support_info: string;
  description: string; // Model không có description ở root, có thể là mapping vào requirements hoặc bỏ qua
  
  fields: string[]; 
  languguages: string[]; 
};

export default function RecruiterJobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const pageTitle = isEdit ? "Chỉnh sửa tin tuyển dụng" : "Đăng tin mới";

  const { data: detailRes, isLoading: isLoadingDetail } = useRecruiterJobPostDetailQuery(id);
  const createMutation = useCreateRecruiterJobPostMutation();
  const updateMutation = useUpdateRecruiterJobPostMutation();
  const deleteMutation = useDeleteRecruiterJobPostMutation();

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<FormValues>({
    defaultValues: {
      position: "",
      available_quantity: 1,
      monthly_salary: 0,
      status: "Đang mở",
      
      // Default Values theo Model
      recruitment_type: "Phỏng vấn",
      job_type: "Văn phòng",
      working_time: "Giờ hành chính",
      graduation_rank: "Đại học",
      computer_skill: "Văn phòng",
      duration: "Toàn thời gian",
      benefits: "Bảo hiểm y tế",
      
      application_deadline_to: "",
      requirements: "",
      other_requirements: "",
      support_info: "",
      
      fields: [],
      languguages: [],
    },
  });

  // Watch values để render UI và xử lý Submit
  const selectedFields = watch("fields") || [];
  const selectedLangs = watch("languguages") || [];
  const [langInput, setLangInput] = useState("");

  // Đăng ký thủ công các trường mảng
  useEffect(() => {
    register("fields");
    register("languguages");
  }, [register]);

  // --- LOAD DATA ---
  useEffect(() => {
    if (isEdit && detailRes?.data) {
      const job = detailRes.data;
      
      // Hàm parse JSON an toàn
      const parseArr = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return []; }
        }
        return [];
      };

      reset({
        ...job,
        application_deadline_to: job.application_deadline_to ? String(job.application_deadline_to).split('T')[0] : "",
        fields: parseArr(job.fields),
        languguages: parseArr(job.languguages || job.languages), // Lấy đúng tên trường model (3 chữ u)
        
        // Fallback giá trị nếu null
        recruitment_type: job.recruitment_type || "Phỏng vấn",
        job_type: job.job_type || "Văn phòng",
        working_time: job.working_time || "Giờ hành chính",
        graduation_rank: job.graduation_rank || "Đại học",
        computer_skill: job.computer_skill || "Văn phòng",
        duration: job.duration || "Toàn thời gian",
        benefits: job.benefits || "Bảo hiểm y tế",
      });
    }
  }, [isEdit, detailRes, reset]);

  // --- HANDLERS ---
  const addLanguage = () => {
    const val = langInput.trim();
    if (val && !selectedLangs.includes(val)) {
      const newVal = [...selectedLangs, val];
      setValue("languguages", newVal, { shouldDirty: true });
      setLangInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    const newVal = selectedLangs.filter(l => l !== lang);
    setValue("languguages", newVal, { shouldDirty: true });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        available_quantity: Number(data.available_quantity),
        monthly_salary: Number(data.monthly_salary),
        application_deadline_to: data.application_deadline_to || null,
        // FIX: Lấy trực tiếp từ biến watch để đảm bảo dữ liệu mới nhất
        fields: selectedFields,
        languguages: selectedLangs, 
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, payload });
        toast.success("Cập nhật tin thành công!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Đăng tin mới thành công!");
      }
      navigate(path.RECRUITER_JOBS);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.mes || "Lỗi lưu tin.");
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Xóa tin này?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Đã xóa.");
      navigate(path.RECRUITER_JOBS);
    } catch { toast.error("Xóa thất bại."); }
  };

  if (isEdit && isLoadingDetail) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <RecruiterLayout title={pageTitle}>
      <div className="max-w-6xl mx-auto pb-10">
        <div className="flex justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-orange-600 font-medium">
            <ArrowLeft size={20} className="mr-2"/> Quay lại
          </button>
          <div className="flex gap-2">
            {isEdit && <button onClick={handleDelete} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg"><Trash2 size={18}/></button>}
            <button onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex gap-2">
              <Save size={18}/> Lưu tin
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <FormSection title="Thông tin cơ bản">
                    <InputGroup label="Tiêu đề vị trí" required error={errors.position}>
                        <input {...register("position", { required: "Bắt buộc" })} className="form-input" placeholder="VD: Nhân viên kinh doanh" />
                    </InputGroup>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Số lượng"><input type="number" {...register("available_quantity")} className="form-input" /></InputGroup>
                        <InputGroup label="Mức lương"><input type="number" {...register("monthly_salary")} className="form-input" /></InputGroup>
                    </div>

                    <InputGroup label="Ngành nghề">
                        <select className="form-input mb-2" onChange={(e) => {
                                const val = e.target.value;
                                if(val && !selectedFields.includes(val)) setValue("fields", [...selectedFields, val], { shouldDirty: true });
                                e.target.value = "";
                            }}>
                            <option value="">-- Chọn ngành --</option>
                            {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {selectedFields.map(f => (
                                <span key={f} className="tag-item">{f} <button type="button" onClick={() => setValue("fields", selectedFields.filter(i => i !== f), { shouldDirty: true })}><X size={12}/></button></span>
                            ))}
                        </div>
                    </InputGroup>

                    {/* FIX: INPUT NGÔN NGỮ */}
                    <InputGroup label="Yêu cầu ngôn ngữ (Languages)">
                        <div className="flex gap-2 mb-2">
                            <input 
                                className="form-input"
                                value={langInput}
                                onChange={(e) => setLangInput(e.target.value)}
                                placeholder="VD: Tiếng Anh, Tiếng Trung"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                            />
                            <button type="button" onClick={addLanguage} className="px-3 bg-gray-100 rounded hover:bg-gray-200"><Plus size={18}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedLangs.map(l => (
                                <span key={l} className="tag-item bg-blue-50 text-blue-700 border-blue-100">
                                    {l} <button type="button" onClick={() => removeLanguage(l)}><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                    </InputGroup>
                </FormSection>

                <FormSection title="Chi tiết yêu cầu">
                    <InputGroup label="Mô tả công việc"><textarea {...register("requirements")} rows={5} className="form-input" placeholder="Mô tả chi tiết công việc..."/></InputGroup>
                    <InputGroup label="Yêu cầu khác"><textarea {...register("other_requirements")} rows={3} className="form-input" placeholder="Yêu cầu bổ sung..."/></InputGroup>
                    <InputGroup label="Thông tin hỗ trợ"><textarea {...register("support_info")} rows={2} className="form-input" placeholder="Xe đưa đón, Cơm trưa..." /></InputGroup>
                </FormSection>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-700 uppercase text-xs mb-4">Cấu hình tin</h3>
                    
                    <InputGroup label="Trạng thái">
                        <select {...register("status")} className="form-input font-bold text-orange-700">
                            <option value="Đang mở">🟢 Đang mở</option>
                            <option value="Đang xem xét">🟡 Đang xem xét</option>
                            <option value="Đã tuyển">🔴 Đã tuyển</option>
                            <option value="Đã hủy">⚫ Đã hủy</option>
                        </select>
                    </InputGroup>
                    
                    <InputGroup label="Hạn nộp"><input type="date" {...register("application_deadline_to")} className="form-input" /></InputGroup>
                    
                    {/* SELECT BOX THEO MODEL */}
                    <InputGroup label="Hình thức tuyển">
                         <select {...register("recruitment_type")} className="form-input">
                            {RECRUITMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Loại công việc">
                        <select {...register("job_type")} className="form-input">
                            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Thời gian làm việc">
                        <select {...register("working_time")} className="form-input">
                            {WORKING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Xếp loại tốt nghiệp">
                        <select {...register("graduation_rank")} className="form-input">
                            {RANKS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Kỹ năng tin học">
                        <select {...register("computer_skill")} className="form-input">
                            {COMPUTER_SKILLS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Phúc lợi chính">
                        <select {...register("benefits")} className="form-input">
                            {BENEFITS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </InputGroup>
                    <InputGroup label="Thời hạn">
                         <select {...register("duration")} className="form-input">
                            <option value="Toàn thời gian">Toàn thời gian</option>
                            <option value="Bán thời gian">Bán thời gian</option>
                            <option value="Hợp đồng">Hợp đồng</option>
                            <option value="Thực tập">Thực tập</option>
                            <option value="6 tháng">6 tháng</option>
                            <option value="12 tháng">12 tháng</option>
                        </select>
                    </InputGroup>
                 </div>
            </div>
        </div>
      </div>
      <style>{`.form-input { width: 100%; border-radius: 0.5rem; border: 1px solid #e2e8f0; padding: 0.5rem; font-size: 0.875rem; outline: none; } .form-input:focus { border-color: #f97316; box-shadow: 0 0 0 1px #f97316; } .tag-item { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; border-radius: 999px; font-size: 11px; font-weight: 500; }`}</style>
    </RecruiterLayout>
  );
}