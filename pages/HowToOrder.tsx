import React from "react";
import { Link } from "react-router-dom";

const HowToOrder: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          How to Order Prescription Glasses Online
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Step 1: Find a Frame That Fits You
            </h3>
            <p className="mb-4">
              The right glasses do not just look good. They need to feel natural
              and work seamlessly with your lenses.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Step 2: Add Your Prescription
            </h3>
            <p className="mb-4">
              Your prescription is the foundation of your lenses. Upload it or
              enter it manually.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowToOrder;
