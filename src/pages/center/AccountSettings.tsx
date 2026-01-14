import React from "react";
import CenterLayout from "@/layouts/CenterLayout";
import { Settings, Mail, Phone, Globe, FileText, MapPin, Save, LogOut } from "lucide-react";
import { useLogoutMutation } from "@/api/auth.api";
import { useUser } from "@/context/user/user.context";
import { toast } from "react-toastify";

const CenterAccountSettings: React.FC = () => {
  const { setUser } = useUser();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;

    try {
      await logoutMutation.mutateAsync({ role: "Center" });
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.info("Đang đăng xuất...");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <CenterLayout title="Cài đặt tài khoản">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
          {/* Header Section */}
          <header className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-xl ring-4 ring-blue-100">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Cài đặt Trung tâm</h1>
              <p className="mt-1 text-base text-gray-600">
                Quản lý thông tin chi tiết của trung tâm đào tạo
              </p>
            </div>
          </header>

          {/* Center Profile Form */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Thông tin Trung tâm</h2>
                  <p className="mt-1 text-blue-100">Cập nhật thông tin cơ bản của trung tâm</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Tên Trung tâm
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="VD: Trung tâm Đào tạo ABC"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  defaultValue="Trung tâm Đào tạo"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  placeholder="VD: info@center.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  defaultValue="center@example.com"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Số điện thoại
                  </div>
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0123456789"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  defaultValue="0123456789"
                />
              </div>

              {/* Website Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    Website
                  </div>
                </label>
                <input
                  type="url"
                  placeholder="VD: https://center.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  defaultValue="https://center.com"
                />
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Địa chỉ
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  defaultValue="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Mô tả
                  </div>
                </label>
                <textarea
                  placeholder="Nhập mô tả về trung tâm của bạn..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                  rows={4}
                  defaultValue="Trung tâm đào tạo chuyên cung cấp các khóa học chất lượng cao."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-blue-600 hover:to-blue-700">
                  <Save className="h-5 w-5" />
                  Lưu thay đổi
                </button>
                <button className="rounded-xl border-2 border-gray-300 bg-white px-8 py-3.5 font-bold text-gray-700 transition hover:bg-gray-50">
                  Hủy
                </button>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <LogOut className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Đăng xuất</h2>
                  <p className="mt-1 text-red-100">Thoát khỏi tài khoản trung tâm</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 mb-4">
                Nhấn nút bên dưới để đăng xuất khỏi tài khoản. Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
              </p>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-5 w-5" />
                {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </CenterLayout>
  );
};

export default CenterAccountSettings;
