import React from "react";
import { useNavigate } from "react-router-dom";

const NewBifocal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white min-h-screen font-sans text-[#1F1F1F] pt-[120px] pb-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        {/* Header Section */}
        <div className="relative flex flex-col items-center justify-center mb-16 text-center min-h-[250px]">
          {/* Left Graphic (Sun/Eye) */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[140px] h-[140px] md:w-[180px] md:h-[180px]">
            <img
              src="/eye.png"
              alt="Sun illustration"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-[50%] h-[50%]">
                <path d="M10 50 Q50 10 90 50 Q50 90 10 50" fill="#F37021" />
                <circle cx="50" cy="50" r="12" fill="#F3F0E7" />
              </svg>
            </div>
          </div>

          {/* Center Text */}
          <div className="max-w-[800px] z-10 relative px-4">
            <h1 className="text-3xl md:text-[40px] font-bold uppercase tracking-wide mb-6 leading-tight">
              New to bifocals? We'll make it simple and straightforward.
            </h1>
          </div>

          {/* Right Graphic (Blue Profile) */}
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[200px] h-[220px]">
            <img
              src="/q5.png"
              alt="Blue head illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-[16px] leading-[1.7] text-[#333]">
          {/* Left Column */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">
                Your First Pair Made Easy
              </h3>
              <p className="mb-4">
                If you've been using separate reading glasses and distance
                glasses, bifocals offer a practical solution. They combine both
                prescriptions in one lens, so you don't need to switch between
                pairs.
              </p>
              <p>
                Bifocal lenses have two distinct zones: the upper part for
                distance vision and a visible segment at the bottom for reading
                or close-up work. There's a clear line between the two, making
                it easy to know which zone you're using.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">
                Here is How it Works
              </h3>
              <p className="mb-4">
                At MultiFolks, we've designed a simple, step-by-step experience
                that makes getting your bifocals seamless— no jargon and no
                second-guessing.
              </p>
              <ul className="list-disc pl-5 space-y-2 marker:text-[#1F1F1F]">
                <li>
                  Upload your prescription or just send us a photo on
                  support@multifolks.com. If you're unsure how to read it, we'll
                  explain each part (like SPH, CYL, and ADD) in simple terms.
                </li>
                <li>
                  Use our smart fitting tool to measure your{" "}
                  <strong>pupillary distance (PD)</strong> - the space between
                  your eyes - and <strong>fitting height</strong> - how the
                  lenses align vertically with your pupils. This ensures your
                  vision zones are perfectly positioned.
                </li>
                <li>
                  During your order placement, we guide you step by step to
                  choose lenses that fit your lifestyle - whether you're reading
                  frequently, working at a desk, or need clear distance vision
                  for daily activities.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div>
              <p className="mb-4">
                Every pair comes with premium bifocal lenses, complete with all
                the coatings you actually need:
              </p>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#1F1F1F] mb-4">
                <li>Anti-glare</li>
                <li>Scratch-resistant</li>
                <li>Anti-reflective</li>
              </ul>
              <p>All included. No hidden extras. No complicated upgrades.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">
                What to expect:
              </h3>
              <p className="mb-4">
                Bifocals are generally easier to adapt to than progressive
                lenses, especially if you're already used to switching between
                reading and distance glasses. The visible line helps you know
                exactly where to look for each task.
              </p>
              <p className="mb-4">
                Most people adjust within a few days. You'll learn to tilt your
                head slightly when reading and look straight ahead for distance
                - it quickly becomes natural.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1F1F1F] mb-3">
                And if your glasses don't feel quite right? We'll adjust or
                remake them at no cost.
              </h3>
              <p className="mb-4">
                We also have <strong>step-by-step guides</strong> to help you
                get used to your new lenses, along with real support from our
                team if you need it.
              </p>
              <p className="mb-4">
                Use your HSA/FSA or claim it later. Shipping is free worldwide.
              </p>
              <p className="font-bold">
                We make your first bifocals feel easy — because they should be.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-16">
          <button
            onClick={() => navigate("/glasses/men")}
            className="bg-[#232320] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base uppercase tracking-[0.15em] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full max-w-[300px] sm:w-auto"        >
            EXPLORE OUR COLLECTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBifocal;
