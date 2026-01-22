import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogoutMutation } from "@/api/auth.api";
import path from "@/constants/path";
import {
  Briefcase,
  Calendar,
  User,
  LifeBuoy,
  Home,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useUser } from "@/context/user/user.context";
import { pathtotitle } from "@/configs/pagetitle";
import LOGO_SRC from "@/assets/networking.png";
import { clearAuthTokens } from "@/utils/authStorage";
import { useCandidateNotificationsQuery } from "@/api/candidate.api";
// [THÊM] Import hook profile
import { useCandidateProfileQuery } from "@/api/profile.api";

type Props = {
  title?: string;
  children: React.ReactNode;
};

type MenuSubItem = {
  id: string;
  label: string;
  link: string;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  link: string;
  subItems?: MenuSubItem[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        id: "home",
        label: "Trang chủ",
        icon: <Home size={20} />,
        link: path.CANDIDATE_HOME,
      },
    ],
  },
  {
    title: "VIỆC LÀM",
    items: [
      {
        id: "jobs",
        label: "Việc làm",
        icon: <Briefcase size={20} />,
        link: "#",
        subItems: [
          {
            id: "jobs-all",
            label: "Tất cả việc làm",
            link: path.CANDIDATE_JOBS,
          },
          {
            id: "jobs-suggested",
            label: "Gợi ý việc làm",
            link: path.CANDIDATE_SUGGESTED_JOBS,
          },
          {
            id: "jobs-applied",
            label: "Đã ứng tuyển",
            link: path.CANDIDATE_APPLIED_JOBS,
          },
        ],
      },
      {
        id: "interviews",
        label: "Lịch phỏng vấn",
        icon: <Calendar size={20} />,
        link: path.CANDIDATE_INTERVIEWS,
      },
    ],
  },
  {
    title: "ĐÀO TẠO",
    items: [
      {
        id: "courses",
        label: "Khóa học",
        icon: <GraduationCap size={20} />,
        link: path.CANDIDATE_COURSES,
      },
    ],
  },
  {
    title: "HỒ SƠ",
    items: [
      {
        id: "profile",
        label: "Hồ sơ",
        icon: <User size={20} />,
        link: path.CANDIDATE_PROFILE,
      },
    ],
  },
  {
    title: "HỖ TRỢ",
    items: [
      {
        id: "support",
        label: "Hỗ trợ",
        icon: <LifeBuoy size={20} />,
        link: path.CANDIDATE_SUPPORT,
      },
    ],
  },
];

