import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  Download,
  Loader2,
  Sparkles,
  Search,
  Tags,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import type { JobPost } from "@/api/job-post.api";
import {
  useDeleteAdminJobPostMutation,
  useGetAdminJobPostsQuery,
  useCreateAdminJobPostMutation,
  useAdminSuggestedCandidatesQuery,
} from "@/api/job-post.api";
import { Link } from "react-router-dom";
import {
  ADMIN_APPLICATION_FORM_DOC_URL,
  ADMIN_RECRUITMENT_NOTICE_PDF_URL,
} from "@/constants/documents";
import path from "@/constants/path";
import { INDUSTRY_OPTIONS } from "@/constants/industries";
import { useGetAllRecruitersQuery } from "@/api/recruiter.api";

const JobList: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newRecruiter, setNewRecruiter] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newRecruitmentType, setNewRecruitmentType] = useState("Full-time");
  const [newStatus, setNewStatus] = useState("Đang mở");
  const [newDuration, setNewDuration] = useState("");
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [newRequirements, setNewRequirements] = useState("");
  const [newSupport, setNewSupport] = useState("");
  const [newBenefits, setNewBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");
  const [newFields, setNewFields] = useState<string[]>([]);
  const [newGraduation, setNewGraduation] = useState("");
  const [newComputerSkill, setNewComputerSkill] = useState("");
  const [newJobType, setNewJobType] = useState("");
  const [newWorkingTime, setNewWorkingTime] = useState("");
  const [newOtherReq, setNewOtherReq] = useState("");
  const [newLanguages, setNewLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");
  const recruitersRes = useGetAllRecruitersQuery();
  const recruiterOptions = (recruitersRes.data as any)?.data || [];
  const [activeSuggestJobId, setActiveSuggestJobId] = useState<string | null>(null);
  const {
    data: suggestData,
    isFetching: suggestLoading,
    refetch: refetchSuggest,
  } = useAdminSuggestedCandidatesQuery(activeSuggestJobId || "", {
    enabled: Boolean(activeSuggestJobId),
  });

  useEffect(() => {
    if (activeSuggestJobId) {
      refetchSuggest();
    }
  }, [activeSuggestJobId, refetchSuggest]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobPost["status"]>(
    "all"
  );
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [fields, setFields] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [jobType, setJobType] = useState("");
  const [workingTime, setWorkingTime] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminJobPostsQuery({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sort_by: sortBy || undefined,
    order,
    fields: fields.length ? fields : undefined,
    salary_from: minSalary || undefined,
    salary_to: maxSalary || undefined,
    job_type: jobType || undefined,
    working_time: workingTime || undefined,
  });
  const deleteMutation = useDeleteAdminJobPostMutation();
  const createMutation = useCreateAdminJobPostMutation();
  const jobs = data?.data ?? [];

  const parseFields = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return [val];
      }
    }
    return [];
  };

  const filtered = useMemo(() => {
    return jobs.filter((job: any) => {
      if (fields.length) {
        const jf = parseFields(job.fields);
        if (!jf.some((f) => fields.includes(f))) return false;
      }
      if (jobType && job.job_type !== jobType) return false;
      if (workingTime && job.working_time !== workingTime) return false;
      if (minSalary && Number(job.monthly_salary || 0) < Number(minSalary)) return false;
      if (maxSalary && Number(job.monthly_salary || 0) > Number(maxSalary)) return false;
      return true;
    });
  }, [jobs, fields, jobType, workingTime, minSalary, maxSalary]);

  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") return "Thỏa thuận";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(value)
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecruiter || !newPosition.trim()) {
      alert("Chọn nhà tuyển dụng và nhập vị trí");
      return;
    }
    try {
      const res = await createMutation.mutateAsync({
        recruiterId: newRecruiter,
        payload: {
          position: newPosition.trim(),
          available_quantity: newQty ? Number(newQty) : undefined,
          monthly_salary: newSalary ? Number(newSalary) : undefined,
          recruitment_type: newRecruitmentType || undefined,
          status: newStatus || undefined,
          duration: newDuration || undefined,
          application_deadline_from: deadlineFrom || undefined,
          application_deadline_to: deadlineTo || undefined,
          requirements: newRequirements || undefined,
          support_info: newSupport || undefined,
          benefits: newBenefits,
          fields: newFields,
          graduation_rank: newGraduation || undefined,
          computer_skill: newComputerSkill || undefined,
          job_type: newJobType || undefined,
          working_time: newWorkingTime || undefined,
          other_requirements: newOtherReq || undefined,
          languguages: newLanguages,
        },
      } as any);
      if ((res as any)?.err === 0) {
        alert((res as any)?.mes || "Đã tạo tin tuyển dụng");
        setShowCreate(false);
        setNewRecruiter("");
        setNewPosition("");
        setNewQty("");
        setNewSalary("");
        setNewRecruitmentType("Full-time");
        setNewStatus("Đang mở");
        setNewDuration("");
        setDeadlineFrom("");
        setDeadlineTo("");
        setNewRequirements("");
        setNewSupport("");
        setNewBenefits([]);
        setBenefitInput("");
        setNewFields([]);
        setNewGraduation("");
        setNewComputerSkill("");
        setNewJobType("");
        setNewWorkingTime("");
        setNewOtherReq("");
        setNewLanguages([]);
        setLanguageInput("");
        refetch();
      } else alert((res as any)?.mes || "Tạo thất bại");
    } catch (err: any) {
      alert(err?.response?.data?.mes || "Tạo thất bại");
    }
  };

  return (
    <AdminLayout
      title="Tin tuyển dụng"
      activeMenu="jobs"
      activeSubmenu="all-jobs"
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý tin đăng</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi và lọc tin tuyển dụng.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
            <a
              href={ADMIN_RECRUITMENT_NOTICE_PDF_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              title="Tải Thông báo tuyển dụng"
            >
              <Download className="h-4 w-4" />
              Thông báo tuyển dụng
            </a>
            <a
              href={ADMIN_APPLICATION_FORM_DOC_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              title="Tải Phiếu đăng ký dự tuyển"
            >
              <Download className="h-4 w-4" />
              Phiếu đăng ký dự tuyển
            </a>
            <Link
              to={path.ADMIN_JOB_CREATE}
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              + Thêm tin
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              + Thêm nhanh
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm vị trí, ngành nghề"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:min-w-[260px]"
              />
            </div>
            <select
              value={statusFilter || "all"}
              onChange={(e) =>
                setStatusFilter(
                  (e.target.value === "all" ? "all" : e.target.value) as
                    | "all"
                    | JobPost["status"]
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang mở">Đang mở</option>
              <option value="Đang xem xét">Đang xem xét</option>
              <option value="Đã tuyển">Đã tuyển</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="">Sắp xếp</option>
              <option value="position">Vị trí</option>
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
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="Lương từ"
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="Lương đến"
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Loại công việc</option>
                <option value="Văn phòng">Văn phòng</option>
                <option value="Sản xuất">Sản xuất</option>
                <option value="Giao dịch">Giao dịch</option>
              </select>
              <select
                value={workingTime}
                onChange={(e) => setWorkingTime(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Thời gian làm việc</option>
                <option value="Giờ hành chính">Giờ hành chính</option>
                <option value="Ca kíp">Ca kíp</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>
        </div>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-10">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Thêm tin nhanh</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Nhà tuyển dụng *</label>
                    <select
                      value={newRecruiter}
                      onChange={(e) => setNewRecruiter(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                      required
                    >
                      <option value="">Chọn nhà tuyển dụng</option>
                      {recruiterOptions.map((rec: any) => (
                        <option key={rec.recruiter_id} value={rec.recruiter_id}>
                          {rec.company_name || rec.user?.email || rec.recruiter_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Vị trí *</label>
                    <input
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="VD: Kế toán"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Số lượng</label>
                    <input
                      type="number"
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Mức lương (VNĐ)</label>
                    <input
                      type="number"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="15000000"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Hình thức</label>
                    <select
                      value={newRecruitmentType}
                      onChange={(e) => setNewRecruitmentType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Intern">Intern</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Trạng thái</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="Đang mở">Đang mở</option>
                      <option value="Đang xem xét">Đang xem xét</option>
                      <option value="Đã tuyển">Đã tuyển</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Thời hạn</label>
                    <input
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="6 tháng"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Hạn nộp từ</label>
                    <input
                      type="date"
                      value={deadlineFrom}
                      onChange={(e) => setDeadlineFrom(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Hạn nộp đến</label>
                    <input
                      type="date"
                      value={deadlineTo}
                      onChange={(e) => setDeadlineTo(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Loại công việc</label>
                    <select
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">Chọn</option>
                      <option value="Developer">Developer</option>
                      <option value="Tester">Tester</option>
                      <option value="Designer">Designer</option>
                      <option value="Business Analyst">Business Analyst</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Giờ làm việc</label>
                    <select
                      value={newWorkingTime}
                      onChange={(e) => setNewWorkingTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                    >
                      <option value="">Chọn</option>
                      <option value="Giờ hành chính">Giờ hành chính</option>
                      <option value="Ca kíp">Ca kíp</option>
                      <option value="Linh hoạt">Linh hoạt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Xếp loại tốt nghiệp</label>
                    <input
                      value={newGraduation}
                      onChange={(e) => setNewGraduation(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Khá"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Kỹ năng máy tính</label>
                    <input
                      value={newComputerSkill}
                      onChange={(e) => setNewComputerSkill(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Thành thạo..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Yêu cầu</label>
                    <textarea
                      value={newRequirements}
                      onChange={(e) => setNewRequirements(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      rows={2}
                      placeholder="Yêu cầu chính"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Yêu cầu khác</label>
                    <textarea
                      value={newOtherReq}
                      onChange={(e) => setNewOtherReq(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      rows={2}
                      placeholder="Khả năng teamwork..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Hỗ trợ</label>
                    <input
                      value={newSupport}
                      onChange={(e) => setNewSupport(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Hỗ trợ chỗ ở..."
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phúc lợi (Enter để thêm)</label>
                    <div className="mt-1 flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                      {newBenefits.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700"
                        >
                          {b}
                          <button
                            type="button"
                            onClick={() => setNewBenefits(newBenefits.filter((x) => x !== b))}
                            className="text-green-500 hover:text-green-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        value={benefitInput}
                        onChange={(e) => setBenefitInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = benefitInput.trim();
                            if (val && !newBenefits.includes(val)) setNewBenefits([...newBenefits, val]);
                            setBenefitInput("");
                          }
                        }}
                        className="flex-1 min-w-[120px] border-none outline-none"
                        placeholder={newBenefits.length ? "" : "Bảo hiểm, Teambuilding..."}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Ngành liên quan</label>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-700">
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
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
                </div>

                <div>
                  <label className="text-sm text-gray-600">Ngôn ngữ (Enter để thêm)</label>
                  <div className="mt-1 flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                    {newLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => setNewLanguages(newLanguages.filter((l) => l !== lang))}
                          className="text-purple-500 hover:text-purple-700"
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
                          if (val && !newLanguages.includes(val)) setNewLanguages([...newLanguages, val]);
                          setLanguageInput("");
                        }
                      }}
                      className="flex-1 min-w-[120px] border-none outline-none"
                      placeholder={newLanguages.length ? "" : "English, Vietnamese..."}
                    />
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
        <div className="flex flex-wrap gap-2 text-xs text-gray-700 px-5 pb-4">
          <span className="text-xs text-gray-500">Ngành:</span>
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
          <button
            onClick={() => refetch()}
            className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Làm mới
          </button>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải danh sách tin tuyển dụng.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Không có tin nào phù hợp.
              </div>
            ) : (
              filtered.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col gap-3 p-5 hover:bg-orange-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {job.position}
                        </h3>
                        <p className="text-sm text-gray-500">
                          NTD: {(job as any).recruiter?.company_name || "Không rõ"} | SL:{" "}
                          {job.available_quantity ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={job.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Hạn: {job.application_deadline_to || "—"}
                    </span>
                    <span>Mức lương: {formatCurrency(job.monthly_salary)}</span>
                    <span>Loại: {job.recruitment_type || "—"}</span>
                    <div className="flex flex-wrap gap-1">
                      {job.fields &&
                        (Array.isArray(job.fields) ? job.fields : [job.fields])
                          .slice(0, 3)
                          .map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                            >
                              <Tags className="h-3 w-3" />
                              {f}
                            </span>
                          ))}
                    </div>
                  </div>

                  {expandedId === job.id && (
                    <div className="space-y-2 rounded-lg border border-orange-100 bg-orange-50/50 p-3 text-sm text-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>Hạn nộp: {job.application_deadline_from || "—"} → {job.application_deadline_to || "—"}</div>
                        <div>Thời gian: {job.duration || "—"}</div>
                        <div>Loại tuyển: {job.recruitment_type || "—"}</div>
                        <div>Mức lương: {formatCurrency(job.monthly_salary)}</div>
                        <div>Loại công việc: {job.job_type || "—"}</div>
                        <div>Giờ làm: {job.working_time || "—"}</div>
                        <div>Tốt nghiệp: {job.graduation_rank || "—"}</div>
                        <div>Kỹ năng máy tính: {job.computer_skill || "—"}</div>
                        <div>Yêu cầu khác: {job.other_requirements || "—"}</div>
                        <div>Hỗ trợ: {job.support_info || "—"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {job.fields &&
                          (Array.isArray(job.fields) ? job.fields : [job.fields]).map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-blue-200"
                            >
                              <Tags className="h-3 w-3" />
                              {f}
                            </span>
                          ))}
                        {job.languguages &&
                          (Array.isArray(job.languguages) ? job.languguages : [job.languguages]).map(
                            (lang) => (
                              <span
                                key={lang}
                                className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-purple-700 ring-1 ring-purple-200"
                              >
                                {lang}
                              </span>
                            )
                          )}
                        {job.benefits &&
                          (Array.isArray(job.benefits) ? job.benefits : [job.benefits]).map((b) => (
                            <span
                              key={b}
                              className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-green-700 ring-1 ring-green-200"
                            >
                              {b}
                            </span>
                          ))}
                      </div>
                      {job.requirements && (
                        <p className="text-sm text-gray-700">Yêu cầu: {job.requirements}</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      to={`/admin/jobs/edit/${job.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      title="Chỉnh sửa tin"
                    >
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveSuggestJobId(job.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      title="Gợi ý ứng viên phù hợp"
                    >
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      Gợi ý ứng viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {expandedId === job.id ? "Thu gọn" : "Xem chi tiết"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Xóa tin tuyển dụng này?")) return;
                        try {
                          const res = await deleteMutation.mutateAsync(job.id);
                          if ((res as any)?.err === 0) {
                            await refetch();
                          } else {
                            window.alert((res as any)?.mes || "Xóa thất bại");
                          }
                        } catch (e: any) {
                          window.alert(e?.response?.data?.mes || "Xóa thất bại");
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      title="Xóa tin"
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
        {activeSuggestJobId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-orange-700">
                    Gợi ý ứng viên cho tin {activeSuggestJobId}
                  </p>
                  <p className="text-xs text-orange-600">
                    {suggestLoading ? "Đang tải gợi ý..." : "Danh sách ứng viên phù hợp:"}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSuggestJobId(null)}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
              {suggestLoading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {!suggestLoading && (suggestData as any)?.data?.length === 0 && (
                <div className="text-sm text-gray-500">Không có gợi ý.</div>
              )}
              {!suggestLoading &&
                (suggestData as any)?.data?.map((c: any) => (
                  <div
                    key={c.candidate_id}
                    className="flex items-center justify-between border-b border-orange-50 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{c.full_name}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </div>
                    <span className="text-xs text-orange-600">
                      {Array.isArray(c.fields_wish) ? c.fields_wish.join(", ") : c.fields_wish}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const StatusPill: React.FC<{ status?: string | null }> = ({ status }) => {
  let classes = "bg-gray-100 text-gray-600";
  if (status === "Đang mở") classes = "bg-green-50 text-green-700";
  else if (status === "Đang xem xét") classes = "bg-yellow-50 text-yellow-700";
  else if (status === "Đã tuyển") classes = "bg-blue-50 text-blue-700";
  else if (status === "Đã hủy") classes = "bg-red-50 text-red-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status || "Chưa đặt trạng thái"}
    </span>
  );
};

export default JobList;
