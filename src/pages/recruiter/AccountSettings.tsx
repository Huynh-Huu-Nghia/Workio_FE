import React from "react";
import { useMeQuery, useUpdateMeMutation } from "@/api/me.api";
import AccountSettingsCard from "@/components/account/AccountSettingsCard";
import { useUser } from "@/context/user/user.context";
import { useLogoutMutation } from "@/api/auth.api";
import { Link } from "react-router-dom";

const RecruiterAccountSettings: React.FC = () => {
  const { setUser } = useUser();
  const { data, isLoading, isError, refetch } = useMeQuery();
  const updateMe = useUpdateMeMutation();
  const logoutApi = useLogoutMutation();

  const me = data?.data;

  const onSave = async (payload: { name: string; avatar_url: string }) => {
    const res = await updateMe.mutateAsync(payload);
    setUser(res.data as any);
    refetch();
  };

  const onLogout = async () => {
    try {
      await logoutApi.mutateAsync({ role: "Recruiter" });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cập nhật thông tin tài khoản (API `/me`).
            </p>
          </div>
          <Link
            to="/recruiter/support"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Yêu cầu hỗ trợ
          </Link>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
              Đang tải...
            </div>
          ) : isError || !me ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-red-600">
              Không thể tải thông tin tài khoản. Kiểm tra token/backend.
            </div>
          ) : (
            <AccountSettingsCard
              title="Tài khoản nhà tuyển dụng"
              subtitle="Bạn có thể đổi tên hiển thị và avatar."
              initialName={me.name || ""}
              initialEmail={me.email}
              initialAvatarUrl={me.avatar_url || ""}
              onSave={onSave}
              onLogout={onLogout}
              isSaving={updateMe.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAccountSettings;
