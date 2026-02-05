import React from "react";

const steps = [
  {
    step: "Step 1:",
    title: "Choose your lens",
    desc: "There are 3 types of multifocal lens: standard, advanced and precision. Our fitting tool will identify the best one for you.",
    bg: "bg-[#FFE4E6]",
  },
  {
    step: "Step 2:",
    title: "Choose your frames",
    desc: "The fun bit!",
    bg: "bg-[#FEF9C3]",
  },
  {
    step: "Step 3:",
    title: "Upload your prescription",
    desc: "Upload your prescription from your optician. We’ll help if you’re not sure how to read it.",
    bg: "bg-[#E0F2FE]",
  },
  {
    step: "Step 4:",
    title: "Pay without pressure",
    desc: "Your multifocals will arrive in a few days. Remember, if you change your mind, just send them back for a full refund.",
    bg: "bg-[#ECFCCB]",
  },
];

export const HowItWorksSection: React.FC = () => {
  return (

    <section className="flex flex-col lg:flex-row h-auto lg:h-screen w-full">
      {/* removed max-width so it's fully stretched */}
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="text-[#232320] text-[20px] font-bold font-serif uppercase mb-4 tracking-wide">
            YOUR PERSONAL MULTIFOCALS, READY IN A FEW MINUTES
          </h2>
          <p className="text-[#333333] text-lg">
            It couldn’t be simpler. All you need is your prescription and we’ll run you through the rest:
          </p>
        </div>

        {/* Full-width grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`${s.bg} p-8 rounded-xl flex flex-col items-center text-center h-full min-h-[260px] transition-transform hover:-translate-y-1 duration-300`}
            >
              <span className="text-[#232320] font-bold text-lg mb-1">{s.step}</span>
              <h3 className="text-[#232320] font-bold text-xl mb-6 leading-tight font-serif">{s.title}</h3>
              <p className="text-[#333333] text-sm leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
