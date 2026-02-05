import React from "react";
import { Link } from "react-router-dom";

const TravelTips: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Travel Tips</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          How to Travel with Multiple Pairs
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              What to Pack
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">Primary pair:</h4>
                <p className="text-[#525252]">
                  Your main multifocals, ideally with photochromic or UV
                  protection for changing environments.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">Backup pair:</h4>
                <p className="text-[#525252]">
                  A second pair with your full prescription just in case your
                  primary glasses are lost or damaged.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Individual hard-shell cases:
                </h4>
                <p className="text-[#525252]">
                  One for each pair, rather than storing multiple glasses
                  together in a soft pouch.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              In-Flight Tips
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Keep glasses in your carry-on
                </h4>
                <p className="text-[#525252]">
                  Checked luggage can get tossed around or exposed to extreme
                  temperatures.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Combat cabin dryness
                </h4>
                <p className="text-[#525252]">
                  Bring a travel-size lens spray and microfiber cloth. Planes
                  are dry, and smudges show up fast.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Remove glasses if you nap
                </h4>
                <p className="text-[#525252]">
                  Use a neck pillow and stow your glasses to avoid bending them
                  in your sleep.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TravelTips;
