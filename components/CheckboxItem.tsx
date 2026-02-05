import React from "react";

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  color?: string; // Optional color prop for visual indicator
}

export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  checked,
  onChange,
  color,
}) => (
  <label className="flex items-center gap-3 cursor-pointer hover:opacity-80 mb-2 group">
    <div className="relative flex items-center justify-center w-4 h-4">
      <input
        type="checkbox"
        className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-[2px] checked:bg-[#1F1F1F] checked:border-[#1F1F1F] transition-all duration-200 ease-in-out cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
      <svg
        className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <div className="flex items-center gap-2 flex-1">
      {color && (
        <span
          style={{ background: color }}
          className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0"
        />
      )}
      <span
        className={`text-[13px] transition-colors duration-200 ${checked
          ? "text-[#1F1F1F] font-medium"
          : "text-[#525252] font-normal group-hover:text-[#1F1F1F]"
          }`}
      >
        {label}
      </span>
    </div>
  </label>
);
