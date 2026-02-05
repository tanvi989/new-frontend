import React from "react";
import { useNavigate } from "react-router-dom";

const StyleBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#F5F5F5] py-12 px-4 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Side - Image */}
            <div className="relative bg-gradient-to-r from-pink-50 to-pink-100 p-12 lg:p-16 flex items-center justify-center">
              <div className="relative">
                {/* Glasses Image */}
                <img
                  src="/style-banner-glasses.png"
                  alt="Eyeglasses"
                  className="w-full max-w-[400px] h-auto object-contain"
                />
                {/* Model Number Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <span
                      className="text-[#E74C3C] font-bold text-2xl tracking-wider"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }}
                    >
                      M146.16
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="p-12 lg:p-16 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F1F1F] mb-8">
                A style right for you
              </h2>
              <button
                onClick={() => navigate("/glasses/women")}
                className="bg-[#2C2C2C] hover:bg-[#1F1F1F] text-white font-semibold text-sm uppercase tracking-wider px-10 py-4 rounded-full transition-all duration-300 hover:scale-105"
              >
                EXPLORE OUR COLLECTION
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StyleBanner;
