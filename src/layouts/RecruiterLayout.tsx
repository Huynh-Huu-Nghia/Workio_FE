import React from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const recruiterNav = [
  { label: "Tin tuyển dụng", link: path.RECRUITER_JOBS },
  { label: "Ứng viên cho tin", link: path.RECRUITER_JOB_CANDIDATES },
  { label: "Gợi ý ứng viên", link: path.RECRUITER_SUGGESTED_CANDIDATES },
  { label: "Lịch phỏng vấn", link: path.RECRUITER_INTERVIEWS },
  { label: "Hồ sơ", link: path.RECRUITER_PROFILE },
  { label: "Cài đặt", link: path.RECRUITER_SETTINGS },
  { label: "Hỗ trợ", link: path.RECRUITER_SUPPORT },
];

export default function RecruiterLayout({ title, children }: Props) {
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
              Nhà tuyển dụng • Quản lý tin đăng, ứng viên, phỏng vấn
            </p>
          </div>
        </div>
        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
            {recruiterNav.map((item) => {
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
