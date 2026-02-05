import React from "react";
import { Link } from "react-router-dom";

const ProgressiveVsBifocal: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Progressive vs. Bifocal vs. Single Vision</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Progressive vs. Bifocal vs. Single Vision: What’s Right for You?
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              1. Single Vision Lenses
            </h3>
            <p className="mb-2">One consistent power across the entire lens.</p>
            <p className="font-bold text-[#1F1F1F] mb-1">Best For:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-2">
              <li>People under 40 with basic correction needs.</li>
              <li>Those needing only distance or only reading glasses.</li>
              <li>Anyone comfortable swapping pairs for different tasks.</li>
            </ul>
            <p className="text-sm italic text-[#525252]">
              May require two separate pairs if you need both reading and
              distance correction.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              2. Bifocal Lenses
            </h3>
            <p className="mb-2">
              Two distinct powers in a single lens, divided by a visible line.
            </p>
            <p className="font-bold text-[#1F1F1F] mb-1">Best For:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-2">
              <li>People comfortable with a “split zone” format.</li>
              <li>Those seeking a budget-friendly dual-correction option.</li>
            </ul>
            <p className="font-bold text-[#1F1F1F] mb-1">Considerations:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252]">
              <li>Sudden shifts between zones can feel abrupt.</li>
              <li>The visible line is a cosmetic drawback for some.</li>
              <li>No built-in intermediate (screen) vision.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              3. Progressive Lenses
            </h3>
            <p className="mb-2">
              Seamless vision at all distances with no visible lines.
            </p>
            <p className="font-bold text-[#1F1F1F] mb-1">Best For:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-2">
              <li>People over 40 with both distance and near correction.</li>
              <li>Those seeking a sleek, line-free look.</li>
              <li>
                Digital users who need clarity across devices, documents, and
                distances.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Why Choose Progressives?
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>More natural vision flow without a line.</li>
              <li>One pair for all-day wear.</li>
              <li>Built-in intermediate zone, unlike bifocals.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveVsBifocal;
