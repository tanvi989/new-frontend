import React from "react";
import { Link } from "react-router-dom";

const ProgressiveFitCheck: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Fine Tune the Fit</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Fine- Tune the Fit: How to Adjust Your Glasses Frame at Home
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <p className="mb-6">
              Not quite sitting right? Here's how to adjust your glasses frame
              at home for a more secure, comfortable fit.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  1. Glasses Slide Down?
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                  <li>
                    <strong>Plastic frames:</strong> Soak arms in warm water for
                    30 seconds, then bend the temple tips slightly downward.
                  </li>
                  <li>
                    <strong>Metal frames:</strong> Gently curve the temple tips
                    inward for a tighter grip behind the ears.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  2. One Side Sits Higher?
                </h4>
                <p className="text-[#525252]">
                  Bend the arm on the higher side upward at the hinge — this
                  lowers the frame on that side. Or bend the lower side downward
                  to raise it.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  3. Too Tight or Too Loose at the Temples?
                </h4>
                <p className="text-[#525252]">
                  Gently bend the arms outward to loosen or inward to tighten
                  grip on your head.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  4. Uncomfortable Nose Fit (Metal Frames Only)?
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                  <li>
                    <strong>Too high:</strong> Spread the nose pads apart.
                  </li>
                  <li>
                    <strong>Too low:</strong> Bring nose pads closer together.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1F1F] mb-1">
                  5. Frame Sits Too Far or Too Close to Eyes?
                </h4>
                <p className="text-[#525252]">
                  Slightly bend the temple arms near the hinge inward or outward
                  to adjust how close the frame sits to your face.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveFitCheck;
