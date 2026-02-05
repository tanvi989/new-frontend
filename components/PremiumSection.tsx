import React from "react";

export const PremiumSection: React.FC = () => {
  return (
    <section className="w-full bg-[#F3F0E7] py-20 px-4 md:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-[#232320] text-[32px] md:text-[48px] font-bold font-serif mb-6 leading-tight">
            Premium In Your Pocket
          </h2>
          <div className="w-20 h-1 bg-[#232320] mb-8 mx-auto md:mx-0"></div>
          <p className="text-[#333333] text-lg md:text-xl leading-relaxed mb-6">
            At MultiFolks, we believe good vision isn’t just about seeing better
            – it’s about living better.
          </p>
          <p className="text-[#333333] text-lg md:text-xl leading-relaxed">
            That’s why we’ve designed the first online eyewear experience
            exclusively for multifocal wearers.
          </p>
        </div>

        {/* Image/Visual Placeholder */}
        <div className="flex-1 w-full">
          <div className="bg-white p-4 rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
              alt="Premium Eyewear"
              className="w-full h-auto rounded-xl object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
