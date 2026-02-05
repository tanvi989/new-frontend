import React from "react";

const WhyChooseMultifolks: React.FC = () => {
  const features = [
    {
      title: "Affordable",
      desc: "Our multifocals are up to 50% cheaper than traditional in-store opticians. We don't compromise on quality.",
      bg: "bg-[#F5D7D7]",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
          <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2"></line>
        </svg>
      ),
    },
    {
      title: "Precise fit",
      desc: "Our patented fitting system (MultipleEYE™) ensures the most accurate multifocal measurements possible online.",
      bg: "bg-[#FFF4CC]",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 9v6"></path>
          <path d="M9 12h6"></path>
        </svg>
      ),
    },
    {
      title: "Ongoing support",
      desc: "From frame choice to lens adjustments, our experts are here to ensure you get the most out of your new MultiFolks glasses.",
      bg: "bg-[#E3EEFF]",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
    },
    {
      title: "Worry free",
      desc: "Multifocals can take some getting used to. If they're not perfect, we'll refund you on the frames and the lenses — no questions asked.",
      bg: "bg-[#E8EDD5]",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="9" cy="9" r="1.5" fill="currentColor"></circle>
          <circle cx="15" cy="9" r="1.5" fill="currentColor"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-16 px-4 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-center text-sm md:text-base font-bold text-[#1F1F1F] uppercase tracking-[0.08em] mb-12">
          WHY CHOOSE MULTIFOLKS?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`${f.bg} rounded-2xl p-6 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold text-[#1F1F1F]">
                  {f.title}
                </h3>
                <div className="text-[#1F1F1F] opacity-70">{f.icon}</div>
              </div>
              <p className="text-xs leading-[1.7] text-[#1F1F1F] font-normal">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseMultifolks;
