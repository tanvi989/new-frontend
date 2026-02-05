import React from "react";

export const FeaturesSection: React.FC = () => {
  return (
    <section className="w-full bg-white pt-20 px-4 md:px-8 font-sans">
      {/* SPECS FROM THE SPECIALISTS */}
      <div className="max-w-[1400px] mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-[#232320] text-[24px] md:text-[28px] font-bold tracking-wide uppercase">
            SPECS FROM THE SPECIALISTS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1: Blue */}
          <div className="bg-[#DDF3F5] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              Expert-led
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              Our team come with 20+ years in the eyewear industry
            </p>
          </div>

          {/* Item 2: Grey/Green */}
          <div className="bg-[#D6E0DD] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              Exclusively online
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              All you need is your prescription and we do the rest
            </p>
          </div>

          {/* Item 3: Pink */}
          <div className="bg-[#FADBD8] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              Accurate lens fitting
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              The world’s most advanced online multifocal fitting
            </p>
          </div>

          {/* Item 4: Yellow */}
          <div className="bg-[#FFF9C4] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              100s of designs
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              Including leading brands
            </p>
          </div>
        </div>
      </div>

      {/* TOTALLY RISK-FREE */}
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[#232320] text-[24px] md:text-[28px] font-bold tracking-wide uppercase">
            TOTALLY RISK-FREE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1: Blue */}
          <div className="bg-[#DDF3F5] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              Surprisingly affordable
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              Our focus on multifocals means we can offer better value than
              regular opticians or shops.
            </p>
          </div>

          {/* Item 2: Grey/Green */}
          <div className="bg-[#D6E0DD] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              30-day refunds, no questions asked
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              Not sitting right on your nose? Send them back! Unlike most
              places, we refund your lenses as well as frames.
            </p>
          </div>

          {/* Item 3: Pink */}
          <div className="bg-[#FADBD8] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              24/7 support
            </h3>
            <div className="flex flex-col items-center">
              <p className="text-[#333333] text-[14px] leading-relaxed mb-1">
                Including our team of real-life humans, available on the email
                support@multifolks.com
              </p>
            </div>
          </div>

          {/* Item 4: Yellow */}
          <div className="bg-[#FFF9C4] rounded-lg p-8 flex flex-col items-center text-center h-full justify-center min-h-[180px]">
            <h3 className="text-[#232320] text-[18px] font-bold mb-2">
              HSA/FSA eligible
            </h3>
            <p className="text-[#333333] text-[14px] leading-relaxed">
              Use your benefits; we accept HSA/FSA insurance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
