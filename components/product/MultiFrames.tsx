import { useNavigate } from "react-router-dom";
import { Button } from "../Button";

export default function MultiFrames() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Section */}
        <div className="w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-10">
          <div className="flex flex-col items-center gap-8 w-full h-full">
            <div className="relative flex-1 w-full h-full max-w-2xl overflow-hidden shadow-lg">
              <img
                src="./menWithGlass.png"
                alt="Man wearing golden frame glasses"
                className="object-cover w-full h-full"
              />
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="mt-2 ml-6 w-full lg:w-[180px] h-[60px] px-2 py-2 bg-[#232320] text-white rounded-full uppercase transition-all duration-300 hover:bg-[#1a1a1a]"
              style={{
                fontSize: "12px",
                fontFamily: "Lynstone-regular, sans-serif",
                fontWeight: 600,
                letterSpacing: '1.39px',
                padding: '10px',
                wordWrap: 'break-word'
              }}
            >
              SHOP OUR RANGE
              SHOP OUR RANGE
            </button>

          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-200 to-gray-100">
          {/* Right Image - FIXED HEIGHT BEHAVIOR */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            <img
              src="./glassGolden.png"
              alt="Golden frame glasses close-up"
              className="object-cover object-right w-full h-full max-h-screen"
            />
          </div>

          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent flex flex-col justify-center">
            <div className="text-white flex flex-col items-center space-y-6 max-w-md mx-auto">
              {/* Title Block */}
              <div className="flex flex-col items-start space-y-3 -ml-[90px]">
                <h4 className="text-4xl font-lynstone tracking-tight">
                  FRAMES
                </h4>
                <span className="text-4xl font-lynstone tracking-wide">
                  MULTIFOCAL LENSES
                </span>
              </div>

              {/* Features */}
              <div className="text-xl font-light leading-relaxed space-y-3">
                <p className="ml-1">Anti reflective</p>
                <p className="ml-[60px]">1.61 Index Thin Lens</p>
                <p className="-ml-[60px]">UV Protection</p>
                <p className="ml-[120px]">Scratch resistant</p>
              </div>
            </div>
          </div>

          {/* Yellow accent line */}
          {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-transparent"></div> */}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col lg:hidden">
        {/* Top Section - Image + CTA */}
        <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 w-full h-full justify-center pt-16 pb-16">
            <div className="relative max-w-md overflow-hidden shadow-lg">
              <img
                src="./menWithGlass.png"
                alt="Man wearing golden frame glasses"
                className="object-cover w-[240px] h-[240px]"
              />
            </div>

            <Button
              onClick={() => navigate("/shop")}
              className="bg-black hover:bg-gray-900 text-white rounded-full px-6 py-4 sm:px-7 sm:py-5 tracking-wider text-sm sm:text-base w-[200px] max-w-xs mt-4"
            >
              SHOP OUR RANGE
            </Button>
          </div>
        </div>

        {/* Bottom Section - Features */}
        <div className="w-full min-h-[50vh] relative overflow-hidden bg-gradient-to-b from-gray-200 to-gray-100">
          <img
            src="./glassGolden.png"
            alt="Golden frame glasses close-up"
            className="object-cover object-center w-full h-full"
          />

          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent flex flex-col justify-center">
            <div className="text-white flex flex-col items-center space-y-6 px-4 h-full justify-center">
              {/* Title Block */}
              <div className="flex flex-col items-start space-y-2 -ml-[40px]">
                <h4 className="text-2xl sm:text-3xl font-lynstone tracking-tight">
                  FRAMES
                </h4>
                <span className="text-2xl sm:text-3xl font-lynstone tracking-wide">
                  MULTIFOCAL LENSES
                </span>
              </div>
              {/* Features */}
              <div className="text-base sm:text-lg font-light leading-relaxed space-y-2">
                <p className="ml-1">Anti reflective</p>
                <p className="ml-[40px] sm:ml-[60px]">1.61 Index Thin Lens</p>
                <p className="-ml-[40px] sm:-ml-[60px]">UV Protection</p>
                <p className="ml-[80px] sm:ml-[120px]">Scratch resistant</p>
              </div>
            </div>
          </div>

          {/* Yellow accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
