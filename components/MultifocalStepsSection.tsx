import React from "react";
import { useNavigate } from "react-router-dom";

export const MultifocalStepsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-12 border-b border-gray-100 font-sans">
      <div className="max-w-[1480px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Card 1: Buying Your First Multifocals? */}
          <div className="flex flex-row lg:flex-row h-full group">
            <div className="flex-1 py-8 px-6 flex flex-col justify-center items-start">
              <h3 className="text-[#1F1F1F] text-[22px] font-bold leading-tight mb-2">
                Buying Your First Multifocals?
              </h3>
              <p className="text-gray-500 text-[14px] mb-6">We Make It Easy</p>
              <button
                onClick={() => navigate("/quiz")}
                className="bg-[#1F4B43] text-white text-[11px] font-bold px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#15332E] transition-colors"
              >
                Get Started
              </button>
            </div>
            <div className="w-[140px] bg-[#EA9A63] flex items-end justify-center overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                alt="Woman with glasses"
                className="w-full h-full object-cover mix-blend-overlay opacity-90"
              />
              {/* Illustration placeholder overlay */}
              <div className="absolute inset-0 bg-[#EA9A63] opacity-20 mix-blend-color"></div>
            </div>
          </div>

          {/* Card 2: Replacing An Existing Pair? */}
          <div className="flex flex-row lg:flex-row h-full group">
            <div className="flex-1 py-8 px-6 flex flex-col justify-center items-start">
              <h3 className="text-[#1F1F1F] text-[22px] font-bold leading-tight mb-2">
                Replacing An Existing Pair?
              </h3>
              <p className="text-gray-500 text-[14px] mb-6">
                You are at the right place.
              </p>
              <button
                onClick={() => navigate("/glasses/men")}
                className="bg-[#1F4B43] text-white text-[11px] font-bold px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#15332E] transition-colors"
              >
                Get Started
              </button>
            </div>
            <div className="w-[140px] bg-[#7A8B58] flex items-end justify-center overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400"
                alt="Man with glasses"
                className="w-full h-full object-cover mix-blend-overlay opacity-90"
              />
              <div className="absolute inset-0 bg-[#7A8B58] opacity-20 mix-blend-color"></div>
            </div>
          </div>

          {/* Card 3: Browse Our Multifocals */}
          <div className="flex flex-row lg:flex-row h-full group">
            <div className="flex-1 py-8 px-6 flex flex-col justify-center items-start">
              <h3 className="text-[#1F1F1F] text-[22px] font-bold leading-tight mb-2">
                Browse Our Multifocalss
              </h3>
              <p className="text-gray-500 text-[14px] mb-6">
                We've got you covered.
              </p>
              <button
                onClick={() => navigate("/glasses/women")}
                className="bg-[#1F4B43] text-white text-[11px] font-bold px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#15332E] transition-colors"
              >
                Shop Now
              </button>
            </div>
            <div className="w-[140px] bg-[#D63D26] flex items-end justify-center overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400"
                alt="Woman with glasses"
                className="w-full h-full object-cover mix-blend-overlay opacity-90"
              />
              <div className="absolute inset-0 bg-[#D63D26] opacity-20 mix-blend-color"></div>
            </div>
          </div>

          {/* Card 4: 1000+ Ways To Style Yourself */}
          <div className="flex flex-row lg:flex-row h-full group">
            <div className="flex-1 py-8 px-6 flex flex-col justify-center items-start">
              <h3 className="text-[#1F1F1F] text-[22px] font-bold leading-tight mb-2">
                1000+ Ways To Style Yourself
              </h3>
              <p className="text-gray-500 text-[14px] mb-6">&nbsp;</p>
              <button
                onClick={() => navigate("/glasses/men")}
                className="bg-[#1F4B43] text-white text-[11px] font-bold px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#15332E] transition-colors"
              >
                Browse Collection
              </button>
            </div>
            <div className="w-[140px] bg-[#4A86B0] flex items-end justify-center overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
                alt="Man with glasses"
                className="w-full h-full object-cover mix-blend-overlay opacity-90"
              />
              <div className="absolute inset-0 bg-[#4A86B0] opacity-20 mix-blend-color"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
