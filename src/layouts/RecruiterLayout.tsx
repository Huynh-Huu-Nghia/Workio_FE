import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";
import {
  Bell,
  Briefcase,
  CalendarDays,
  LifeBuoy,
  Menu,
  Sparkles,
  User,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { useUser } from "@/context/user/user.context";
import { pathtotitle } from "@/configs/pagetitle";
import LOGO_SRC from "@/assets/networking.png";
import { useLogoutMutation, type AuthRole } from "@/api/auth.api";
import { toast } from "react-toastify";

type Props = {
  title?: string;
  children: React.ReactNode;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  link: string;
  match?: string[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const recruiterMenu: MenuGroup[] = [
  {
    title: "TIN & ỨNG VIÊN",
    items: [
      {
        id: "jobs",
        label: "Tin tuyển dụng",
        icon: <Briefcase size={18} />,
        link: path.RECRUITER_JOBS,
        match: [
          path.RECRUITER_JOBS,
          path.RECRUITER_JOB_CREATE,
          path.RECRUITER_JOB_EDIT,
        ],
      },
      {
        id: "job-candidates",
        label: "Ứng viên theo tin",
        icon: <Users size={18} />,
        link: path.RECRUITER_JOB_CANDIDATES,
      },
      {
        id: "suggested",
        label: "Gợi ý ứng viên",
        icon: <Sparkles size={18} />,
        link: path.RECRUITER_SUGGESTED_CANDIDATES,
      },
      {
        id: "interviews",
        label: "Lịch phỏng vấn",
        icon: <CalendarDays size={18} />,
        link: path.RECRUITER_INTERVIEWS,
      },
    ],
  },
  {
    title: "TÀI KHOẢN",
    items: [
      {
        id: "profile",
        label: "Hồ sơ & cài đặt",
        icon: <User size={18} />,
        link: path.RECRUITER_PROFILE,
        match: [path.RECRUITER_PROFILE, path.RECRUITER_SETTINGS],
      },
    ],
  },
  {
    title: "HỖ TRỢ",
    items: [
      {
        id: "support",
        label: "Yêu cầu hỗ trợ",
        icon: <LifeBuoy size={18} />,
        link: path.RECRUITER_SUPPORT,
      },
    ],
  },
];

export default function RecruiterLayout({ title, children }: Props) {
  const { pathname } = useLocation();
  const { user, logout: contextLogout } = useUser();
  const logoutMutation = useLogoutMutation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("recruiterSidebarOpen");
    return saved !== null ? saved === "true" : true;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "recruiterSidebarOpen",
      JSON.stringify(sidebarOpen),
    );
  }, [sidebarOpen]);

  const displayTitle = useMemo(
    () => pathtotitle[pathname] || title || "Không gian nhà tuyển dụng",
    [pathname, title],
  );

  const avatarInitial = useMemo(() => {
    const source = user?.name || user?.email || "RC";
    return source.trim().charAt(0).toUpperCase();
  }, [user?.name, user?.email]);

  const handleLogout = async () => {
    if (!user?.role?.value) return;

    try {
      await logoutMutation.mutateAsync({ role: user.role.value as AuthRole });
      contextLogout();
      window.location.href = "/login";
      toast.success("Đăng xuất thành công!");
    } catch (error: any) {
      contextLogout();
      window.location.href = "/login";
      toast.success("Đăng xuất thành công!");
    }
  };

  const isExpanded = sidebarOpen;
  const isActive = (item: MenuItem) => {
    const targets =
      item.match && item.match.length > 0 ? item.match : [item.link];
    return targets.some((target) => {
      if (pathname === target) return true;
      if (target.includes(":")) {
        const base = target.split(":")[0];
        return pathname.startsWith(base);
      }
      return false;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300 ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col items-center justify-center border-b border-gray-100 py-6">
          <div
            className={`rounded-xl border border-orange-100 bg-white p-2 shadow-sm ${
              isExpanded ? "h-16 w-16" : "h-10 w-10"
            }`}
          >
            <img
              src={LOGO_SRC}
              alt="Workio"
              className="h-full w-full object-contain"
            />
          </div>
          {isExpanded && (
            <div className="mt-2 text-center">
              <p className="text-base font-extrabold text-gray-800">
                Work<span className="text-orange-600">io</span>
              </p>
              <p className="text-xs text-gray-400">Bảng điều khiển NTD</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-6 scrollbar-hide">
          {recruiterMenu.map((group) => (
            <div key={group.title}>
              {isExpanded && (
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      title={!isExpanded ? item.label : undefined}
                      className={`flex items-center rounded-lg py-2.5 transition ${
                        isExpanded ? "justify-between px-3" : "justify-center"
                      } ${
                        active
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex items-center gap-3 ${isExpanded ? "" : "justify-center"}`}
                      >
                        <span
                          className={
                            active ? "text-orange-500" : "text-gray-400"
                          }
                        >
                          {item.icon}
                        </span>
                        {isExpanded && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 transition-all duration-200 ${isExpanded ? "lg:pl-64" : "lg:pl-20"}`}
      >
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white shadow-sm">
          <div className="mx-auto flex w-full items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Nhà tuyển dụng
                </p>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {displayTitle}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative rounded-full p-2 text-gray-400 transition hover:bg-gray-50 hover:text-orange-500">
                <Bell size={18} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white bg-red-500" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-sm font-bold text-orange-600 hover:bg-orange-200 transition-colors"
                >
                  {avatarInitial}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut size={16} />
                      <span>
                        {logoutMutation.isPending
                          ? "Đang đăng xuất..."
                          : "Đăng xuất"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
