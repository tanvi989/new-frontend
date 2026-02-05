import React from "react";
import { Link } from "react-router-dom";

const HowWeMeasure: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>How We Measure</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          How MultiFolks Measures PD and Fitting Height via Webcam
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              How It Works:
            </h3>

            <div className="mb-6">
              <h4 className="font-bold text-[#1F1F1F] mb-2">
                1. Frame Mapping:
              </h4>
              <p className="text-[#525252]">
                Once you choose a frame, we digitally map its lens width and
                depth for exact scaling.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-[#1F1F1F] mb-2">
                2. AI-Powered Face Capture:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                <li>Our system guides you to face the camera naturally.</li>
                <li>
                  It detects your pupils, head tilt, and posture automatically.
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-[#1F1F1F] mb-2">
                3. Measurement and Verification:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                <li>PD is calculated to ±1mm accuracy (single or dual).</li>
                <li>Fitting height is captured for each eye individually.</li>
                <li>
                  You receive a visual confirmation before checkout so you can
                  review.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowWeMeasure;
