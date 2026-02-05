import React from "react";
import { Link } from "react-router-dom";

const CleanWithoutScratches: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Clean Without Scratches</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          How to Clean Multifocal Lenses Without Scratching Them
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              The Do’s for Cleaning
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Rinse with lukewarm water first
                </h4>
                <p className="text-[#525252]">
                  Always run lenses under gentle, lukewarm water before wiping.
                  Even invisible dust can scratch coatings if wiped dry.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Use a lens-specific cleaner
                </h4>
                <p className="text-[#525252]">
                  Skip dish soap or glass spray. Use a pH-neutral, alcohol-free
                  cleaner designed for optical lenses.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Dry with microfiber only
                </h4>
                <p className="text-[#525252]">
                  A clean microfiber cloth is the safest way to dry. Shirts,
                  tissues, or paper towels can leave lint, scratches, or
                  streaks.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Keep the frame clean
                </h4>
                <p className="text-[#525252]">
                  Clean the nose pads and edges regularly. Dirt buildup here can
                  transfer back to your lenses.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              The Don’ts to Avoid Damage
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">No hot water.</h4>
                <p className="text-[#525252]">
                  High heat can warp lens coatings. Stick to lukewarm.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  No ammonia, vinegar, or glass cleaners.
                </h4>
                <p className="text-[#525252]">
                  These break down coatings and can cloud the lenses.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  No circular rubbing.
                </h4>
                <p className="text-[#525252]">
                  Gently swipe in one direction to avoid micro-abrasions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CleanWithoutScratches;
