import React, { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  useSocialInsurancesQuery,
  useUnemploymentBenefitsQuery,
} from "@/api/social.api";

const SocialInsuranceLookup: React.FC = () => {
  const [identifyNumber, setIdentifyNumber] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(identifyNumber.trim());
  };

  const {
    data: socialData,
    isFetching: isSocialLoading,
    isError: socialError,
  } = useSocialInsurancesQuery(submittedId);
  const {
    data: benefitData,
    isFetching: isBenefitLoading,
    isError: benefitError,
  } = useUnemploymentBenefitsQuery(submittedId);

  const records = socialData?.data ?? [];
  const benefits = benefitData?.data;

  const totalSalary = useMemo(() => {
    return records.reduce((sum, rec) => {
      const salary = Number(rec.salary_base || 0);
      return sum + salary;
    }, 0);
  }, [records]);

  return (
    <AdminLayout title="Tra cứu BHXH" activeMenu="social">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Tra cứu bảo hiểm xã hội
          </h1>
          <p className="text-sm text-gray-500">
            Dựa trên API /admin/social-insurances và /admin/unemployed-benefits.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={identifyNumber}
              onChange={(e) => setIdentifyNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="Nhập số CMND/CCCD của ứng viên"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Tra cứu
          </button>
        </form>

        {submittedId === "" ? (
          <div className="p-6 text-center text-gray-500">
            Nhập số định danh để bắt đầu tra cứu.
          </div>
        ) : (
          <>
            {(isSocialLoading || isBenefitLoading) && (
              <div className="flex h-48 items-center justify-center text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-orange-500" />
                Đang tải dữ liệu...
              </div>
            )}

            {(socialError || benefitError) && (
              <div className="p-6 text-center text-red-500">
                Không thể lấy dữ liệu BHXH.
              </div>
            )}

            {!isSocialLoading && !socialError && (
              <div className="p-5">
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-orange-50/80 p-4">
                    <p className="text-sm text-gray-600">Tổng lương đã khai</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(totalSalary)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-blue-50/60 p-4">
                    <p className="text-sm text-gray-600">Ước tính trợ cấp</p>
                    {isBenefitLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : benefits ? (
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-800">
                          {formatCurrency(benefits.totalBenefits)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tổng số tháng đóng: {benefits.totalMonths}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                        <th className="px-4 py-3">Công ty</th>
                        <th className="px-4 py-3">Từ</th>
                        <th className="px-4 py-3">Đến</th>
                        <th className="px-4 py-3 text-right">Lương BHXH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-gray-500"
                          >
                            Không tìm thấy dữ liệu BHXH.
                          </td>
                        </tr>
                      ) : (
                        records.map((rec) => (
                          <tr key={rec.id}>
                            <td className="px-4 py-3 text-gray-800">
                              {rec.company_name || "Không rõ"}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {rec.start_date || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {rec.end_date || "Đến nay"}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-800">
                              {formatCurrency(rec.salary_base || 0)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

export default SocialInsuranceLookup;
