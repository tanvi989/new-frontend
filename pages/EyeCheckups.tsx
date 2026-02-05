import React from "react";
import { useNavigate } from "react-router-dom";
import EyeCheckupTable from "../components/eyeCheckup/eyeCheckupList/EyeCheckupTable";

const EyeCheckups: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[22px] font-bold text-[#1F1F1F] font-sans">
            Eye checkup List
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/new-eye-check")}
              className="px-6 py-2 bg-[#232320] text-white rounded-full font-bold text-sm hover:bg-black transition-colors shadow-lg uppercase tracking-wider"
            >
              + New Checkup
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-bold text-[#1F1F1F] hover:text-[#E94D37] underline decoration-1 underline-offset-4 flex items-center"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Table Component */}
        <EyeCheckupTable />
      </div>
    </div>
  );
};

export default EyeCheckups;
