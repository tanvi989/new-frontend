import React from "react";
import { Link } from "react-router-dom";

const ExchangePolicy: React.FC = () => {
  return (
    <div className=" bg-white font-sans pt-[120px] pb-24 text-[#525252]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Optional Breadcrumb */}
        {/* <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Exchange Policy</span>
          </span>
        </div> */}

        <h1 className="text-[28px] md:text-[32px] font-thin uppercase tracking-wide mb-2 border-b">
          EXCHANGE POLICY
        </h1>

        <div className=" text-[#525252] text-base font-medium leading-relaxed  mb-2">
          <h3 className="text-lg md:text-xl font-bold ">
            Not quite the right fit? We will make it right.
          </h3>
          <p>
            Multifocals can take a little getting used to, especially if it's
            your first time.
          </p>
          <p className="mt-3">
            Our <strong>30-day exchange policy</strong> gives you the time and
            space to adjust to your new multifocals at your own pace. If things
            still don’t feel quite right, we offer an exchange to give you the
            clarity and comfort you deserve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExchangePolicy;
