import React from "react";
import { Button } from "./Button";

interface FilterProps {
  date?: boolean;
  download?: boolean;
  fromDate?: string;
  toDate?: string;
  setFromDate?: (date: string) => void;
  setToDate?: (date: string) => void;
  handleDownload?: () => void;
}

export const Filter: React.FC<FilterProps> = ({
  date = false,
  download = false,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  handleDownload,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-sans mb-6">
      {date && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="font-bold text-[#1F1F1F] text-sm uppercase tracking-wide">
            Filter By Date:
          </span>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <input
              type="date"
              value={fromDate || ""}
              max={toDate}
              onChange={(e) => setFromDate?.(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-[#1F1F1F] text-sm rounded-lg focus:ring-2 focus:ring-[#F3CB0A] focus:border-[#F3CB0A] block p-2.5 outline-none transition-all font-medium w-full md:w-auto cursor-pointer"
            />

            <span className="text-gray-400 font-medium text-sm">to</span>

            <input
              type="date"
              value={toDate || ""}
              min={fromDate}
              onChange={(e) => setToDate?.(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-[#1F1F1F] text-sm rounded-lg focus:ring-2 focus:ring-[#F3CB0A] focus:border-[#F3CB0A] block p-2.5 outline-none transition-all font-medium w-full md:w-auto cursor-pointer"
            />
          </div>
        </div>
      )}

      {download && handleDownload && (
        <div className="w-full md:w-auto">
          <Button
            onClick={handleDownload}
            variant="primary"
            className="w-full md:w-auto !py-2.5 !px-6 !text-sm shadow-none hover:shadow-md"
          >
            <span className="flex items-center gap-2 justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download List
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Filter);
