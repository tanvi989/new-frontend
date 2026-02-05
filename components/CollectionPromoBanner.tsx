import React from "react";
import { useNavigate } from "react-router-dom";

const CollectionPromoBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white pb-20 px-4 font-sans">
      <div className="max-w-[1400px] mx-auto bg-[#FAFAFA] rounded-[20px] overflow-hidden flex flex-col lg:flex-row shadow-sm border border-gray-50">
        {/* Image Side */}
        <div className="lg:w-1/2 relative bg-[#Fdfbf7] min-h-[400px] flex items-center justify-center overflow-hidden">
          {/* Pink Platform */}
          <div className="absolute bottom-[-50px] w-[120%] h-[200px] bg-[#FFD6D6] transform -rotate-3 rounded-[100%]"></div>
          <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 w-[80%] h-[120px] bg-[#FFC1CC] rounded-t-[40px]"></div>

          {/* Glasses Image */}
          <img
            src="https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800"
            alt="Style Glasses"
            className="relative z-10 w-[70%] object-contain mix-blend-multiply drop-shadow-2xl transform -rotate-6 hover:scale-105 transition-transform duration-700"
          />

          {/* Vertical Text Code */}
          <div className="absolute top-1/2 right-12 transform -translate-y-1/2 flex flex-col items-center z-20 hidden md:flex">
            <span
              className="text-[#E94D37] font-bold text-5xl tracking-widest opacity-90 font-sans"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              M 146 1.6 RT
            </span>
          </div>
        </div>

        {/* Content Side */}
        <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center items-start bg-white">
          <span className="bg-[#333] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-[0.2em] mb-6">
            Explore our collection
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#1F1F1F] mb-8 font-sans leading-tight">
            A style right for you
          </h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-[#1F1F1F] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#000] transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            EXPLORE OUR COLLECTION
          </button>
        </div>
      </div>
    </section>
  );
};

export default CollectionPromoBanner;
