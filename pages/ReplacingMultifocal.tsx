import React from "react";
import { useNavigate } from "react-router-dom";

const ReplacingMultifocal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#F3F0E7] min-h-screen font-sans text-[#1F1F1F] mt-14 md:mt-5 pt-6 pb-16 md:pt-12 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Desktop Layout - Hidden on mobile, shown from tablet up */}
        <div className="hidden sm:block relative mb-10 md:mb-16 min-h-[300px] md:min-h-[400px]">

          {/* Left Eye Box - Top Left */}
          <div className="absolute top-20 left-0 w-32 h-32 md:w-40 md:h-40 lg:w-42 lg:h-42">
            <img
              src="/eye.png"
              alt="Eye illustration"
              className="w-full h-full object-contain"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-[50%] h-[50%]">
                <path d="M10 50 Q50 10 90 50 Q50 90 10 50" fill="#F37021" />
                <circle cx="50" cy="50" r="12" fill="#F3F0E7" />
              </svg>
            </div>
          </div>

          {/* Center Text Content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[750px]">
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold uppercase tracking-wide mb-4 md:mb-6 leading-tight">
              ALREADY WEARING MULTIFOCALS? <br /> TIME FOR A SMARTER UPGRADE.
            </h1>
          </div>

          {/* Right Profile Box - Bottom Right */}
          <div className="absolute bottom-20 right-0 w-32 h-32 md:w-40 md:h-40 lg:w-42 lg:h-42">
            <img
              src="/q5.png"
              alt="Profile illustration"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile Layout - Vertical diagonal like AboutUs */}
        <div className="sm:hidden mb-12">
          <div className="flex  items-center space-y-8">
            {/* Mobile Eye Box - Aligned to start */}
            <div className="w-28 h-28 self-start">
              <img
                src="/eye.png"
                alt="Eye illustration"
                className="w-full h-full object-contain"
                loading="lazy"
              />

            </div>

            {/* Mobile Text Content */}
            <div className="text-center w-full">
              <h1 className="text-xl font-bold uppercase mb-4 leading-tight">
                ALREADY WEARING MULTIFOCALS? <br /> TIME FOR A SMARTER UPGRADE.
              </h1>
            </div>

            {/* Mobile Profile Box - Aligned to end */}
            <div className="w-28 h-28 self-end">
              <img
                src="/q5.png"
                alt="Profile illustration"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 text-sm sm:text-base md:text-[16px] leading-relaxed md:leading-[1.7] text-[#333]">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F]">
              Your eyes have changed. Your lenses should too.
            </h3>
            <p className="font-medium text-justify">
              Maybe your current pair isn't keeping up or your screen hours have
              gone up.
            </p>
            <p className="font-medium text-justify">
              Maybe you just want something lighter, clearer, and better aligned
              with how you live now.
            </p>
            <p className="font-bold text-justify">
              Whatever the reason, you shouldn't have to settle for lenses that
              almost work.
            </p>
            <p className="font-medium text-justify">
              At MultiFolks, we help experienced multifocal wearers upgrade with
              confidence — using precise fitting tools, optical expertise, and
              lenses that feel right from day one.
            </p>
            <p className="font-medium text-justify">
              Start by uploading your updated prescription — or just send us a
              photo on support@multifolks.com. Next our propriety tool measures
              your PD and fitting height, so your next pair truly fits.
            </p>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            <p className="font-medium text-justify">
              We will then recommend lenses matched to your routine — whether
              that's sharper screen vision, seamless distance clarity, or
              smoother transitions across all zones.
            </p>
            <p className="font-medium text-justify">
              Every pair comes with high-performance multifocal lenses and all
              the right coatings already built in: anti-glare, anti-reflective,
              and scratch-resistant.
            </p>
            <p className="font-medium text-justify">
              No mystery pricing. Just a better pair, built for your real
              day-to-day.
            </p>
            <p className="font-medium text-justify">
              Use your HSA/FSA or claim it later. Shipping is free worldwide.
              And if your glasses don't feel quite right? We'll adjust or remake
              them at no cost.
            </p>
            <p className="font-bold text-lg sm:text-lg text-[#1F1F1F] text-justify">
              A new fit for your upgraded life.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10 md:mt-16">
          <button
            onClick={() => navigate("/glasses/men")}
            className="bg-[#232320] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base uppercase tracking-[0.15em] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full max-w-[300px] sm:w-auto"
          >
            EXPLORE OUR COLLECTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplacingMultifocal;