import path from "@/constants/path";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormSchema,
} from "@/schemas/auth.schema";
import { useForgotPasswordMutation } from "@/api/auth.api";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import logoImg from "@/assets/networking.png";
import { useState } from "react";

type FormData = ForgotPasswordFormSchema;

export default function ForgotPassword() {
  // 1. State kiểm soát: false = hiện form nhập liệu, true = hiện giao diện check mail
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      role: "" as any,
    },
  });

  const currentRole = watch("role");
  const forgotPasswordMutation = useForgotPasswordMutation();

  const onSubmit = handleSubmit((data) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: (response: any) => {
        const { err, mes } = response.data;

        if (err === 0) {
          // ✅ THAY ĐỔI QUAN TRỌNG:
          // Thay vì navigate() ngay, ta bật state này lên để đổi giao diện
          setIsEmailSent(true);
          toast.success(mes || "Đã gửi yêu cầu thành công!");
        } else {
          // Nếu lỗi logic (err=1), hiện thông báo lỗi
          toast.error(
            mes || "Thông tin không chính xác. Vui lòng kiểm tra lại."
          );
        }
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response) {
          const data = error.response.data;
          toast.error(data?.mes || "Lỗi kết nối máy chủ.");
        } else {
          toast.error("Không thể kết nối đến máy chủ.");
        }
      },
    });
  });

  // 2. GIAO DIỆN THÀNH CÔNG (Sẽ hiện ra khi isEmailSent = true)
  // Đây là phần code "dài hơn" mà bạn đang thiếu
  if (isEmailSent) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100 text-center">
          {/* Icon Email Bay */}
          <div className="h-24 w-24 mx-auto mb-6 p-4 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 19v-8.93a2 2 0 01.89-1.664l7.171-5.197m0 0A2 2 0 0117.91 6.613l7.181 5.196M12.073 3.416l-7.17 5.197m7.17-5.196l7.197 5.196M3 19a2 2 0 002 2h14a2 2 0 002-2v-5.159l-5.375-2.688M3 19l6.125-3.063M21 19l-6.125-3.063M3 19l6.125-3.063m11.875 3.063L14.875 15.938"
              ></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Kiểm tra hòm thư của bạn!
          </h2>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <p className="text-gray-600 text-sm">
              Link đặt lại mật khẩu đã được gửi đến:
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1 break-all">
              {getValues("email")}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Nếu không thấy email, vui lòng kiểm tra cả mục <b>Spam</b> hoặc{" "}
            <b>Quảng cáo</b>.
          </p>

          <div className="space-y-3">
            {/* Nút mở Gmail */}
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"></path>
              </svg>
              Mở Gmail ngay
            </a>

            {/* Nút thử lại */}
            <button
              onClick={() => setIsEmailSent(false)}
              className="block w-full rounded-lg border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Nhập lại email khác
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to={path.login}
              className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-orange-600"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. GIAO DIỆN FORM NHẬP LIỆU (Mặc định)
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 mb-4 p-2 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Workio Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu?</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
            Đừng lo! Chọn vai trò và nhập email, chúng tôi sẽ giúp bạn lấy lại
            mật khẩu.
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          {/* Role Selection */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Bạn thuộc đối tượng nào? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <RoleCard
                id="role-candidate"
                value="Candidate"
                label="Ứng viên"
                desc="Tôi tìm việc"
                icon="👨‍💼"
                register={register}
                currentRole={currentRole}
              />
              <RoleCard
                id="role-recruiter"
                value="Recruiter"
                label="Nhà tuyển dụng"
                desc="Tôi đăng tuyển"
                icon="🏢"
                register={register}
                currentRole={currentRole}
              />
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-500 font-medium animate-pulse flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                Vui lòng chọn cổng đăng nhập cũ
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email đăng ký
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                className={`w-full rounded-lg border px-4 py-3 pl-10 text-sm outline-none transition-all focus:ring-2 ${
                  errors.email
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500 focus:ring-orange-100"
                }`}
                placeholder="name@example.com"
                {...register("email")}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">✉️</span>
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:bg-orange-200 disabled:cursor-not-allowed transform active:scale-95 duration-200"
          >
            {forgotPasswordMutation.isPending
              ? "Đang gửi yêu cầu..."
              : "Gửi link khôi phục"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to={path.login}
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Component RoleCard (Giữ nguyên) ---
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
