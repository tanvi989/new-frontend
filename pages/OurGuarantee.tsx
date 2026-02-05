import React from "react";
import ScrollToTop from "../components/ScrollToTop";

const OurGuarantee: React.FC = () => {
  return (
    <div className="bg-white pt-32 md:pt-44 pb-20 text-gray-700">
      <ScrollToTop />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 pb-6 border-b border-gray-100">
          OUR GUARANTEE
        </h1>

        {/* Section */}
        <div className="mt-8 md:mt-10 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-wide">
            We stand by your vision. 100%.
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-gray-600">
            Our MultiFollks Vision Guarantee ensures your experience is
            seamless, fully supported and risk-free.
          </p>
        </div>

        {/* Section */}
        <div className="mt-8 md:mt-10 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-wide">
            If they do not feel right, we will make it right.
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-gray-600">
            If you are struggling with your new lenses, our support team will
            check your measurements, guide you through any adjustments, and
            offer a free remake if needed.
          </p>
        </div>

        {/* Section */}
        <div className="mt-8 md:mt-10 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-wide">
            Still not happy? We will refund you in full.
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-gray-600">
            No questions asked. Just send your glasses back within 30 days.
          </p>
        </div>
      </div>
    </div>
  );
};


export default OurGuarantee;
