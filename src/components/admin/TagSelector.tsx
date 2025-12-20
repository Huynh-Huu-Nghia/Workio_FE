import React from "react";

export interface TagOption {
  value: string;
  label: string;
  color: "blue" | "orange" | "red" | "green" | "yellow";
}

interface TagSelectorProps {
  options: TagOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const colorClasses = {
  blue: "bg-blue-500 text-white",
  orange: "bg-orange-500 text-white",
  red: "bg-red-500 text-white",
  green: "bg-green-500 text-white",
  yellow: "bg-yellow-500 text-white",
};

const inactiveClass =
  "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer";

const TagSelector: React.FC<TagSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  showLabel = false,
  size = "sm",
}) => {
  const paddingClass = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`rounded-full font-semibold transition ${paddingClass} ${
            selectedValue === opt.value
              ? `${colorClasses[opt.color]} shadow-md`
              : inactiveClass
          }`}
        >
          {showLabel ? `${opt.label}: ${opt.value}` : opt.label}
        </button>
      ))}
    </div>
  );
};

export default TagSelector;
