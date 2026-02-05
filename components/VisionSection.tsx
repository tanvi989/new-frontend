import React from "react";
export const VisionSection: React.FC = () => {
  return (
    <section className="w-full font-sans">
      <div
        className="grid grid-cols-1 md:grid-cols-2
"
      >
        {/* LEFT SIDE — Illustration without background */}
        <div className="flex items-center justify-center py-16 px-8 lg:px-12">
          <div className="relative">
            {/* MAIN ILLUSTRATION – BIGGER & perfectly placed */}
            <img
              src="/image 20.png"
              alt="Multifocus Illustration"
              className="h-full w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
        {/* RIGHT SIDE — Cream Background Content */}
        <div className="bg-[#F3F0E7] text-[#1E1E1E] py-20 px-8 md:px-16">
          <h2
            className="mb-8"
            style={{
              fontSize: "20px", // regular 20px

              letterSpacing: "0.2em", // 20%
              textTransform: "none", // remove uppercase
            }}
          >
            LIFE LOOKS BETTER WHEN YOU MULTIFOCUS
          </h2>

          <p
            className="mb-8"
            style={{
              fontFamily: "Lynstone-book",
              fontWeight: 350,
              fontStyle: "Book",
              fontSize: "17px",
              lineHeight: "100%", // 1.0
              letterSpacing: "-0.03em", // -3%
              marginBottom: "2rem",
            }}
          >
            {/* Built for the multifocal generation, here's what makes us different: */}
          </p>

          <ul
            className="space-y-3 mb-10"
            style={{
              fontWeight: 350,
               fontFamily: "Lynstone-book",
              fontSize: "17px",
              lineHeight: "100%",
              letterSpacing: "-0.03em",
              marginBottom: "2.5rem",
            }}
          >
            {/* <li className="flex items-start gap-3" >
              <span className="mt-1.5 w-1.5 h-1.5 bg-[#1E1E1E] rounded-full shrink-0"></span>
              Ultra-accurate fit with our proprietary PD & fitting height tech
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 bg-[#1E1E1E] rounded-full shrink-0"></span>
              Premium lenses with honest pricing and zero compromise on quality
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 bg-[#1E1E1E] rounded-full shrink-0"></span>
              Expert guidance to match your multifocals to real-life routines
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 bg-[#1E1E1E] rounded-full shrink-0"></span>
              Easy ordering, free 30-day returns
            </li> */}
          </ul>

          <p
            style={{
              fontFamily: "Lynstone-book",
              fontWeight: 350,
              fontSize: "17px",
              lineHeight: "100%",
              letterSpacing: "-0.03em",
            }}
          >
            Designed by multifocal specialists. Backed by our Vision Guarantee.
          </p>
        </div>
      </div>
    </section>
  );
};
