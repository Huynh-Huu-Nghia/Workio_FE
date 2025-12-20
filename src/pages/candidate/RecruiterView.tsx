import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateLayout from "@/layouts/CandidateLayout";
import { useCandidateRecruiterDetailQuery } from "@/api/recruiter.api";
import { ArrowLeft, Loader2, Mail, MapPin, Phone, Globe, Building2 } from "lucide-react";

type InfoRowProps = {
  label: string;
  value?: React.ReactNode;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value || "—"}</span>
  </div>
);

const CandidateRecruiterView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCandidateRecruiterDetailQuery(id);
  const apiErr = data && (data as any).err !== 0;
  const recruiter = !apiErr ? (data?.data as any) : null;

  return (
    <CandidateLayout title="Nhà tuyển dụng">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-5 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            Đang tải thông tin nhà tuyển dụng...
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            Không thể tải thông tin nhà tuyển dụng.
          </div>
        )}

        {!isLoading && !isError && apiErr && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            {(data as any)?.mes || "Không tìm thấy nhà tuyển dụng."}
          </div>
        )}

        {!isLoading && !isError && recruiter && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-xl font-bold text-orange-600">
                  {recruiter.company_name?.charAt(0) || "N"}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">
                    {recruiter.company_name || "Chưa cập nhật"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {recruiter?.recruiter?.email || recruiter.email || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <InfoRow label="Số điện thoại" value={recruiter.phone || "Chưa cập nhật"} />
                <InfoRow label="Website" value={recruiter.website || "Không có website"} />
                <InfoRow label="Mã số thuế" value={recruiter.tax_number || "—"} />
                <InfoRow label="Trạng thái" value={recruiter.is_verified ? "Đã xác thực" : "Chưa xác thực"} />
                <InfoRow label="Đã tuyển" value={typeof recruiter.hired_count === "number" ? recruiter.hired_count : 0} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800">Thông tin liên hệ</h2>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {recruiter.phone || "Chưa cập nhật"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {recruiter?.recruiter?.email || recruiter.email || "Chưa cập nhật"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    {recruiter.website || "Không có website"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800">Địa chỉ</h2>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {recruiter.address?.street || "Chưa cập nhật"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {recruiter.address?.ward_code || "—"} • {recruiter.address?.province_code || "—"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800">Giới thiệu</h2>
                <p className="mt-2 text-sm text-gray-700">
                  {recruiter.description || "Nhà tuyển dụng chưa cập nhật mô tả chi tiết."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

export default CandidateRecruiterView;
