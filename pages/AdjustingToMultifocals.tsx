import React from "react";
import { Link } from "react-router-dom";

const AdjustingToMultifocals: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Adjusting to Multifocals</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          How Long Does It Take to Adjust to Multifocal Glasses?
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              The 3 Adaptation Phases
            </h3>
            <ol className="list-decimal pl-5 space-y-4 text-[#525252]">
              <li>
                <strong>Initial Awareness (Days 1–3):</strong> Your eyes
                identify the zones; things may feel slightly “swimmy.”
              </li>
              <li>
                <strong>Active Adjustment (Days 4–10):</strong> Your brain
                begins reprogramming, making near-to-far transitions feel
                natural.
              </li>
              <li>
                <strong>Comfort Zone (Day 11+):</strong> You forget you are
                wearing them. The ultimate sign of full adaptation.
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdjustingToMultifocals;
