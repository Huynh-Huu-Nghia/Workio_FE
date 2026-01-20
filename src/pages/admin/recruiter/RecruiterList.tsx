import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Eye,
  Search,
  XCircle,
  Printer,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  useGetAllRecruitersQuery,
  useCreateRecruiterMutation,
} from "@/api/recruiter.api";
import { useNavigate } from "react-router-dom";
import { INDUSTRY_OPTIONS } from "@/constants/industries";
import { useProvincesQuery, useWardsQuery } from "@/api/provinces.api";

const RecruiterList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [showVerified, setShowVerified] = useState<
    "all" | "verified" | "pending"
  >("all");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [showCreate, setShowCreate] = useState(false);

  // Province/ward data (ensure these are declared only once)
  const { data: provinceData } = useProvincesQuery?.() || { data: [] };
  const { data: wardData } = useWardsQuery?.(true) || { data: [] };
  const filteredWardOptions = React.useMemo(() => {
    if (!wardData) return [];
    return wardData.filter((ward: any) =>
      provinceFilter
        ? String(ward.province_code) === String(provinceFilter)
        : true,
    );
  }, [wardData, provinceFilter]);
  const activeFilterTags: { label: string; onRemove: () => void }[] = [];
  if (searchTerm)
    activeFilterTags.push({
      label: `Từ khóa: "${searchTerm}"`,
      onRemove: () => setSearchTerm(""),
    });
  if (fields.length)
    fields.forEach((f) =>
      activeFilterTags.push({
        label: `Ngành: ${f}`,
        onRemove: () => setFields(fields.filter((x) => x !== f)),
      }),
    );
  if (showVerified !== "all")
    activeFilterTags.push({
      label: showVerified === "verified" ? "Đã xác thực" : "Chờ xác thực",
      onRemove: () => setShowVerified("all"),
    });
  if (provinceFilter)
    activeFilterTags.push({
      label: `Tỉnh: ${provinceFilter}`,
      onRemove: () => setProvinceFilter(""),
    });
  if (wardFilter)
    activeFilterTags.push({
      label: `Phường/Xã: ${wardFilter}`,
      onRemove: () => setWardFilter(""),
    });
  // --- UI FILTERS ---
  // Helper text for filter
  const filterHelper =
    "Chỉ lọc theo các tiêu chí quan trọng. Bộ lọc nâng cao giúp quản trị chi tiết hơn.";

  // --- RENDER ---
  // Place filter UI inside main return block, wrapped in a fragment or parent element
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123456Aa!");
  const [newPhone, setNewPhone] = useState("");
  const [newTax, setNewTax] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEstablished, setNewEstablished] = useState("");
  const [isVerifiedQuick, setIsVerifiedQuick] = useState(false);
  const [addrStreet, setAddrStreet] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrWard, setAddrWard] = useState("");
  const navigate = useNavigate();
  const createMutation = useCreateRecruiterMutation();

  const { data, isLoading, isError, refetch } = useGetAllRecruitersQuery({
    search: searchTerm || undefined,
    is_verified:
      showVerified === "all"
        ? undefined
        : showVerified === "verified"
          ? true
          : false,
    sort_by: sortBy || undefined,
    order,
    fields: fields.length ? fields : undefined,
  });
  const apiErr = data && (data as any).err !== 0;
  const recruiters = !apiErr ? (data?.data ?? []) : [];
  // Removed duplicate province/ward state and data declarations and useEffect.

  const parseFields = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [val];
      }
    }
    return [];
  };

  const filtered = useMemo(() => {
    return recruiters.filter((rec) => {
      const keyword = searchTerm.toLowerCase();
      const matchesKeyword =
        rec.company_name?.toLowerCase().includes(keyword) ||
        rec.user?.email?.toLowerCase().includes(keyword) ||
        rec.phone?.toLowerCase().includes(keyword) ||
        false;

      if (!matchesKeyword) return false;

      if (fields.length) {
        const recFieldSources = [
          parseFields((rec as any).fields),
          parseFields((rec as any).related_fields),
          parseFields((rec as any).industry),
        ];
        const recFields = recFieldSources.reduce<string[]>((acc, curr) => {
          if (Array.isArray(curr) && curr.length) {
            acc.push(...curr);
          }
          return acc;
        }, []);
        const hasMatch =
          Array.isArray(recFields) &&
          recFields.some((f: string) => fields.includes(f));
        if (!hasMatch) return false;
      }

      if (showVerified === "verified") return Boolean(rec.is_verified);
      if (showVerified === "pending") return !rec.is_verified;
      const recProvince =
        rec.address?.province_code ??
        rec.address?.province?.code ??
        rec.province?.code ??
        rec.province_code ??
        null;
      if (
        provinceFilter &&
        String(recProvince || "") !== String(provinceFilter)
      ) {
        return false;
      }
      const recWard = rec.address?.ward_code ?? rec.ward_code ?? null;
      if (wardFilter && String(recWard || "") !== String(wardFilter)) {
        return false;
      }
      return true;
    });
  }, [
    recruiters,
    searchTerm,
    showVerified,
    fields,
    provinceFilter,
    wardFilter,
  ]);

  const printRecruiterProfile = (rec: any, password?: string) => {
    const html = `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hồ sơ Nhà tuyển dụng - ${rec.company_name || ""}</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
              margin: 0 0 10px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header .subtitle {
              font-size: 16px;
              color: #64748b;
              margin: 0;
            }
            .section {
              margin-bottom: 25px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
              align-items: flex-start;
            }
            .info-row:last-child {
              margin-bottom: 0;
            }
            .label {
              font-weight: bold;
              color: #374151;
              min-width: 140px;
              flex-shrink: 0;
              margin-right: 15px;
            }
            .value {
              color: #111827;
              flex: 1;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-verified {
              background: #dcfce7;
              color: #166534;
            }
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
            .print-date {
              font-style: italic;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hồ sơ Nhà tuyển dụng</h1>
            <p class="subtitle">Thông tin chi tiết công ty và liên hệ</p>
          </div>

          <div class="section">
            <div class="section-title">📋 Thông tin cơ bản</div>
            <div class="info-row">
              <span class="label">Tên công ty:</span>
              <span class="value">${rec.company_name || "Chưa cập nhật"}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${rec.user?.email || "Chưa cập nhật"}</span>
            </div>
            <div class="info-row">
              <span class="label">Số điện thoại:</span>
              <span class="value">${rec.phone || "Chưa cập nhật"}</span>
            </div>
            <div class="info-row">
              <span class="label">Mật khẩu:</span>
              <span class="value">${password || "Đã được mã hóa"}</span>
            </div>
            <div class="info-row">
              <span class="label">Mã số thuế:</span>
              <span class="value">${rec.tax_number || "Chưa cập nhật"}</span>
            </div>
            <div class="info-row">
              <span class="label">Website:</span>
              <span class="value">${rec.website || "Chưa cập nhật"}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🏢 Thông tin doanh nghiệp</div>
            <div class="info-row">
              <span class="label">Ngày thành lập:</span>
              <span class="value">${rec.established_at ? new Date(rec.established_at).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</span>
            </div>
            <div class="info-row">
              <span class="label">Mô tả công ty:</span>
              <span class="value">${rec.description || "Chưa cập nhật"}</span>
            </div>
            <div class="info-row">
              <span class="label">Trạng thái xác thực:</span>
              <span class="status-badge ${rec.is_verified ? "status-verified" : "status-pending"}">
                ${rec.is_verified ? "✓ Đã xác thực" : "⏳ Chờ xác thực"}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Số lượng đã tuyển:</span>
              <span class="value">${rec.hired_count ?? 0} ứng viên</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📍 Địa chỉ liên hệ</div>
            <div class="info-row">
              <span class="label">Địa chỉ:</span>
              <span class="value">
                ${rec.street || ""}${rec.street && (rec.ward_code || rec.province_code) ? ", " : ""}
                ${rec.ward_code ? "Phường/Xã " + rec.ward_code : ""}${rec.ward_code && rec.province_code ? ", " : ""}
                ${rec.province_code ? "Tỉnh/TP " + rec.province_code : ""}
                ${!rec.street && !rec.ward_code && !rec.province_code ? "Chưa cập nhật" : ""}
              </span>
            </div>
          </div>

          <div class="footer">
            <div class="print-date">
              In ngày: ${new Date().toLocaleDateString("vi-VN")} lúc ${new Date().toLocaleTimeString("vi-VN")}
            </div>
            <div style="margin-top: 10px;">
              Hệ thống quản lý tuyển dụng Workio
            </div>
          </div>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newEmail.trim()) {
      alert("Nhập tối thiểu tên công ty và email");
      return;
    }
    try {
      const res = await createMutation.mutateAsync({
        email: newEmail.trim(),
        password: newPassword || "123456Aa!",
        recruiterInfo: {
          company_name: newCompany.trim(),
          phone: newPhone || "",
          description: newDescription || "",
          tax_number: newTax || "",
          website: newWebsite || "",
          established_at: newEstablished || "",
          is_verified: isVerifiedQuick,
        },
        addressInfo: {
          street: addrStreet || "",
          province_code: addrProvince || "",
          ward_code: addrWard || "",
        },
      } as any);
      if ((res as any)?.err === 0) {
        alert((res as any)?.mes || "Đã tạo NTD");
        setShowCreate(false);
        setNewCompany("");
        setNewEmail("");
        setNewPassword("123456Aa!");
        setNewPhone("");
        setNewTax("");
        setNewWebsite("");
        setNewDescription("");
        setNewEstablished("");
        setIsVerifiedQuick(false);
        setAddrStreet("");
        setAddrProvince("");
        setAddrWard("");
        await refetch();
      } else {
        alert((res as any)?.mes || "Tạo thất bại");
      }
    } catch (err: any) {
      alert(err?.response?.data?.mes || "Tạo thất bại");
    }
  };

  return (
    <AdminLayout
      title="Danh sách Nhà tuyển dụng"
      activeMenu="recruiters"
      activeSubmenu="all-recruiters"
      fullWidth={true}
    >
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-10">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thêm Nhà tuyển dụng
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Tên công ty *</label>
                  <input
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="Công ty TNHH ABC"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="contact@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Số điện thoại</label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mã số thuế</label>
                  <input
                    value={newTax}
                    onChange={(e) => setNewTax(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Website</label>
                  <input
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Ngày thành lập
                  </label>
                  <input
                    type="date"
                    value={newEstablished}
                    onChange={(e) => setNewEstablished(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Mô tả</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  rows={2}
                  placeholder="Thông tin tóm tắt"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Đường</label>
                  <input
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="Số nhà, đường"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tỉnh/TP</label>
                  <select
                    value={addrProvince}
                    onChange={(e) => setAddrProvince(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinceData?.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phường/Xã</label>
                  <select
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
                  >
                    <option value="">Chọn phường/xã</option>
                    {wardData
                      ?.filter(
                        (w) =>
                          !addrProvince ||
                          String(w.province_code) === String(addrProvince),
                      )
                      .map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </div>
                <label className="mt-6 inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isVerifiedQuick}
                    onChange={(e) => setIsVerifiedQuick(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  Đánh dấu đã xác thực
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Mật khẩu mặc định: 123456Aa! (yêu cầu NTD đổi sau).
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                >
                  {createMutation.isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Quản lý Nhà tuyển dụng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi và quản lý danh sách nhà tuyển dụng.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => refetch()}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Làm mới
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 sm:w-auto"
              >
                + Thêm mới
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
              <div className="md:col-span-2 xl:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên công ty, email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <select
                value={showVerified}
                onChange={(e) =>
                  setShowVerified(
                    e.target.value as "all" | "verified" | "pending",
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Tất cả</option>
                <option value="verified">Đã xác thực</option>
                <option value="pending">Chờ xác thực</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Sắp xếp</option>
                <option value="company_name">Tên công ty</option>
                <option value="created_at">Ngày tạo</option>
                <option value="updated_at">Ngày cập nhật</option>
              </select>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Tỉnh/TP</option>
                {provinceData?.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                disabled={!provinceFilter}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">Phường/Xã</option>
                {filteredWardOptions.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                className="text-xs text-orange-600 underline"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                {showAdvanced ? "Thu gọn" : "Bộ lọc nâng cao"}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                {/* Advanced filters can be added here */}
              </div>
            )}

            <div className="text-xs text-gray-400 mb-2">{filterHelper}</div>

            {/* Active filter tags */}
            {activeFilterTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {activeFilterTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-700"
                  >
                    {tag.label}
                    <button
                      type="button"
                      onClick={tag.onRemove}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              <span className="text-xs text-gray-500">Ngành:</span>
              {INDUSTRY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={fields.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) setFields([...fields, opt]);
                      else setFields(fields.filter((f) => f !== opt));
                    }}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  {opt}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
              <div className="md:col-span-2 xl:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên công ty, email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <select
                value={showVerified}
                onChange={(e) =>
                  setShowVerified(
                    e.target.value as "all" | "verified" | "pending",
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">Tất cả</option>
                <option value="verified">Đã xác thực</option>
                <option value="pending">Chờ xác thực</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Sắp xếp</option>
                <option value="company_name">Tên công ty</option>
                <option value="created_at">Ngày tạo</option>
                <option value="updated_at">Ngày cập nhật</option>
              </select>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Tỉnh/TP</option>
                {provinceData?.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                disabled={!provinceFilter}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">Phường/Xã</option>
                {filteredWardOptions.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 px-5 pb-4 text-xs text-gray-700">
            <span className="text-xs text-gray-500">Ngành liên quan:</span>
            {INDUSTRY_OPTIONS.map((opt) => (
              <label
                key={opt}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={fields.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) setFields([...fields, opt]);
                    else setFields(fields.filter((f) => f !== opt));
                  }}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="flex h-48 items-center justify-center text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
              Đang tải dữ liệu...
            </div>
          )}

          {isError && (
            <div className="flex h-48 items-center justify-center text-red-500">
              <XCircle className="mr-2 h-5 w-5" />
              Không thể tải danh sách nhà tuyển dụng.
            </div>
          )}

          {!isLoading && !isError && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3">Công ty</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Mã số thuế</th>
                  <th className="px-4 py-3">Nhân viên đã tuyển</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apiErr ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-red-600 bg-red-50"
                    >
                      {(data as any)?.mes || "Không tải được danh sách NTD."}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Không có nhà tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rec) => (
                    <tr
                      key={rec.recruiter_id}
                      className="hover:bg-orange-50/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {rec.company_name || "Chưa cập nhật"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Website: {rec.website || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-gray-700">
                          <span className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {rec.user?.email || "Không có email"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.phone || "Chưa có số điện thoại"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {rec.tax_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {rec.hired_count ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            rec.is_verified
                              ? "bg-green-50 text-green-600"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {rec.is_verified ? "Đã xác thực" : "Chờ xác thực"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/recruiters/view/${rec.recruiter_id}`,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </button>
                        <button
                          onClick={() => printRecruiterProfile(rec)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-green-50 ml-2"
                        >
                          <Printer className="h-4 w-4" />
                          In
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RecruiterList;
