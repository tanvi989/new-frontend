
// export default SelectLensCoatings;
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CheckoutStepper from "../components/CheckoutStepper";
import { addToCart, selectLens, addPrescription, getProductById, getProductBySku } from "../api/retailerApis";
import CoatingInfoModal from "../components/product/CoatingInfoModal";
import { setCartLensOverride } from "../utils/priceUtils";
import ProductDetailsFooter from "@/components/ProductDetailsFooter";
import { getProductFlow, setProductFlow, saveCartId } from "../utils/productFlowStorage";



const SelectLensCoatings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: locationState } = useLocation();
  const flow = id ? getProductFlow(id) : null;
  const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCoating, setSelectedCoating] = useState<string>("anti-reflective");
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showCoatingGuide, setShowCoatingGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product from API if not passed in state
  const { data: apiProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await getProductById(id);
        return response.data;
      } catch (err) {
        try {
          const response = await getProductBySku(id);
          return response.data;
        } catch (skuErr) {
          console.error("Product not found:", id);
          return null;
        }
      }
    },
    enabled: !state?.product && !!id,
  });

  const getPrescriptionTypeLabel = () => {
    const tier = state?.prescriptionTier;
    if (tier === "advanced") return "PREMIUM PROGRESSIVE EYEGLASSES";
    if (tier === "standard") return "STANDARD PROGRESSIVE EYEGLASSES";
    return "BIFOCAL/PROGRESSIVE EYEGLASSES";
  };

  const product = state?.product || (apiProduct ? {
    id: apiProduct.id,
    skuid: apiProduct.skuid,
    name: apiProduct.name || "Unknown",
    price: apiProduct.price || "0",
    image: apiProduct.image || "",
    colors: apiProduct.colors || [],
    brand: apiProduct.brand,
    style: apiProduct.style
  } : (flow?.product as any)) || (id ? {
    id: id,
    skuid: id,
    name: "Product",
    price: "0",
    image: "",
    colors: [],
  } : null);

  // Debug logging
  React.useEffect(() => {
    console.log("=== SelectLensCoatings Debug ===");
    console.log("URL ID:", id);
    console.log("State:", state);
    console.log("State Product:", state?.product);
    console.log("API Product:", apiProduct);
    console.log("Final Product:", product);
    console.log("================================");
  }, [id, state, apiProduct, product]);

  const COATING_OPTIONS = [
    {
      id: "anti-reflective",
      title: "Anti Reflective Coating",
      price: "+£0",
      priceValue: 0,
      description: "Reduces light reflections, UV protection",
      recommended: true,
      icon: () => <img src="/icon1.svg" alt="Anti Reflective" className="w-12 h-12 object-contain" />,
    },
    {
      id: "water-resistant",
      title: "Water Resistant",
      price: "+£10",
      priceValue: 10,
      description: "Reduces light reflections, UV protection & prevents water stains.",
      recommended: false,
      icon: () => <img src="/icon2.svg" alt="Water Resistant" className="w-12 h-12 object-contain" />,
    },
    {
      id: "oil-resistant",
      title: "Oil Resistant Coating",
      price: "+£15",
      priceValue: 15,
      description: "Reduces light reflections, UV protection, prevents water & oil stains, easy to clean.",
      recommended: false,
      icon: () => <img src="/icon3.svg" alt="Oil Resistant" className="w-12 h-12 object-contain" />,
    },
  ];


  console.log('state', state);

  // When a card is clicked — perform the add->selectLens->addPrescription flow and navigate to /cart
  const handleSelectAndProceed = async (coatingId: string) => {
    if (processing) return;
    setError(null);
    setSelectedCoating(coatingId);
    setProcessing(true);
    setProcessingId(coatingId);

    console.log("DEBUG: Product data:", product);
    console.log("DEBUG: State data:", state);

    // Validate product data
    if (!product || (!product.skuid && !product.id)) {
      setError("Product information is missing. Please go back and select a product.");
      setProcessing(false);
      setProcessingId(null);
      return;
    }

    try {
      // If we have a pending selection from the packages page, merge it into state-driven values.
      // This avoids losing the lens package price if react-router state is missing after refresh/navigation.
      let pendingSelection: any = null;
      try {
        const raw = sessionStorage.getItem("pending_lens_selection_v1");
        pendingSelection = raw ? JSON.parse(raw) : null;
      } catch { }

      // Persist flow to session so we can restore after refresh
      if (id && product) {
        setProductFlow(id, {
          product: product as any,
          selectedLensPackage: state?.selectedLensPackage ?? flow?.selectedLensPackage,
          selectedLensPrice: state?.selectedLensPrice ?? flow?.selectedLensPrice,
          lensCategory: state?.lensCategory ?? flow?.lensCategory,
          lensType: state?.lensType ?? flow?.lensType,
          prescriptionTier: state?.prescriptionTier ?? flow?.prescriptionTier,
        });
      }

      // Resolve product with price (fetch from API if flow product has no price)
      let productToAdd = product;
      const framePrice = Number(product?.price ?? product?.list_price ?? 0);
      if ((!framePrice || framePrice === 0) && id) {
        const source = apiProduct || (await getProductById(id).then((r: any) => r?.data).catch(() => null))
          || (await getProductBySku(id).then((r: any) => r?.data).catch(() => null));
        const apiPrice = Number(source?.price ?? source?.list_price ?? 0);
        if (apiPrice > 0) {
          productToAdd = { ...product, price: apiPrice, list_price: apiPrice };
        }
      }

      // Get lens and coating prices before add
      const selectedCoatingOption = COATING_OPTIONS.find(c => c.id === coatingId);
      const lensPackage = state?.selectedLensPackage ?? pendingSelection?.lensPackage;
      let lensPackagePrice = 0;
      if (state?.selectedLensPrice !== undefined) {
        lensPackagePrice = state.selectedLensPrice;
      } else if (pendingSelection?.lensPackagePrice !== undefined) {
        lensPackagePrice = pendingSelection.lensPackagePrice;
      } else if (lensPackage) {
        const lensCategory = state?.lensCategory || "blue";
        if (lensPackage === "1.61") lensPackagePrice = lensCategory === "blue" ? 39 : lensCategory === "photo" ? 59 : lensCategory === "sun" ? 49 : 39;
        else if (lensPackage === "1.67") lensPackagePrice = lensCategory === "blue" ? 59 : lensCategory === "photo" ? 89 : 59;
        else if (lensPackage === "1.74") lensPackagePrice = lensCategory === "blue" ? 89 : lensCategory === "photo" ? 139 : 89;
      }
      const coatingPrice = selectedCoatingOption?.priceValue ?? 0;

      // 1) Add product to cart with full pricing (frame + lens + coating)
      const addToCartResponse: any = await addToCart(productToAdd, "instant", undefined, {
        lensPackagePrice,
        coatingPrice,
        lensPackage,
        coatingTitle: selectedCoatingOption?.title,
      });
      console.log("DEBUG: addToCart full response:", addToCartResponse);

      let cartId = addToCartResponse?.data?.cart_id ||
        addToCartResponse?.data?.data?.cart_id ||
        addToCartResponse?.data?.id ||
        (id ? flow?.cart_id : undefined);

      if (!cartId) {
        try {
          const { getCart } = await import("../api/retailerApis");
          const cartResponse: any = await getCart({});
          const cart = cartResponse?.data?.cart;
          if (Array.isArray(cart) && cart.length) {
            const matching = cart.find((item: any) =>
              item.product?.products?.skuid === product.skuid ||
              item.product_id === product.skuid ||
              item.product?.products?.id === product.id
            );
            if (matching?.cart_id) cartId = matching.cart_id;
            else cartId = cart[cart.length - 1]?.cart_id;
          }
        } catch (e) {
          console.warn("Recover cart_id:", e);
        }
      }

      if (cartId && id) saveCartId(id, Number(cartId));

      if (!cartId) {
        setProcessing(false);
        setProcessingId(null);
        navigate("/cart", {
          state: { addedMessage: "Your item was added to the bag. Open your cart to continue." },
        });
        return;
      }

      // 2) select/update lens (already computed above)
      await selectLens(product.skuid, cartId, coatingId, {
        title: selectedCoatingOption?.title,
        priceValue: selectedCoatingOption?.priceValue || 0, // Coating price
        lensPackage: lensPackage,
        lensPackagePrice: lensPackagePrice, // Lens index price
        lensCategory: state?.lensCategory,
        prescriptionTier: state?.prescriptionTier,
        main_category: state?.lensType === "bifocal" ? "Bifocal Lenses" :
          state?.prescriptionTier === "advanced" ? "Premium Progressive Lenses" :
            state?.prescriptionTier === "standard" ? "Standard Progressive Lenses" :
              "Progressive Lenses",
      });


      // Persist the user's chosen prices locally (backend may not echo them back reliably)
      setCartLensOverride(cartId, {
        lensPackage: lensPackage,
        lensPackagePrice: Number(lensPackagePrice || 0),
        lensCategory: state?.lensCategory,
        prescriptionTier: state?.prescriptionTier,
        mainCategory: state?.lensType === "bifocal" ? "Bifocal Lenses" :
          state?.prescriptionTier === "advanced" ? "Premium Progressive Lenses" :
            state?.prescriptionTier === "standard" ? "Standard Progressive Lenses" :
              "Progressive Lenses",
        coatingTitle: selectedCoatingOption?.title,
        coatingPrice: Number(selectedCoatingOption?.priceValue || 0),
      });


      // Clear pending selection once we've persisted it against a real cart_id
      try { sessionStorage.removeItem("pending_lens_selection_v1"); } catch { }

      console.log("DEBUG: cartId before prescription:", cartId, "Type:", typeof cartId);

      // 3) add prescription if available
      try {
        if (state?.prescriptionMethod === "manual" && state?.prescriptionData) {
          const customerID = localStorage.getItem("customerID") || "guest";
          await addPrescription(customerID, null, "manual", state.prescriptionData, cartId);
        } else if (state?.prescriptionMethod === "upload") {
          await addPrescription("guest", null, "upload", {}, cartId);
        }
      } catch (prescErr) {
        console.error("Failed to save prescription, but proceeding to cart:", prescErr);
        // We do NOT block navigation if prescription saves fail, as per user requirement to "go to cart anyhow"
      }

      // 5) refresh cart queries and navigate based on screen size
      await queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Check if mobile (screen width < 768px)
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Mobile: navigate to checkout preview
        navigate("/checkout-preview");
      } else {
        // Desktop: navigate directly to cart
        navigate("/cart");
      }
    } catch (err: any) {
      console.error("Failed to add & proceed", err);
      if (err?.response?.data) {
        console.log("DEBUG: Full Error Response:", JSON.stringify(err.response.data, null, 2));
      }

      let msg = err?.message ?? "An error occurred while processing your selection";
      // Prefer backend detail/message when present (addToCart attaches err.response)
      if (err?.response?.data) {
        const d = err.response.data;
        const detail = d.detail ?? d.message ?? d.error;
        if (detail !== undefined && detail !== null) {
          if (typeof detail === "string") msg = detail;
          else if (Array.isArray(detail)) msg = detail.map((e: any) => `${e.loc?.join(".")} - ${e.msg}`).join(", ");
          else if (typeof detail === "object") msg = JSON.stringify(detail);
        }
      }

      setError(msg);
      setProcessing(false);
      setProcessingId(null);
    }
  };

  // Early return if no product data available
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F3F0E7] font-sans py-2 md:py-8 px-4 md:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-[#E53935] mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">
            Unable to load product information. Please go back and select a product.
          </p>
          <button
            onClick={() => navigate('/glasses')}
            className="bg-[#025048] text-white px-6 py-3 rounded font-bold hover:bg-[#013a34] transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans py-2 md:py-8 px-4 md:px-8">
      <CheckoutStepper
        currentStep={4}
        selections={{
          2: "Bifocal/Progressive Eyeglasses",
          3: "Prescription Details",
        }}
      />

      <div className="max-w-[900px] mx-auto mt-4 md:mt-6">
        {/* Header */}
        <div className="text-center mb-8 pb-3 md:pb-0 border-b md:border-b-0 border-gray-200 relative">
          <p className="text-[16px] md:text-[20px] font-medium text-[#1F1F1F] uppercase tracking-wide flex items-center justify-center flex-wrap">
            CHOOSE HOW YOUR LENSES HANDLE GLARE, SMUDGES, AND LIGHT
            <button
              onClick={() => setShowCoatingGuide(true)}
              className="text-[#E94D37] text-lg cursor-pointer hover:text-[#d43f2a] transition-colors ml-3"
              title="Help"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </p>
        </div>

        {/* Coating Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 max-w-[900px] mx-auto">
          {COATING_OPTIONS.map((coating, index) => {
            const isProcessingThis = processing && processingId === coating.id;
            const bottomCardCentering = index === 2 ? "md:col-span-2 md:w-1/2 md:mx-auto" : "";

            return (
              <button
                key={coating.id}
                type="button"
                onClick={() => handleSelectAndProceed(coating.id)}
                disabled={processing}
                className={`
                  relative rounded-2xl p-4 cursor-pointer 
                  border-2 flex items-center text-left min-h-[110px] gap-4 w-full
                  focus:outline-none focus:ring-0
                  ${bottomCardCentering}
                  bg-[#F3F0E7] border-gray-400 hover:border-[#025048] hover:shadow-md transition-all
                  ${processing ? "opacity-80" : ""}
                `}
              >
                {/* Icon (left) */}
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  {coating.icon()}
                </div>

                {/* Texts (right) */}
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-[#1F1F1F] font-serif">
                      {coating.title}
                    </h3>
                    <div className="text-lg font-bold text-[#025048] whitespace-nowrap">
                      {coating.price}
                    </div>
                  </div>

                  <p className="text-sm text-[#525252] font-medium mt-1 leading-snug">
                    {coating.description}
                  </p>

                  {coating.recommended && (
                    <div className="mt-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wide bg-[#025048] px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}
                </div>

                {/* Processing overlay text on the clicked card */}
                {isProcessingThis && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                    <span className="font-bold text-sm text-[#025048]">Processing...</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Product Details Footer - Mobile Only */}
        <div className="mx-auto mt-12 block md:hidden">
          <ProductDetailsFooter
            product={product}
            selectedColor={product.colors ? product.colors[0] : undefined}
            prescriptionData={{
              prescriptionType: getPrescriptionTypeLabel(),
              pd: state?.prescriptionData?.pdOD
                ? `${state.prescriptionData.pdOD}/${state.prescriptionData.pdOS}`
                : state?.prescriptionData?.totalPD,
              birthYear: state?.prescriptionData?.birthYear,
              od: {
                sph: state?.prescriptionData?.sphOD,
                cyl: state?.prescriptionData?.cylOD,
                axis: state?.prescriptionData?.axisOD,
              },
              os: {
                sph: state?.prescriptionData?.sphOS,
                cyl: state?.prescriptionData?.cylOS,
                axis: state?.prescriptionData?.axisOS,
              },
              addPower: state?.prescriptionData?.addOD,
            }}
          />
        </div>
      </div>

      {/* Coating Guide Modal */}
      <CoatingInfoModal isOpen={showCoatingGuide} onClose={() => setShowCoatingGuide(false)} />
    </div>
  );
};

export default SelectLensCoatings;
