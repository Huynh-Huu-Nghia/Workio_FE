import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";
import {
  Briefcase,
  ClipboardList,
  Calendar,
  User,
  LifeBuoy,
  Home,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useUser } from "@/context/user/user.context";
import { pathtotitle } from "@/configs/pagetitle";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const candidateNav = [
  { label: "Trang chủ", link: path.CANDIDATE_HOME, icon: <Home size={16} /> },
  { label: "Việc làm", link: path.CANDIDATE_JOBS, icon: <Briefcase size={16} /> },
  { label: "Đã ứng tuyển", link: path.CANDIDATE_APPLIED_JOBS, icon: <ClipboardList size={16} /> },
  { label: "Lịch phỏng vấn", link: path.CANDIDATE_INTERVIEWS, icon: <Calendar size={16} /> },
  { label: "Hồ sơ", link: path.CANDIDATE_PROFILE, icon: <User size={16} /> },
  { label: "Hỗ trợ", link: path.CANDIDATE_SUPPORT, icon: <LifeBuoy size={16} /> },
];

export default function CandidateLayout({ title, children }: Props) {
  const { pathname } = useLocation();
  const { user } = useUser();
  const [open, setOpen] = useState(true);

  const displayTitle = useMemo(
    () => pathtotitle[pathname] || title || "Candidate",
    [pathname, title]
  );
  const avatarInitial = useMemo(() => {
    const source = user?.name || user?.email || "CA";
    return source.trim().charAt(0).toUpperCase();
  }, [user?.name, user?.email]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-100 bg-white px-4 py-6 shadow-sm transition duration-200 lg:static lg:translate-x-0 lg:block ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="space-y-1">
          {candidateNav.map((item) => {
            const active = pathname === item.link;
            return (
              <Link
                key={item.link}
                to={item.link}
                onClick={() => setOpen(false)}
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

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1">
        <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <p className="text-[11px] uppercase font-semibold text-gray-400">
                  Ứng viên
                </p>
                <h1 className="text-lg font-bold text-gray-800 leading-tight">
                  {displayTitle}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
              </button>
              <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm border border-orange-200">
                {avatarInitial}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
