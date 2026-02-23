import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CheckoutStepper from "../components/CheckoutStepper";
import { addToCart } from "../api/retailerApis";
import { trackAddToCart } from "@/utils/analytics";
import { setCartLensOverride } from "../utils/priceUtils";
import { getProductFlow, saveCartId } from "../utils/productFlowStorage";

interface TintOption {
  id: string;
  name: string;
  price: number;
  colors: { name: string; hex: string }[];
}

const TINT_OPTIONS: TintOption[] = [
  {
    id: "mirror",
    name: "Mirror Tints",
    price: 49,
    colors: [
      { name: "Gray", hex: "#808080" },
      { name: "Brown", hex: "#8B4513" },
      { name: "Blue", hex: "#4169E1" },
      { name: "Green", hex: "#228B22" },
      { name: "Purple", hex: "#9370DB" },
      { name: "Violet", hex: "#8A2BE2" },
    ],
  },
  {
    id: "polarized",
    name: "Polarized Tints",
    price: 119,
    colors: [
      { name: "Gray", hex: "#808080" },
      { name: "Brown", hex: "#8B4513" },
      { name: "Green", hex: "#228B22" },
    ],
  },
  {
    id: "solid",
    name: "Solid Tints 85% Dark",
    price: 19,
    colors: [
      { name: "Gray", hex: "#808080" },
      { name: "Brown", hex: "#8B4513" },
      { name: "Blue", hex: "#4169E1" },
      { name: "Green", hex: "#228B22" },
      { name: "Purple", hex: "#9370DB" },
      { name: "Violet", hex: "#8A2BE2" },
      { name: "Gold", hex: "#FFD700" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
  },
];

const SelectLensColor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: locationState } = useLocation();
  const flow = id ? getProductFlow(id) : null;
  const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedTintType, setSelectedTintType] = useState<string>("mirror");
  const [selectedColor, setSelectedColor] = useState<string>("Gray");
  const [expandedSection, setExpandedSection] = useState<string>("mirror");
  const [processing, setProcessing] = useState(false);

  const product = state?.product || (flow?.product as any) || {
    id: id,
    skuid: id,
    name: "Sunglasses",
    price: "0",
    image: "",
    colors: [],
  };

  // Debug logging
  React.useEffect(() => {
    console.log("=== SelectLensColor Debug ===");
    console.log("URL ID:", id);
    console.log("State:", state);
    console.log("Product:", product);
    console.log("============================");
  }, [id, state, product]);

  const handleSaveTintSelection = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const selectedTint = TINT_OPTIONS.find((t) => t.id === selectedTintType);
      if (!selectedTint) {
        throw new Error("Please select a tint type");
      }

      console.log("=== SAVE TINT SELECTION ===");
      console.log("Product:", product);
      console.log("Selected Tint:", selectedTint);
      console.log("Selected Color:", selectedColor);

      // Step 1: Add product to cart (API or localStorage) with sunglasses lens package from previous step (e.g. 1.56)
      const lensPackage = state?.selectedLensPackage;
      const lensPackagePrice = Number(state?.selectedLensPrice ?? 0);
      const addToCartResponse: any = await addToCart(product, "instant", undefined, state?.lensCategory === "sun" ? {
        lensPackage: lensPackage || "1.56",
        lensPackagePrice,
        lensCategory: "sun",
      } : undefined);
      console.log("DEBUG: addToCart response:", addToCartResponse);
      trackAddToCart(product, 1);

      let cartId =
        addToCartResponse?.data?.cart_id ||
        addToCartResponse?.data?.data?.cart_id ||
        addToCartResponse?.data?.id;

      // Fail-safe: If cart_id missing, get cart (API or localStorage) and find item
      if (!cartId) {
        try {
          const { getCart } = await import("../api/retailerApis");
          const cartResponse: any = await getCart({});
          if (cartResponse?.data && Array.isArray(cartResponse.data.cart)) {
            const matchingItem = cartResponse.data.cart.find(
              (item: any) =>
                item.product?.products?.skuid === product.skuid ||
                item.product_id === product.skuid ||
                item.product?.products?.id === product.id
            );

            if (matchingItem?.cart_id) {
              cartId = matchingItem.cart_id;
            } else if (cartResponse.data.cart.length) {
              cartId = cartResponse.data.cart[cartResponse.data.cart.length - 1]?.cart_id;
            }
          }
        } catch (fetchErr) {
          console.warn("Recover cart_id:", fetchErr);
        }
      }

      if (!cartId) {
        setProcessing(false);
        navigate("/cart", {
          state: { addedMessage: "Your item was added to the bag. Open your cart to continue." },
        });
        return;
      }
      if (id && cartId != null) saveCartId(id, Number(cartId));

      // Step 2: Save tint selection as lens data
      const { selectLens } = await import("../api/retailerApis");

      // Construct main_category based on prescription tier to preserve it in cart display
      let mainCategory = "Sunglasses Tint";
      if (state?.lensType === "bifocal") {
        mainCategory = "Bifocal Lenses";
      } else if (state?.prescriptionTier === "advanced") {
        mainCategory = "Premium Progressive Lenses";
      } else if (state?.prescriptionTier === "standard") {
        mainCategory = "Standard Progressive Lenses";
      } else if (state?.prescriptionTier || state?.lensType === "progressive") {
        mainCategory = "Progressive Lenses";
      }

      const lensData: Record<string, unknown> = {
        title: `${selectedTint.name} - ${selectedColor}`,
        sub_category: selectedTint.name,
        main_category: mainCategory,
        selling_price: selectedTint.price,
        price: selectedTint.price,
        tint_type: selectedTint.name,
        tint_color: selectedColor,
        tint_price: selectedTint.price,
        lens_category: "sun",
      };
      if (state?.selectedLensPackage) {
        lensData.lensPackage = state.selectedLensPackage;
        if (state?.selectedLensPrice != null) lensData.lensPackagePrice = Number(state.selectedLensPrice);
      }

      console.log("Calling selectLens with:", {
        skuid: product.skuid,
        cartId,
        lensId: selectedTintType,
        lensData,
      });

      const selectLensResponse = await selectLens(
        product.skuid,
        cartId,
        selectedTintType,
        lensData
      );
      console.log("selectLens response:", selectLensResponse);

      // Persist selection locally so Cart reflects it even if backend doesn't echo these fields back (include lens package e.g. 1.56). Pass product id so override survives cart_id change after login.
      setCartLensOverride(cartId, {
        lensCategory: "sun",
        lensPackage: state?.selectedLensPackage || "1.56",
        lensPackagePrice: Number(state?.selectedLensPrice ?? 0),
        mainCategory: mainCategory,
        tintType: selectedTint.name,
        tintColor: selectedColor,
        tintPrice: Number(selectedTint.price || 0),
      }, id ?? product?.skuid);

      // Step 3: Invalidate cart queries and navigate
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate("/cart");
    } catch (error: any) {
      console.error("=== SAVE TINT ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      alert(`Failed to save tint selection: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? "" : sectionId);
  };

  const handleTintSelect = (tintId: string) => {
    setSelectedTintType(tintId);
    // Always expand the selected tint section
    setExpandedSection(tintId);
    // Auto-select first color (Gray) for the selected tint type
    const tint = TINT_OPTIONS.find((t) => t.id === tintId);
    if (tint && tint.colors.length > 0) {
      setSelectedColor(tint.colors[0].name);
    }
  };

  const calculateTotalPrice = () => {
    const priceString = String(product.price || "0");
    const basePrice = parseFloat(priceString.replace("£", ""));
    const selectedTint = TINT_OPTIONS.find((t) => t.id === selectedTintType);
    const tintPrice = selectedTint?.price || 0;
    return basePrice + tintPrice;
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans py-2 md:py-8 px-4 md:px-8">
      <CheckoutStepper
        currentStep={4}
        selections={{
          1: product.name,
          2: "Sunglasses",
        }}
      />

      <div className="max-w-[900px] mx-auto mt-6">
        {/* Header */}
        <div className="text-center mb-8 pb-3 md:pb-0 border-b md:border-b-0 border-gray-200">
          <h1 className="text-[18px] md:text-[28px] font-semibold text-[#1F1F1F] uppercase tracking-widest mb-6">
            SELECT LENS COLOUR
          </h1>

          {/* Product Image */}
          <div className="bg-white rounded-xl p-3 md:p-4 mb-6 border border-[#E5E0D8]">
            <img
              src={product.image || "/placeholder-sunglasses.png"}
              alt={product.name}
              className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto mx-auto object-contain"
            />
          </div>
        </div>

        {/* Tint Options */}
        <div className="space-y-4 mb-8">
          {TINT_OPTIONS.map((tint) => {
            const isExpanded = expandedSection === tint.id;
            const isSelected = selectedTintType === tint.id;

            return (
              <div
                key={tint.id}
                className={`bg-white rounded-xl border-2 transition-all ${isSelected ? "border-[#025048]" : "border-[#E5E0D8]"
                  }`}
              >
                {/* Header */}
                <button
                  onClick={() => handleTintSelect(tint.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#025048]" : "border-gray-300"
                        }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-[#025048]"></div>
                      )}
                    </div>
                    <span className="text-[16px] font-semibold text-[#1F1F1F]">
                      {tint.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[16px] font-bold text-[#E94D37]">
                      £{tint.price}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex flex-wrap gap-4">
                      {tint.colors.map((color) => {
                        const isColorSelected =
                          isSelected && selectedColor === color.name;

                        return (
                          <button
                            key={color.name}
                            onClick={() => {
                              handleTintSelect(tint.id);
                              setSelectedColor(color.name);
                            }}
                            className="flex flex-col items-center gap-2 group"
                          >
                            <div
                              className={`w-12 h-12 rounded-full border-2 transition-all ${isColorSelected
                                ? "border-[#025048] ring-2 ring-[#025048] ring-offset-2"
                                : "border-gray-300 group-hover:border-gray-400"
                                }`}
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <span className="text-xs text-[#525252] font-medium">
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>``

        {/* Save Button */}
        <div className="sticky bottom-0 left-0 right-0 z-10  pb-6 pt-4 flex justify-center mb-0 md:static md:bg-transparent md:pb-0 md:pt-0">
          <button
            onClick={handleSaveTintSelection}
            disabled={processing}
            className={`bg-[#025048] text-white px-12 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-xl ${processing
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#013d33] active:scale-95"
              }`}
          >
            {processing ? "SAVING..." : "SAVE TINT SELECTION"}
          </button>
        </div>
        {/* Price Display */}
        {/* <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-[24px] font-bold text-[#1F1F1F]">
                        <span>£{calculateTotalPrice()}</span>
                        <button className="text-[#025048] text-sm underline">
                            Details
                        </button>
                    </div>
                </div> */}
      </div>
    </div>
  );
};

export default SelectLensColor;
