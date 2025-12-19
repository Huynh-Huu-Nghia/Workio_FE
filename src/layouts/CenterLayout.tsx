import React from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";
import { Home, BookOpen, Settings, LifeBuoy } from "lucide-react";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const centerNav = [
  { label: "Tổng quan", link: path.CENTER_HOME, icon: <Home size={16} /> },
  { label: "Khóa học", link: path.CENTER_COURSES, icon: <BookOpen size={16} /> },
  { label: "Cài đặt", link: path.CENTER_SETTINGS, icon: <Settings size={16} /> },
  { label: "Hỗ trợ", link: path.CENTER_SUPPORT, icon: <LifeBuoy size={16} /> },
];

export default function CenterLayout({ title, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 border-r border-gray-100 bg-white px-4 py-6 shadow-sm lg:block">
        <div className="px-2 pb-4">
          <div className="text-sm font-semibold text-gray-800">Center Console</div>
          <p className="text-xs text-gray-500">Quản lý khóa học, hỗ trợ, cài đặt</p>
        </div>
        <nav className="space-y-1">
          {centerNav.map((item) => {
            const active = pathname === item.link;
            return (
              <Link
                key={item.link}
                to={item.link}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-orange-50 text-orange-700 border border-orange-100"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-gray-500">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div>
              {title && <h1 className="text-xl font-semibold text-gray-800">{title}</h1>}
              <p className="text-xs text-gray-500">
                Trung tâm đào tạo • Quản lý khóa học, cài đặt, hỗ trợ
              </p>
            </div>
          </div>
          <nav className="border-t border-gray-100 bg-white px-4 py-2 lg:hidden">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {centerNav.map((item) => {
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
    </div>
  );
}
