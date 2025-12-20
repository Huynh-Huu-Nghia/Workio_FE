import AdminLayout from "@/layouts/AdminLayout";
import path from "@/constants/path";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminRecruiterDetailQuery } from "@/api/recruiter.api";
import {
  Loader2,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Briefcase,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users,
} from "lucide-react";

const parseList = (value?: string[] | string | null) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const formatNumber = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN").format(value ?? 0);

const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || "Chưa cập nhật"}</p>
  </div>
);

const TagGroup = ({ label, items }: { label: string; items: string[] }) => (
  <div>
    <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
    {items.length ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">Chưa cập nhật.</p>
    )}
  </div>
);

export default function RecruiterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminRecruiterDetailQuery(id);
  const apiErr = data && (data as any).err !== 0;
  const recruiter = !apiErr ? (data?.data as any) : null;
  const primaryFields = recruiter ? parseList(recruiter.fields) : [];
  const relatedFields = recruiter ? parseList(recruiter.related_fields) : [];
  const industries = recruiter ? parseList(recruiter.industry) : [];
  const handleBack = () => {
    const canUseHistory = typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    navigate(path.ADMIN_RECRUITER_LIST);
  };

  return (
    <AdminLayout
      title="Chi tiết Nhà tuyển dụng"
      activeMenu="recruiters"
      activeSubmenu="all-recruiters"
    >
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            Đang tải dữ liệu...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-red-700">
            Không thể tải dữ liệu NTD.
          </div>
        )}

        {!isLoading && !isError && apiErr && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-red-700">
            {(data as any)?.mes || "Không tìm thấy nhà tuyển dụng."}
          </div>
        )}

        {!isLoading && !isError && recruiter && (
          <>
            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  id: "status",
                  label: "Trạng thái",
                  value: recruiter.is_verified ? "Đã xác thực" : "Chờ xác thực",
                  icon: BadgeCheck,
                  accent: recruiter.is_verified
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600",
                },
                {
                  id: "hired",
                  label: "Nhân sự đã tuyển",
                  value: formatNumber(recruiter.hired_count),
                  icon: Users,
                  accent: "bg-indigo-50 text-indigo-600",
                },
                {
                  id: "fields",
                  label: "Lĩnh vực chính",
                  value: primaryFields[0] || "Chưa cập nhật",
                  icon: Building2,
                  accent: "bg-blue-50 text-blue-600",
                },
                {
                  id: "industry",
                  label: "Ngành ưu tiên",
                  value: industries[0] || "Chưa cập nhật",
                  icon: Briefcase,
                  accent: "bg-orange-50 text-orange-600",
                },
              ].map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-gray-900 line-clamp-1">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100 text-2xl font-bold text-orange-600">
                      {recruiter.company_name?.charAt(0) || "N"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-600">
                        Doanh nghiệp đối tác
                      </p>
                      <h2 className="text-lg font-bold text-gray-900">
                        {recruiter.company_name || "Chưa cập nhật"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {recruiter?.user?.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 text-sm">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {recruiter.phone || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {recruiter.website || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {recruiter?.user?.email || recruiter.email || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl border border-dashed border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Mã số thuế
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {recruiter.tax_number || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Trạng thái kiểm duyệt
                  </h3>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Xác thực tài khoản
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {recruiter.is_verified ? "Đã xác thực" : "Chờ xác thực"}
                      </p>
                    </div>
                    <BadgeCheck
                      className={`h-10 w-10 ${
                        recruiter.is_verified ? "text-emerald-500" : "text-amber-500"
                      }`}
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Trạng thái được đồng bộ từ hệ thống quản trị dựa trên giấy tờ pháp
                    lý và lịch sử hợp tác với Workio.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400">
                        Tổng quan doanh nghiệp
                      </p>
                      <h3 className="text-xl font-bold text-gray-900">
                        Giới thiệu & sứ mệnh
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-700">
                    {recruiter.description || "Doanh nghiệp chưa cập nhật mô tả chi tiết."}
                  </p>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <TagGroup label="Lĩnh vực chính" items={primaryFields} />
                    <TagGroup label="Lĩnh vực liên quan" items={relatedFields} />
                  </div>
                  <div className="mt-5">
                    <TagGroup label="Ngành ưu tiên" items={industries} />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Thông tin liên hệ & pháp lý
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem label="Website" value={recruiter.website} />
                    <InfoItem label="Email liên hệ" value={recruiter?.user?.email || recruiter.email} />
                    <InfoItem label="Điện thoại" value={recruiter.phone} />
                    <InfoItem label="Mã số thuế" value={recruiter.tax_number} />
                    <InfoItem label="Đã tuyển" value={formatNumber(recruiter.hired_count)} />
                    <InfoItem label="Trạng thái" value={recruiter.is_verified ? "Đã xác thực" : "Chờ xác thực"} />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400">Địa chỉ hoạt động</p>
                      <h3 className="text-base font-bold text-gray-900">Thông tin địa lý & khu vực</h3>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-gray-500">Đường</p>
                      <p className="font-semibold text-gray-900">
                        {recruiter.address?.street || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phường/Xã</p>
                      <p className="font-semibold text-gray-900">
                        {recruiter.address?.ward_code || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tỉnh/TP</p>
                      <p className="font-semibold text-gray-900">
                        {recruiter.address?.province?.name || recruiter.address?.province_code || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-gray-600">
                    Các thông tin địa lý này phục vụ đối chiếu khu vực tuyển dụng và giao tiếp với trung tâm đào tạo.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
