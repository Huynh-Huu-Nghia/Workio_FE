import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { useForm } from "react-hook-form";
import {
  useAdminCenterDetailQuery,
  useUpdateAdminCenterMutation,
} from "@/api/center.api";
import { toast } from "react-toastify";
import ProvinceWardSelect from "@/components/ProvinceWardSelect";
import { Loader2 } from "lucide-react";

type FormValues = {
  name: string;
  code?: string;
  phone?: string;
  website?: string;
  description?: string;
  street?: string;
  ward_code?: string;
  province_code?: string;
};

const CenterEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: centerData, isLoading } = useAdminCenterDetailQuery(id);
  const updateMutation = useUpdateAdminCenterMutation();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>({
      defaultValues: {
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

  useEffect(() => {
    if (centerData?.data) {
      const center = centerData.data;
      reset({
        name: center.name || "",
        code: "", // Code is not available in the API response
        phone: center.phone || "",
        website: center.website || "",
        description: center.description || "",
        street: center.address?.street || "",
        ward_code: center.address?.ward_code || "",
        province_code: center.address?.province_code || "",
      });
    }
  }, [centerData, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!id) return;

    try {
      const payload = {
        center_id: id,
        centerInfo: {
          name: values.name,
          code: values.code,
          phone: values.phone,
          website: values.website,
          description: values.description,
        },
        addressInfo:
          values.street || values.ward_code || values.province_code
            ? {
                street: values.street,
                ward_code: values.ward_code,
                province_code: values.province_code,
              }
            : undefined,
      };

      await updateMutation.mutateAsync(payload);
      toast.success("Cập nhật trung tâm thành công!");
      navigate("/admin/centers");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mes || "Có lỗi xảy ra khi cập nhật trung tâm",
      );
    }
  });

  if (isLoading) {
    return (
      <AdminLayout title="Chỉnh sửa Trung tâm">
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
          Đang tải dữ liệu...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chỉnh sửa Trung tâm">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Chỉnh sửa Trung tâm
          </h1>
          <p className="text-sm text-gray-500">
            Cập nhật thông tin trung tâm đào tạo.
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Tên trung tâm *
              </label>
              <input
                {...register("name", { required: true })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Nhập tên trung tâm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Mã trung tâm
              </label>
              <input
                {...register("code")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Nhập mã trung tâm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Số điện thoại
              </label>
              <input
                {...register("phone")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Website
              </label>
              <input
                {...register("website")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Mô tả</label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Nhập mô tả về trung tâm"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Địa chỉ</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <ProvinceWardSelect
                provinceCode={watch("province_code") || ""}
                wardCode={watch("ward_code") || ""}
                onProvinceChange={(code) => setValue("province_code", code)}
                onWardChange={(code) => setValue("ward_code", code)}
                labelProvince="Tỉnh/Thành phố"
                labelWard="Phường/Xã"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Đường/Số nhà
              </label>
              <input
                {...register("street")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Nhập địa chỉ đường/số nhà"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/centers")}
              className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CenterEdit;
