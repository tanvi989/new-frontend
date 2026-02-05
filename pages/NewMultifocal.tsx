import React from "react";
import { useNavigate } from "react-router-dom";

const NewMultifocal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white min-h-screen font-sans text-[#1F1F1F]  pt-20 md:pt-12 pb-16 md:pt-[70px]  md:pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Desktop Layout - Hidden on mobile, shown from tablet up */}
        <div className="hidden sm:block relative mb-10 md:mb-0 min-h-[300px] md:min-h-[400px]">

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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[800px]">
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold uppercase tracking-wide mb-4 md:mb-6 leading-tight mt-3">
              New to multifocals? Let's make your first pair feel easy.
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

        {/* Mobile Layout - Vertical diagonal */}
        <div className="sm:hidden mb-12">
          <div className="flex items-center space-y-8">
            {/* Mobile Eye Box - Aligned to start */}
            <div className="relative w-24 h-24 xs:w-28 xs:h-28 self-start shrink-0">
              <img
                src="/eye.png"
                alt="Eye illustration"
                className="w-full h-full object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5 xs:w-6 xs:h-6">
                  <path d="M10 50 Q50 10 90 50 Q50 90 10 50" fill="#F37021" />
                  <circle cx="50" cy="50" r="8" fill="#F3F0E7" />
                </svg>
              </div>
            </div>

            {/* Mobile Text Content - Showing "Multifolks" with subtitle */}
            <div className="text-center w-full">
              <h1 className="text-2xl font-bold uppercase mb-2">
                Multifolks
              </h1>
              <p className="text-base text-[#333] font-bold">
                Looking good. In every sense.
              </p>
            </div>

            {/* Mobile Profile Box - Aligned to end */}
            <div className="relative w-24 h-24 xs:w-28 xs:h-28 self-end shrink-0">
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
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] mb-3">
                Your First Pair Made Easy
              </h3>
              <p className="mb-4 font-medium text-justify">
                If you've ever juggled two pairs of glasses — one for reading,
                one for everything else — multifocals can sound like a
                complicated upgrade. But they don't have to be.
              </p>
              <p className="font-medium text-justify">
                Multifocal lenses are designed to give you clear vision at every
                distance— far, near, and everything in between — without the
                need to swap glasses. They work by smoothly transitioning
                between zones within a single lens, so you can go from laptop to
                phone to across the room, effortlessly.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] mb-3">
                Here is How it Works
              </h3>
              <p className="mb-4 font-medium text-justify">
                At MultiFolks, we've designed a simple, step-by-step experience
                that makes your transition seamless— no jargon and no
                second-guessing.
              </p>
              <ul className="list-disc pl-5 space-y-2 marker:text-[#1F1F1F]">
                <li className="font-medium text-justify">
                  Upload your prescription or just send us a photo on
                  support@multifolks.com. If you're unsure how to read it, we'll
                  explain each part (like SPH, CYL, and ADD) in simple terms.
                </li>
                <li className="font-medium text-justify">
                  Use our smart fitting tool to measure your{" "}
                  <strong>pupillary distance (PD)</strong> - the space between
                  your eyes - and <strong>fitting height</strong> - how the
                  lenses align vertically with your pupils. This ensures your
                  vision zones are perfectly aligned.
                </li>
                <li className="font-medium text-justify">
                  During your order placement, we guide you step by step to
                  choose lenses that fit your lifestyle - whether you're leading
                  a retired life, working on screens, or constantly on the go.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <p className="mb-4 font-medium text-justify">
                Every pair comes with premium multifocal lenses, complete with
                all the coatings you actually need:
              </p>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#1F1F1F] mb-4">
                <li className="font-medium">Anti-glare</li>
                <li className="font-medium">Scratch-resistant</li>
                <li className="font-medium">Anti-reflective</li>
              </ul>
              <p className="font-medium text-justify">All included. No hidden extras. No complicated upgrades.</p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] mb-3">
                What to expect:
              </h3>
              <p className="mb-4 font-medium text-justify">
                It may take a few days for your eyes to fully adjust to the
                different zones in multifocals — especially if it's your first
                pair. That's completely normal. Think of it like switching to a
                new phone or learning a new shortcut — your brain adapts
                quickly, and it soon becomes second nature.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] mb-3">
                And if your glasses don't feel quite right? We'll adjust or
                remake them at no cost.
              </h3>
              <p className="mb-4 font-medium text-justify">
                We also have <strong>step-by-step guides</strong> to help you
                get used to your new lenses, along with real support from our
                team if you need it.
              </p>
              <p className="mb-4 font-medium text-justify">
                Use your HSA/FSA or claim it later. Shipping is free worldwide.
              </p>
              <p className="font-bold text-justify">
                We make your first multifocals feel easy — because they should
                be.
              </p>
            </div>
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

export default NewMultifocal;