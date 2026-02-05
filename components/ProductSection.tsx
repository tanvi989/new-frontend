import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFrames } from "../api/retailerApis";
import { Frame } from "../types";
import DeliveryPopUp from "./DeliveryPopUp";
import { getAllProducts } from "../api/retailerApis";
import { getColorFromSkuid } from "../utils/colorMapping";
import { getHexColorsFromNames } from "../utils/colorNameToHex";

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
    extraDesc: "",
    bg: "bg-[#FEF9C3]",
  },
  {
    step: "Step 3:",
    title: "Upload your prescription",
    desc: "Upload your prescription from your optician. We'll help if you're not sure how to read it.",
    bg: "bg-[#E0F2FE]",
  },
  {
    step: "Step 4:",
    title: "Pay without pressure",
    desc: "Your multifocals will arrive in a few days. Remember, if you change your mind, just send them back for a full refund.",
    bg: "bg-[#ECFCCB]",
  },
];

export const ProductSection: React.FC = () => {
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const navigate = useNavigate();

  const colorMap = {
    Red: "#FF0000",
    Green: "#00FF00",
    Blue: "#0000FF",
    Brown: "#8B4513",
    Black: "#000000",
    White: "#FFFFFF",
    Grey: "#808080",
  };

  const { data: frames = [], isLoading: loading } = useQuery({
    queryKey: ["frames"],
    queryFn: async () => {
      try {
        const response = await getAllProducts({ limit: 12 });
        console.log("🔍 DEBUG getAllProducts response:", response.data);

        // Backend returns: { success: true, data: [...products], pagination: {...} }
        const products = response.data?.data || [];
        console.log("📦 Products count:", products.length);

        const mappedFrames = products.map((p: any) => {
          // Process naming_system to keep only the first three parts
          let processedNamingSystem = p.naming_system;
          if (p.naming_system) {
            const parts = p.naming_system.split('.');
            if (parts.length > 3) {
              processedNamingSystem = parts.slice(0, 3).join('.');
            }
          }

          return {
            id: p.id,
            skuid: p.skuid,
            name: p.name,
            naming_system: processedNamingSystem,
            price: `£${p.price}`,
            image: p.image,
            images: p.images || [],
            variants: p.variants || [],
            color_names: p.color_names || [],
            colors: (() => {
              // Extract colors from variants if available
              let colorNames: string[] = [];
              if (p.variants && p.variants.length > 0) {
                colorNames = p.variants
                  .map((v: any) => v.color_names?.[0])
                  .filter((c: string) => c);
              } else if (p.color_names && p.color_names.length > 0) {
                colorNames = p.color_names;
              }
              return colorNames.map((name: string) => getHexColorsFromNames([name])[0] || name);
            })(),
          };
        });

        console.log("✅ Mapped frames:", mappedFrames.length);
        return mappedFrames;
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        return [];
      }
    },
  });

  const handleProductClick = (frame: Frame) => {
    // Navigate to product details page
    navigate(`/product/${frame.skuid || frame.id}`, { state: { product: frame } });
  };

  // Get first 6 frames for mobile
  const mobileFrames = frames.slice(0, 6);
  // Get all 12 frames for desktop/tablet
  const desktopFrames = frames.slice(0, 12);

  return (
    <section className="w-full bg-white py-10 md:py-20 font-sans">
      <div className="max-w-[1800px] mx-auto px-0 md:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-4 md:px-0">
          <p
            className="mb-4"
            style={{
              color: "#232320",
              textAlign: "center",
              fontFamily: "Lynstone-regular",
              fontSize: "40px",
              fontStyle: "normal",
              fontWeight: 450,
              lineHeight: "normal",
              letterSpacing: "6px",
              textTransform: "uppercase",
            }}
          >
            OUR RANGE
          </p>
          <p
            style={{
              color: "#232320",
              textAlign: "center",
              fontFamily: "Lynstone-book",
              fontSize: "20px",
              fontStyle: "normal",
              fontWeight: 350,
              lineHeight: "normal",
              letterSpacing: "0.3px",
            }}
          >
            Glasses for the way you live now
          </p>
        </div>

        {/* Mobile Layout: Text -> Button -> 4 Images (touching each other) */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center px-4">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 border-4 border-[#232320] border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-gray-400 font-medium">
                  Loading collection...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Text Content First */}
              <div className="mb-8 space-y-4 px-4">
                <p className="text-gray-600 text-md leading-relaxed text-center">
                  Got a favourite style, or fancy trying something a bit
                  different? We offer every type of frame imaginable from round to
                  square, cat's eye to butterfly, as well as leading brands.
                </p>
                <p className="text-gray-600 text-md leading-relaxed text-center">
                  All our frames use the best sustainable materials including
                  acetate, steel, wood and titanium. And every frame will fit
                  whatever multifocal lens you choose.
                </p>
              </div>

              {/* Button Second */}
              <div className="mb-10 px-4 flex justify-center">
              <button
                onClick={() => navigate("/glasses/men")}
                aria-label="Explore our range of glasses"
                className="w-[200px] py-6 bg-[#232320] text-white rounded-full uppercase transition-all duration-300 hover:bg-[#1a1a1a]"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Lynstone-regular, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '1.2px',
                    wordWrap: 'break-word'
                  }}
                >
                  EXPLORE OUR RANGE
                </button>
              </div>

              {/* 4 Product Images Third - NO GAPS between images */}
              <div className="grid grid-cols-2 gap-0">
                {mobileFrames.map((frame, index) => (
                  <div
                    key={frame.id}
                    className={`group cursor-pointer flex flex-col border-[#D4D4D4] overflow-hidden bg-[#F5F5F5] hover:shadow-md transition-shadow duration-300
                      ${index % 2 === 0 ? 'border-r border-t' : 'border-t'} 
                      ${index === 0 || index === 1 ? 'border-t' : ''}
                      ${index === 2 || index === 3 ? 'border-b' : ''}`}
                    onClick={() => handleProductClick(frame)}
                  >
                    <div className="relative aspect-[4/3] m-0">
                      {/* Color Dots - Top Left */}
                      {frame.colors && frame.colors.length > 0 && (
                        <div className="absolute top-2 left-2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-sm px-1.5 py-1 rounded-full">
                          {frame.colors.map((c: string, i: number) => (
                            <span
                              key={i}
                              style={{ backgroundColor: c }}
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                            />
                          ))}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        {/* Image 1 - Visible by default - Base image (images[0]) */}
                        <img
                          src={frame.images?.[0] || frame.image}
                          alt={frame.name}
                          width="400"
                          height="300"
                          loading="lazy"
                          className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
                        />
                        {/* Image 2 - Hidden until hover - Shows images[1] */}
                        <img
                          src={frame.images?.[1] || frame.image}
                          alt={`${frame.name} hover`}
                          width="400"
                          height="300"
                          loading="lazy"
                          className="w-full h-full object-contain mix-blend-multiply absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                    {/* Model Name and Price Below */}
                    <div className="flex justify-between items-end mt-2 px-2 mx-4">
                      <p className="font-bold text-[#1F1F1F] uppercase tracking-wider text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl truncate pr-2">
                        {frame.naming_system || frame.name}
                      </p>
                      <span className="font-bold text-[#1F1F1F] text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">
                        {frame.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop Layout: Left text/image + Right 3x3 grid (touching each other) */}
        <div className="hidden lg:flex flex-col lg:flex-row gap-8 mb-20">
          {/* Left Side: Content and Button */}
          <div className="lg:w-[30%] flex flex-col justify-start gap-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-[15px] leading-relaxed" style={{
                fontSize: '14px',
                fontFamily: 'Lynstone-book',
                fontWeight: 350,
                lineHeight: '20px',
                wordWrap: 'break-word'
              }}>
                Got a favourite style, or fancy trying something a bit
                different? We offer every type of frame imaginable from round to
                square, cat's eye to butterfly, as well as leading brands.
              </p>
              <p className="text-gray-600 text-[15px] leading-relaxed" style={{
                fontSize: '14px',
                fontFamily: 'Lynstone-book',
                fontWeight: 350,
                lineHeight: '20px',
                wordWrap: 'break-word'
              }}>
                All our frames use the best sustainable materials including
                acetate, steel, wood and titanium. And every frame will fit
                whatever multifocal lens you choose.
              </p>
            </div>
            {/* Frame Styles Image - Hidden on mobile, visible on desktop */}
            <div className="mb-8">
              <img
                src="/smallspecs.png"
                alt="Frame Styles"
                width="400"
                height="200"
                loading="lazy"
                className="w-full"
              />
            </div>
            <button
              onClick={() => navigate("/glasses")}
              aria-label="Explore our range of glasses"
              className="mt-2 ml-6 w-full lg:w-[180px] h-[60px] px-2 py-2 bg-[#232320] text-white rounded-full uppercase transition-all duration-300 hover:bg-[#1a1a1a]"
              style={{
                fontSize: '12px',
                fontFamily: 'Lynstone-regular, sans-serif',
                fontWeight: 600,
                letterSpacing: '1.39px',
                padding: '12px 10px',
                wordWrap: 'break-word'
              }}
            >
              EXPLORE OUR RANGE
            </button>
          </div>

          {/* Right Side: 3x3 Grid - NO GAPS between images */}
          <div className="lg:w-[70%]">
            {loading ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 border-4 border-[#232320] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-gray-400 font-medium">
                    Loading collection...
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0">
                {desktopFrames.map((frame, index) => (
                  <div
                    key={frame.id}
                    className={`group cursor-pointer flex flex-col border-[#D4D4D4] overflow-hidden bg-[#F5F5F5] hover:shadow-md transition-shadow duration-300
                      ${index % 3 === 0 ? 'border-r' : index % 3 === 1 ? 'border-r' : ''} 
                      ${index < 3 ? 'border-t border-b' : index < 6 ? 'border-b' : 'border-b'}
                      ${index === 0 || index === 3 || index === 6 ? 'border-l' : ''}`}
                    onClick={() => handleProductClick(frame)}
                  >
                    {/* Frame Card - Fixed hover with no layout shift */}
                    <div className="relative aspect-[4/3] m-0">
                      {/* Color Dots - Top Left */}
                      {frame.colors && frame.colors.length > 0 && (
                        <div className="absolute top-2 left-2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-sm px-1.5 py-1 rounded-full">
                          {frame.colors.map((c: string, i: number) => (
                            <span
                              key={i}
                              style={{ backgroundColor: c }}
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                            />
                          ))}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        {/* Image 1 - Visible by default - Base image (images[0]) */}
                        <img
                          src={frame.images?.[0] || frame.image}
                          alt={frame.name}
                          width="400"
                          height="300"
                          loading="lazy"
                          className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
                        />
                        {/* Image 2 - Hidden until hover - Shows images[1] */}
                        <img
                          src={frame.images?.[1] || frame.image}
                          alt={`${frame.name} hover`}
                          width="400"
                          height="300"
                          loading="lazy"
                          className="w-full h-full object-contain mix-blend-multiply absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                    {/* Model Name and Price Below */}
                    <div className="flex justify-between items-end mt-2 px-1 p-2 mx-1">
                      <p className="font-bold text-[#1F1F1F] uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl truncate pr-2">
                        {frame.naming_system || frame.name}
                      </p>
                      <p className="font-bold text-[#1F1F1F] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl whitespace-nowrap">
                        {frame.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedFrame && (
          <DeliveryPopUp
            open={!!selectedFrame}
            onHide={() => setSelectedFrame(null)}
            selectedProduct={selectedFrame}
          />
        )}
      </div>
    </section>
  );
};