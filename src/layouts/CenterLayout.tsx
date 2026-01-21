import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import path from "@/constants/path";
import {
  BookOpen,
  LifeBuoy,
  Menu,
  Settings,
  Bell,
  LogOut,
  ClipboardList,
  Home,
  X,
  UserPlus,
} from "lucide-react";
import LOGO_SRC from "@/assets/networking.png";
import { pathtotitle } from "@/configs/pagetitle";
import { useUser } from "@/context/user/user.context";
import { useLogoutMutation, type AuthRole } from "@/api/auth.api";
import { useCenterNotificationsQuery } from "@/api/center.api";

type Props = {
  title?: string;
  children: React.ReactNode;
};

type MenuSubItem = {
  id: string;
  label: string;
  link: string;
  hash?: string;
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

const centerMenu: MenuGroup[] = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        id: "home",
        label: "Trang chủ",
        icon: <Home size={20} />,
        link: path.CENTER_HOME,
      },
    ],
  },
  {
    title: "ĐÀO TẠO",
    items: [
      {
        id: "courses",
        label: "Khóa học",
        icon: <BookOpen size={20} />,
        link: path.CENTER_COURSES,
        subItems: [
          {
            id: "courses-create",
            label: "Thêm khóa học",
            link: path.CENTER_COURSES,
            hash: "create",
          },
          {
            id: "courses-manage",
            label: "Quản lý khóa học",
            link: path.CENTER_COURSES,
            hash: "manage",
          },
        ],
      },
    ],
  },
  {
    title: "HỖ TRỢ",
    items: [
      {
        id: "settings",
        label: "Cài đặt",
        icon: <Settings size={20} />,
        link: path.CENTER_SETTINGS,
      },
      {
        id: "support",
        label: "Hỗ trợ",
        icon: <LifeBuoy size={20} />,
        link: path.CENTER_SUPPORT,
      },
    ],
  },
];

