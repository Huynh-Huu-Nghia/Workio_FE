import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function AccountSettingsCard({
  title,
  subtitle,
  initialName,
  initialEmail,
  initialAvatarUrl,
  onSave,
  onLogout,
  isSaving,
}: {
  title: string;
  subtitle?: string;
  initialName: string;
  initialEmail: string;
  initialAvatarUrl: string;
  onSave: (payload: { name: string; avatar_url: string }) => Promise<void>;
  onLogout: () => Promise<void> | void;
  isSaving?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const initials = useMemo(() => {
    const source = (name || initialEmail || "A").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "A";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }, [name, initialEmail]);

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh.");
      return;
    }
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("File quá lớn (tối đa 2MB).");
      return;
    }

    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    });
    setAvatarUrl(dataUrl);
    toast.info("Đã chọn ảnh. Bấm “Lưu thay đổi” để cập nhật.");
  };

  const submit = async () => {
    try {
      await onSave({ name, avatar_url: avatarUrl });
      toast.success("Đã lưu cài đặt.");
    } catch (e: any) {
      toast.error(e?.response?.data?.mes || e?.response?.data?.message || "Lưu thất bại.");
    }
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">
                  {initials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onPickAvatar}
              className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600"
              title="Đổi avatar"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onAvatarFileChange(e.target.files?.[0])}
            />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Ảnh đại diện</p>
            <p className="text-xs text-gray-500">
              Chọn ảnh để lưu vào `avatar_url` (data URL). Hoặc dán link ở ô bên dưới.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Email</label>
          <input
            value={initialEmail}
            disabled
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Tên hiển thị</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="VD: Workio User"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Avatar URL / Data URL
          </label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={submit}
            disabled={Boolean(isSaving)}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:bg-orange-200"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={() => onLogout()}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </section>
  );
}
