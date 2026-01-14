import path from "@/constants/path";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormSchema,
} from "@/schemas/auth.schema";
import { useResetPasswordMutation } from "@/api/auth.api";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import logoImg from "@/assets/networking.png";
import { useState, useEffect } from "react";

type FormData = ResetPasswordFormSchema;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy token từ URL (ví dụ: domain.com/reset-password?token=xyz123)
  const tokenFromUrl = searchParams.get("token");

  // State hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
      role: "" as any,
      token: tokenFromUrl || "", // Gán token vào form
    },
  });

  // Nếu URL không có token -> Báo lỗi ngay
  useEffect(() => {
    if (!tokenFromUrl) {
      toast.error("Đường dẫn không hợp lệ hoặc đã hết hạn.");
    } else {
      setValue("token", tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const currentRole = watch("role");
  const resetPasswordMutation = useResetPasswordMutation();

  const onSubmit = handleSubmit((data) => {
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Đổi mật khẩu thành công! Hãy đăng nhập ngay.", {
          autoClose: 3000,
        });
        setTimeout(() => navigate(path.login), 3000);
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          const mes = error.response.data.mes;

          if (status === 404 || status === 400) {
            toast.error(
              "Token hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại."
            );
          } else {
            toast.error(mes || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
          }
        } else {
          toast.error("Lỗi kết nối máy chủ.");
        }
      },
    });
  });

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            ❌ Lỗi đường dẫn
          </h2>
          <p className="mb-6 text-gray-600">
            Thiếu mã xác thực (Token). Vui lòng kiểm tra lại link trong email.
          </p>
          <Link
            to={path.login}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 mb-4 p-2 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Workio Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-500 mt-2">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* 1. Chọn Role (Để biết gọi API nào - Candidate hay Recruiter) */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Xác nhận vai trò <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <RoleCard
                id="role-candidate"
                value="Candidate"
                label="Ứng viên"
                desc="Tìm việc làm"
                icon="👨‍💼"
                register={register}
                currentRole={currentRole}
              />
              <RoleCard
                id="role-recruiter"
                value="Recruiter"
                label="Nhà tuyển dụng"
                desc="Đăng tin tuyển dụng"
                icon="🏢"
                register={register}
                currentRole={currentRole}
              />
              <RoleCard
                id="role-center"
                value="Center"
                label="Trung tâm"
                desc="Tôi đào tạo"
                icon="🎓"
                register={register}
                currentRole={currentRole}
              />
            </div>
            {errors.role && (
              <p className="mt-2 text-xs text-red-500 font-bold animate-pulse">
                ⚠️ {errors.role.message}
              </p>
            )}
          </div>

          {/* 2. Mật khẩu mới */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:border-orange-500 focus:ring-orange-100"
                }`}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 3. Nhập lại mật khẩu */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none focus:ring-2 ${
                  errors.confirm_password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:border-orange-500 focus:ring-orange-100"
                }`}
                placeholder="Nhập lại mật khẩu trên"
                {...register("confirm_password")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:bg-orange-200 disabled:cursor-not-allowed transform active:scale-95 duration-200"
          >
            {resetPasswordMutation.isPending
              ? "Đang cập nhật..."
              : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Reusable Components (Giống file trước) ---
function RoleCard({
  id,
  value,
  label,
  desc,
  icon,
  register,
  currentRole,
}: any) {
  const isSelected = currentRole === value;
  return (
    <label htmlFor={id} className="cursor-pointer relative block group h-full">
      <input
        type="radio"
        id={id}
        value={value}
        className="peer sr-only"
        {...register("role")}
      />
      <div
        className={`flex flex-col items-center justify-center rounded-xl border py-3 px-1 transition-all duration-200 select-none h-full text-center ${
          isSelected
            ? "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500 shadow-sm scale-[1.02]"
            : "border-gray-200 bg-white text-gray-400 hover:border-orange-200 hover:bg-orange-50/30"
        }`}
      >
        <span
          className={`text-2xl mb-1 transition-transform duration-300 ${
            isSelected
              ? "scale-110 drop-shadow-sm"
              : "grayscale group-hover:grayscale-0"
          }`}
        >
          {icon}
        </span>
        <span className="text-xs font-bold uppercase">{label}</span>
        <span className="text-[10px] opacity-80 mt-0.5">{desc}</span>
      </div>
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-0.5 shadow-md">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
      )}
    </label>
  );
}
const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);
const EyeSlashIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);
