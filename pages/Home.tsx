import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { ProductSection } from "../components/ProductSection";
import { LensSection } from "../components/LensSection";
import { VisionSection } from "../components/VisionSection";
import MultifocalHero from "@/components/MultifocalHero";
import Multifocus from "@/components/MultiFocus";

import FeaturesSectionSecond from "@/components/FeaturesSectionSecond";
import MultiFrames from "@/components/product/MultiFrames";
import ChooseRightLens from "@/components/product/ChooseRightLens";
import PersonalLens from "@/components/product/PersonalLens";
import GoodLiving from "@/components/product/GoodLiving";
import NamingSystemSection from "@/components/NamingSystemSection";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection />
      <MultifocalHero />
      <FeaturesSectionSecond />
      {/* <FeaturesSection /> */}
      <ProductSection />
      {/* <LensSection /> */}
      {/* <VisionSection /> */}
      <div className="block lg:hidden">
        <PersonalLens />
      </div>
      {/* Image block with mobile-safe containment */}
      <div className="w-full flex justify-center hidden lg:block ">
        <img
          src="four2.png"
          alt="Product Showcase"
          width="1920"
          height="600"
          loading="lazy"
          className="w-full max-w-full object-contain"
          style={{ objectFit: "contain" }}
        />
      </div>
      <ChooseRightLens />
      {/* <MultiFrames /> */}

      {/* Mobile view - Show two images with button overlay on first image */}
      <div className="block md:hidden">
        {/* First image with button overlay */}
        <div style={{ position: "relative", width: "100%" }}>
          <img
            src="/men-glass-img.png"
            alt="Men's glasses"
            width="600"
            height="800"
            loading="lazy"
            style={{ width: "100%", display: "block", objectFit: "cover" }}
          />
          <button
            onClick={() => navigate("/glasses")}
            aria-label="Shop our range of glasses"
            className="rounded-full transition-all whitespace-nowrap flex-shrink-0 bg-gray-800 text-white"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "180px",
              height: "60px",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              border: "1px solid rgb(74, 85, 104)",
              cursor: "pointer",
            }}
          >
            SHOP OUR RANGE
          </button>
        </div>
        
        {/* Second image - full width */}
        <div style={{ width: "100%" }}>
          <img
            src="/Frame-img.png"
            alt="Women's glasses"
            width="600"
            height="800"
            loading="lazy"
            style={{ width: "100%", display: "block", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Desktop view - Show two images with button overlay on men's photo */}
      <div
        className="hidden md:block"
        style={{ position: "relative", width: "100%" }}
      >
        <div className="flex" style={{ gap: 0, height: "900px" }}>
          <div className="w-1/2 relative">
            <img
              src="/men-glass-img.png"
              alt="Men's glasses"
              width="960"
              height="900"
              loading="lazy"
              style={{ 
                width: "100%", 
                height: "100%", 
                display: "block", 
                objectFit: "cover" 
              }}
            />
            <button
              onClick={() => navigate("/glasses")}
              aria-label="Shop our range of glasses"
              className="rounded-full transition-all whitespace-nowrap flex-shrink-0 bg-gray-800 text-white"
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "180px",
                height: "60px",
                fontSize: "14px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                border: "1px solid rgb(74, 85, 104)",
                cursor: "pointer",
              }}
            >
              SHOP OUR RANGE
            </button>
          </div>
          <div className="w-1/2">
            <img
              src="/Frame-img.png"
              alt="Women's glasses"
              width="960"
              height="900"
              loading="lazy"
              style={{ 
                width: "100%", 
                height: "100%", 
                display: "block", 
                objectFit: "cover" 
              }}
            />
          </div>
        </div>
      </div>
      <Multifocus />
      {/* {/*    */}
      {/* <div className="block lg:hidden">
        <GoodLiving />
      </div>  */}
      <NamingSystemSection />
    </>
  );
};
