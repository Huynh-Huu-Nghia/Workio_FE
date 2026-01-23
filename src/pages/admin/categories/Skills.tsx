import React, { useMemo, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = "workio_admin_categories_skills_v1";

const readItems = (): CategoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CategoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeItems = (items: CategoryItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const Skills: React.FC = () => {
  const [items, setItems] = useState<CategoryItem[]>(() => readItems());
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, query]);

  const add = () => {
    const value = name.trim();
    if (!value) return;
    const exists = items.some(
      (it) => it.name.toLowerCase() === value.toLowerCase(),
    );
    if (exists) {
      toast.info("Kỹ năng đã tồn tại.");
      return;
    }
    const next = [
      {
        id: crypto.randomUUID(),
        name: value,
        createdAt: new Date().toISOString(),
      },
      ...items,
    ];
    setItems(next);
    writeItems(next);
    setName("");
    toast.success("Đã thêm kỹ năng.");
  };

  const remove = (id: string) => {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    writeItems(next);
  };

  return (
    <AdminLayout title="Kỹ năng" activeMenu="categories" fullWidth={true}>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Danh mục kỹ năng
          </h1>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Thêm kỹ năng
            </h2>
            <div className="mt-3 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="VD: ReactJS"
              />
              <button
                type="button"
                onClick={add}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Thêm
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Tổng: <b className="text-gray-900">{items.length}</b>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full sm:w-80 rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Tìm kỹ năng..."
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                  Chưa có kỹ năng nào.
                </div>
              ) : (
                filtered.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {it.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(it.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Xóa
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Skills;
