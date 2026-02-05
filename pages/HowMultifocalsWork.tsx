import React from "react";
import { Link } from "react-router-dom";

const HowMultifocalsWork: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>How Multifocal Lenses Work</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          What Are Multifocal Lenses and How Do They Work?
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              What Are Multifocal Lenses?
            </h3>
            <p className="mb-2">
              Also known as progressive lenses, multifocal feature three vision
              zones:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>
                <strong>Top:</strong> Distance (walking, driving, conversations)
              </li>
              <li>
                <strong>Middle:</strong> Intermediate (computer screens,
                dashboards, grocery shelves)
              </li>
              <li>
                <strong>Bottom:</strong> Near (books, phones, labels)
              </li>
            </ul>
            <p>
              These zones are digitally blended so your eyes glide smoothly from
              one to the next, without the visual “breaks” that bifocals create.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Why MultiFolks Lenses Stand Apart
            </h3>
            <p className="mb-2">
              Not all multifocals perform the same. MultiFolks goes beyond the
              standard with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>
                Digital corridor designs customized to your facial structure.
              </li>
              <li>
                AI-measured PD (Pupillary Distance) and fitting height for
                precise zone placement.
              </li>
              <li>
                Frame-specific optimization so your zones align naturally within
                your chosen style.
              </li>
            </ul>
            <p>
              These details mean greater comfort and faster adaptation —
              especially if you wear your lenses from morning to night.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              How Multifocals Work (and Why Fit Matters)
            </h3>
            <p className="mb-2">
              Multifocals only perform at their best when they’re aligned
              perfectly with your eyes. Three factors determine this alignment:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>
                <strong>PD (Pupillary Distance):</strong> Horizontal alignment
                of the lens center to your pupils.
              </li>
              <li>
                <strong>Fitting Height:</strong> Vertical positioning of each
                vision zone.
              </li>
              <li>
                <strong>Frame Size and Shape:</strong> Influences how naturally
                your eyes move through the zones.
              </li>
            </ul>
            <p>
              MultiFolks lenses are custom mapped to your measurements and your
              frame to avoid distortion and speed up adaptation.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Getting Comfortable with Multifocals
            </h3>
            <p className="mb-2">
              For most people, adapting takes 3–7 days, sometimes up to two
              weeks if it’s a first pair. Comfort comes faster when you:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>Wear them consistently.</li>
              <li>
                Move your head slightly (not just your eyes) when shifting
                between distances.
              </li>
              <li>
                Avoid switching back to old glasses during the adjustment phase.
              </li>
            </ul>
            <p>
              Every pair comes with a 30-day comfort guarantee, so you can ease
              into multifocals risk-free.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              Are Multifocal Right for You?
            </h3>
            <p className="mb-2">They’re ideal if:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252]">
              <li>
                You’ve been prescribed both distance and reading correction.
              </li>
              <li>You’re done swapping between multiple pairs of glasses.</li>
              <li>You prefer a clean, modern look without bifocal lines.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowMultifocalsWork;
