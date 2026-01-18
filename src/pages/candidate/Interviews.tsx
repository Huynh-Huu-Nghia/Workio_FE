import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  Loader2,
  MapPin,
  XCircle,
  Clock,
  Briefcase,
  Filter,
  ChevronDown,
  ChevronUp,
  Search
} from "lucide-react";
import { useCandidateInterviewsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { INDUSTRY_OPTIONS } from "@/constants/industries";

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

const CandidateInterviews: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Lịch phỏng vấn";
  const { data, isLoading, isError } = useCandidateInterviewsQuery();
  const interviews = data?.data ?? [];
  
  // State bộ lọc
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobType, setJobType] = useState("");
  const [workingTime, setWorkingTime] = useState("");
  const [sortBy, setSortBy] = useState<"scheduled_time" | "created_at">("scheduled_time");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  
  // State đóng/mở bộ lọc
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    interviews.forEach((i: any) => {
      if (i.status) set.add(i.status);
    });
    return Array.from(set);
  }, [interviews]);

  const filtered = useMemo(() => {
    const list = interviews.filter((itv: any) => {
      const term = search.trim().toLowerCase();
      if (
        term &&
        !`${itv.job_post_title || ""} ${itv.job_post_id || ""}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (statusFilter !== "all" && itv.status !== statusFilter) {
        return false;
      }
      if (jobType && itv.job_type !== jobType) return false;
      if (workingTime && itv.working_time !== workingTime) return false;
      if (selectedFields.length) {
        const f = parseFields(itv.fields || itv.job_fields);
        if (!f.some((x) => selectedFields.includes(x))) return false;
      }
      return true;
    });

    return list.sort((a: any, b: any) => {
      const factor = order === "ASC" ? 1 : -1;
      if (sortBy === "created_at") {
        return (
          factor *
          (new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime())
        );
      }
      return (
        factor *
        (new Date(a.scheduled_time || 0).getTime() -
          new Date(b.scheduled_time || 0).getTime())
      );
    });
  }, [
    interviews,
    search,
    statusFilter,
    jobType,
    workingTime,
    selectedFields,
    sortBy,
    order,
  ]);

  const toggleField = (value: string) => {
    setSelectedFields((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const hasActiveFilter = search || statusFilter !== "all" || jobType || workingTime || selectedFields.length > 0;

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl">
        
        {/* --- BỘ LỌC TÌM KIẾM (Collapsible) --- */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300">
          {/* Header bấm để mở */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-2 font-bold text-gray-700">
              <Filter size={20} className="text-orange-500" />
              <span>Bộ lọc tìm kiếm</span>
              {!isFilterOpen && hasActiveFilter && (
                <span className="text-xs font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                  Đang lọc...
                </span>
              )}
            </div>
            {isFilterOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </div>

          {/* Nội dung bộ lọc */}
          {isFilterOpen && (
            <div className="p-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Tìm kiếm */}
                <div className="lg:col-span-3">
                   <label className="mb-1 block text-sm font-medium text-gray-700">Tìm kiếm</label>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Vị trí công việc, mã tin..."
                        className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      />
                   </div>
                </div>

                {/* Trạng thái */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
                   <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      {allStatuses.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                </div>

                {/* Loại việc */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Loại việc</label>
                   <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Tất cả</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Intern">Intern</option>
                    </select>
                </div>

                {/* Giờ làm */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Giờ làm</label>
                   <select
                      value={workingTime}
                      onChange={(e) => setWorkingTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Tất cả</option>
                      <option value="Giờ hành chính">Giờ hành chính</option>
                      <option value="Linh hoạt">Linh hoạt</option>
                      <option value="Ca">Ca</option>
                    </select>
                </div>

                {/* Sắp xếp */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Sắp xếp theo</label>
                   <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    >
                      <option value="scheduled_time">Thời gian phỏng vấn</option>
                      <option value="created_at">Ngày tạo</option>
                    </select>
                </div>

                {/* Thứ tự */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Thứ tự</label>
                   <select
                      value={order}
                      onChange={(e) => setOrder(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    >
                      <option value="DESC">Mới nhất trước</option>
                      <option value="ASC">Cũ nhất trước</option>
                    </select>
                </div>
              </div>

              {/* Ngành nghề */}
              <div className="mt-4">
                 <p className="mb-2 text-sm font-medium text-gray-700">Lọc theo ngành nghề</p>
                 <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((f) => (
                      <label
                        key={f}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                          selectedFields.includes(f) 
                            ? "border-orange-500 bg-orange-50 text-orange-700" 
                            : "border-gray-200 hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden" // Ẩn checkbox native đi cho đẹp
                          checked={selectedFields.includes(f)}
                          onChange={() => toggleField(f)}
                        />
                        {f}
                      </label>
                    ))}
                 </div>
              </div>

              {/* Nút thu gọn */}
              <div className="mt-4 flex justify-center border-t border-gray-100 pt-3">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="text-xs text-gray-500 hover:text-orange-500 hover:underline flex items-center gap-1"
                >
                  <ChevronUp size={14}/> Thu gọn bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- DANH SÁCH LỊCH PHỎNG VẤN --- */}
        {isLoading && (
          <div className="flex h-48 items-center justify-center text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
            Đang tải lịch...
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center text-red-500">
            <XCircle className="mr-2 h-5 w-5" />
            Không thể tải lịch phỏng vấn.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-500">
                 <p className="text-base font-medium">Không tìm thấy lịch phỏng vấn phù hợp</p>
                 <p className="text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc kiểm tra lại sau.</p>
              </div>
            ) : (
              filtered.map((itv: any) => (
                <article
                  key={itv.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <CalendarClock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-400 font-bold tracking-wide">
                          {itv.job_post_id ? `Mã tin: ${itv.job_post_id.slice(0, 8)}...` : "—"}
                        </p>
                        <h3 className="text-lg font-bold text-gray-800 mt-0.5">
                          {itv.job_post_title || "Phỏng vấn công việc"}
                        </h3>
                        {itv.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">Note: "{itv.notes}"</p>
                        )}
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                           {parseFields(itv.fields || itv.job_fields).slice(0, 3).map((f) => (
                              <span key={f} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                                 {f}
                              </span>
                           ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         itv.status === 'Đã hủy' ? 'bg-red-50 text-red-600' :
                         itv.status === 'Hoàn thành' ? 'bg-green-50 text-green-600' :
                         'bg-blue-50 text-blue-600'
                      }`}>
                        {itv.status || "Sắp tới"}
                      </span>
                      <div className="mt-1 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                         <Clock size={14} className="text-gray-400"/>
                         {formatDateTime(itv.scheduled_time)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-4 text-sm text-gray-600">
                    {itv.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {itv.location}
                      </span>
                    )}
                    {itv.job_type && (
                      <span className="inline-flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        {itv.job_type}
                      </span>
                    )}
                    {itv.working_time && (
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {itv.working_time}
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        hour12: false,
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa đặt lịch";

export default CandidateInterviews;