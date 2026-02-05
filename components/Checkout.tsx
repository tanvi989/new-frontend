import { useState } from "react";

interface Product {
  name: string;
  price: string | number;
  image: string;
  colors?: string[];
  skuid?: string;
  brand?: string;
}

interface PrescriptionData {
  prescriptionType?: string;
  pd?: string;
  birthYear?: string;
  od?: { sph: string; cyl: string; axis: string };
  os?: { sph: string; cyl: string; axis: string };
  addPower?: string;
}

interface ProductDetailsCheckoutProps {
  product: Product;
  selectedColor?: string | ColorObject;
  prescriptionData?: PrescriptionData;
  onhandleCart: () => void;
  onClose?: () => void;
}

interface ColorObject {
  skuid?: string;
  color_names?: string;
  colors?: string;
  image?: string;
  frameColor?: string;
}

export const Checkout = ({
  product,
  selectedColor,
  prescriptionData,
  onhandleCart,
  onClose
}: ProductDetailsCheckoutProps) => {
  const displayPrice =
    typeof product.price === "number" ? `£${product.price}` : product.price;

  // Extract color name and hex
  const colorName = typeof selectedColor === 'string' ? selectedColor : selectedColor?.color_names || 'White';
  const colorHex = typeof selectedColor === 'string' ? selectedColor : selectedColor?.colors || '#FFFFFF';

  const [open, setOpen] = useState(false);


  return (
    <div className="flex flex-col bg-[#F3F0E7] h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#F3F0E7] text-black">
        <h2 className="text-lg font-bold uppercase tracking-wider">CHECKOUT</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Product Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-black">
          {/* Top Row: Image, Color, Price */}
          <div className="flex items-center justify-between mb-4">
            {/* Product Image */}
            <div className="w-24 h-16 flex-shrink-0 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Color Swatch */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full border-2 border-gray-400"
                style={{ backgroundColor: colorHex }}
              />
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-3xl font-bold text-[#1F1F1F]">{displayPrice}</p>
            </div>
          </div>

          {/* Bottom Row: SKU, Color Name, Product Price */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#1F1F1F]">
                {product.skuid || "EI9B850I"}
              </span>
              <span className="text-sm font-medium text-[#1F1F1F]">
                {colorName}
              </span>
              <span className="text-base font-medium text-[#1F1F1F]">{displayPrice}</span>
            </div>
          </div>
        </div>

        {/* Lenses Selection - Static Display */}
        <div
          onClick={() => setOpen((prev) => !prev)}
          className="bg-white rounded-3xl p-5 shadow-sm border-2 border-black
             flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-[#1F1F1F]">Lenses:</span>
            <span className="text-base font-bold text-[#E94D37]">
              {prescriptionData?.prescriptionType || "Blue Protect"}
            </span>
          </div>

          <svg
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""
              }`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {open && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-black">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#1F1F1F]">Lenses:</span>
              <span className="text-base font-bold text-[#E94D37]">
                {prescriptionData?.prescriptionType || "Blue Protect"}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Fixed Footer Button */}
      <div className="p-4 bg-[#F3F0E7]">
        <button
          onClick={onhandleCart}
          className="w-full py-4 bg-[#2D2D2D] text-white font-bold rounded-xl hover:bg-black transition-colors uppercase tracking-wider"
        >
          Finish & Add To Cart
        </button>
      </div>
    </div>
  );
};
