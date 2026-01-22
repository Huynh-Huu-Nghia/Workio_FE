import React from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { useForm } from "react-hook-form";
import { useCreateCenterMutation } from "@/api/admin.api";
import { toast } from "react-toastify";
import ProvinceWardSelect from "@/components/ProvinceWardSelect";
import { useNavigate } from "react-router-dom";

type FormValues = {
  email: string;
  password: string;
  name: string;
  code?: string;
  phone?: string;
  website?: string;
  description?: string;
  street?: string;
  ward_code?: string;
  province_code?: string;
};

const CenterCreate: React.FC = () => {
  const mutation = useCreateCenterMutation();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      code: "",
      phone: "",
      website: "",
      description: "",
      street: "",
      ward_code: "",
      province_code: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        email: values.email,
        password: values.password,
        centerInfo: {
          name: values.name,
          code: values.code,
          phone: values.phone,
          website: values.website,
          description: values.description,
        },
        addressInfo: {
          street: values.street,
          ward_code: values.ward_code,
          province_code: values.province_code,
        },
      };
      const res = await mutation.mutateAsync(payload as any);
      if (res?.err === 0) {
        toast.success(res?.mes || "Tạo trung tâm thành công");
        navigate("/admin/centers");
      } else {
        toast.error(res?.mes || "Tạo trung tâm thất bại");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Tạo trung tâm thất bại");
    }
  });

  return (
    <AdminLayout title="Thêm trung tâm" activeMenu="center">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Thêm trung tâm
          </h1>
          <p className="text-sm text-gray-500">
            Điền thông tin tài khoản, trung tâm và địa chỉ.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2 font-semibold text-gray-700">
            Tài khoản
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              {...register("email")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="center@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu *
            </label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="••••••"
              required
            />
          </div>

          <div className="sm:col-span-2 font-semibold text-gray-700 pt-2">
            Thông tin trung tâm
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên trung tâm *
            </label>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="Tên trung tâm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã trung tâm
            </label>
            <input
              {...register("code")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="Mã tùy chọn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Điện thoại
            </label>
            <input
              {...register("phone")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="SĐT"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              {...register("website")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="https://..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              rows={3}
              placeholder="Giới thiệu ngắn"
            />
          </div>

          <div className="sm:col-span-2 font-semibold text-gray-700 pt-2">
            Địa chỉ
          </div>
          <div className="sm:col-span-2 grid gap-4 md:grid-cols-2">
            <ProvinceWardSelect
              provinceCode={watch("province_code") || ""}
              wardCode={watch("ward_code") || ""}
              onProvinceChange={(code) => {
                setValue("province_code", code);
                setValue("ward_code", "");
              }}
              onWardChange={(code) => setValue("ward_code", code)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Đường
            </label>
            <input
              {...register("street")}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
              placeholder="Số nhà, đường"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
            >
              {mutation.isPending ? "Đang tạo..." : "Tạo trung tâm"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CenterCreate;
