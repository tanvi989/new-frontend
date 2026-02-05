import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ReadyForMultifocals: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Ready for Multifocals</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          How to Know If You are Ready for Multifocal Glasses
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">
              Struggling to read your phone up close, but still seeing road
              signs clearly?
            </h3>
            <p className="mb-2">
              That’s often the first sign of <strong>presbyopia</strong>, a
              natural change in near vision that usually begins in your 40s.
            </p>
            <p>
              Multifocal glasses are designed to help you move seamlessly from
              books to screens to the open road, all with a single pair of
              lenses.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-2 uppercase">
              1. You are Holding Your Phone or Book at Arm’s Length
            </h3>
            <p>
              Menu, messages, even the morning paper — they all feel clearer
              when they are farther away.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-2 uppercase">
              2. You are Switching Between Two Pairs of Glasses
            </h3>
            <p>
              One for distance. Another for reading. Juggling glasses is
              frustrating — and unnecessary.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-2 uppercase">
              3. Screens Strain Your Eyes
            </h3>
            <p>
              If your laptop or tablet feels like a gray zone — not quite near,
              not quite far — multifocals bridge that gap.
            </p>
          </section>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/glasses/men")}
              className="bg-[#232320] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base uppercase tracking-[0.15em] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full max-w-[300px] sm:w-auto"        >
              EXPLORE OUR COLLECTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyForMultifocals;
