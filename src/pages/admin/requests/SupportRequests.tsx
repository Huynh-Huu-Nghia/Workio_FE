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

const SupportRequests: React.FC = () => {
  const { data, isLoading, isError, refetch } = useAdminSupportRequestsQuery();
  const updateRequest = useUpdateSupportRequestAdminMutation();
  const deleteRequest = useDeleteSupportRequestAdminMutation();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<SupportRequestPriority | "all">("all");

  const items: SupportRequest[] = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
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
      if (priorityFilter !== "all" && it.priority !== priorityFilter) return false;
      return true;
    });
  }, [items, query, statusFilter, priorityFilter]);

  const updateStatus = async (id: string, status: SupportRequestStatus) => {
    try {
      await updateRequest.mutateAsync({ requestId: id, status });
      toast.success("Đã cập nhật trạng thái.");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Cập nhật thất bại.");
    }
  };

  const updatePriority = async (id: string, p: SupportRequestPriority) => {
    try {
      await updateRequest.mutateAsync({ requestId: id, priority: p });
      toast.success("Đã cập nhật ưu tiên.");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Cập nhật thất bại.");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteRequest.mutateAsync({ requestId: id });
      toast.info("Đã xóa yêu cầu.");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || "Xóa thất bại.");
    }
  };

  const toViStatus = (status?: string) => {
    switch (status) {
      case "open":
        return "Đang mở";
      case "in_progress":
        return "Đang xử lý";
      case "resolved":
        return "Đã xong";
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
    <AdminLayout title="Yêu cầu hỗ trợ" activeMenu="request">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">Yêu cầu hỗ trợ</h1>
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
                    setStatusFilter((e.target.value as SupportRequestStatus | "all") || "all")
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
                    setPriorityFilter((e.target.value as SupportRequestPriority | "all") || "all")
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">Tất cả ưu tiên</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                  Đang tải...
                </div>
              ) : isError ? (
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
                          {new Date(it.created_at).toLocaleString("vi-VN")} •{" "}
                          {it.creator?.role?.value || "—"} •{" "}
                          {it.creator?.email || it.created_by}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Ưu tiên: {toViPriority(it.priority)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            it.status === "resolved"
                              ? "bg-green-50 text-green-700"
                              : it.status === "in_progress"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {toViStatus(it.status)}
                        </span>
                        <select
                          value={it.priority}
                          onChange={(e) =>
                            updatePriority(
                              it.id,
                              e.target.value as SupportRequestPriority
                            )
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                        >
                          <option value="low">Thấp</option>
                          <option value="medium">Trung bình</option>
                          <option value="high">Cao</option>
                        </select>
                        <select
                          value={it.status}
                          onChange={(e) =>
                            updateStatus(
                              it.id,
                              e.target.value as SupportRequestStatus
                            )
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                        >
                          <option value="open">Đang mở</option>
                          <option value="in_progress">Đang xử lý</option>
                          <option value="resolved">Đã xong</option>
                        </select>
                        {it.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(it.id, "resolved")}
                            className="rounded-lg bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-600"
                          >
                            Đã xử lý
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(it.id)}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
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
