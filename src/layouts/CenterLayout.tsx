import React from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const centerNav = [
  { label: "Tổng quan", link: path.CENTER_HOME },
  { label: "Khóa học", link: path.CENTER_COURSES },
  { label: "Cài đặt", link: path.CENTER_SETTINGS },
  { label: "Hỗ trợ", link: path.CENTER_SUPPORT },
];

export default function CenterLayout({ title, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-gray-200 bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
            <p className="text-sm text-gray-600">
              Trung tâm đào tạo • Quản lý khóa học và học viên
            </p>
          </div>
        </div>
        <nav className="border-t border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3 text-sm">
            {centerNav.map((item) => {
              const active = pathname === item.link;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                    active
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

