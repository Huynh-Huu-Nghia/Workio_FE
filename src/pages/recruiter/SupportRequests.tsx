import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCreateSupportRequestMutation, useMySupportRequestsQuery } from "@/api/requests.api";
import { Link, useLocation } from "react-router-dom";
import { pathtotitle } from "@/configs/pagetitle";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import path from "@/constants/path";
import { useUser } from "@/context/user/user.context";

const RecruiterSupportRequests: React.FC = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Yêu cầu hỗ trợ";
  const { user } = useUser(); // 2. Lấy user từ context

  const { data, isLoading, isError, refetch } = useMySupportRequestsQuery(user?.id);
  const createMutation = useCreateSupportRequestMutation();

  const formatDate = (value?: string | number | Date | null) => {
    if (!value) return "—";

    try {
      let date: Date | null = null;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === "number") {
        const ts = value < 1e12 ? value * 1000 : value; // seconds -> ms
        date = new Date(ts);
      } else if (typeof value === "string") {
        let s = value.trim();
        if (!s) return "—";

        if (/^\d+$/.test(s)) {
          let ts = parseInt(s, 10);
          ts = ts < 1e12 ? ts * 1000 : ts;
          date = new Date(ts);
        } else {
          const mainPart = s.split("+")[0].split("Z")[0];
          const trimmedMain = mainPart.split(".")[0];
          if (trimmedMain.includes(" ") && !trimmedMain.includes("T")) {
            const [d, t] = trimmedMain.split(" ");
            s = `${d}T${t}Z`;
          }
          date = new Date(s);
        }
      }

      if (!date || isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const [query, setQuery] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [sortBy, setSortBy] = useState<"created_desc" | "created_asc">("created_desc");

  const items = data?.data ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? items
      : items.filter(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            (it.description || "").toLowerCase().includes(q)
        );

    const sorted = [...list];
    sorted.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at as any).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at as any).getTime() : 0;
      return sortBy === "created_desc" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [items, query, sortBy]);

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

  const toViStatus = (status?: string) => {
    switch (status) {
      case "open":
        return "Đang mở";
      case "in_progress":
        return "Đang xử lý";
      case "resolved":
        return "Đã giải quyết";
      default:
        return status || "Không rõ";
    }
  };

  const toViPriority = (priority?: string) => {
    switch (priority) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      default:
        return priority || "Không rõ";
    }
  };

  return (
    <RecruiterLayout title={title}>
      <div className="space-y-5">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">
                Bạn tạo yêu cầu, Admin sẽ tiếp nhận và xử lý.
              </p>
            </div>
            <Link
              to={path.RECRUITER_PROFILE}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hồ sơ & cài đặt
            </Link>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
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
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>
                  Tổng: <b className="text-gray-900">{items.length}</b>
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  Hiển thị: {filtered.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Tìm theo tiêu đề/mô tả..."
                />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy((e.target.value as "created_desc" | "created_asc") || "created_desc")
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="created_desc">Mới nhất</option>
                  <option value="created_asc">Cũ nhất</option>
                </select>
              </div>
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
                          {formatDate(it.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Ưu tiên: {toViPriority(it.priority)}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {toViStatus(it.status)}
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
    </RecruiterLayout>
  );
};

export default RecruiterSupportRequests;
