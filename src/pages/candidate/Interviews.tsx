import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Video,
  Map
} from "lucide-react";
import { useCandidateInterviewsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";

// Hàm helper detect link online
const renderLocation = (type: string, location: string) => {
  if (type === "Online") {
    // Regex tìm URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(location);
    if (hasUrl) {
        return (
            <a href={location} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                <ExternalLink size={14} /> Link phỏng vấn Online
            </a>
        )
    }
    return <span className="text-blue-600 inline-flex items-center gap-1"><Video size={14}/> Online: {location}</span>;
  }
  return <span className="inline-flex items-center gap-1"><Map size={14}/> {location}</span>;
};

const CandidateInterviews: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Lịch phỏng vấn";
  const { data, isLoading, isError } = useCandidateInterviewsQuery();
  const interviews = data?.data ?? [];
  
  // --- STATE BỘ LỌC ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all"); // Thêm lọc Online/Offline
  const [sortBy, setSortBy] = useState<"scheduled_time" | "created_at">("scheduled_time");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Options khớp với Model Interview
  const INTERVIEW_STATUS_OPTIONS = ["Đang diễn ra", "Đã kết thúc"];
  const INTERVIEW_TYPE_OPTIONS = ["Online", "Offline"];

  const filtered = useMemo(() => {
    const list = interviews.filter((itv: any) => {
      // 1. Tìm kiếm theo Tên Job hoặc Địa điểm
      const term = search.trim().toLowerCase();
      const jobTitle = itv.job_post?.position || ""; // Lấy tên job từ relation
      const loc = itv.location || "";
      
      if (term && !(jobTitle.toLowerCase().includes(term) || loc.toLowerCase().includes(term))) {
        return false;
      }

      // 2. Lọc theo trạng thái (Enum: Đang diễn ra, Đã kết thúc)
      if (statusFilter !== "all" && itv.status !== statusFilter) {
        return false;
      }

      // 3. Lọc theo hình thức (Enum: Online, Offline)
      if (typeFilter !== "all" && itv.interview_type !== typeFilter) {
        return false;
      }

      return true;
    });

    // Sắp xếp
    return list.sort((a: any, b: any) => {
      const factor = order === "ASC" ? 1 : -1;
      const dateA = new Date(sortBy === "created_at" ? a.created_at : a.scheduled_time).getTime();
      const dateB = new Date(sortBy === "created_at" ? b.created_at : b.scheduled_time).getTime();
      return factor * (dateA - dateB);
    });
  }, [interviews, search, statusFilter, typeFilter, sortBy, order]);

  const hasActiveFilter = search || statusFilter !== "all" || typeFilter !== "all";

  return (
    <CandidateLayout title={title}>
      <div className="mx-auto max-w-6xl">
        
        {/* --- BỘ LỌC TÌM KIẾM --- */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300">
           <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <div className="flex items-center gap-2 font-bold text-gray-700">
                <Filter size={20} className="text-orange-500" />
                <span>Bộ lọc lịch phỏng vấn</span>
                {!isFilterOpen && hasActiveFilter && (<span className="text-xs font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">Đang lọc...</span>)}
            </div>
            {isFilterOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </div>
          
          {isFilterOpen && (
            <div className="p-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Tìm kiếm */}
                <div className="lg:col-span-4">
                   <label className="mb-1 block text-sm font-medium text-gray-700">Tìm kiếm</label>
                   <div className="relative">
                       <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                       <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nhập tên vị trí công việc hoặc địa điểm..." className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                   </div>
                </div>

                {/* Trạng thái */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
                   <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none">
                      <option value="all">Tất cả</option>
                      {INTERVIEW_STATUS_OPTIONS.map((st) => (<option key={st} value={st}>{st}</option>))}
                    </select>
                </div>

                {/* Hình thức */}
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-700">Hình thức</label>
                   <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none">
                      <option value="all">Tất cả</option>
                      {INTERVIEW_TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                </div>

                {/* Sắp xếp */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Sắp xếp theo</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none">
                        <option value="scheduled_time">Thời gian phỏng vấn</option>
                        <option value="created_at">Ngày tạo</option>
                    </select>
                </div>

                {/* Thứ tự */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Thứ tự</label>
                    <select value={order} onChange={(e) => setOrder(e.target.value as any)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none">
                        <option value="DESC">Mới nhất trước</option>
                        <option value="ASC">Cũ nhất trước</option>
                    </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center border-t border-gray-100 pt-3">
                  <button onClick={() => setIsFilterOpen(false)} className="text-xs text-gray-500 hover:text-orange-500 hover:underline flex items-center gap-1">
                      <ChevronUp size={14}/> Thu gọn bộ lọc
                  </button>
              </div>
            </div>
          )}
        </div>

        {/* --- DANH SÁCH --- */}
        {!isLoading && !isError && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-500"><p className="text-base font-medium">Không tìm thấy lịch phỏng vấn phù hợp</p></div>
            ) : (
              filtered.map((itv: any) => (
                <article key={itv.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Icon thay đổi theo trạng thái */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${itv.status === 'Đã kết thúc' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-600'}`}>
                          <CalendarClock className="h-6 w-6" />
                      </div>
                      
                      <div>
                        {/* Tags Type */}
                        <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${itv.interview_type === 'Online' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                 {itv.interview_type || 'Offline'}
                             </span>
                        </div>

                        {/* Tên Job từ Relation */}
                        <h3 className="text-lg font-bold text-gray-800 mt-1">
                            {itv.job_post?.position ? `Phỏng vấn vị trí: ${itv.job_post.position}` : "Phỏng vấn công việc"}
                        </h3>

                        {itv.notes && (<p className="text-sm text-gray-600 mt-1 italic border-l-2 border-gray-300 pl-2">Ghi chú: "{itv.notes}"</p>)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 text-right">
                      {/* Trạng thái */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${itv.status === 'Đã kết thúc' ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>
                        {itv.status || "Đang diễn ra"}
                      </span>
                      <div className="mt-1 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400"/>
                          {formatDateTime(itv.scheduled_time)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-4 text-sm text-gray-600">
                    {/* Render Location */}
                    {itv.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {renderLocation(itv.interview_type, itv.location)}
                      </span>
                    )}
                    
                    {/* Nếu có tên công ty */}
                    {itv.job_post?.recruiter?.company_name && (
                         <span className="inline-flex items-center gap-2">
                             <span className="font-semibold text-gray-500">Tại:</span>
                             {itv.job_post.recruiter.company_name}
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