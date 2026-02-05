import React from "react";
import EyeCheckupForm from "../components/eyeCheckup/eyeCheckupForm/EyeCheckupForm";
import { useNavigate } from "react-router-dom";

const NewEyeCheck: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] font-bold text-[#1F1F1F] font-sans">
            New Eye Checkup
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-[#1F1F1F] hover:text-[#E94D37] underline decoration-1 underline-offset-4"
          >
            Back to Home
          </button>
        </div>

        <EyeCheckupForm />
      </div>
    </div>
  );
};

export default NewEyeCheck;
