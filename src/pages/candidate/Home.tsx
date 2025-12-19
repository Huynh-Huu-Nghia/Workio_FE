import React from "react";
import CandidateLayout from "@/layouts/CandidateLayout";
import path from "@/constants/path";
import { Link } from "react-router-dom";
import { Briefcase, ClipboardList, Calendar, LifeBuoy } from "lucide-react";

const CandidateHome: React.FC = () => {
  return (
    <CandidateLayout title="Trang chủ ứng viên">
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Chào mừng bạn!</h1>
          <p className="mt-1 text-sm text-gray-600">
            Truy cập nhanh các tác vụ: xem việc làm, việc đã ứng tuyển, lịch phỏng vấn hoặc gửi hỗ trợ.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={path.CANDIDATE_JOBS}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              <Briefcase className="h-4 w-4" />
              Việc làm
            </Link>
            <Link
              to={path.CANDIDATE_APPLIED_JOBS}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ClipboardList className="h-4 w-4" />
              Đã ứng tuyển
            </Link>
            <Link
              to={path.CANDIDATE_INTERVIEWS}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4" />
              Lịch phỏng vấn
            </Link>
            <Link
              to={path.CANDIDATE_SUPPORT}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LifeBuoy className="h-4 w-4" />
              Hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateHome;
