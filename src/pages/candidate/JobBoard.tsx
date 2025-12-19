import React, { useState } from "react";
import { Briefcase, Calendar, Loader2, MapPin, XCircle, ChevronDown } from "lucide-react";
import { useApplyJobCandidateMutation, useCandidateJobPostsQuery } from "@/api/candidate.api";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { toast } from "react-toastify";
import { useUser } from "@/context/user/user.context";

const CandidateJobBoard: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Việc làm";
  const { data, isLoading, isError } = useCandidateJobPostsQuery();
  const jobs = data?.data ?? [];
  const applyMutation = useApplyJobCandidateMutation();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useUser();

  return (
    <CandidateLayout title={title}>
      {isLoading && (
        <div className="flex h-48 items-center justify-center text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
          Đang tải việc làm...
        </div>
      )}

      {isError && (
        <div className="flex h-48 items-center justify-center text-red-500">
          <XCircle className="mr-2 h-5 w-5" />
          Không thể tải danh sách việc làm.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Chưa có việc làm nào.
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
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
                        Hình thức: {job.recruitment_type || "—"} | Trạng thái:{" "}
                        {job.status || "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Hạn nộp: {job.application_deadline_to || "Chưa thiết lập"}
                  </span>
                  {job.support_info && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {job.support_info}
                    </span>
                  )}
                </div>
                {job.requirements && (
                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                    {job.requirements}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((prev) => (prev === job.id ? null : job.id))
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition ${
                        expandedId === job.id ? "rotate-180" : ""
                      }`}
                    />
                    Xem chi tiết
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setApplyingId(job.id);
                      try {
                        const res = await applyMutation.mutateAsync(job.id);
                        if ((res as any)?.err === 0) {
                          toast.success((res as any)?.mes || "Ứng tuyển thành công");
                        } else {
                          toast.error((res as any)?.mes || "Ứng tuyển thất bại");
                        }
                      } catch (e: any) {
                        toast.error(e?.response?.data?.mes || "Ứng tuyển thất bại");
                      } finally {
                        setApplyingId(null);
                      }
                    }}
                    className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                    disabled={
                      (applyMutation.isPending && applyingId === job.id) ||
                      (Array.isArray(job.applied_candidates) &&
                        Boolean(user?.id) &&
                        job.applied_candidates.includes(user!.id as string))
                    }
                  >
                    {Array.isArray(job.applied_candidates) &&
                    Boolean(user?.id) &&
                    job.applied_candidates.includes(user!.id as string)
                      ? "Đã ứng tuyển"
                      : applyMutation.isPending && applyingId === job.id
                      ? "Đang gửi..."
                      : "Ứng tuyển"}
                  </button>
                </div>
                {expandedId === job.id && (
                  <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {(job.application_deadline_from || job.application_deadline_to) && (
                      <div>
                        <span className="font-semibold text-gray-800">Hạn ứng tuyển: </span>
                        {job.application_deadline_from || "—"} → {job.application_deadline_to || "—"}
                      </div>
                    )}
                    {job.duration && (
                      <div>
                        <span className="font-semibold text-gray-800">Thời lượng: </span>
                        {job.duration}
                      </div>
                    )}
                    {job.support_info && (
                      <div>
                        <span className="font-semibold text-gray-800">Địa điểm hỗ trợ: </span>
                        {job.support_info}
                      </div>
                    )}
                    {job.fields && (
                      <div>
                        <span className="font-semibold text-gray-800">Ngành nghề: </span>
                        {Array.isArray(job.fields) ? job.fields.join(", ") : job.fields}
                      </div>
                    )}
                    {job.monthly_salary && (
                      <div>
                        <span className="font-semibold text-gray-800">Mức lương: </span>
                        {job.monthly_salary}
                      </div>
                    )}
                    {job.available_quantity !== null && job.available_quantity !== undefined && (
                      <div>
                        <span className="font-semibold text-gray-800">Số lượng cần: </span>
                        {job.available_quantity}
                      </div>
                    )}
                    {job.languguages && (
                      <div>
                        <span className="font-semibold text-gray-800">Ngôn ngữ: </span>
                        {Array.isArray(job.languguages)
                          ? job.languguages.join(", ")
                          : job.languguages}
                      </div>
                    )}
                    {(job.job_type || job.working_time) && (
                      <div>
                        <span className="font-semibold text-gray-800">Hình thức làm việc: </span>
                        {job.job_type || "—"} {job.working_time ? ` • ${job.working_time}` : ""}
                      </div>
                    )}
                    {(job.graduation_rank || job.computer_skill) && (
                      <div>
                        <span className="font-semibold text-gray-800">Yêu cầu học vấn/kỹ năng: </span>
                        {job.graduation_rank || "—"}{" "}
                        {job.computer_skill ? ` • ${job.computer_skill}` : ""}
                      </div>
                    )}
                    {job.other_requirements && (
                      <div>
                        <span className="font-semibold text-gray-800">Yêu cầu khác: </span>
                        {job.other_requirements}
                      </div>
                    )}
                    {job.benefits && (
                      <div>
                        <span className="font-semibold text-gray-800">Quyền lợi: </span>
                        {job.benefits}
                      </div>
                    )}
                    {Array.isArray(job.applied_candidates) && (
                      <div>
                        <span className="font-semibold text-gray-800">
                          Số ứng viên đã ứng tuyển:{" "}
                        </span>
                        {job.applied_candidates.length}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </CandidateLayout>
  );
};

export default CandidateJobBoard;
