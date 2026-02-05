import React from "react";
import { Link } from "react-router-dom";

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="w-full bg-[#AAB7FF] relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-[1200px] w-full px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-12 py-12">
          {/* Left: Image/Graphic Bubble */}
          <div className="w-[280px] md:w-[320px] shrink-0">
            <div className="relative bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform -rotate-3 flex flex-col items-center justify-center h-[240px]">
              <h2 className="text-[42px] font-black text-[#1F1F1F] leading-[0.9] text-center font-sans">
                NEED
                <br />
                HELP?
              </h2>
              {/* Bell/Alarm Icon Decoration */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-20 border-4 border-white transform rotate-12">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="#1F1F1F"
                  stroke="none"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                  {/* Impact lines */}
                  <path
                    d="M20 6l2-2M2 6l2-2M22 14l-2-2M2 14l2-2"
                    stroke="#1F1F1F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
              {/* Bubble Tail */}
              <div className="absolute -bottom-4 left-12 w-8 h-8 bg-white transform rotate-45"></div>
            </div>
          </div>

          {/* Right: Text */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-bold text-[#1F1F1F] uppercase tracking-wide leading-none">
              FEEL FREE TO REACH OUT TO US.
            </h1>

            <div className="mt-8 hidden md:block">
              <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
                <Link to="/" className="hover:underline">
                  Home
                </Link>
                <span>/</span>
                <span>Help</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-24 text-center">
        <div className="bg-white">
          <h2 className="text-[32px] font-bold text-[#1F1F1F] mb-6 font-serif">
            When to Seek Help
          </h2>

          <p className="text-[#525252] text-lg font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
            Most adaptation issues resolve with time and consistent wear, but
            sometimes a professional touch is needed.
          </p>

          <p className="text-[#525252] text-lg font-medium mb-8">
            Reach out to us at{" "}
            <a
              href="mailto:support@multifolks.com"
              className="text-[#E94D37] font-bold hover:underline"
            >
              support@multifolks.com
            </a>{" "}
            if you experience:
          </p>

          <ul className="text-[#525252] text-lg font-medium space-y-3 mb-12 inline-block text-left mx-auto list-disc pl-6 marker:text-[#1F1F1F]">
            <li>Persistent dizziness or nausea after two weeks.</li>
            <li>Sharp eye strain or recurring headaches.</li>
            <li>Blurry reading or distance vision despite effort.</li>
          </ul>

          <p className="text-[#1F1F1F] text-lg font-bold mb-4">
            MultiFolks is here to ensure your lens fit, and prescription work in
            perfect harmony.
          </p>

          <p className="text-[#525252] text-base font-bold italic opacity-80">
            Multifocal lenses include progressives, trifocal and bifocal - all
            designed to help you see clearly at multiple distances
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
