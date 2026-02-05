import React from "react";
import { Link } from "react-router-dom";

const CommonMistakes: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Common Mistakes</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Common Mistakes to Avoid with Multifocals
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <p className="mb-6">
              Multifocal lenses perform best when fitted and used correctly.
              Avoid these common pitfalls:
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  1. Switching Between Old and New Glasses:
                </h4>
                <p className="text-[#525252]">
                  Confuses your visual adaptation.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  2. Poor Frame Fit:
                </h4>
                <p className="text-[#525252]">
                  Sliding or crooked frames disrupt your fitting height.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  3. Not Moving Your Head:
                </h4>
                <p className="text-[#525252]">
                  Relying only on your eyes can make finding focus harder.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  4. Reading Through the Distance Zone:
                </h4>
                <p className="text-[#525252]">
                  Drop your chin to use the correct part of the lens.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  5. Choosing Frames Too Short Vertically:
                </h4>
                <p className="text-[#525252]">
                  Frames under 30mm height restrict all three vision zones.
                </p>
              </div>
            </div>

            <p className="mt-8 font-medium">
              Fixing even one of these issues can noticeably improve your
              comfort. If you need support, the MultiFolks team is here to help
              make it right.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CommonMistakes;
