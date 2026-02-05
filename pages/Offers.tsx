import React from "react";
import { useNavigate } from "react-router-dom";

const Offers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans pt-32 md:pt-44">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mb-16 md:mb-20">
          
          {/* Left Icon */}
          <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] shrink-0 relative">
            <img
              src="/eye.png"
              alt="Eye illustration"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-[45%] h-[45%]">
                <path d="M10 50 Q50 10 90 50 Q50 90 10 50" fill="#F37021" />
                <circle cx="50" cy="50" r="12" fill="#F3F0E7" />
              </svg>
            </div>
          </div>

          {/* Center Text */}
          <div className="text-center flex-1 px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1F1F] mb-6 md:mb-8 uppercase tracking-wide">
              FLAT 50% OFF - USE CODE LAUNCH50
            </h1>
            <button
              onClick={() => navigate("/glasses")}
              className="bg-[#025048] text-white px-10 sm:px-12 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#036c61] transition-all shadow-lg"
            >
              BUY NOW
            </button>
          </div>

          {/* Right Icon */}
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[200px] md:h-[200px] shrink-0 pointer-events-none relative">
            <img
              src="/q5.png"
              alt="Profile illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-[#EAEAEA]/30 p-6 sm:p-8 md:p-12 rounded-sm flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          
          <div className="flex-1 space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] mb-3">
                Terms & Conditions of the Offer
              </h3>
              <ul className="list-decimal pl-5 space-y-1 text-[#333] text-sm font-medium">
                <li>Minimum order value £150 and above</li>
                <li>Valid once per user</li>
                <li>Valid for first 1000 users only</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] mb-3">
                Benefits you get always with every order
              </h3>
              <ul className="list-decimal pl-5 space-y-1 text-[#333] text-sm font-medium">
                <li>Free Standard Shipping</li>
                <li>1.61 Index Premium Varifocal Lenses with AR coating</li>
                <li>30 days return guarantee</li>
                <li>24/7 support</li>
                <li>Complimentary case & lens cleaning cloth</li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/glasses")}
              className="bg-[#025048] text-white px-8 sm:px-10 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#036c61] transition-all shadow-lg"
            >
              BUY NOW
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <img
              src="E19B8501-2.jpg"
              alt="Glasses"
              className="max-w-full h-auto max-h-[220px] sm:max-h-[260px] md:max-h-[300px] object-contain mix-blend-multiply"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Offers;
