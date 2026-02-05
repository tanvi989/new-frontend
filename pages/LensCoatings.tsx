import React from "react";
import { Link } from "react-router-dom";

const LensCoatings: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        {/* Optional Breadcrumb */}
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Lens Coatings</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          What Do Lens Coatings Do? A Clear Guide
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <p>
              Coatings are not just “extras.” They protect your investment,
              improve comfort, and extend the life of your glasses. In many
              cases, they are what make your lenses feel truly premium.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-4 border-b border-gray-100 pb-2">
              Key Coatings
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-[#1F1F1F]">
                  1. Anti-Reflective (AR) Coating:
                </h4>
                <p className="text-sm text-[#525252]">
                  Reduces glare, improves night driving, makes lenses nearly
                  invisible on video calls. Standard on all high-index and
                  multifocals lenses at MultiFolks.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#1F1F1F]">
                  2. Scratch-Resistant Coating:
                </h4>
                <p className="text-sm text-[#525252]">
                  Protects lenses from everyday wear. Included by default.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#1F1F1F]">
                  3. UV Protection:
                </h4>
                <p className="text-sm text-[#525252]">
                  Blocks 100% UVA and UVB rays to protect against long-term eye
                  damage. Included with most high-index and polycarbonate
                  lenses. Built-in feature in MultiFolks lenses.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#1F1F1F]">
                  4. Blue Light Filter:
                </h4>
                <p className="text-sm text-[#525252]">
                  Helps minimize digital eye strain and fatigue, especially if
                  you spend hours on screens.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#1F1F1F]">
                  5. Water-Repellent & Smudge-Resistant Coating:
                </h4>
                <p className="text-sm text-[#525252]">
                  Keeps lenses clearer, longer. Reduces fogging and
                  fingerprints.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#1F1F1F]">
                  6. Photochromic (Light-Adaptive) Coating:
                </h4>
                <p className="text-sm text-[#525252]">
                  Automatically darkens in sunlight and clears indoors.
                  Available as Transitions® Signature® (premium) or standard
                  photochromic options.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              How to Choose the Right Coatings
            </h3>
            <p className="mb-4">
              Our system recommends coating based on your prescription and
              lifestyle during checkout, but as a quick guide:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                <strong>Daily screen users:</strong> Blue Light + AR.
              </li>
              <li>
                <strong>Frequent drivers:</strong> AR + Gradient or Polarized.
              </li>
              <li>
                <strong>Active outdoors:</strong> Water-repellent + UV +
                Polarized.
              </li>
              <li>
                <strong>Multifocal wearers:</strong> AR + Scratch-resistant
                (built-in) + Smudge resistance for easy cleaning.
              </li>
            </ul>
            <p className="mt-4 text-sm font-bold italic">
              Multifocal lenses include progressives, trifocal and bifocal - all
              designed to help you see clearly at multiple distances
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LensCoatings;
