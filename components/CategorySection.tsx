import React from "react";
import { useNavigate } from "react-router-dom";

export const CategorySection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MEN Button */}
          <button
            onClick={() => navigate("/glasses/men")}
            className="group relative h-[80px] md:h-[100px] bg-[#F3F0E7] hover:bg-[#232320] transition-colors duration-300 rounded-lg overflow-hidden flex items-center justify-center"
          >
            <span className="text-[#232320] group-hover:text-white text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase transition-colors duration-300">
              MEN
            </span>
          </button>

          {/* WOMEN Button */}
          <button
            onClick={() => navigate("/glasses/women")}
            className="group relative h-[80px] md:h-[100px] bg-[#F3F0E7] hover:bg-[#232320] transition-colors duration-300 rounded-lg overflow-hidden flex items-center justify-center"
          >
            <span className="text-[#232320] group-hover:text-white text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase transition-colors duration-300">
              WOMEN
            </span>
          </button>
        </div>

        {/* Get $50 EMECASH on Signup */}
        <div className="text-center mt-12">
          <p className="text-[#232320] text-lg font-medium">
            Get $50 EMECASH on Signup
          </p>
        </div>
      </div>
    </section>
  );
};
