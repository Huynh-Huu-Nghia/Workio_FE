import path from "@/constants/path";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormSchema } from "@/schemas/auth.schema";
import { useLoginMutation } from "@/api/auth.api";
import { useUser } from "@/context/user/user.context";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import logoImg from "@/assets/networking.png";
import { useState } from "react"; // ✅ Thêm useState để quản lý hiện/ẩn password
import { setAuthTokens } from "@/utils/authStorage";

type FormData = LoginFormSchema;

export default function Login() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  // ✅ State quản lý việc hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "" as any,
    },
  });

  const currentRole = watch("role");
  const loginMutation = useLoginMutation();

  const onSubmit = handleSubmit((data) => {
    console.log(">>> Gửi yêu cầu đăng nhập:", data);

    loginMutation.mutate(data as any, {
      onSuccess: (response) => {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        const user = response.data.data;

        const realRole = (user as any).role?.value || "";
        const selectedRole = data.role;

        console.log(
          `🔍 Đăng nhập thành công! Chọn [${selectedRole}] - Server trả về [${realRole}]`
        );

        if (
          realRole &&
          selectedRole &&
          realRole.toLowerCase() !== selectedRole.toLowerCase()
        ) {
          toast.info(
            `Hệ thống nhận diện bạn là "${realRole}", đang chuyển hướng...`
          );
        }

        // BE đã trả về `access_token` kèm sẵn "Bearer ...", lưu nguyên xi để dùng về sau
        setAuthTokens({ accessToken, refreshToken });
        setUser(user);

        const displayName = user.name || user.email || "bạn";
        if (!toast.isActive("welcome")) {
          toast.success(`Chào mừng ${displayName} quay lại!`, {
            toastId: "welcome",
          });
        }

        switch (realRole.toLowerCase()) {
          case "admin":
            navigate(path.ADMIN_DASHBOARD);
            break;
          case "recruiter":
            navigate(path.RECRUITER_JOBS);
            break;
          case "center":
            navigate(path.CENTER_HOME);
            break;
          default:
            navigate(path.CANDIDATE_HOME);
            break;
        }
      },

      // ✅ CẬP NHẬT LOGIC BÁO LỖI THÂN THIỆN
      onError: (error) => {
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          // const mes = error.response.data.mes; // Dữ liệu gốc từ backend (thường khó hiểu)

          // "Dịch" mã lỗi sang tiếng Việt dễ hiểu
          switch (status) {
            case 404:
              // Lỗi này xảy ra khi chọn sai cổng (VD: Recruiter đăng nhập cổng Admin)
              toast.error(
                `Không tìm thấy tài khoản này tại cổng "${data.role}". Bạn có chắc mình đã chọn đúng vai trò không?`
              );
              break;
            case 401:
              // Lỗi sai mật khẩu hoặc chưa kích hoạt
              toast.error(
                "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!"
              );
              break;
            case 403:
              toast.error(
                "Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập."
              );
              break;
            case 400:
              toast.error(
                "Dữ liệu gửi đi không hợp lệ. Vui lòng kiểm tra lại thông tin."
              );
              break;
            case 500:
              toast.error(
                "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút."
              );
              break;
            default:
              // Các lỗi lạ khác thì mới hiện message từ backend
              toast.error(
                error.response.data.mes ||
                  "Đăng nhập thất bại. Vui lòng thử lại."
              );
          }
        } else {
          // Lỗi mất mạng
          toast.error("Mất kết nối Internet! Vui lòng kiểm tra đường truyền.");
        }
      },
    });
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-20 w-20 mb-4 p-2 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Workio Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Đăng nhập Workio</h1>
          <p className="text-sm text-gray-500 mt-2">
            Hệ thống tuyển dụng & việc làm trực tuyến
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          {/* --- Chọn Role --- */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Cổng đăng nhập <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <RoleCard
                id="role-candidate"
                value="Candidate"
                label="Ứng viên"
                icon="👨‍💼"
                register={register}
                currentRole={currentRole}
              />
              <RoleCard
                id="role-recruiter"
                value="Recruiter"
                label="Tuyển dụng"
                icon="🏢"
                register={register}
                currentRole={currentRole}
              />
              <RoleCard
                id="role-center"
                value="Center"
                label="Trung tâm"
                icon="🏫"
                register={register}
                currentRole={currentRole}
              />
              <RoleCard
                id="role-admin"
                value="Admin"
                label="Admin"
                icon="⚡"
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
                Vui lòng chọn vai trò
              </p>
            )}
          </div>

          {/* --- Email Input --- */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.email
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500 focus:ring-orange-100"
              }`}
              placeholder="name@workio.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* --- Password Input (ĐÃ CẬP NHẬT NÚT SHOW/HIDE) --- */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <Link
                to={path.forgotPassword}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <div className="relative">
              <input
                // ✅ Thay đổi type dựa trên state showPassword
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none transition-all focus:ring-2 ${
                  errors.password
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 bg-white hover:border-orange-300 focus:border-orange-500 focus:ring-orange-100"
                }`}
                placeholder="••••••••"
                {...register("password")}
              />

              {/* ✅ Nút con mắt để bật tắt xem mật khẩu */}
              <button
                type="button" // Quan trọng: type="button" để không bị submit form nhầm
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                tabIndex={-1} // Không cho focus bằng tab để trải nghiệm nhập liệu mượt hơn
              >
                {showPassword ? (
                  // Icon Mắt Mở (Hiện)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
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
                ) : (
                  // Icon Mắt Gạch chéo (Ẩn)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* --- Submit Button --- */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:bg-orange-200 disabled:cursor-not-allowed transform active:scale-95 duration-200"
          >
            {loginMutation.isPending ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              to={path.resetPassword}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- ROLE CARD (Component con) ---
function RoleCard({ id, value, label, icon, register, currentRole }: any) {
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
        className={`
                flex flex-col items-center justify-center rounded-xl border py-3 px-1 transition-all duration-200 select-none h-full
                ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500 shadow-sm scale-[1.02]"
                    : "border-gray-200 bg-white text-gray-400 hover:border-orange-200 hover:bg-orange-50/30"
                }
            `}
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
        <span className="text-[10px] sm:text-[11px] font-bold uppercase">
          {label}
        </span>
      </div>

      {/* Checkmark Icon khi chọn */}
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
