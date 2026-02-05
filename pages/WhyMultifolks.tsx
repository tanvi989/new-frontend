import React from "react";
const WhyMultifolks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-16 pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        {/* Title */}
        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-12">
          WHY MULTIFOLKS
        </h1>
        {/* Intro Text */}
        <div className="text-[15px] md:text-base text-[#333333] font-medium leading-relaxed mb-8 border-b border-gray-200 pb-8">
          <p>
            At MultiFolks, we believe needing multifocals is not a sign of
            slowing down, it is a sign of evolution. Designed exclusively for
            those navigating 45+, we combine vision science, premium design, and
            digital simplicity to make multifocals a choice, not a compromise.
          </p>
        </div>
        {/* Details Grid */}
        <div className="space-y-8">
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              Easily affordable:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              Up to 50% cheaper than traditional in-store opticians, with no
              compromise on quality.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              Precise fit:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              Our proprietary fitting system Get My Fit ensures the most
              accurate multifocal measurements possible online.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              Built-in protection:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              Every order comes fully protected against loss, damage, or delays
              in transit. It is our responsibility to get you your perfect pair.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              Upgrades Included:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              All our multifocal lenses include scratch-resistant, UV
              protection, and anti-reflective coatings on both sides, and start
              at a 1.6 index for thinner, clearer optics. All included at no
              extra cost.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              All online:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              Just provide us with your prescription, and we will take care of
              the rest, from personalized fitting to superfast delivery around
              the globe.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              Worry free:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              Multifocals can take some getting used to. If they are not
              perfect, we will refund you the frames and the lenses. No
              questions asked.
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] mb-1">
              Ongoing support:
            </h3>
            <p className="text-[15px] text-[#333333] leading-relaxed">
              From frame choice to lens adjustments, our experts are here to
              ensure you get the most out of your new MultiFolks glasses. Write
              to us at{" "}
              <a
                href="mailto:support@multifolks.com"
                className="text-[#E94D37] hover:underline"
              >
                support@multifolks.com
              </a>{" "}
              and we will reach out to you for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WhyMultifolks;