export default function CenterLayout({ title, children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const { pathname, hash } = location;
  const { user, logout: contextLogout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }
    const saved = window.localStorage.getItem("centerSidebarOpen");
    return saved !== null ? saved === "true" : true;
  });
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('center_read_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  const { data: notificationsData } = useCenterNotificationsQuery();
  const allNotifications = notificationsData?.data?.notifications || [];
  
  // Filter out read notifications
  const unreadNotifications = allNotifications.filter(notif => !readNotifications.has(notif.id));
  const notificationCount = unreadNotifications.length;

  // Save read notifications to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('center_read_notifications', JSON.stringify([...readNotifications]));
  }, [readNotifications]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allIds = allNotifications.map(notif => notif.id);
    setReadNotifications(new Set(allIds));
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      "centerSidebarOpen",
      JSON.stringify(sidebarOpen),
    );
  }, [sidebarOpen]);

  useEffect(() => {
    centerMenu.forEach((group) => {
      group.items.forEach((item) => {
        if (item.subItems) {
          const match = item.subItems.some((sub) =>
            pathname.startsWith(sub.link),
          );
          if (match) {
            setOpenMenus((prev) =>
              prev.includes(item.id) ? prev : [...prev, item.id],
            );
          }
        }
      });
    });
  }, [pathname]);

  const displayTitle = useMemo(() => {
    return pathtotitle[pathname] || title || "Trang trung tâm";
  }, [pathname, title]);

  const avatarInitial = useMemo(() => {
    const source = user?.center?.name || user?.name || user?.email || "CT";
    return source.trim().charAt(0).toUpperCase();
  }, [user?.center?.name, user?.name, user?.email]);

  const handleLogout = async () => {
    if (!user?.role?.value) return;

    try {
      await logoutMutation.mutateAsync({ role: user.role.value as AuthRole });
      contextLogout();
      window.location.href = "/login";
      toast.success("Đăng xuất thành công!");
    } catch (error: any) {
      console.error("Logout error:", error);
      contextLogout();
      window.location.href = "/login";
      toast.success("Đăng xuất thành công!");
    }
  };

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const resolveLink = (link: string, hashFragment?: string) =>
    hashFragment ? `${link}#${hashFragment}` : link;

  const isExpanded = sidebarOpen;

  const handleBack = () => {
    const canUseHistory =
      typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    navigate(path.CENTER_HOME);
  };

  // // HÀM ĐĂNG XUẤT CHUẨN
  // const handleLogout = () => {
  //   // 1. Xóa bản nháp của user hiện tại (nếu có)
  //   if (user?.id) {
  //       const draftKey = `workio_center_profile_draft_${user.id}`;
  //       localStorage.removeItem(draftKey);
  //   }
  //   clearAuthTokens(); // Xóa LocalStorage
  //   setUser(null); // Xóa Context
  //   toast.success("Đăng xuất thành công");
  //   navigate(path.login); // Chuyển về trang login
  // };

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <aside
        className={`bg-white border-r border-gray-100 flex-col font-sans z-40 transition-all duration-300 fixed top-0 left-0 flex h-screen ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        <div className="border-b border-gray-100 py-6 transition-all duration-300">
          <div className="flex items-center justify-between px-3 mb-4">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              title={isExpanded ? "Thu gọn menu" : "Mở rộng menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <Link 
            to={path.CENTER_HOME} 
            className="flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:opacity-80"
          >
            <div
              className={`bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center p-2 transition-all duration-300 ${
                isExpanded ? "h-20 w-20" : "h-10 w-10"
              }`}
            >
              <img
                src={LOGO_SRC}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
            {isExpanded && (
              <div className="mt-3 text-center">
                <h1 className="text-xl font-extrabold tracking-tight text-gray-800">
                  Work<span className="text-orange-600">io</span>
                </h1>
                <p className="text-xs text-gray-400">Trung tâm đào tạo</p>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-3 py-6 scrollbar-hide">
          {centerMenu.map((group) => (
            <div key={group.title}>
              {isExpanded && (
                <h3 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isUrlActive =
                    item.id === "home"
                      ? pathname === item.link
                      : pathname.startsWith(item.link) && item.link !== "#";
                  const isMenuActive =
                    isUrlActive ||
                    (item.subItems &&
                      item.subItems.some((sub) =>
                        pathname.startsWith(sub.link),
                      ));
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const expanded = openMenus.includes(item.id);
                  const firstSubItem = hasSubItems ? item.subItems![0] : null;
                  const defaultSubHash = firstSubItem?.hash;
                  return (
                    <div key={item.id}>
                      <Link
                        to={
                          firstSubItem
                            ? resolveLink(firstSubItem.link, firstSubItem.hash)
                            : item.link
                        }
                        onClick={(event) => {
                          if (hasSubItems) {
                            event.preventDefault();
                            toggleMenu(item.id);
                          }
                        }}
                        className={`flex items-center ${
                          isExpanded
                            ? "justify-between px-3"
                            : "justify-center px-0"
                        } py-2.5 rounded-lg transition-all duration-200 ${
                          isMenuActive
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                        title={!isExpanded ? item.label : ""}
                      >
                        <div
                          className={`flex items-center ${isExpanded ? "gap-3" : "gap-0"}`}
                        >
                          <span
                            className={
                              isMenuActive ? "text-orange-500" : "text-gray-400"
                            }
                          >
                            {item.icon}
                          </span>
                          {isExpanded && (
                            <span className="font-medium">{item.label}</span>
                          )}
                        </div>
                        {hasSubItems && isExpanded && (
                          <svg
                            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180 text-orange-400" : "text-gray-300"}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )}
                      </Link>
                      {hasSubItems && isExpanded && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expanded
                              ? "max-h-40 opacity-100 mt-1"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="ml-4 space-y-1 border-l-2 border-orange-100 pl-3">
                            {item.subItems!.map((sub) => {
                              const matchesHash = sub.hash
                                ? hash === `#${sub.hash}` ||
                                  (!hash &&
                                    defaultSubHash &&
                                    sub.hash === defaultSubHash)
                                : true;
                              const isSubActive =
                                pathname === sub.link && matchesHash;
                              return (
                                <Link
                                  key={sub.id}
                                  to={resolveLink(sub.link, sub.hash)}
                                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                                    isSubActive
                                      ? "bg-orange-100 text-orange-700 font-medium"
                                      : "text-gray-500 hover:bg-gray-50"
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

        <div className="border-t border-gray-50 p-4">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 ${
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
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 transition-all duration-200 ${isExpanded ? "lg:pl-64" : "lg:pl-20"}`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-100 bg-white shadow-sm">
          <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6">
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-800">
                {displayTitle}
              </h1>
              <p className="text-xs text-gray-500">
                Không gian quản trị trung tâm
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-full p-2 text-gray-400 transition hover:bg-gray-50 hover:text-orange-500"
                >
                  <Bell size={18} />
                  {notificationCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 text-[10px] font-bold text-white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">Thông báo</h3>
                        <p className="text-xs text-gray-500">{notificationCount} yêu cầu chưa đọc</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadNotifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1">
                      {allNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                          <Bell className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-sm font-medium text-gray-600">Không có thông báo mới</p>
                          <p className="text-xs text-gray-400 mt-1">Bạn sẽ nhận được thông báo khi có yêu cầu đăng ký</p>
                        </div>
                      ) : (
                        <div className="py-1">
                          {allNotifications.map((notif) => {
                            const isRead = readNotifications.has(notif.id);
                            return (
                              <Link
                                key={notif.id}
                                to={`${path.CENTER_COURSES}#manage`}
                                onClick={() => {
                                  markAsRead(notif.id);
                                  setShowNotifications(false);
                                }}
                                className={`flex items-start gap-3 px-4 py-3 transition-colors border-b border-gray-50 last:border-0 ${
                                  isRead 
                                    ? 'bg-gray-50 hover:bg-gray-100' 
                                    : 'bg-white hover:bg-orange-50'
                                }`}
                              >
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                  isRead ? 'bg-gray-200' : 'bg-amber-100'
                                }`}>
                                  <UserPlus className={`h-5 w-5 ${isRead ? 'text-gray-500' : 'text-amber-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold break-words ${
                                    isRead ? 'text-gray-600' : 'text-gray-800'
                                  }`}>
                                    {notif.candidate_name}
                                  </p>
                                  <p className={`text-xs mt-0.5 ${isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                                    Yêu cầu tham gia: <span className={`font-medium ${isRead ? 'text-gray-600' : 'text-gray-700'}`}>{notif.course_name}</span>
                                  </p>
                                  {notif.candidate_email && (
                                    <p className="text-xs text-gray-500 mt-1 break-all">
                                      {notif.candidate_email}
                                    </p>
                                  )}
                                  <p className={`text-xs mt-1 ${isRead ? 'text-gray-500' : 'text-amber-600'}`}>
                                    {new Date(notif.requested_at).toLocaleString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                {!isRead && (
                                  <div className="flex-shrink-0 h-2 w-2 rounded-full bg-orange-500 mt-2"></div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {allNotifications.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-2">
                        <Link
                          to={`${path.CENTER_COURSES}#manage`}
                          onClick={() => setShowNotifications(false)}
                          className="block text-center text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          Xem tất cả khóa học
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-sm font-bold text-orange-600 hover:bg-orange-200 transition-colors"
                >
                  {avatarInitial}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-lg font-bold text-orange-600">
                          {avatarInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 break-words">
                            {user?.center?.name || user?.name || "Trung tâm"}
                          </p>
                          <p className="text-xs text-gray-500 break-all">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to={path.CENTER_SETTINGS}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Cài đặt</span>
                      </Link>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
