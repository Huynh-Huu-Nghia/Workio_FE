import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import path from "@/constants/path";
import {
  Briefcase,
  Calendar,
  User,
  LifeBuoy,
  Home,
  Menu,
  X,
  Bell,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useUser } from "@/context/user/user.context";
import { pathtotitle } from "@/configs/pagetitle";
import LOGO_SRC from "@/assets/networking.png";

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
          { id: "jobs-all", label: "Tất cả việc làm", link: path.CANDIDATE_JOBS },
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
  const { pathname } = useLocation();
  const { user } = useUser();
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("candidateSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem("candidateSidebarOpen", JSON.stringify(open));
  }, [open]);

  const displayTitle = useMemo(
    () => pathtotitle[pathname] || title || "Candidate",
    [pathname, title]
  );
  const avatarInitial = useMemo(() => {
    const source = user?.name || user?.email || "CA";
    return source.trim().charAt(0).toUpperCase();
  }, [user?.name, user?.email]);

  useEffect(() => {
    const currentPath = pathname;
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) =>
            currentPath.startsWith(sub.link)
          );
          if (hasActiveSub) {
            setOpenMenus((prev) =>
              prev.includes(item.id) ? prev : [...prev, item.id]
            );
          }
        }
      });
    });
  }, [pathname]);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
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
            <img src={LOGO_SRC} alt="Logo" className="w-full h-full object-contain" />
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
                    pathname.startsWith(item.link) && item.link !== "#";
                  const isParentActive =
                    isUrlActive ||
                    (item.subItems &&
                      item.subItems.some((sub) => pathname.startsWith(sub.link)));
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
                            isExpanded ? "justify-between px-3" : "justify-center px-0"
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
            className={`flex items-center w-full px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium ${
              isExpanded ? "gap-3" : "justify-center"
            }`}
          >
            <X size={18} />
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

        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
