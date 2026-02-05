import React from "react";
import { Link } from "react-router-dom";

const StorageAndHandling: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Storage and Handling</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Storage and Handling Tips for Multifocal Glasses
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Storage Guidelines
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Always use a hard case.
                </h4>
                <p className="text-[#525252]">
                  Store your glasses in a rigid case lined with soft material.
                  Pouches alone do not offer enough protection.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Never place lenses face-down.
                </h4>
                <p className="text-[#525252]">
                  Always rest glasses with the lenses facing upward to avoid
                  pressure and scratches.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Avoid extreme heat.
                </h4>
                <p className="text-[#525252]">
                  Leaving glasses on a car dashboard can expose them to
                  temperatures over 60°C (140°F), which can warp frames and
                  damage coatings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Handling Habits
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Use both hands to put on or remove glasses.
                </h4>
                <p className="text-[#525252]">
                  This prevents accidental bending or misalignment of the frame.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Hold at the bridge when cleaning.
                </h4>
                <p className="text-[#525252]">
                  Holding by the temples can twist the frame over time.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Skip the “headband” habit.
                </h4>
                <p className="text-[#525252]">
                  Wearing glasses on your head stretches the temples and changes
                  the fit.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StorageAndHandling;
