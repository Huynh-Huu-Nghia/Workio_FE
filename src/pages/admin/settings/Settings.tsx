import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  useAdminProfileQuery,
  useUpdateAdminProfileMutation,
} from "@/api/profile.api";
import { useLogoutMutation } from "@/api/auth.api";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import path from "@/constants/path";
import { useNavigate } from "react-router-dom";

const Settings: React.FC = () => {
  const { data, isLoading, isError, refetch } = useAdminProfileQuery();
  const updateProfile = useUpdateAdminProfileMutation();
  const logout = useLogoutMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const profile = useMemo(() => data?.data, [data]);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setAvatarUrl(profile.avatar_url || "");
  }, [profile]);

  const avatarInitials = useMemo(() => {
    const source = (name || profile?.email || "A").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "A";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }, [name, profile?.email]);

  const onPickAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh.");
      return;
    }
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      toast.error("File quá lớn (tối đa 2MB).");
      return;
    }

    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    });

    setAvatarUrl(dataUrl);
    toast.info("Đã chọn ảnh. Bấm “Lưu thay đổi” để cập nhật.");
  };

  const onSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, avatar_url: avatarUrl });
      toast.success("Đã lưu cài đặt.");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Lưu thất bại.");
    }
  };

  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
      await logout.mutateAsync({ role: "Admin" });
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.info("Đang đăng xuất...");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      //window.location.href = "/login";
      navigate(path.login); // Chuyển về trang login
    }
  };

  return (
    <AdminLayout title="Cài đặt tài khoản" activeMenu="settings">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-800">Thông tin tài khoản</h2>

            {isLoading && <p className="mt-3 text-sm text-gray-500">Đang tải...</p>}
            {isError && (
              <p className="mt-3 text-sm text-red-600">
                Không thể tải profile. Kiểm tra token hoặc backend.
              </p>
            )}

            {!isLoading && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">
                          {avatarInitials}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onPickAvatar}
                      className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600"
                      title="Đổi avatar"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onAvatarFileChange(e.target.files?.[0])}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      Ảnh đại diện
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Tên hiển thị
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="VD: Admin Workio"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={updateProfile.isPending}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:bg-orange-200"
                  >
                    {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
