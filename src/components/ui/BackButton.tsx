import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  text?: string;
  to?: string;
  className?: string;
};

export default function BackButton({
  text = "Quay lại",
  to,
  className = "",
}: Props) {
  const navigate = useNavigate();
  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={`inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{text}</span>
    </button>
  );
}
