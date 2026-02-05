import React from "react";
import { Link } from "react-router-dom";

const ChoosingRightFrame: React.FC = () => {
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
            <span>Choosing the Right Frame</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Choosing the Right Frame for Progressive Lenses
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <p className="mb-4">
              Progressive lenses work as intended when the frame is right. Too
              narrow, too shallow, or poorly fitted frames can make adapting
              harder.
            </p>
            <p>
              Here is how to choose a frame that brings out the best in your
              progressive lenses while still suiting your style.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              1. Choose Frames with Enough Vertical Depth
            </h3>
            <p className="mb-4">
              Progressive lenses contain three vision zones stacked vertically:
              distance (top), intermediate (middle), and near (bottom). If your
              frame is too shallow, those zones get squeezed, and you will end
              up moving your head around uncomfortably to find the “sweet spot.”
            </p>
            <p className="mb-2 font-bold text-[#1F1F1F]">What to look for:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>A minimum lens height of 30–36mm.</li>
              <li>“Tall rectangle” or “deep oval” styles work best.</li>
              <li>
                Avoid very narrow rectangles, rimless half-frames, or
                ultra-short lenses.
              </li>
            </ul>
            <p className="mt-4 text-sm text-[#525252] italic">
              Think of vertical depth as “breathing room” for your lenses — the
              more space, the smoother the transition between zones.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              2. Comfort is Critical
            </h3>
            <p className="mb-4">
              Even the perfect lens cannot perform if your frame does not sit
              correctly. Progressives require precise positioning, so frames
              that slip or tilt can throw off alignment, forcing your eyes to
              work harder.
            </p>
            <p className="mb-2 font-bold text-[#1F1F1F]">
              How to get a comfortable fit:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>Ensure the frame sit is centered and stable on your nose.</li>
              <li>
                Adjustable nose pads and flexible arms help keep everything
                secure.
              </li>
              <li>
                Lightweight materials like TR90, titanium, or acetate reduce
                pressure points, making long wear more comfortable.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              3. Match the Frame to Your Lifestyle
            </h3>
            <p className="mb-4">Your glasses should work where you do.</p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                <strong>All-day professionals:</strong> Lightweight metal or
                classic full-rim frames.
              </li>
              <li>
                <strong>Active users:</strong> Flexible, impact-resistant frames
                with spring hinges.
              </li>
              <li>
                <strong>Digital multitaskers:</strong> Wider frames offer a
                broader intermediate zone — ideal for laptop and desktop work.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              4. Frame Shape Matters
            </h3>
            <p className="mb-4">
              Round, rectangular, and aviator shapes typically work well for
              progressives because they allow a natural top-to-bottom gaze.
              Overly angular, geometric, or sharply sloped shapes can cut off
              your visual pathway.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              5. Keep Style Without Sacrifice
            </h3>
            <p className="mb-4">
              Just because progressives are functional does not mean they cannot
              be fashionable.
            </p>
            <p className="mb-2">At MultiFolks, you will find:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                Frames designed to be multifocal-friendly without looking
                clinical.
              </li>
              <li>Virtual Try-On so you can test your style before you buy.</li>
              <li>
                Frame recommendations tailored to your prescription and face
                shape, so you never have to guess.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              6. Not Sure Where to Start?
            </h3>
            <p className="mb-4">
              Our system automatically flags any frame that isn’t compatible
              with the lens type you’ve selected. Standard progressive lenses
              require larger frames to ensure proper zone alignment. If you
              upload your prescription and virtually try on a few pairs, our
              experts (or AI assistant) will help you narrow down the best
              options.
            </p>
            <p className="mb-4">
              But if you choose our <strong>Advanced</strong> or{" "}
              <strong>Precision+ lenses</strong>, you’ll get more flexibility —
              they’re designed to work across most frame styles, including
              smaller and trend-forward shapes.
            </p>
            <p className="mb-2 font-bold text-[#1F1F1F]">
              The right frames for progressives are:
            </p>
            <ul className="list-none space-y-1 text-[#525252]">
              <li>✔ At least 30–36mm tall.</li>
              <li>✔ Stable and comfortable.</li>
              <li>✔ Not overly narrow or sharply angled.</li>
              <li>✔ Matched to your lifestyle.</li>
              <li>
                ✔ Clearly marked “progressive-ready” on our product pages.
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

export default ChoosingRightFrame;
