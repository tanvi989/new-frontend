import React, { useState } from "react";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  isOpen = false,
}) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div className="border-b border-gray-200 py-4 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group py-1"
      >
        <span className="text-[15px] font-bold text-[#1F1F1F] group-hover:text-black capitalize tracking-wide">
          {title}
        </span>
        <span
          className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        >
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M1 1L5 5L9 1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${open
            ? "grid-rows-[1fr] opacity-100 mt-3"
            : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="min-h-0">{children}</div>
      </div>
    </div>
  );
};
