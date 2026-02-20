import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CheckoutStepper from "../components/CheckoutStepper";
import ProductDetailsFooter from "../components/ProductDetailsFooter";
import { addToCart, selectLens, addPrescription, updateMyPrescription } from "../api/retailerApis";
import { setCartLensOverride } from "../utils/priceUtils";
import { trackAddToCart } from "@/utils/analytics";


const LensImage = ({
  type,
}: {
  type: "blue" | "clear" | "photo" | "sun";
}) => {
  const imageMap: Record<typeof type, string> = {
    blue: "/glass1.png",
    clear: "/glass2.png",
    photo: "/glass3.png",
    sun: "/glass4.png",
  };

  return (
    <img
      src={imageMap[type]}
      alt={`${type} lens preview`}
      className="w-full max-w-[160px] h-auto object-contain"
      loading="lazy"
    />
  );
};

const LensCategoryCard = ({
  title,
  desc,
  type,
  selected,
  onClick,
}: {
  title: string;
  desc: string;
  type: "blue" | "clear" | "photo" | "sun";
  selected?: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`border-2 rounded-[20px] px-4 pt-3 pb-0 flex flex-col items-center text-center cursor-pointer h-full min-h-[220px] relative overflow-hidden transition-all ${
      selected ? "border-[#025048] bg-white" : "border-[#232320] bg-[#F3F0E7] hover:border-[#025048]"
    }`}
  >
    <div className="mb-0 relative z-10">
      <LensImage type={type} />
    </div>
    <h3 className="text-base md:text-xl font-bold text-[#1F1F1F] mb-4 font-serif tracking-tight">
      {title}
    </h3>
    <p className="text-xs md:text-sm text-[#525252] font-medium leading-relaxed max-w-[260px] mx-auto">
      {desc}
    </p>
  </div>
);

