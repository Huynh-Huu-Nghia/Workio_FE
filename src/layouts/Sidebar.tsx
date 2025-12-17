import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  Building2,
  BarChart3,
  ChevronDown,
  LogOut,
  Settings,
  List,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import LOGO_SRC from "@/assets/networking.png";

export interface SidebarProps {
  isOpen: boolean;
  activeMenu?: string;
  activeSubmenu?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  link: string;
  subItems?: { id: string; label: string; link: string }[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeMenu }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const menuGroups: MenuGroup[] = [
    {
      title: "TỔNG QUAN",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          link: "/admin/dashboard",
        },
        {
          id: "reports",
          label: "Báo cáo",
          icon: <BarChart3 size={20} />,
          link: "/admin/reports",
        },
      ],
    },
    {
      title: "QUẢN LÝ NGƯỜI DÙNG",
      items: [
        {
          id: "candidates",
          label: "Ứng viên",
          icon: <UserCheck size={20} />,
          link: "#",
          subItems: [
            {
              id: "all-candidates",
              label: "Danh sách Ứng viên",
              link: "/admin/candidates/list",
            },
            {
              id: "add-candidate",
              label: "Thêm Ứng viên",
              link: "/admin/candidates/create",
            },
            {
              id: "candidate-jobs",
              label: "Tin tuyển dụng đã ứng tuyển",
              link: "/admin/candidates/jobs",
            },
          ],
        },
        {
          id: "recruiters",
          label: "Nhà tuyển dụng",
          icon: <Building2 size={20} />,
          link: "#",
          subItems: [
            {
              id: "all-recruiters",
              label: "Danh sách nhà tuyển dụng",
              link: "/admin/recruiters",
            },
            {
              id: "pending-recruiters",
              label: "Chờ duyệt",
              link: "/admin/recruiters/pending",
            },
            {
              id: "add-recruiter",
              label: "Thêm nhà tuyển dụng",
              link: "/admin/recruiters/create",
            },
          ],
        },
      ],
    },
    {
      title: "QUẢN LÝ VIỆC LÀM",
      items: [
        {
          id: "jobs",
          label: "Tin tuyển dụng",
          icon: <Briefcase size={20} />,
          link: "#",
          subItems: [
            { id: "all-jobs", label: "Tất cả tin đăng", link: "/admin/jobs" },
            {
              id: "pending-jobs",
              label: "Tin chờ duyệt",
              link: "/admin/jobs/pending",
            },
            {
              id: "interviews",
              label: "Lịch phỏng vấn",
              link: "/admin/interviews",
            },
            {
              id: "interviews-candidate",
              label: "PV theo ứng viên",
              link: "/admin/interviews/candidate",
            },
            {
              id: "job-candidates",
              label: "Ứng viên theo tin",
              link: "/admin/jobs/candidates",
            },
            {
              id: "suggested-jobs",
              label: "Gợi ý việc làm",
              link: "/admin/jobs/suggested",
            },
            {
              id: "suggested-candidates",
              label: "Gợi ý ứng viên",
              link: "/admin/jobs/suggested-candidates",
            },
          ],
        },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        {
          id: "request",
          label: "Yêu cầu hỗ trợ",
          icon: <MessageSquare size={20} />,
          link: "/admin/requests",
        },
        {
          id: "categories",
          label: "Danh mục chung",
          icon: <List size={20} />,
          link: "#",
          subItems: [
            {
              id: "industries",
              label: "Ngành nghề",
              link: "/admin/categories/industries",
            },
            {
              id: "skills",
              label: "Kỹ năng",
              link: "/admin/categories/skills",
            },
          ],
        },
        {
          id: "social",
          label: "Tra cứu BHXH",
          icon: <ShieldCheck size={20} />,
          link: "/admin/social-insurances",
        },
        {
          id: "settings",
          label: "Cài đặt tài khoản",
          icon: <Settings size={20} />,
          link: "/admin/settings",
        },
      ],
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) =>
            currentPath.startsWith(sub.link)
          );
          if (hasActiveSub) {
            setOpenMenus((prev) =>
              !prev.includes(item.id) ? [...prev, item.id] : prev
            );
          }
        }
      });
    });
  }, [location.pathname]);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <aside
      className={`
      bg-white border-r border-gray-100 flex-col h-screen font-sans z-30 transition-all duration-300
      fixed top-0 left-0 hidden 
      md:flex md:sticky md:top-0
      ${isOpen ? "md:w-64" : "md:w-20"} 
    `}
    >
      {/* HEADER: Logo + Brand Name */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-gray-100 w-full transition-all duration-300">
        {/* 1. KHUNG LOGO */}
        <div
          className={`
            bg-white rounded-xl shadow-sm 
            border-[1.5px] border-orange-100 /* Viền mỏng hơn 1 chút cho tinh tế */
            flex items-center justify-center p-2 transition-all duration-300
            ${isOpen ? "h-20 w-20" : "h-10 w-10"} 
          `}
        >
          <img
            src={LOGO_SRC}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 2. TEXT THƯƠNG HIỆU */}
        {isOpen && (
          <div className="mt-3 text-center animate-fadeIn">
            {/* Thiết kế Clean & Minimal:
               - text-xl: Kích thước vừa phải, không quá to thô.
               - font-extrabold: Tạo độ dày, chắc chắn.
               - text-gray-800: Màu xám than chì, sang hơn màu đen tuyền.
               - tracking-tight: Kéo các chữ lại gần nhau, tạo cảm giác khối logo kết dính.
            */}
            <h1 className="text-xl font-extrabold tracking-tight text-gray-800 leading-none">
              Work<span className="text-orange-600">io</span>
            </h1>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {isOpen && (
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isUrlActive =
                  location.pathname.startsWith(item.link) && item.link !== "#";
                const isPropsActive = activeMenu === item.id;
                const isParentActive =
                  isPropsActive ||
                  isUrlActive ||
                  (item.subItems &&
                    item.subItems.some((sub) =>
                      location.pathname.startsWith(sub.link)
                    ));

                const isExpanded = openMenus.includes(item.id);
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
                          isOpen
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
                      title={!isOpen ? item.label : ""}
                    >
                      <div
                        className={`flex items-center ${
                          isOpen ? "gap-3" : "gap-0"
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
                        {isOpen && <span>{item.label}</span>}
                      </div>
                      {hasSubItems && isOpen && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded
                              ? "rotate-180 text-orange-400"
                              : "text-gray-300"
                          }`}
                        />
                      )}
                    </Link>

                    {hasSubItems && isOpen && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-40 opacity-100 mt-1"
                            : "max-h-0 opacity-0 mt-0"
                        }`}
                      >
                        <div className="ml-4 space-y-1 border-l-2 border-orange-100 pl-3">
                          {item.subItems!.map((sub) => {
                            const isSubActive = location.pathname === sub.link;
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
            isOpen ? "gap-3" : "justify-center"
          }`}
        >
          <LogOut size={18} />
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
