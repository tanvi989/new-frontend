import React from "react";
import { Link } from "react-router-dom";

const FirstSevenDays: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>First 7 Days</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          What to Expect in the First 7 Days with Multifocal Lenses
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">Day 1:</h3>
            <p className="mb-4">
              Things might feel unusual. You may experience slight edge blur,
              more head movement, and stairs may look odd. Stick to familiar
              environments.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">Day 2-3:</h3>
            <p className="mb-2">Your brain starts mapping the zones:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>Top for distance.</li>
              <li>Middle for screens.</li>
              <li>Bottom for reading.</li>
            </ul>
            <p>
              Moments of “ah, that’s better” start appearing, like reading a
              menu without swapping glasses.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">Day 4-5:</h3>
            <p className="mb-4">
              Your movements start to feel automatic. Edge blur fades, screens
              and print feel sharper, and your confidence builds.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FirstSevenDays;