const PackageCard = ({
  title,
  price,
  features,
  recommended,
  onClick,
  description,
  icon,
  loading,
}: {
  title: string;
  price: string;
  features?: string[];
  recommended?: boolean;
  onClick: () => void;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}) => (
  <div
    onClick={!loading ? onClick : undefined}
    className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 group h-full flex flex-col ${recommended
      ? "border-[#025048] bg-white shadow-md"
      : "border-gray-200 bg-[#F3F0E7] hover:bg-white hover:border-gray-300 hover:shadow-lg"
      } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
  >
    {recommended && (
      <div className="absolute -top-3 left-6 bg-[#025048] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
        Recommended
      </div>
    )}

    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-2xl">
        <div className="w-6 h-6 border-2 border-[#232320] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}

    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${recommended
              ? "bg-white text-[#E94D37]"
              : "bg-gray-50 text-gray-500"
              }`}
          >
            {icon}
          </div>
        )}
        <div>
          {recommended && (
            <p className="text-xs text-[#1F1F1F] font-bold mb-1">
              Recommended for your prescription
            </p>
          )}
          <h3
            className={`text-lg font-bold leading-tight ${recommended ? "text-[#025048]" : "text-[#1F1F1F]"
              }`}
          >
            {title}
          </h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-[#1F1F1F]">{price}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-colors ${recommended
            ? "text-[#E94D37]"
            : "text-gray-400 group-hover:text-[#E94D37]"
            }`}
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>

    {description && (
      <p className="text-sm text-[#525252] mb-4 leading-relaxed font-medium">
        {description}
      </p>
    )}

    {features && (
      <ul className="space-y-2 mt-auto">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-xs text-[#525252] font-medium"
          >
            <span
              className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${recommended ? "bg-[#025048]" : "bg-gray-400"
                }`}
            ></span>
            {feature}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const SelectLensType: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Ref for the continue button container
  const continueButtonRef = React.useRef<HTMLDivElement>(null);

  // Debug logging
  React.useEffect(() => {
    console.log("SelectLensType mounted");
    console.log("URL ID:", id);
    console.log("State received:", state);
    console.log("Product:", state?.product);
    console.log("Selected Category:", selectedCategory);
  }, [id, state, selectedCategory]);

  // Auto-scroll to continue button when category is selected
  React.useEffect(() => {
    if (selectedCategory && continueButtonRef.current) {
      // Small delay to ensure the button is rendered
      setTimeout(() => {
        continueButtonRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 100);
    }
  }, [selectedCategory]);

  const product = state?.product || {
    id: id,
    skuid: id,
    name: "Unknown",
    price: "0",
    image: "",
    colors: [],
  };

  // Helper function to get lens type display text
  const getLensTypeText = () => {
    const lensType = state?.lensType;
    const tier = state?.prescriptionTier;
    
    if (lensType === "progressive" && tier) {
      // Map tier to display name
      const tierMap: { [key: string]: string } = {
        precision: "Precision+ Options",
        advanced: "Advanced Options",
        standard: "Standard Options"
      };
      return `Progressive - ${tierMap[tier] || tier}`;
    }
    
    switch (lensType) {
      case "single":
        return "Single Vision";
      case "bifocal":
        return "Bifocal";
      case "progressive":
        return "Progressive";
      default:
        return "Multifocal";
    }
  };

  const getPrescriptionTypeLabel = () => {
    const tier = state?.prescriptionTier;
    if (tier === "advanced") return "Premium Progressive";
    if (tier === "standard") return "Standard Progressive";
    return "Bifocal/Progressive";
  };

  // Get display name for the selected category
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      blue: "Blue Protect",
      clear: "Clear",
      photo: "Photochromic",
      sun: "Sunglasses",
    };
    return categoryMap[category] || category;
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleContinue = () => {
    const category = selectedCategory;
    if (!category) return;
    // Bifocal has no sunglasses packages – go straight to lens color
    const isBifocalSunglasses = category === "sun" && state?.lensType === "bifocal";
    const path = isBifocalSunglasses
      ? `/product/${product.skuid || product.id || id}/select-lens-color`
      : `/product/${product.skuid || product.id || id}/select-lens-packages`;

    navigate(path, {
      state: {
        ...state,
        product: product,
        lensCategory: category,
      },
    });
  };

  const handlePackageSelect = async (pkg: any) => {
    if (processing) return;
    setProcessing(pkg.id);

    try {
      // Determine prescription data to send
      let prescriptionToSync = null;
      if (state?.prescriptionMethod === "manual" && state?.prescriptionData) {
        prescriptionToSync = state.prescriptionData;
      } else if (state?.prescriptionMethod === "upload") {
        // Find upload info in session/local storage
        const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
        const productPrescription = sessionPrescriptions[product.skuid];
        if (productPrescription) {
          prescriptionToSync = productPrescription.prescriptionDetails || productPrescription.data || productPrescription;
        }
      }

      const addToCartResponse: any = await addToCart(product, "instant", prescriptionToSync);

      if (addToCartResponse?.data?.status) {
        trackAddToCart(product, 1);
        let cartId =
          addToCartResponse.data.cart_id ??
          addToCartResponse.data.data?.cart_id ??
          addToCartResponse.data.data?.id ??
          addToCartResponse.data.id;
        if (!cartId) {
          try {
            const { getCart } = await import("../api/retailerApis");
            const cartResponse: any = await getCart({});
            const cart = cartResponse?.data?.cart;
            if (Array.isArray(cart) && cart.length) {
              const matching = cart.find(
                (item: any) =>
                  item.product?.products?.skuid === product.skuid ||
                  item.product_id === product.skuid ||
                  String(item.product_id || "").startsWith(String(product.skuid || product.id || ""))
              );
              cartId = matching?.cart_id ?? cart[cart.length - 1]?.cart_id;
            }
          } catch (e) {
            console.warn("Recover cart_id:", e);
          }
        }

        if (!cartId) {
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          navigate("/cart");
          setProcessing(null);
          return;
        }

        const priceValue =
          pkg.priceValue !== undefined
            ? pkg.priceValue
            : parseInt(pkg.price.replace(/[^0-9]/g, "")) || 0;

        const mainCategoryValue = state?.lensType === "single"
          ? "Single Vision"
          : state?.lensType === "bifocal"
            ? "Bifocal"
            : state?.precisionPlus
              ? "Precision Progressive"
              : state?.prescriptionTier === "advanced"
                ? "Premium Progressive"
                : state?.prescriptionTier === "standard"
                  ? "Standard Progressive"
                  : "Progressive";

        await selectLens(product.skuid, cartId, pkg.id, {
          title: pkg.title,
          lensPackagePrice: priceValue,
          priceValue: 0,
          lensCategory: state?.lensCategory || selectedCategory,
          main_category: mainCategoryValue,
        });

        setCartLensOverride(cartId, {
          lensPackage: pkg.id,
          lensPackagePrice: priceValue,
          lensCategory: state?.lensCategory || selectedCategory,
          mainCategory: mainCategoryValue,
          lensType: state?.lensType,
        }, product?.skuid);

        // Check session storage for product-based prescriptions
        const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
        const productPrescription = sessionPrescriptions[product.skuid];
        
        if (productPrescription) {
          // Link the prescription to the cart item
          if (productPrescription.associatedProduct) {
            productPrescription.associatedProduct.cartId = String(cartId);
            // Update session storage
            sessionPrescriptions[product.skuid] = productPrescription;
            sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
            
            // Also update localStorage
            const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
            const localIndex = localPrescriptions.findIndex((p: any) => 
              p._id === productPrescription._id || 
              (p.associatedProduct?.productSku === product.skuid && !p.associatedProduct?.cartId)
            );
            if (localIndex >= 0) {
              localPrescriptions[localIndex].associatedProduct.cartId = String(cartId);
              localStorage.setItem('prescriptions', JSON.stringify(localPrescriptions));
            }
            
            console.log("✅ Linked product prescription to cartId:", cartId);
          }
        }

        if (state?.prescriptionMethod === "manual" && state?.prescriptionData) {
          const customerID = localStorage.getItem("customerID") || "guest";
          await addPrescription(
            customerID,
            null,
            "manual",
            state.prescriptionData,
            cartId
          );

          // Update the backend prescription record with the new cart ID
          if (state.fullPrescriptionPayload?._id) {
            const associatedProductUpdate = {
              ...state.fullPrescriptionPayload.associatedProduct,
              cartId: cartId
            };
            await updateMyPrescription(state.fullPrescriptionPayload._id, {
              associatedProduct: associatedProductUpdate
            });
          }

        } else if (state?.prescriptionMethod === "upload") {
          await addPrescription("guest", null, "upload", {}, cartId);
          // Assuming upload flow also passes fullPrescriptionPayload or we can construct/pass it if needed
          // But based on previous changes, UploadPrescription saves to localStorage/backend but doesn't explicitly pass full payload 
          // in state the same way ManualPrescription does. Let's rely on what's available.
        }

        queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigate("/cart");
      }
    } catch (error) {
      console.error("Failed to add to cart", error);
      setProcessing(null);
    }
  };

  // Get Blue Protect packages with dynamic titles
  const getBlueProtectPackages = () => {
    const categoryName = getCategoryDisplayName(selectedCategory || "blue");
    return [
      {
        id: "1.61",
        title: `1.61 ${categoryName} High Index`,
        price: "+£39",
        features: [
          "20% thinner than 1.50 Standard lenses",
          "Superior clarity",
          "Highly durable & for all purpose",
          "Prescriptions between +4.00/-6.00",
        ],
        recommended: true,
      },
      {
        id: "1.67",
        title: `1.67 ${categoryName} High Index`,
        price: "+£59",
        features: [
          "30% thinner than 1.50 Standard lenses",
          "High clarity",
          "Best for every purpose",
          "Prescriptions between +6.00/-8.00",
        ],
        recommended: false,
      },
      {
        id: "1.74",
        title: `1.74 ${categoryName} High Index`,
        price: "+£89",
        features: [
          "35% thinner than 1.50 Standard lenses",
          "Optimum clarity",
          "Highly recommended for high powers",
          "Prescriptions between +8.00/-12.00",
        ],
        recommended: false,
      },
    ];
  };

  // Get Clear packages with dynamic titles
  const getClearPackages = () => {
    const categoryName = getCategoryDisplayName(selectedCategory || "clear");
    return [
      {
        id: "anti-reflective",
        title: `${categoryName} Anti Reflective Coating`,
        price: "+£0",
        description: "Reduces light reflections, uv protection",
        recommended: true,
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
        ),
      },
      {
        id: "water-resistant",
        title: `${categoryName} Water Resistant`,
        price: "+£10",
        description:
          "Reduces light reflections, uv protection & prevents water stains.",
        recommended: false,
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        ),
      },
      {
        id: "oil-resistant",
        title: `${categoryName} Oil Resistant Coating`,
        price: "+£15",
        description:
          "Reduces light reflections, uv protection, prevents water & oil stains, easy to clean.",
        recommended: false,
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12h20"></path>
            <path d="M12 2a10 10 0 0 1 10 10v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a10 10 0 0 1 10-10z"></path>
            <path d="M12 12v10"></path>
            <path d="M12 12a5 5 0 0 0 5 5"></path>
            <path d="M12 12a5 5 0 0 1-5 5"></path>
          </svg>
        ),
      },
    ];
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pt-0 md:pt-4 px-4 md:px-8">
      <div className="hidden md:block">
        <CheckoutStepper
          currentStep={4}
          selections={{
            2: `${getLensTypeText()} Eyeglasses`,
            3: "Prescription Details",
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto grid gap-2 mt-4 md:mt-2">
        {/* Lens type category selection - select then Continue */}
        <div>
            <div className="md:hidden">
              <div className="flex items-center justify-between pb-4 border-b border-black mb-6">
                <span className="text-xl font-normal text-[#1F1F1F] uppercase tracking-widest whitespace-nowrap">
                  SELECT YOUR LENS TYPE
                </span>

                <button
                  onClick={() => navigate(-1)}
                  className="text-[#1F1F1F] hover:text-[#E94D37] transition-colors"
                  aria-label="Close"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-center mb-2 pb-3 border-b border-gray-200">
                <p className="text-[24px] font-medium text-[#1F1F1F] uppercase tracking-widest font-serif">
                  CHOOSE HOW YOU'D LIKE YOUR LENSES TO WORK
                </p>
              </div>
            </div>


            {/* Lens category cards - all in one grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-[1000px] mx-auto justify-center items-stretch [&>*]:h-[200px] [&>*]:hover:shadow-none [&>*]:hover:border-[#232320]">
              <LensCategoryCard
                title="Blue Protect"
                desc="If you spend a lot of time on screens, this lens helps reduce strain from blue light."
                type="blue"
                selected={selectedCategory === "blue"}
                onClick={() => handleCategorySelect("blue")}
              />
              <LensCategoryCard
                title="Clear"
                desc="Simple, sharp vision for regular daily use — no extras."
                type="clear"
                selected={selectedCategory === "clear"}
                onClick={() => handleCategorySelect("clear")}
              />
              <LensCategoryCard
                title="Photochromic"
                desc="These lenses darken automatically in bright light, and stay clear indoors."
                type="photo"
                selected={selectedCategory === "photo"}
                onClick={() => handleCategorySelect("photo")}
              />
              {state?.lensType !== "bifocal" && (
                <div className="md:col-span-3 md:flex md:justify-center">
                  <LensCategoryCard
                    title="Sunglasses"
                    desc="Turn your glasses into full sunglasses — great for outdoor time, with extra UV protection."
                    type="sun"
                    selected={selectedCategory === "sun"}
                    onClick={() => handleCategorySelect("sun")}
                  />
                </div>
              )}
            </div>

            {/* Continue button - only when category selected */}
            {selectedCategory && (
              <div ref={continueButtonRef} className="flex justify-center mt-8">
                <button
                  onClick={handleContinue}
                  className="bg-[#025048] text-white px-12 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#013a34] transition-colors shadow-md"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Sunglasses card - only for non-bifocal */}
        </div>

        {/* BLUE PACKAGES - hidden; user selects category then Continue to go to select-lens-packages */}
        {false && selectedCategory === "blue" && (
          <div className="max-w-[900px] mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="text-center mb-10 relative">
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors flex items-center gap-2 text-xs font-bold uppercase"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </button>
              <h1 className="text-[18px] md:text-[28px] font-bold text-[#1F1F1F] uppercase tracking-widest flex items-center justify-center gap-2">
                SELECT A LENS TYPE
                <span
                  className="text-[#E94D37] text-lg cursor-pointer"
                  title="Help"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getBlueProtectPackages().map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`${index === 2 ? "md:col-span-2 md:w-2/3 md:mx-auto" : ""
                    }`}
                >
                  <PackageCard
                    title={pkg.title}
                    price={pkg.price}
                    features={pkg.features}
                    recommended={pkg.recommended}
                    loading={processing === pkg.id}
                    onClick={() => handlePackageSelect(pkg)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLEAR PACKAGES - hidden; user selects category then Continue to go to select-lens-packages */}
        {false && selectedCategory === "clear" && (
          <div className="max-w-[900px] mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="text-center mb-10 relative">
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors flex items-center gap-2 text-xs font-bold uppercase"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </button>
              <h1 className="text-[16px] md:text-[24px] font-bold text-[#1F1F1F] uppercase tracking-widest flex items-center justify-center gap-2">
                CHOOSE HOW YOUR LENSES HANDLE GLARE, SMUDGES, AND LIGHT
                <span
                  className="text-[#E94D37] text-lg cursor-pointer"
                  title="Help"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getClearPackages().map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`${index === 2 ? "md:col-span-2 md:w-1/2 md:mx-auto" : ""
                    }`}
                >
                  <PackageCard
                    title={pkg.title}
                    price={pkg.price}
                    description={pkg.description}
                    recommended={pkg.recommended}
                    icon={pkg.icon}
                    loading={processing === pkg.id}
                    onClick={() => handlePackageSelect(pkg)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden">
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
          lensDetails={selectedCategory ? { lensType: getCategoryDisplayName(selectedCategory) } : undefined}
        />
      </div>
    </div>
  );
};

export default SelectLensType;