import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  type = "danger",
}) => {
  if (!isOpen) return null;

  const getButtonClasses = (isConfirm: boolean) => {
    const baseClasses =
      "px-4 py-2 text-sm font-medium rounded-lg transition-colors";
    if (isConfirm) {
      switch (type) {
        case "danger":
          return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500`;
        case "warning":
          return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500`;
        case "info":
          return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500`;
        default:
          return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500`;
      }
    } else {
      return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={getButtonClasses(false)}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={getButtonClasses(true)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
