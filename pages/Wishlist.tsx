import React from "react";
import AccountSidebar from "../components/AccountSidebar";

const Wishlist: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pb-12">
      {/* Hero Banner */}
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img
          src="recent banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-cyan-400/20 to-purple-500/20 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0 z-10">
          <div
            className="bg-white px-12 py-4 relative shadow-lg"
            style={{
              clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              paddingLeft: "4rem",
              paddingRight: "4rem",
            }}
          >
            {/* <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F] uppercase tracking-widest text-center whitespace-nowrap">
              My Favourites
            </h1> */}
          </div>
        </div>
      </div>

      {/* <div className="max-w-[1400px] mx-auto px-0 md:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-auto shadow-soft rounded-sm overflow-hidden">
            <AccountSidebar activeItem="MY FAVOURITES" />
          </div>
          <div className="flex-1 bg-white p-8 rounded-sm shadow-soft min-h-[500px] w-full flex items-center justify-center">
            <p className="text-[#525252] text-base font-bold">
              No Favourites are added
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Wishlist;
