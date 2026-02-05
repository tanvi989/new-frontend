import React from "react";

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F3F0E7]/90 backdrop-blur-sm font-sans">
      <div className="flex flex-col items-center justify-center">
        {/* Replacement for loader.gif using SVG */}
        <div className="relative w-[100px] h-[100px] flex items-center justify-center">
          <svg
            className="animate-spin h-16 w-16 text-[#232320]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-100"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <span className="text-[#232320] font-bold text-sm uppercase tracking-[0.2em] animate-pulse mt-2">
          Loading
        </span>
      </div>
    </div>
  );
};

export const Loader2: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-[100px] flex items-center justify-center">
        <svg
          className="animate-spin h-12 w-12 text-[#232320]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          ></circle>
          <path
            className="opacity-100"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Loader;
