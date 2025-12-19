import React from "react";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Định nghĩa màu sắc cho từng trạng thái
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-yellow-50 text-yellow-700 border-yellow-200",
    blocked: "bg-red-50 text-red-700 border-red-200",
  };

  // Định nghĩa nhãn hiển thị tiếng Việt
  const labels: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Chờ xác thực",
    blocked: "Đã khóa",
  };

  const normalizedStatus = status.toLowerCase();

  return (
    <span
      className={`
        px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide
        ${styles[normalizedStatus] || "bg-gray-100 text-gray-600"}
      `}
    >
      {labels[normalizedStatus] || status}
    </span>
  );
};

export default StatusBadge;
