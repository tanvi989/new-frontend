import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, Droplets, Fingerprint, Sparkles, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart, selectLens, addPrescription } from "../api/retailerApis";

const SelectLenses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("recommended");
  const [processing, setProcessing] = useState<boolean>(false);

  const product = state?.product || {
    name: "Unknown",
    price: "0",
    image: "",
    colors: [],
  };

  const steps = [
    { id: 1, label: "Select Your Frame", completed: true },
    {
      id: 2,
      label: "Select Prescription Type",
      subLabel: "Bifocal/Progressive Eyeglasses",
      completed: true,
    },
    {
      id: 3,
      label: "Add Your Prescription",
      subLabel: "Bifocal/Progressive Eyeglasses",
      completed: true,
    },
    { id: 4, label: "Select Your Lenses", active: true },
  ];

  const options = [
    {
      id: "anti-reflective",
      title: "Recommended",
      subtitle: "Anti Reflective Coating",
      price: "+£0",
      priceValue: 0,
      description: "Reduces light reflections, uv protection",
      icon: <Sparkles className="w-8 h-8 text-[#E57373]" />,
      isRecommended: true,
    },
    {
      id: "water-resistant",
      title: "Water Resistant",
      price: "+£10",
      priceValue: 10,
      description:
        "Reduces light reflections, uv protection & prevents water stains.",
      icon: <Droplets className="w-8 h-8 text-[#E57373]" />,
    },
    {
      id: "oil-resistant",
      title: "Oil Resistant Coating",
      price: "+£15",
      priceValue: 15,
      description:
        "Reduces light reflections, uv protection, prevents water & oil stains, easy to clean.",
      icon: <Fingerprint className="w-8 h-8 text-[#E57373]" />,
    },
  ];

  // --- Mock Glasses Icon Component ---
  const GlassesIcon = ({
    type,
  }: {
    type: "blue" | "clear" | "photo" | "sun";
  }) => {
    let lensFill = "#FFFFFF";
    let lensOpacity = 0.5;

    if (type === "blue") {
      lensFill = "url(#blueGradient)";
      lensOpacity = 0.8;
    } else if (type === "photo") {
      lensFill = "url(#photoGradient)";
      lensOpacity = 0.9;
    } else if (type === "sun") {
      lensFill = "#1F1F1F";
      lensOpacity = 0.9;
    }

    return (
      <svg
        width="160"
        height="80"
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6A5ACD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4169E1" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="photoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="40%" stopColor="#333333" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Frame */}
        <g stroke="#F3CB0A" strokeWidth="4" fill="none">
          <path d="M10 30 Q50 5 90 30 Q95 60 70 75 Q45 85 10 70 Q5 50 10 30 Z" />
          <path d="M110 30 Q150 5 190 30 Q195 50 190 70 Q155 85 130 75 Q105 60 110 30 Z" />
          <path d="M90 30 Q100 20 110 30" strokeWidth="3" />
        </g>

        {/* Lens Fill */}
        <g fill={lensFill} opacity={lensOpacity}>
          <path d="M12 32 Q50 8 88 32 Q93 60 68 73 Q45 82 12 68 Q8 50 12 32 Z" />
          <path d="M112 32 Q150 8 188 32 Q192 50 188 68 Q155 82 132 73 Q108 60 112 32 Z" />
        </g>

        {/* Shine/Reflection */}
        <g fill="white" opacity="0.4">
          <ellipse
            cx="30"
            cy="30"
            rx="10"
            ry="5"
            transform="rotate(-20 30 30)"
          />
          <ellipse
            cx="130"
            cy="30"
            rx="10"
            ry="5"
            transform="rotate(-20 130 30)"
          />
        </g>
      </svg>
    );
  };

  const LensCategoryCard = ({
    title,
    desc,
    type,
    onClick,
  }: {
    title: string;
    desc: string;
    type: "blue" | "clear" | "photo" | "sun";
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className="bg-[#Fdfbf7] border border-[#E5E0D8] rounded-[24px] p-8 flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:border-[#232320] transition-all group h-full min-h-[320px] relative overflow-hidden"
    >
      <div className="mb-8 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
        <GlassesIcon type={type} />
      </div>
      <h3 className="text-xl font-bold text-[#1F1F1F] mb-4 font-serif tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[#525252] font-medium leading-relaxed max-w-[260px] mx-auto">
        {desc}
      </p>
    </div>
  );

  const handleCategorySelect = (category: string) => {
    if (category === "photo" || category === "sun") {
      // For demo, creating a simple package for these categories instantly
      const pkg =
        category === "photo"
          ? {
            id: "photo",
            title: "Photochromic Lens",
            price: "+£29",
            priceValue: 29,
          }
          : {
            id: "sun",
            title: "Sunglasses Lens",
            price: "+£19",
            priceValue: 19,
          };

      handleSelect(pkg);
    } else {
      setSelectedCategory(category);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const BLUE_PROTECT_PACKAGES = [
    {
      id: "1.61",
      title: "1.61 Blue Protect High Index",
      price: "+£49",
      priceValue: 49,
      features: [
        "20% thinner than 1.56 Standard lenses",
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
      priceValue: 79,
      features: [
        "30% thinner than 1.56 Standard lenses",
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
      priceValue: 119,
      features: [
        "40% thinner than 1.56 Standard lenses",
        "Optimum clarity",
        "Highly recommended for high powers",
        "Prescriptions between +8.00/-12.00",
      ],
      recommended: false,
    },
  ];

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
        ? "border-[#025048] bg-[#F0FDF4] shadow-md"
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
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

  const handleSelect = async (option: any) => {
    if (processing) return;
    setProcessing(true);
    setSelectedOption(option.id);

    try {
      // 1. Add Product to Cart
      const addToCartResponse: any = await addToCart(product, "instant");

      if (addToCartResponse?.data?.status) {
        const cartId = addToCartResponse.data.cart_id;
        // Associate selected lens option with the cart (best-effort)
        try {
          if (typeof selectLens === "function") {
            await selectLens(
              product.id || "unknown-sku",
              cartId,
              option.id,
              option
            );
          }
          // Invalidate cart/query cache so UI updates elsewhere
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        } catch (err) {
          console.error("Failed to select lens:", err);
        }
        // Navigate to cart after selection (adjust as needed)
        navigate("/cart");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  // Minimal render so component is functional until full UI is available
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Select Lenses</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => (
          <PackageCard
            key={opt.id}
            title={opt.title}
            price={opt.price}
            recommended={opt.isRecommended}
            onClick={() => handleSelect(opt)}
            description={opt.description}
            icon={opt.icon}
            loading={processing && selectedOption === opt.id}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectLenses;
