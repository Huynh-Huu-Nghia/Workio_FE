import React, { useMemo, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { toast } from "react-toastify";
import {
  type SupportRequest,
  type SupportRequestPriority,
  type SupportRequestStatus,
  useAdminSupportRequestsQuery,
  useDeleteSupportRequestAdminMutation,
  useUpdateSupportRequestAdminMutation,
} from "@/api/requests.api";
import TagSelector, { type TagOption } from "@/components/admin/TagSelector";

const SupportRequests: React.FC = () => {
  const { data, isLoading, isError } = useAdminSupportRequestsQuery();
  const updateRequest = useUpdateSupportRequestAdminMutation();
  const deleteRequest = useDeleteSupportRequestAdminMutation();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    SupportRequestStatus | "all"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    SupportRequestPriority | "all"
  >("all");
  const [sortBy, setSortBy] = useState<
    "created_desc" | "created_asc" | "priority" | "status"
  >("created_desc");

  const items: SupportRequest[] = data?.data ?? [];

  // Priority and Status options for TagSelector
  const priorityOptions: TagOption[] = [
    { value: "low", label: "Thấp", color: "blue" },
    { value: "medium", label: "Trung", color: "orange" },
    { value: "high", label: "Cao", color: "red" },
  ];

  const statusOptions: TagOption[] = [
    { value: "open", label: "Mở", color: "yellow" },
    { value: "in_progress", label: "Xử lý", color: "blue" },
    { value: "resolved", label: "Xong", color: "green" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredList = items.filter((it) => {
      if (
        q &&
        !(
          it.title.toLowerCase().includes(q) ||
          (it.description || "").toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (statusFilter !== "all" && it.status !== statusFilter) return false;
      if (priorityFilter !== "all" && it.priority !== priorityFilter)
        return false;
      return true;
    });
    const sorted = [...filteredList];

    sorted.sort((a, b) => {
      if (sortBy === "created_desc" || sortBy === "created_asc") {
        const ta = a.created_at ? new Date(a.created_at as any).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at as any).getTime() : 0;
        return sortBy === "created_desc" ? tb - ta : ta - tb;
      }

      if (sortBy === "priority") {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const pa = order[a.priority] ?? 99;
        const pb = order[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        const ta = a.created_at ? new Date(a.created_at as any).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at as any).getTime() : 0;
        return tb - ta;
      }

      if (sortBy === "status") {
        const order: Record<string, number> = {
          open: 0,
          in_progress: 1,
          resolved: 2,
        };
        const sa = order[a.status] ?? 99;
        const sb = order[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        const ta = a.created_at ? new Date(a.created_at as any).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at as any).getTime() : 0;
        return tb - ta;
      }

      return 0;
    });

    return sorted;
  }, [items, query, statusFilter, priorityFilter, sortBy]);
  const updateStatus = async (id: string, status: SupportRequestStatus) => {
    try {
      await updateRequest.mutateAsync({ requestId: id, status });
      toast.success("Đã cập nhật trạng thái.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Cập nhật thất bại.");
    }
  };

  const updatePriority = async (id: string, p: SupportRequestPriority) => {
    try {
      await updateRequest.mutateAsync({ requestId: id, priority: p });
      toast.success("Đã cập nhật ưu tiên.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Cập nhật thất bại.");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteRequest.mutateAsync({ requestId: id });
      toast.info("Đã xóa yêu cầu.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  const toViRole = (role?: string) => {
    if (!role) return "—";
    switch (role.toLowerCase()) {
      case "candidate":
        return "Ứng viên";
      case "recruiter":
        return "Nhà tuyển dụng";
      case "center":
        return "Trung tâm";
      case "admin":
        return "Quản trị viên";
      default:
        return role;
    }
  };

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

        // Numeric timestamp string
        if (/^\d+$/.test(s)) {
          let ts = parseInt(s, 10);
          ts = ts < 1e12 ? ts * 1000 : ts;
          date = new Date(ts);
        } else {
          // Normalize common DB timestamp format: "YYYY-MM-DD HH:mm:ss[.fff][+..]"
          // Safari không parse được dạng có khoảng trắng, nên đổi thành ISO.
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

  return (
    <AdminLayout title="Yêu cầu hỗ trợ" activeMenu="request" fullWidth={true}>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Yêu cầu hỗ trợ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Admin quản lý danh sách; các role khác có thể tạo yêu cầu.
          </p>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-3">
          <div className="lg:col-span-3">
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
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      (e.target.value as SupportRequestStatus | "all") || "all",
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="open">Đang mở</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="resolved">Đã xong</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(
                      (e.target.value as SupportRequestPriority | "all") ||
                        "all",
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">Tất cả ưu tiên</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      (e.target.value as
                        | "created_desc"
                        | "created_asc"
                        | "priority"
                        | "status") || "created_desc",
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="created_desc">Mới nhất</option>
                  <option value="created_asc">Cũ nhất</option>
                  <option value="priority">Ưu tiên (Cao → Thấp)</option>
                  <option value="status">Trạng thái</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                  Đang tải...
                </div>
              ) : isError || data?.err === 1 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-red-600">
                  Không thể tải yêu cầu hỗ trợ. Kiểm tra backend/token.
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                  Chưa có yêu cầu nào.
                </div>
              ) : (
                filtered.map((it) => (
                  <article
                    key={it.id}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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
                          {formatDate(it.created_at)} •{" "}
                          {toViRole(it.creator?.role?.value)} •{" "}
                          {it.creator?.email || it.created_by}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-col gap-2">
                          {/* Priority Tags */}
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-600">
                              Ưu tiên:
                            </p>
                            <TagSelector
                              options={priorityOptions}
                              selectedValue={it.priority}
                              onSelect={(p) =>
                                updatePriority(
                                  it.id,
                                  p as SupportRequestPriority,
                                )
                              }
                              size="sm"
                            />
                          </div>

                          {/* Status Tags */}
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-600">
                              Trạng thái:
                            </p>
                            <TagSelector
                              options={statusOptions}
                              selectedValue={it.status}
                              onSelect={(s) =>
                                updateStatus(it.id, s as SupportRequestStatus)
                              }
                              size="sm"
                            />
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => remove(it.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          {deleteRequest.isPending ? "..." : "Xóa"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportRequests;
