import { toast } from "react-toastify";

interface Props {
  register: any;
  errors: any;
  setValue?: any;
  passwordRequired?: boolean;
}

export default function AccountSection({
  register,
  errors,
  setValue,
  passwordRequired = true,
}: Props) {
  const generatePassword = (length = 12) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
    let out = "";
    for (let i = 0; i < length; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  };

  const handleGenerate = async () => {
    const pwd = generatePassword(12);
    try {
      if (setValue)
        setValue("password", pwd, { shouldValidate: true, shouldDirty: true });
      await navigator.clipboard.writeText(pwd);
      toast.success("Mật khẩu đã được tạo và sao chép vào clipboard");
    } catch (err) {
      if (setValue) setValue("password", pwd);
      toast.info("Mật khẩu đã được tạo (không thể sao chép vào clipboard)");
    }
  };

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

      {/* Password with generate button */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Mật khẩu {passwordRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="password"
            {...register("password")}
            className="flex-1 rounded-lg border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            placeholder="••••••"
          />
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Tạo
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>
    </div>
  );
}
