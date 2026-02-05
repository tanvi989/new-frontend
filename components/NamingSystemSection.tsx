import React, { useState } from "react";

const NamingSystemSection: React.FC = () => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const parts = [
    { id: "M", text: "M", tooltip: "M is for Multifolks" },
    {
      id: "146",
      text: "146",
      tooltip:
        "Size of the frame, specifically arms length in mm (temple length)",
    },
    {
      id: "1.6",
      text: "1.6",
      tooltip:
        "The higher the index, the more efficiently a lens corrects vision",
    },
    {
      id: "S",
      text: "S",
      tooltip: "Glasses shape\nSquare • Round • Cats Eye • Hexagonal",
    },
    {
      id: "A",
      text: "A",
      tooltip: "Suitable for all type of Multifocal lenses",
    },
  ];

  return (
    <section className="w-full bg-[#F3F0E7] py-12 md:py-24 px-4 md:px-6 font-sans border-b border-gray-100 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-sm md:text-base font-bold tracking-[0.15em] text-[#525252] uppercase mb-6">
          NAMING SYSTEM
        </h2>

        <p className="text-[#525252] text-base md:text-lg font-medium mb-8 md:mb-16 max-w-2xl mx-auto leading-relaxed px-2">
          We don't have fancy names for our frames. Instead, we have a descriptive
          code which helps to explain what you're buying. Sleuthing specs on:
        </p>

        {/* Mobile-optimized wrapper with horizontal scroll on very small screens */}
        <div className="relative">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-6 lg:gap-8 text-4xl md:text-6xl lg:text-[80px] font-sans font-normal text-[#1F1F1F] leading-none select-none px-2">
            {parts.map((part) => (
              <div
                key={part.id}
                className="relative group cursor-pointer isolate flex-shrink-0"
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={() =>
                  setHoveredPart(hoveredPart === part.id ? null : part.id)
                }
              >
                {/* Highlight Circle - Centered */}
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F3CB0A] transition-all duration-300 ease-out -z-10 ${
                    hoveredPart === part.id
                      ? "w-[1.3em] h-[1.3em] opacity-100"
                      : "w-0 h-0 opacity-0"
                  }`}
                ></div>

                {/* Character */}
                <span className="relative z-10 transition-colors duration-300 block px-1 py-2 md:px-2">
                  {part.text}
                </span>

                {/* Tooltip - Adjust position for mobile */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 md:mb-6 w-40 md:w-64 bg-[#232320] text-white text-xs md:text-sm font-medium p-3 md:p-4 rounded-lg shadow-xl text-left transition-all duration-300 z-50 pointer-events-none ${
                    hoveredPart === part.id
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 translate-y-2 invisible"
                  }`}
                >
                  {/* Arrow */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-[6px] md:border-l-[8px] border-l-transparent border-r-[6px] md:border-r-[8px] border-r-transparent border-t-[6px] md:border-t-[8px] border-t-[#232320]"></div>

                  {part.tooltip.split("\n").map((line, i) => (
                    <div
                      key={i}
                      className={
                        i > 0
                          ? "mt-1 md:mt-2 text-gray-300 text-[10px] uppercase tracking-wide font-bold"
                          : ""
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NamingSystemSection;
