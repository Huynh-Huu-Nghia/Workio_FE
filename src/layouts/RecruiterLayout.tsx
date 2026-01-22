import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";
import {
  Bell,
  Briefcase,
  CalendarDays,
  Home,
  LifeBuoy,
  Menu,
  LogOut,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "@/context/user/user.context";
import { pathtotitle } from "@/configs/pagetitle";
import LOGO_SRC from "@/assets/networking.png";
import { useLogoutMutation, type AuthRole } from "@/api/auth.api";
import { clearAuthTokens } from "@/utils/authStorage";
import { useNavigate } from "react-router-dom";
import { useRecruiterNotificationsQuery } from "@/api/recruiter.api"; // Import hook thông báo
import { useRecruiterProfileQuery } from "@/api/profile.api"; // Import hook profile để lấy dữ liệu realtime

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
    title: "TỔNG QUAN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Home size={18} />,
        link: path.RECRUITER_HOME,
      },
    ],
  },
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
  const { user, logout: contextLogout, setUser } = useUser();
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

  const [showNotifications, setShowNotifications] = useState(false);

  // [MỚI] Lấy dữ liệu Profile realtime để hiển thị Avatar/Tên đúng nhất
  const { data: profileRes } = useRecruiterProfileQuery();
  const profile = profileRes?.data;

  // [MỚI] Lấy dữ liệu Thông báo
  const { data: notifData } = useRecruiterNotificationsQuery();
  const notifications = notifData?.data?.notifications || [];
  const unreadCount = notifications.length; // Hoặc lọc theo is_read nếu DB có lưu

  // [SỬA] Logic hiển thị Tên & Avatar (Ưu tiên từ Profile API)
  const displayName = profile?.company_name || user?.name || "Nhà tuyển dụng";
  const displayEmail = user?.email;
  const avatarSrc = user?.avatar_url; // Avatar User được update từ Profile

  const avatarInitial = useMemo(() => {
    return (displayName || "RC").charAt(0).toUpperCase();
  }, [displayName]);

  const displayTitle = useMemo(
    () => pathtotitle[pathname] || title || "Không gian nhà tuyển dụng",
    [pathname, title],
  );

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;

    try {
      // 1. Xóa bản nháp Profile của Recruiter này
      if (user?.id) {
        const draftKey = `workio_recruiter_profile_draft_${user.id}`;
        localStorage.removeItem(draftKey);
      }
      await logoutMutation.mutateAsync({ role: "Recruiter" });
      clearAuthTokens(); // Xóa LocalStorage
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.info("Đang đăng xuất...");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      navigate(path.login); // Chuyển về trang login
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

  const [open] = useState(true);

  // --- LOGIC ĐĂNG XUẤT ---
  // const handleLogout = () => {
  //   // 1. Xóa bản nháp Profile của Recruiter này
  //   if (user?.id) {
  //       const draftKey = `workio_recruiter_profile_draft_${user.id}`;
  //       localStorage.removeItem(draftKey);
  //   }

  //   // 2. Xóa token & state
  //   clearAuthTokens();
  //   setUser(null);
  //   toast.success("Đăng xuất thành công");
  //   navigate(path.login);
  // };

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
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout} // Gắn hàm logout vào đây
            className={`flex items-center w-full px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium ${
              open ? "gap-3" : "justify-center"
            }`}
          >
            <LogOut size={18} />
            {open && <span>Đăng xuất</span>}
          </button>
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
              {/* --- 1. NOTIFICATIONS --- */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-full p-2 text-gray-400 transition hover:bg-gray-50 hover:text-orange-500"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                   <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto">
                     <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                        <span className="font-semibold text-gray-700 text-sm">Thông báo</span>
                        <span className="text-xs text-orange-600 cursor-pointer">Đánh dấu đã đọc</span>
                     </div>
                     {notifications.length === 0 ? (
                       <div className="p-4 text-center text-sm text-gray-500">Không có thông báo mới</div>
                     ) : (
                       notifications.map((notif: any, idx: number) => (
                         <div key={idx} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer">
                            <p className="text-sm text-gray-800 font-medium">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 text-right">
                                {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                            </p>
                         </div>
                       ))
                     )}
                   </div>
                )}
              </div>

              {/* --- 2. USER MENU --- */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-sm font-bold text-orange-600 hover:bg-orange-200 transition-colors overflow-hidden"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {/* Header Menu: Avatar + Tên + Email */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden border border-orange-200">
                           {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" /> : avatarInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                         to={path.RECRUITER_PROFILE}
                         onClick={() => setShowUserMenu(false)}
                         className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} />
                        <span>Hồ sơ công ty</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>{logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                      </button>
                    </div>
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
