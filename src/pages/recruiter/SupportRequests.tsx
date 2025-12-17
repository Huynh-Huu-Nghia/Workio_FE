import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCreateSupportRequestMutation, useMySupportRequestsQuery } from "@/api/requests.api";
import { Link, useLocation } from "react-router-dom";
import { pathtotitle } from "@/configs/pagetitle";

const RecruiterSupportRequests: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Yêu cầu hỗ trợ";

  const { data, isLoading, isError, refetch } = useMySupportRequestsQuery();
  const createMutation = useCreateSupportRequestMutation();

  const [query, setQuery] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const items = data?.data ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const submit = async () => {
    if (!titleInput.trim()) {
      toast.error("Vui lòng nhập tiêu đề.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: titleInput.trim(),
        description: description.trim(),
        priority,
      });
      toast.success("Đã gửi yêu cầu hỗ trợ.");
      setTitleInput("");
      setDescription("");
      setPriority("medium");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Gửi yêu cầu thất bại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500">
              Bạn tạo yêu cầu, Admin sẽ tiếp nhận và xử lý.
            </p>
          </div>
          <Link
            to="/recruiter/settings"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cài đặt tài khoản
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-semibold text-gray-800">Tạo yêu cầu</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Tiêu đề
                </label>
                <input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="VD: Không tạo được tin đăng"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Mô tả chi tiết..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={createMutation.isPending}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:bg-orange-200"
              >
                {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Tổng: <b className="text-gray-900">{items.length}</b>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-80 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Tìm theo tiêu đề/mô tả..."
              />
            </div>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                  Đang tải...
                </div>
              ) : isError ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-red-600">
                  Không thể tải danh sách. Kiểm tra token/backend.
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                  Chưa có yêu cầu nào.
                </div>
              ) : (
                filtered.map((it) => (
                  <article
                    key={it.id}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {it.title}
                        </h3>
                        {it.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {it.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(it.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Priority: {it.priority}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {it.status}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterSupportRequests;

