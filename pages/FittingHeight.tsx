import React from "react";
import { Link } from "react-router-dom";

const FittingHeight: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Fitting Height</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          What Is Fitting Height and Why Does It Matter?
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              What Exactly Is Fitting Height?
            </h3>
            <p className="mb-2">
              Fitting height is the distance from the bottom of your eyeglass
              frame to the center of your pupil when you’re looking straight
              ahead in a natural, relaxed posture.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>
                It positions the near zone exactly where your eyes drop when
                reading.
              </li>
              <li>
                It ensures the intermediate and distance zones align with your
                typical gaze angles.
              </li>
            </ul>
            <p>
              Without the right fitting height, progressives can feel
              off-balance, making adaptation harder and reducing visual comfort.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              How MultiFolks Gets It Right
            </h3>
            <p className="mb-2">
              Unlike traditional methods, which rely on in-store marks and
              rulers, MultiFolks uses AI-powered face mapping via webcam to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>Capture the exact frame dimensions you’ve chosen.</li>
              <li>
                Measure your pupil position in real time as you look naturally
                at the camera.
              </li>
              <li>
                Lock in your fitting height so each lens zone aligns with your
                posture and head angle.
              </li>
            </ul>
            <p>
              This process gives ±1mm precision, helping your lenses feel
              comfortable from the first wear.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FittingHeight;
