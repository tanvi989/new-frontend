import React from "react";
import { Link } from "react-router-dom";

const AllDayComfort: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>All-Day Comfort</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Give your eyes a gentle start with your new lenses
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <p className="mb-6">
              Few small habits can make the transition smoother. Here’s how to
              ease in comfortably:
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Follow the 20-20-20 rule:
                </h4>
                <p className="text-[#525252]">
                  Every 20 minutes, look at something 20 feet away for 20
                  seconds. It helps reduce eye fatigue, especially during screen
                  time.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Take pauses in dry or low-light settings:
                </h4>
                <p className="text-[#525252]">
                  Your eyes work harder in tough environments. Let them rest
                  when needed.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Listen to your eyes:
                </h4>
                <p className="text-[#525252]">
                  If you feel strain, dryness, or a headache coming on, take a
                  short break. A quick reset can help.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  Why it matters:
                </h4>
                <p className="text-[#525252]">
                  Adjusting to multifocals is like giving your vision a new
                  rhythm. These small pauses help your brain and eyes sync with
                  your lenses for smoother focus and less fatigue throughout the
                  day.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AllDayComfort;
