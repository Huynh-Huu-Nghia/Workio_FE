interface Props {
  register: any;
  errors: any;
  passwordRequired?: boolean;
}

export default function AccountSection({
  register,
  errors,
  passwordRequired = true,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Email */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email đăng nhập <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          placeholder="example@gmail.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Mật khẩu{" "}
          {passwordRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          placeholder="••••••"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>
    </div>
  );
}
