import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CheckoutStepper from "../components/CheckoutStepper";
import ProductDetailsFooter from "../components/ProductDetailsFooter";
import { setCartLensOverride } from "../utils/priceUtils";
import { getProductFlow, saveLensSelection } from "../utils/productFlowStorage";
import { getProductById, getProductBySku } from "../api/retailerApis";

const SelectLensPackages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: locationState } = useLocation();
  const flow = id ? getProductFlow(id) : null;
  const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>();
  const [showLensGuide, setShowLensGuide] = useState(false);

  const { data: apiProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await getProductById(id);
        return res.data;
      } catch {
        try {
          const res = await getProductBySku(id);
          return res.data;
        } catch {
          return null;
        }
      }
    },
    enabled: !state?.product && !!id,
  });

  const product = state?.product || (flow?.product as any) || (apiProduct ? {
    id: apiProduct.id,
    skuid: apiProduct.skuid,
    naming_system: apiProduct.naming_system,
    name: apiProduct.name || "Unknown",
    price: apiProduct.price ?? "0",
    image: apiProduct.image || "",
    colors: apiProduct.colors || [],
  } : null) || {
    name: "Unknown",
    price: "0",
    image: "",
    colors: [],
  };

  const getPrescriptionTypeLabel = () => {
    const tier = state?.prescriptionTier;
    if (state?.lensType === "progressive" && state?.precisionPlus) return "Precision Progressive";
    if (tier === "advanced") return "Advanced Progressive";
    if (tier === "standard") return "Standard Progressive";
    return state?.lensType === "single" ? "Single Vision" : "Bifocal/Progressive";
  };

  const lensCategory = state?.lensCategory || "blue";

  // Bifocal has no sunglasses packages – redirect to lens color
  useEffect(() => {
    if (state?.lensType === "bifocal" && lensCategory === "sun" && id) {
      navigate(`/product/${id}/select-lens-color`, {
        replace: true,
        state: { ...state, product, lensCategory: "sun" },
      });
    }
  }, [state?.lensType, lensCategory, id]);

  // Single Vision packages (pricing: clear 0/19/39/69, blueprotect 19/39/59/79, photochromic 29/49/79/99, sunglasses 1.56 only 29)
  const SINGLE_VISION_BLUE_PACKAGES = [
    {
      id: "1.56",
      title: "1.56 Blue Protect Low Index",
      price: "+£19",
      features: [
        "Suitable for select frames only",
        "For low powers up to +/- 3",
      ],
      recommended: false,
    },
    {
      id: "1.61",
      title: "1.61 Blue Protect High Index",
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
      title: "1.67 Blue Protect High Index",
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
      title: "1.74 Blue Protect High Index",
      price: "+£79",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const SINGLE_VISION_CLEAR_PACKAGES = [
    {
      id: "1.56",
      title: "1.56 Clear Low Index",
      price: "+£0",
      features: [
        "Suitable for select frames only",
        "For low powers up to +/- 3",
      ],
      recommended: false,
    },
    {
      id: "1.61",
      title: "1.61 High Index",
      price: "+£19",
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
      title: "1.67 High Index",
      price: "+£39",
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
      title: "1.74 High Index",
      price: "+£69",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const SINGLE_VISION_PHOTO_PACKAGES = [
    {
      id: "1.56",
      title: "1.56 Photochromic Low Index",
      price: "+£29",
      features: [
        "Suitable for select frames only",
        "For low powers up to +/- 3",
        "Darkens automatically in bright light",
      ],
      recommended: false,
    },
    {
      id: "1.61",
      title: "1.61 Photochromic High Index",
      price: "+£49",
      features: [
        "20% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 Photochromic High Index",
      price: "+£79",
      features: [
        "30% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 Photochromic High Index",
      price: "+£99",
      features: [
        "40% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const SINGLE_VISION_SUN_PACKAGES = [
    {
      id: "1.56",
      title: "1.56 Sunglasses",
      price: "+£29",
      features: [
        "Suitable for select frames only",
        "For low powers up to +/- 3",
        "Full UV protection",
      ],
      recommended: true,
    },
  ];

  const BLUE_PROTECT_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Blue Protect High Index",
      price: "+£49",
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
      title: "1.67 Blue Protect High Index",
      price: "+£79",
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
      title: "1.74 Blue Protect High Index",
      price: "+£119",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const BIFOCAL_BLUE_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Blue Protect High Index",
      price: "+£29",
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
      title: "1.67 Blue Protect High Index",
      price: "+£49",
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
      title: "1.74 Blue Protect High Index",
      price: "+£79",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const PHOTOCHROMIC_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Photochromic High Index",
      price: "+£49",
      features: [
        "20% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "High clarity",
        "Best for every purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
    {
      id: "1.67",
      title: "1.67 Photochromic High Index",
      price: "+£79",
      features: [
        "30% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +6.00/-8.00",
      ],
      recommended: false,
    },
    {
      id: "1.74",
      title: "1.74 Photochromic High Index",
      price: "+£99",
      features: [
        "40% thinner than 1.56 Standard lenses",
        "Free Blue Protect Coating",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const CLEAR_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 High Index",
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
      title: "1.67 High Index",
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
      title: "1.74 High Index",
      price: "+£89",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const BIFOCAL_CLEAR_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 High Index",
      price: "+£0",
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
      title: "1.67 High Index",
      price: "+£29",
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
      title: "1.74 High Index",
      price: "+£69",
      features: [
        "40% thinner than 1.50 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

  const SUNGLASSES_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 High Index",
      price: "+£49",
      features: [
        "20% thinner than 1.50 Standard lenses",
        "Superior clarity",
        "Highly durable & for all purpose",
        "Prescriptions between +4.00/-6.00",
      ],
      recommended: true,
    },
  ];

  // --- Progressive by tier: Standard, Advanced, Precision (from pricing table) ---
  const isPrecisionProgressive = state?.lensType === "progressive" && state?.prescriptionTier === "advanced" && state?.precisionPlus;
  const isAdvancedProgressive = state?.lensType === "progressive" && state?.prescriptionTier === "advanced" && !state?.precisionPlus;
  const isStandardProgressive = state?.lensType === "progressive" && state?.prescriptionTier === "standard";

  // Standard Progressive: 1.61 clear 0, blue 39, photo 49, sun 29; 1.67 clear 39, blue 59, photo 69; 1.74 clear 79, blue 89, photo 88
  const STANDARD_PROG_CLEAR = [
    { id: "1.61", title: "1.61 High Index", price: "+£0", features: ["20% thinner than 1.50 Standard lenses", "Superior clarity", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 High Index", price: "+£39", features: ["30% thinner than 1.50 Standard lenses", "High clarity", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 High Index", price: "+£79", features: ["40% thinner than 1.50 Standard lenses", "Optimum clarity", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const STANDARD_PROG_BLUE = [
    { id: "1.61", title: "1.61 Blue Protect High Index", price: "+£39", features: ["20% thinner than 1.50 Standard lenses", "Superior clarity", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 Blue Protect High Index", price: "+£59", features: ["30% thinner than 1.50 Standard lenses", "High clarity", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 Blue Protect High Index", price: "+£89", features: ["40% thinner than 1.50 Standard lenses", "Optimum clarity", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const STANDARD_PROG_PHOTO = [
    { id: "1.61", title: "1.61 Photochromic High Index", price: "+£49", features: ["20% thinner than 1.56 Standard lenses", "Free Blue Protect Coating", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 Photochromic High Index", price: "+£69", features: ["30% thinner than 1.56 Standard lenses", "Free Blue Protect Coating", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 Photochromic High Index", price: "+£88", features: ["40% thinner than 1.56 Standard lenses", "Free Blue Protect Coating", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const STANDARD_PROG_SUN = [
    { id: "1.61", title: "1.61 Sunglasses", price: "+£29", features: ["Standard Progressive", "20% thinner than 1.50 Standard lenses", "Full UV protection", "Prescriptions between +4.00/-6.00"], recommended: true },
  ];

  // Advanced Progressive: 1.61 clear 39, blue 59, sun 59; 1.67 clear 59, blue 89; 1.74 clear 89, blue 139
  const ADVANCED_PROG_CLEAR = [
    { id: "1.61", title: "1.61 High Index", price: "+£39", features: ["20% thinner than 1.50 Standard lenses", "Superior clarity", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 High Index", price: "+£59", features: ["30% thinner than 1.50 Standard lenses", "High clarity", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 High Index", price: "+£89", features: ["40% thinner than 1.50 Standard lenses", "Optimum clarity", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const ADVANCED_PROG_BLUE = [
    { id: "1.61", title: "1.61 Blue Protect High Index", price: "+£59", features: ["20% thinner than 1.50 Standard lenses", "Superior clarity", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 Blue Protect High Index", price: "+£89", features: ["30% thinner than 1.50 Standard lenses", "High clarity", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 Blue Protect High Index", price: "+£139", features: ["40% thinner than 1.50 Standard lenses", "Optimum clarity", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const ADVANCED_PROG_SUN = [
    { id: "1.61", title: "1.61 Sunglasses", price: "+£59", features: ["Advanced Progressive", "20% thinner than 1.50 Standard lenses", "Full UV protection", "Prescriptions between +4.00/-6.00"], recommended: true },
  ];

  // Precision Progressive: 1.61 clear 59, blue 69, photo 79, sun 69; 1.67 clear 79, blue 99, photo 109; 1.74 clear 109, blue 139, photo 159
  const PRECISION_PROG_CLEAR = [
    { id: "1.61", title: "1.61 High Index", price: "+£59", features: ["20% thinner than 1.50 Standard lenses", "Superior clarity", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 High Index", price: "+£79", features: ["30% thinner than 1.50 Standard lenses", "High clarity", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 High Index", price: "+£109", features: ["40% thinner than 1.50 Standard lenses", "Optimum clarity", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const PRECISION_PROG_BLUE = [
    { id: "1.61", title: "1.61 Blue Protect High Index", price: "+£69", features: ["20% thinner than 1.50 Standard lenses", "Superior clarity", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 Blue Protect High Index", price: "+£99", features: ["30% thinner than 1.50 Standard lenses", "High clarity", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 Blue Protect High Index", price: "+£139", features: ["40% thinner than 1.50 Standard lenses", "Optimum clarity", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const PRECISION_PROG_PHOTO = [
    { id: "1.61", title: "1.61 Photochromic High Index", price: "+£79", features: ["20% thinner than 1.56 Standard lenses", "Free Blue Protect Coating", "Prescriptions between +4.00/-6.00"], recommended: true },
    { id: "1.67", title: "1.67 Photochromic High Index", price: "+£109", features: ["30% thinner than 1.56 Standard lenses", "Free Blue Protect Coating", "Prescriptions between +6.00/-8.00"], recommended: false },
    { id: "1.74", title: "1.74 Photochromic High Index", price: "+£159", features: ["40% thinner than 1.56 Standard lenses", "Free Blue Protect Coating", "Prescriptions between +8.00/-12.00"], recommended: false },
  ];
  const PRECISION_PROG_SUN = [
    { id: "1.61", title: "1.61 Sunglasses", price: "+£69", features: ["Precision Progressive", "20% thinner than 1.50 Standard lenses", "Full UV protection", "Prescriptions between +4.00/-6.00"], recommended: true },
  ];

  // Select packages based on category and lens type (progressive uses tier: standard / advanced / precision)
  const packages =
    state?.lensType === "single"
      ? lensCategory === "blue"
        ? SINGLE_VISION_BLUE_PACKAGES
        : lensCategory === "photo"
          ? SINGLE_VISION_PHOTO_PACKAGES
          : lensCategory === "sun"
            ? SINGLE_VISION_SUN_PACKAGES
            : SINGLE_VISION_CLEAR_PACKAGES
      : state?.lensType === "bifocal"
        ? lensCategory === "blue"
          ? BIFOCAL_BLUE_PACKAGES
          : lensCategory === "photo"
            ? PHOTOCHROMIC_PACKAGES
            : lensCategory === "sun"
              ? SUNGLASSES_PACKAGES
              : BIFOCAL_CLEAR_PACKAGES
        : isStandardProgressive
          ? lensCategory === "blue"
            ? STANDARD_PROG_BLUE
            : lensCategory === "photo"
              ? STANDARD_PROG_PHOTO
              : lensCategory === "sun"
                ? STANDARD_PROG_SUN
                : STANDARD_PROG_CLEAR
          : isAdvancedProgressive
            ? lensCategory === "blue"
              ? ADVANCED_PROG_BLUE
              : lensCategory === "photo"
                ? STANDARD_PROG_PHOTO
                : lensCategory === "sun"
                  ? ADVANCED_PROG_SUN
                  : ADVANCED_PROG_CLEAR
            : isPrecisionProgressive
              ? lensCategory === "blue"
                ? PRECISION_PROG_BLUE
                : lensCategory === "photo"
                  ? PRECISION_PROG_PHOTO
                  : lensCategory === "sun"
                    ? PRECISION_PROG_SUN
                    : PRECISION_PROG_CLEAR
              : lensCategory === "blue"
                ? BLUE_PROTECT_PACKAGES
                : lensCategory === "photo"
                  ? PHOTOCHROMIC_PACKAGES
                  : lensCategory === "sun"
                    ? SUNGLASSES_PACKAGES
                    : CLEAR_PACKAGES;

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackage(pkgId);

    // Find the package to get its price
    const selectedPkg = packages.find(p => p.id === pkgId);
    let priceValue = 0;
    if (selectedPkg) {
      // Parse "£49" or "+£49" to number 49
      priceValue = parseFloat(selectedPkg.price.replace(/[^0-9.]/g, "")) || 0;
    }

    if (id) saveLensSelection(id, { selectedLensPackage: pkgId, selectedLensPrice: priceValue, lensCategory });

    const path = lensCategory === "sun"
      ? `/product/${id}/select-lens-color`
      : `/product/${id}/select-lens-coatings`;

    navigate(path, {
      state: {
        ...state,
        product: product as any,
        selectedLensPackage: pkgId,
        selectedLensPrice: priceValue,
        lensCategory: lensCategory, // Ensure lensCategory is preserved
      },
    });

    try {
      sessionStorage.setItem(
        "pending_lens_selection_v1",
        JSON.stringify({
          lensPackage: pkgId,
          lensPackagePrice: priceValue,
          lensCategory: state?.lensCategory,
          updatedAt: Date.now(),
        })
      );
    } catch { }
  };

  // Lens index data for the modal
  const lensIndexData = [
    {
      id: "1.50/1.56",
      features: ["Normal Thickness.", "For Low Powers Only."]
    },
    {
      id: "1.59/1.61",
      features: ["20% Thinner The 1.50/1.56", "For Powers Up to -4/+4"]
    },
    {
      id: "1.67",
      features: ["30% Thinner The 1.50/1.56", "For Powers Up to  -8/+8"]
    },
    {
      id: "1.74",
      features: ["40% Thinner The 1.50/1.56", "For All Powers"]
    }
  ];

  // Check if it's single vision
  const isSingleVision = state?.lensType === "single";

  // Split packages into rows
  const firstRowPackages = packages.slice(0, 2);
  const secondRowPackages = packages.slice(2);

  // Render package card component
  const PackageCard = ({ pkg }: { pkg: any }) => (
    <div
      onClick={() => handleSelectPackage(pkg.id)}
      className={`rounded-[24px] p-5 md:p-6 cursor-pointer transition-all duration-300 border-2 group flex flex-col gap-3 w-full ${selectedPackage === pkg.id
        ? "bg-white border-[#025048] shadow-md"
        : "bg-[#F3F0E7] border-gray-200  hover:border-[#025048] hover:shadow-md"
        }`}
    >
      {/* Recommended Badge */}
      {pkg.recommended && (
        <div className="mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wide bg-[#025048] px-3 py-1 rounded-full">
            Recommended for your prescription
          </span>
        </div>
      )}

      {/* Title and Price */}
      <div className="flex items-start justify-between pr-6">
        <h3 className="text-lg md:text-xl font-bold text-[#1F1F1F] font-serif">
          {pkg.title}
        </h3>
        <span className="text-2xl font-bold text-[#025048] whitespace-nowrap">
          {pkg.price}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-1.5 flex-1">
        {pkg.features.map((feature: string, i: number) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] md:text-sm text-[#525252] font-medium"
          >
            <span className="mt-1.5 w-1.5 h-1.5 bg-[#025048] rounded-full shrink-0"></span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pt-0 md:pt-4 px-4 md:px-8">
      <div className="hidden md:block">
        <CheckoutStepper
          currentStep={4}
          selections={{
            2: state?.lensType === "single" ? "Single Vision Eyeglasses" : "Bifocal/Progressive Eyeglasses",
            3: "Prescription Details",
          }}
        />
      </div>

      <div className="max-w-[1000px] mx-auto mt-0 md:mt-2">
        {/* Header */}
        <div className="text-center mb-2 pb-3 md:pb-0 border-b md:border-b-0 border-gray-200 relative">
          <div className="md:hidden">
            <div className="flex items-center justify-between py-2 ">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-md font-normal uppercase text-black transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                LENS TYPE | {lensCategory}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="flex items-center pb-4 border-b border-black mb-6">
              <span className="text-xl font-normal text-[#1F1F1F] uppercase tracking-widest whitespace-nowrap">
                SELECT YOUR LENS INDEX
              </span>
              <button
                onClick={() => setShowLensGuide(true)}
                className="text-[#E94D37] hover:text-[#D43F2A] transition-colors ml-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>

          <p className="hidden md:flex text-[18px] md:text-[24px] font-medium text-[#1F1F1F] uppercase tracking-widest flex items-center justify-center gap-2">
            SELECT A LENS TYPE
            <button
              onClick={() => setShowLensGuide(true)}
              className="text-[#E94D37] text-lg cursor-pointer hover:text-[#d43f2a] transition-colors"
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

        {/* Package Cards - Different layouts for single vision vs others */}
        {isSingleVision ? (
          // Single Vision: 2x2 grid layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          // Non-Single Vision: 2 in first row, remaining centered in second row
          <>
            {/* First Row (2 packages) */}
            {firstRowPackages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {firstRowPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}

            {/* Second Row (remaining packages centered) */}
            {secondRowPackages.length > 0 && (
              <div className="flex justify-center mb-12">
                <div className="w-full md:w-1/2">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {secondRowPackages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Product Details Footer - Mobile Only */}
        <div className="mx-auto md:hidden">
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
            lensDetails={{
              lensType: lensCategory === "blue" ? "Blue Protect" : lensCategory === "photo" ? "Photochromic" : lensCategory === "clear" ? "Clear" : lensCategory === "sun" ? "Sunglasses" : getPrescriptionTypeLabel(),
              lensIndex: selectedPackage ? packages.find((p: { id: string }) => p.id === selectedPackage)?.title : undefined,
              lensIndexPrice: selectedPackage ? packages.find((p: { id: string }) => p.id === selectedPackage)?.price : undefined,
              addOns: [{ name: "Case & Cleaning cloth included", price: "Free" }],
            }}
          />
        </div>
      </div>

      {/* Lens Index Guide Modal - Fixed Borders and Alignment */}
      {showLensGuide && (
        <div 
          id="lens-index-show"
          className="fixed top-0 left-0 w-full h-full overflow-x-hidden overflow-y-auto bg-[#F0EBE4] z-[1033]"
        >
          <div className="content-lenss p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h6 id="lens-index" className="text-xl md:text-2xl font-bold text-[#1F1F1F] mb-0">
                How to Choose a Lens Index
              </h6>
              <button
                onClick={() => setShowLensGuide(false)}
                className="rxrange-close p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
            
            <div className="index-value-wrap">
              <ul className="flex flex-wrap">
                {/* First item - 1.50/1.56 */}
                <li className="w-1/2">
                  <div className="inr-index borderrightli p-4 h-full border-r border-gray-400 border-b border-gray-400">
                    <div className="index-images-sides text-center mb-4">
                      <img 
                        src="https://cdn.multifolks.com/msite/images/layers-dark.png" 
                        alt="1.50/1.56 lens thickness"
                        className="w-[100px] h-[120px] object-contain mx-auto"
                      />
                    </div>
                    <h6 className="text-lg font-bold text-center mb-3">
                      1.50/1.56
                    </h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>Normal Thickness.</li>
                      <li>For Low Powers Only.</li>
                    </ul>
                  </div>
                </li>
                
                {/* Second item - 1.59/1.61 */}
                <li className="w-1/2">
                  <div className="inr-index p-4 h-full border-b border-gray-400">
                    <div className="index-images-sides text-center mb-4">
                      <img 
                        src="https://cdn.multifolks.com/msite/images/layers-dark.png" 
                        alt="1.59/1.61 lens thickness"
                        className="w-[100px] h-[120px] object-contain mx-auto"
                      />
                    </div>
                    <h6 className="text-lg font-bold text-center mb-3">
                      1.59/1.61
                    </h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>20% Thinner The 1.50/1.56</li>
                      <li>For Powers Up to -4/+4</li>
                    </ul>
                  </div>
                </li>
                
                {/* Third item - 1.67 */}
                <li className="w-1/2">
                  <div className="inr-index border-right-top p-4 h-full border-r border-gray-400 border-t border-gray-400">
                    <div className="index-images-sides text-center mb-4">
                      <img 
                        src="https://cdn.multifolks.com/msite/images/layers-dark.png" 
                        alt="1.67 lens thickness"
                        className="w-[100px] h-[120px] object-contain mx-auto"
                      />
                    </div>
                    <h6 className="text-lg font-bold text-center mb-3">
                      1.67
                    </h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>30% Thinner The 1.50/1.56</li>
                      <li>For Powers Up to -8/+8</li>
                    </ul>
                  </div>
                </li>
                
                {/* Fourth item - 1.74 */}
                <li className="w-1/2">
                  <div className="inr-index border-topli p-4 h-full border-t border-gray-400">
                    <div className="index-images-sides text-center mb-4">
                      <img 
                        src="https://cdn.multifolks.com/msite/images/layers-dark.png" 
                        alt="1.74 lens thickness"
                        className="w-[100px] h-[120px] object-contain mx-auto"
                      />
                    </div>
                    <h6 className="text-lg font-bold text-center mb-3">
                      1.74
                    </h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>40% Thinner The 1.50/1.56</li>
                      <li>For All Powers</li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectLensPackages;
