import React from "react";

const MultifocalAboutPage: React.FC = () => {
  return (
    <>
      {/* Mobile Layout - Increased section size */}
      <div className="block lg:hidden relative h-auto bg-red-500 text-white px-8 py-14 overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[#E94D37] opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col">
          {/* Logo/Image - larger */}
          <img
            src="/mlogo.png"
            alt="Multifocal Logo"
            width="56"
            height="44"
            loading="lazy"
            className="w-14 h-11 mb-8 rounded-full"
          />

          {/* Main text - larger font for mobile */}
          <h3
            className="text-white mb-10"
            style={{
              fontSize: '22px',
              fontWeight: 350,
              wordWrap: 'break-word',
              lineHeight: '1.7',
            }}
          >
            We're passionate about the power of multifocals to make life better,
            whether you wear glasses all the time or on-and-off. It's why
            multifocals are the one and only thing we focus on.
          </h3>

          {/* Right side sections - larger font and spacing */}
          <hr className="border-red-300/50 w-full" />
          <div className="space-y-8 w-full mt-6">
            {[
              {
                title: "Multifocal experts",
                desc: "Our team comes with 20+ years in the eyewear industry",
              },
              {
                title: "Exclusively online",
                desc: "All you need is your prescription and we'll do the rest",
              },
              {
                title: "Accurate lens fitting",
                desc: "The world's most advanced online multifocal fitting",
              },
              { title: "100s of designs", desc: "including leading brands" },
            ].map((section, idx) => (
              <div key={idx} className="space-y-4 w-full">
                <div className="flex flex-col justify-between items-start gap-1 w-full">

                  <h2
                    className="text-white w-full"
                    style={{
                      fontSize: '30px',
                      fontFamily: 'Lynstone-regular',
                      fontWeight: 350,
                      lineHeight: '1.4',
                      wordWrap: 'break-word'
                    }}
                  >
                    {section.title}
                  </h2>
                  <p
                    className="text-white opacity-90 text-left w-full"
                    style={{
                      fontSize: '20px',
                      lineHeight: '1.6',
                      marginTop: '8px'
                    }}
                  >
                    {section.desc}
                  </p>
                </div>
                <hr className="border-red-300/50 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Increased section size */}
      <div className="hidden lg:relative lg:flex lg:min-h-[620px] lg:py-20 bg-red-500 text-white px-20 py-12 flex-row items-start justify-between gap-16 overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[#E94D37] opacity-90"></div>

        {/* Left/main content */}
        <div className="relative z-10 flex-1 flex flex-col max-w-xl">
          {/* Logo/Image - larger */}
          <img
            src="/mlogo.png"
            alt="Multifocal Logo"
            width="56"
            height="44"
            loading="lazy"
            className="mb-8 rounded-full w-14 h-11"
          />

          {/* Main text - larger */}
          <h3
            className="text-white mb-10 mt-4 md:mt-10"
            style={{
              fontSize: "24px",
              fontWeight: 350,
              wordWrap: "break-word",
              paddingRight: "40px",
              width: "100%",
              maxWidth: "520px",
              lineHeight: "1.6",
            }}
          >
            We're passionate about the power of multifocals to make life better,
            whether you wear glasses all the time or on-and-off. It's why
            multifocals are the one and only thing we focus on.
          </h3>
        </div>

        {/* Right side sections - larger text and spacing */}
        <div className="relative z-10 flex-1 space-y-8 mt-8 lg:mt-14 max-w-xl">
          <hr className="border-red-300/50" />

          {[
            {
              title: "Multifocal experts",
              desc: "Our team comes with 20+ years in the eyewear industry",
            },
            {
              title: "Exclusively online",
              desc: "All you need is your prescription and we'll do the rest",
            },
            {
              title: "Accurate lens fitting",
              desc: "The world's most advanced online multifocal fitting",
            },
            {
              title: "100s of designs",
              desc: "including leading brands",
            },
          ].map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6">
                <h3
                  className="text-white"
                  style={{
                    fontSize: "24px",
                    fontFamily: "Lynstone-book",
                    fontWeight: 350,
                    lineHeight: "1.35",
                    wordWrap: "break-word",
                  }}
                >
                  {section.title}
                </h3>

                <p
                  className="text-white opacity-90 text-left"
                  style={{ fontSize: "16px", lineHeight: "1.5", width: "100%", maxWidth: "320px" }}
                >
                  {section.desc}
                </p>
              </div>

              <hr className="border-red-300/50" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MultifocalAboutPage;