export default function CandidateLayout({ title, children }: Props) {
const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const { user, setUser } = useUser();
  const { pathname } = useLocation();
  
  // [THÊM] Gọi API lấy profile mới nhất
  const { data: profileRes } = useCandidateProfileQuery();
  const profile = profileRes?.data;
  
  // State quản lý Sidebar
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("candidateSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  
  // State quản lý Dropdown
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Lấy dữ liệu thông báo
  const { data: notifData } = useCandidateNotificationsQuery();
  const notifications = notifData?.data?.notifications || [];
  // Đếm số thông báo chưa đọc (giả sử logic là tất cả list trả về, hoặc lọc theo field is_read)
  const unreadCount = notifications.length;

  // HÀM ĐĂNG XUẤT CHUẨN
  // const handleLogout = () => {
  //   // 1. Xóa bản nháp của user hiện tại (nếu có)
  //   if (user?.id) {
  //       const draftKey = `workio_candidate_profile_draft_${user.id}`;
  //       localStorage.removeItem(draftKey);
  //   }
  //   clearAuthTokens(); // Xóa LocalStorage
  //   setUser(null); // Xóa Context
  //   toast.success("Đăng xuất thành công");
  //   navigate(path.login); // Chuyển về trang login
  // };

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;

    try {
      // 1. Xóa bản nháp Profile của Candidate này
      if (user?.id) {
        const draftKey = `workio_candidate_profile_draft_${user.id}`;
        localStorage.removeItem(draftKey);
      }
      await logoutMutation.mutateAsync({ role: "Candidate" });
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

  useEffect(() => {
    localStorage.setItem("candidateSidebarOpen", JSON.stringify(open));
  }, [open]);

  const displayTitle = useMemo(
    () => pathtotitle[pathname] || title || "Candidate",
    [pathname, title],
  );
  
// [SỬA] Logic ưu tiên hiển thị tên và avatar từ Profile mới nhất
  // Nếu profile có tên -> dùng tên profile. Nếu không -> dùng tên user login -> dùng email
  const displayName = profile?.full_name || user?.name || user?.email?.split('@')[0] || "Ứng viên";
  
  // Avatar cũng ưu tiên từ profile mới upload
  const avatarSrc = profile?.candidate?.avatar_url || user?.avatar_url;
  
  const avatarInitial = useMemo(() => {
    const source = displayName || "CA";
    return source.trim().charAt(0).toUpperCase();
  }, [displayName]);

  useEffect(() => {
    const currentPath = pathname;
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) =>
            currentPath.startsWith(sub.link),
          );
          if (hasActiveSub) {
            setOpenMenus((prev) =>
              prev.includes(item.id) ? prev : [...prev, item.id],
            );
          }
        }
      });
    });
  }, [pathname]);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const isExpanded = open;

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <aside
        className={`
          bg-white border-r border-gray-100 flex-col h-screen font-sans z-40 transition-all duration-300
          fixed top-0 left-0 flex
          ${isExpanded ? "w-64" : "w-20"}
        `}
      >
        <div className="flex flex-col items-center justify-center py-6 border-b border-gray-100 w-full transition-all duration-300">
          <div
            className={`
              bg-white rounded-xl shadow-sm border-[1.5px] border-orange-100
              flex items-center justify-center p-2 transition-all duration-300
              ${isExpanded ? "h-20 w-20" : "h-10 w-10"}
            `}
          >
            <img
              src={LOGO_SRC}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {isExpanded && (
            <div className="mt-3 text-center">
              <h1 className="text-xl font-extrabold tracking-tight text-gray-800 leading-none">
                Work<span className="text-orange-600">io</span>
              </h1>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {isExpanded && (
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isUrlActive =
                    item.link === path.CANDIDATE_HOME
                      ? pathname === item.link // Nếu là trang chủ, phải khớp chính xác 100%
                      : pathname.startsWith(item.link) && item.link !== "#"; // Các trang khác thì startsWith

                  const isParentActive =
                    isUrlActive ||
                    (item.subItems &&
                      item.subItems.some((sub) =>
                        pathname.startsWith(sub.link),
                      ));
                  const isMenuExpanded = openMenus.includes(item.id);
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  return (
                    <div key={item.id}>
                      <Link
                        to={hasSubItems ? "#" : item.link}
                        onClick={(e) => {
                          if (hasSubItems) {
                            e.preventDefault();
                            toggleMenu(item.id);
                          }
                        }}
                        className={`
                          flex items-center ${
                            isExpanded
                              ? "justify-between px-3"
                              : "justify-center px-0"
                          }
                          py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative
                          ${
                            isParentActive
                              ? "bg-orange-50 text-orange-600 font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                        title={!isExpanded ? item.label : ""}
                      >
                        <div
                          className={`flex items-center ${
                            isExpanded ? "gap-3" : "gap-0"
                          }`}
                        >
                          <span
                            className={
                              isParentActive
                                ? "text-orange-500"
                                : "text-gray-400 group-hover:text-gray-600"
                            }
                          >
                            {item.icon}
                          </span>
                          {isExpanded && <span>{item.label}</span>}
                        </div>
                        {hasSubItems && isExpanded && (
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isMenuExpanded
                                ? "rotate-180 text-orange-400"
                                : "text-gray-300"
                            }`}
                          />
                        )}
                      </Link>

                      {hasSubItems && isExpanded && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isMenuExpanded
                              ? "max-h-40 opacity-100 mt-1"
                              : "max-h-0 opacity-0 mt-0"
                          }`}
                        >
                          <div className="ml-4 space-y-1 border-l-2 border-orange-100 pl-3">
                            {item.subItems!.map((sub) => {
                              const isSubActive = pathname === sub.link;
                              return (
                                <Link
                                  key={sub.id}
                                  to={sub.link}
                                  className={`block text-sm py-2 px-3 rounded-md transition-colors ${
                                    isSubActive
                                      ? "bg-orange-100 text-orange-700 font-medium"
                                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium ${
              isExpanded ? "gap-3" : "justify-center"
            }`}
          >
            <LogOut size={18} />
            {isExpanded && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`flex-1 transition-all duration-200 ${
          isExpanded ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-100 bg-white shadow-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setOpen((v: boolean) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <h1 className="text-lg font-bold leading-tight text-gray-800">
                  {displayTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* --- DROPDOWN THÔNG BÁO --- */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors relative"
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
                         </div>
                       ))
                     )}
                   </div>
                )}
              </div>

              {/* --- DROPDOWN USER (AVATAR) --- */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm border border-orange-200 hover:bg-orange-200 transition-colors overflow-hidden"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                     <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                           {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* [HIỂN THỊ TÊN CHÍNH XÁC TẠI ĐÂY] */}
                          <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link 
                        to={path.CANDIDATE_PROFILE} 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} />
                        <span>Hồ sơ cá nhân</span>
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

        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
