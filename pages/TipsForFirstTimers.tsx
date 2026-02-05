import React from "react";
import { Link } from "react-router-dom";

const TipsForFirstTimers: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Tips for First-Timers</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-8">
          Tips for First-Time Multifocal Wearers
        </h1>

        <div className="space-y-10 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              1. Wear Them Full-Time from Day One
            </h3>
            <p className="mb-4">
              The quickest path to comfort is consistency. Put your new
              MultiFolks lenses on in the morning and keep them on all day.
              Switching back to old glasses can disrupt adaptation because your
              eyes are relearning how to track through the new lens zones. The
              more consistently you wear them, the faster your brain makes the
              switch permanent.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              2. Move Your Head, Not Just Your Eyes
            </h3>
            <p className="mb-2">
              Multifocals have zones for distance (top), intermediate (middle),
              and near (bottom). To see clearly, shift your head toward what you
              are viewing rather than relying only on your eyes.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>Looking down at your phone? Slightly drop your chin.</li>
              <li>
                Reading a sign across the street? Lift your chin a bit and use
                the upper part of the lens.
              </li>
            </ul>
            <p>
              Think of it like adjusting a camera lens. The clearer you frame
              your focus, the sharper things appear.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              3. Practice Everyday Movements
            </h3>
            <p className="mb-2">
              Use the first couple of days to rehearse real-life scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#525252] mb-4">
              <li>Walk up and down stairs indoors.</li>
              <li>
                Scroll through your phone or read a book at a natural distance.
              </li>
              <li>Take a few laps around your home.</li>
            </ul>
            <p>
              By repeating common movements, your brain maps out how to use each
              lens zone — making them feel like second nature faster.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              4. Expect Some Soft Edges (At First)
            </h3>
            <p className="mb-4">
              Multifocals lenses naturally transition between zones, which can
              create slight peripheral blur when shifting focus. This is not a
              flaw, it is how the lenses balance your vision needs. Within days,
              your eyes will intuitively know where to look. What feels
              deliberate at first soon becomes automatic.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              5. Ensure Your Frame Fits Correctly
            </h3>
            <p className="mb-4">
              Fit matters just as much as the lenses. If your glasses slide down
              your nose or sit unevenly, you will not be looking through the
              correct zones. Follow the MultiFolks fit guide online to fine-tune
              at home.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
              6. Patience Pays Off
            </h3>
            <p className="mb-4">
              Some people feel at ease within 24 hours; others take up to two
              weeks. Both are normal. Set a 7-day commitment goal. Most
              MultiFolks wearers feel at home by day five.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TipsForFirstTimers;
