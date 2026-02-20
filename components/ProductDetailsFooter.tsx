import React, { useState } from "react";

interface Product {
  name: string;
  price: string | number;
  image: string;
  colors?: string[];
  skuid?: string;
  naming_system?: string;
  brand?: string;
}

interface ColorObject {
  skuid?: string;
  color_names?: string;
  colors?: string;
  image?: string;
  frameColor?: string;
}

interface PrescriptionData {
  prescriptionType?: string;
  pd?: string;
  birthYear?: string;
  od?: {
    sph: string;
    cyl: string;
    axis: string;
  };
  os?: {
    sph: string;
    cyl: string;
    axis: string;
  };
  addPower?: string;
}

export interface LensDetailsItem {
  lensType?: string;
  lensIndex?: string;
  lensIndexPrice?: string;
  addOns?: { name: string; price: string }[];
  prismCharge?: number | string;
}

interface ProductDetailsFooterProps {
  product: Product;
  selectedColor?: string | ColorObject;
  prescriptionData?: PrescriptionData;
  lensDetails?: LensDetailsItem;
}

const ProductDetailsFooter: React.FC<ProductDetailsFooterProps> = ({
  product,
  selectedColor,
  prescriptionData,
  lensDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lensSectionOpen, setLensSectionOpen] = useState(true);

  const toggleDrawer = () => setIsOpen(!isOpen);

  // Format Price
  const displayPrice =
    typeof product.price === "number" ? `£${product.price}` : product.price;

  // Display name: naming_system (user-friendly) over skuid
  const productDisplayName = product.naming_system || product.skuid || product.name || "";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Drawer - Bottom on Mobile, Side on Desktop */}
      <div
        className={`fixed z-[100] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          bg-[#F3F0E7] md:bg-white
          bottom-0 left-0 w-full max-h-[50vh] rounded-t-3xl md:top-0 md:right-0 md:h-full md:max-w-[600px] md:bottom-auto md:left-auto md:rounded-none
          ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}`}
      >
        {/* Drawer Header */}
        <div className="relative flex items-center justify-center px-6 py-5 border-b border-gray-200 bg-white md:bg-[#F3F0E7]">
          <h2 className="text-xl font-bold text-[#1F1F1F] font-serif">
            Details
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="13" y2="13"></line>
              <line x1="13" y1="1" x2="1" y2="13"></line>
            </svg>
          </button>
        </div>


        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Card */}
          <div className="bg-[#F3F0E7] rounded-3xl p-4 shadow-sm border border-black">
            {/* Top Row: Image, Color, Price */}
            <div className="flex items-center justify-between mb-2">
              {/* Product Image */}
              <div className="w-28 h-20 flex-shrink-0 rounded-xl flex items-center justify-center overflow-hidden relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
                />
                <img
                  src={product.image.replace("_1.jpg", "_2.jpg")}
                  alt={`${product.name} hover`}
                  className="w-full h-full object-contain mix-blend-multiply absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Color Swatch */}
              {selectedColor && (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: typeof selectedColor === 'string' ? selectedColor : selectedColor.colors || '#ccc' }}
                  ></div>
                </div>
              )}

              {/* Price */}
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1F1F1F]">{displayPrice}</p>
              </div>
            </div>

            {/* Bottom Section: Naming system, Color, Pricing - visible as soon as user enters */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#1F1F1F]">
                  {productDisplayName || product.skuid || product.name}
                </span>
                <span className="text-base font-medium text-[#1F1F1F]">{displayPrice}</span>
              </div>

              {product.name && product.name !== productDisplayName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1F1F1F]">
                    {product.name}
                  </span>
                </div>
              )}

              {selectedColor && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#1F1F1F]">
                    {typeof selectedColor === 'string' ? selectedColor : selectedColor.color_names || (selectedColor as ColorObject).frameColor || 'Color'}
                  </span>
                </div>
              )}

              {lensDetails?.prismCharge != null && lensDetails.prismCharge !== 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#1F1F1F]">
                    Prism Charge
                  </span>
                  <span className="text-base font-medium text-[#1F1F1F]">
                    {typeof lensDetails.prismCharge === "number" ? `£${lensDetails.prismCharge}` : lensDetails.prismCharge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Lenses / Config card - full details user entered (lens type, index, add-ons) */}
          {(lensDetails || prescriptionData) && (
            <div className="mt-4 bg-[#F3F0E7] rounded-3xl p-4 shadow-sm border border-black">
              {/* Expandable Lenses section */}
              {(lensDetails?.lensType || lensDetails?.lensIndex || (lensDetails?.addOns && lensDetails.addOns.length > 0)) && (
                <>
                  <button
                    type="button"
                    onClick={() => setLensSectionOpen(!lensSectionOpen)}
                    className="w-full flex items-center justify-between text-left py-1"
                  >
                    <span className="text-sm font-bold text-[#1F1F1F]">
                      Lenses{lensDetails.lensType ? `: ${lensDetails.lensType}` : ""}
                    </span>
                    <svg
                      className={`w-4 h-4 text-[#1F1F1F] transition-transform ${lensSectionOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="18 15 12 9 6 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {lensSectionOpen && (
                    <div className="space-y-2 pt-3 border-t border-gray-200 mt-2">
                      {lensDetails.lensIndex && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-[#E94D37]">
                            Index: {lensDetails.lensIndex}
                          </span>
                          {lensDetails.lensIndexPrice && (
                            <span className="text-sm font-medium text-[#1F1F1F]">{lensDetails.lensIndexPrice}</span>
                          )}
                        </div>
                      )}
                      {lensDetails.addOns && lensDetails.addOns.length > 0 && lensDetails.addOns.map((addOn, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-[#E94D37]">{addOn.name}</span>
                          <span className="text-sm font-medium text-[#1F1F1F]">{addOn.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* Prescription summary when available */}
              {prescriptionData && (prescriptionData.prescriptionType || prescriptionData.pd) && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                  {prescriptionData.prescriptionType && (
                    <p className="text-xs font-medium text-[#525252]">Prescription: {prescriptionData.prescriptionType}</p>
                  )}
                  {prescriptionData.pd && (
                    <p className="text-xs font-medium text-[#525252]">PD: {prescriptionData.pd}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Sticky Footer Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#F3F0E7] border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[80] font-sans pb-safe">
        <div className="flex flex-col items-center pt-3 pb-3 md:pb-0">
          <div
            className="flex items-center gap-2 cursor-pointer group leading-none"
            onClick={toggleDrawer}
          >
            <span className="text-2xl md:text-3xl font-bold text-[#E94D37] md:py-2">
              {displayPrice}
            </span>
            <span className="text-[15px] md:text-sm font-medium md:font-bold text-[#E94D37] md:text-gray-600 flex items-center gap-1">
              Details
              <svg
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform md:text-[#E94D37] duration-300 ${isOpen ? "rotate-180" : ""
                  }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </span>
          </div>

          {/* Stepper Indicator - Only on Mobile (md:hidden) */}
          <div className="md:hidden flex items-center justify-center w-full max-w-[300px] mt-4 mb-2">
            {/* Step 1: Rx */}
            <div className="flex items-center gap-1.5 min-w-max">
              <div className="flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[13px] font-bold text-[#1F1F1F]">Rx</span>
            </div>

            {/* Line 1 */}
            <div className="flex-1 h-[1px] bg-black/40 mx-2 min-w-[30px]" />

            {/* Step 2: Lens */}
            <div className="flex items-center gap-1.5 min-w-max">
              <div className="w-6 h-6 rounded-full bg-[#E94D37] text-white flex items-center justify-center text-[11px] font-bold">
                2
              </div>
              <span className="text-[13px] font-bold text-[#1F1F1F]">Lens</span>
            </div>

            {/* Line 2 */}
            <div className="flex-1 h-[1px] bg-black/40 mx-2 min-w-[30px]" />

            {/* Step 3: Check */}
            <div className="flex items-center gap-1.5 min-w-max">
              <div className="w-6 h-6 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[11px] font-bold">
                3
              </div>
              <span className="text-[13px] font-bold text-gray-400">Check</span>
            </div>
          </div>
        </div>

       
      </div>
      {/* Spacer to prevent content being hidden behind footer */}
      <div className="h-[100px]"></div>
    </>
  );
};

export default ProductDetailsFooter;
