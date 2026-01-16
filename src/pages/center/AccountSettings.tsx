import React, { useState } from "react";
import CenterLayout from "@/layouts/CenterLayout";
import { Settings, Mail, Phone, Globe, FileText, Save, LogOut, Edit2, X } from "lucide-react";
import { useLogoutMutation } from "@/api/auth.api";
import { useCenterProfileQuery, useUpdateCenterProfileMutation } from "@/api/center.api";
import { useUser } from "@/context/user/user.context";
import { toast } from "react-toastify";

const CenterAccountSettings: React.FC = () => {
  const { setUser, user } = useUser();
  const logoutMutation = useLogoutMutation();
  
  // Fetch center profile data
  const { data: profileData, isLoading, refetch } = useCenterProfileQuery();
  const updateProfileMutation = useUpdateCenterProfileMutation();

  // Avatar initial from user context (same as layout)
  const avatarInitial = React.useMemo(() => {
    const source = user?.name || user?.email || "CT";
    return source.trim().charAt(0).toUpperCase();
  }, [user?.name, user?.email]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Local state for form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    description: "",
  });

  // Update local state when data is loaded
  React.useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data;
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        website: profile.website || "",
        description: profile.description || "",
      });
    }
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Cập nhật thông tin thành công!");
      refetch();
      setIsEditing(false); // Disable edit mode after save
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (profileData?.data) {
      const profile = profileData.data;
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        website: profile.website || "",
        description: profile.description || "",
      });
    }
    setIsEditing(false); // Disable edit mode
    toast.info("Đã hủy thay đổi");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar - Same style as header */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-200 bg-orange-100 text-3xl font-bold text-orange-600 shadow-lg">
                    {avatarInitial}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user?.name || profileData?.data?.name || "Trung tâm"}
                    </h2>
                    <p className="mt-1 text-blue-100">
                      {user?.email || profileData?.data?.email || "Đang tải thông tin..."}
                    </p>
                  </div>
                </div>
                {/* Edit Button */}
                {!isEditing && !isLoading && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-lg"
                  >
                    <Edit2 className="h-5 w-5" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-gray-500">Đang tải thông tin...</p>
                </div>
              ) : (
                <>
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
                      name="name"
                      placeholder="VD: Trung tâm Đào tạo ABC"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                      name="email"
                      placeholder="VD: info@center.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                      name="phone"
                      placeholder="VD: 0123456789"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                      name="website"
                      placeholder="VD: https://center.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                      name="description"
                      placeholder="Nhập mô tả về trung tâm của bạn..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="h-5 w-5" />
                          {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                          className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-3.5 font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-5 w-5" />
                          Hủy
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 py-3">
                        Nhấn nút "Chỉnh sửa" ở trên để thay đổi thông tin
                      </p>
                    )}
                  </div>
                </>
              )}
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
