import React from "react";

const MultifocalAboutPage: React.FC = () => {
  return (
    <>
      {/* Mobile Layout */}
      <div className="block lg:hidden relative h-auto bg-red-500 text-white px-6 py-10 overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[#E94D37] opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col">
          {/* Logo/Image */}
          <img
            src="/mlogo.png"
            alt="Multifocal Logo"
            width="40"
            height="32"
            loading="lazy"
            className="w-10 h-8 mb-6 rounded-full"
          />

          {/* Main text - Larger font for mobile */}
          <h3
            className="text-white mb-8"
            style={{
              fontSize: '18px',
              fontWeight: 350,
              wordWrap: 'break-word',
              lineHeight: '1.7',
            }}
          >
            We're passionate about the power of multifocals to make life better,
            whether you wear glasses all the time or on-and-off. It's why
            multifocals are the one and only thing we focus on.
          </h3>

          {/* Right side sections - Larger font for mobile */}
          <hr className="border-red-300/50 w-full" />
          <div className="space-y-6 w-full mt-4">
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
              <div key={idx} className="space-y-3 w-full">
                <div className="flex flex-col justify-between items-start gap-1 w-full">

                  <h2
                    className="text-white w-full"
                    style={{
                      fontSize: '26px', // Even larger for mobile
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
                      fontSize: '18px', // Larger for mobile
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

      {/* Desktop Layout */}
      <div className="hidden lg:relative lg:flex lg:h-[500px] bg-red-500 text-white px-16 py-12 flex-row items-start justify-between gap-12 overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[#E94D37] opacity-90"></div>

        {/* Left/main content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Logo/Image */}
          <img
            src="/mlogo.png"
            alt="Multifocal Logo"
            width="40"
            height="32"
            loading="lazy"
            className="mb-6 rounded-full md:w-10"
          />

          {/* Main text */}
          <h3
            className="text-white mb-8 mt-4 md:mt-10"
            style={{
              fontSize: "16px",
              fontWeight: 350,
              wordWrap: "break-word",
              paddingRight: "36px",
              width: "450px",
            }}
          >
            We're passionate about the power of multifocals to make life better,
            whether you wear glasses all the time or on-and-off. It's why
            multifocals are the one and only thing we focus on.
          </h3>
        </div>

        {/* Right side sections */}
        {/* Right side sections */}
        <div className="relative z-10 flex-1 space-y-6 mt-8 lg:mt-12">
          {/* NEW LINE ABOVE FIRST OBJECT */}
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
            <div key={idx} className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <h3
                  className="text-white"
                  style={{
                    fontSize: "18px",
                    fontFamily: "Lynstone-book",
                    fontWeight: 350,
                    lineHeight: "28px",
                    wordWrap: "break-word",
                  }}
                >
                  {section.title}
                </h3>

                <p
                  className="text-white opacity-90 text-left"
                  style={{ fontSize: "12px", lineHeight: "14px", width: "250px" }}
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