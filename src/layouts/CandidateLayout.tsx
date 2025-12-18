import React from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const candidateNav = [
  { label: "Việc làm", link: path.CANDIDATE_JOBS },
  { label: "Đã ứng tuyển", link: path.CANDIDATE_APPLIED_JOBS },
  { label: "Gợi ý việc làm", link: path.CANDIDATE_SUGGESTED_JOBS },
  { label: "Lịch phỏng vấn", link: path.CANDIDATE_INTERVIEWS },
  { label: "Hồ sơ", link: path.CANDIDATE_PROFILE },
  { label: "Cài đặt", link: path.CANDIDATE_SETTINGS },
  { label: "Hỗ trợ", link: path.CANDIDATE_SUPPORT },
];

export default function CandidateLayout({ title, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            {title && (
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            )}
            <p className="text-xs text-gray-500">
              Ứng viên • Quản lý việc làm, hồ sơ, phỏng vấn
            </p>
          </div>
        </div>
        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
            {candidateNav.map((item) => {
              const active = pathname === item.link;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
