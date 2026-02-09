import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GetMyFitPopup from "../components/getMyFitPopup/GetMyFitPopup";
import { getCaptureSession, saveCaptureSession } from "../utils/captureSession";
import VtoProductOverlay from "../components/VtoProductOverlay";
import { useQuery } from "@tanstack/react-query";
import { getFrames, getAllProducts } from "../api/retailerApis";
import NamingSystemSection from "../components/NamingSystemSection";
import WhyChooseMultifolks from "../components/WhyChooseMultifolks";
import StyleBanner from "../components/StyleBanner";
import NoProductsFound from "../components/NoProductsFound";
import { CheckboxItem } from "../components/CheckboxItem";
import { FilterSection } from "../components/FilterSection";
// import { GenderFilter } from "../components/GenderFilter";
import { ShapeFilter } from "../components/ShapeFilter";

import { getColorFromSkuid } from "../utils/colorMapping";
import { getHexColorsFromNames } from "../utils/colorNameToHex";
import { GenderFilter } from "@/components/GenderFilter";
import { parseDimensionsString } from "@/utils/frameDimensions";
import { trackViewItemList } from "@/utils/analytics";
import { FrameAdjustmentControls } from "@/components/try-on/FrameAdjustmentControls";
import { DEFAULT_ADJUSTMENTS, type AdjustmentValues } from "@/utils/frameOverlayUtils";
import { ChevronDown, ChevronUp } from "lucide-react";

// --- MOCK DATA REMOVED ---

// --- FILTER DATA ---
const PRICES = ["£40 - 80", "£80 - 100", "£100 - 120", "£120 - 140"];
// Removed SHOP_FOR constant as it's no longer needed
const MATERIALS = [
  "Acetate",
  "Combination",
  "Metallic",
  "Stainless Steel",
  "Thermoplastic",
  "Titanium",
];
const COLLECTIONS = ["Offline Collection", "Premium Eyeglasses"];
const COMFORT = ["Lightweight", "Spring Hinge"];
const COMFORT_LABELS: Record<string, string> = {
  Lightweight: "Lightweight (less than 30 gm)",
  "Spring Hinge": "With Hinge",
};
const FRAME_COLORS = [
  "Beige",
  "Black",
  "Black & Gold",
  "Black Transparent",
  "Blue",
  "Bronze",
  "Brown",
  "Burgundy",
  "Copper",
  "Cream",
  "Gold",
  "Golden",
  "Green",
  "Grey",
  "Grey Transparent",
  "Gun",
  "Gunmetal",
  "Maroon",
  "Matte",
  "Mauve",
  "Multi",
  "Orange",
  "Peach",
  "Pink",
  "Purple",
  "Red",
  "Rose Gold",
  "Royal Blue",
  "Silver",
  "Tortoise",
  "White",
  "Transparent",
  "White Transparent",
  "Wine",
].sort();


// Color mapping for visual indicators
const FRAME_COLOR_MAP: { [key: string]: string } = {
  Beige: "#F5F5DC",
  Black: "#000000",
  "Black & Gold": "linear-gradient(135deg, #000000 0%, #FFD700 100%)",
  "Black Transparent": "rgba(0, 0, 0, 0.3)",
  Blue: "#0066CC",
  Bronze: "#CD7F32",
  Brown: "#8B4513",
  Burgundy: "#800020",
  Copper: "#B87333",
  Cream: "#FFFDD0",
  Gold: "#FFD700",
  Golden: "#FFD700",
  Green: "#228B22",
  Grey: "#808080",
  "Grey Transparent": "rgba(128, 128, 128, 0.3)",
  Gun: "#4A4A4A",
  Gunmetal: "#2C3539",
  Maroon: "#800000",
  Matte: "#D3D3D3",
  Mauve: "#E0B0FF",
  Multi: "linear-gradient(90deg, #FF0000 0%, #00FF00 33%, #0000FF 66%, #FFFF00 100%)",
  Orange: "#FF8C00",
  Peach: "#FFE5B4",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Red: "#DC143C",
  "Rose Gold": "#B76E79",
  "Royal Blue": "#4169E1",
  Silver: "#C0C0C0",
  Tortoise: "#8B4513",
  White: "#FFFFFF",
  Transparent: "#FFFFFF",
  "White Transparent": "rgba(255, 255, 255, 0.3)",
  Wine: "#722F37",
};

const FILTER_OPTIONS = {
  Size: ["Large", "Medium", "Small"],
  Brand: ["Berg", "Face A Face", "Leon", "Miyama"],
  Styles: ["Full Frame", "Half Frame", "Rimless"],
  Gender: ["Men", "Women"],

  Shape: [
    "Aviator",
    "Cateye",
    "Hexagon",
    "Oval",
    "Rectangle",
    "Round",
    "Semi Square",
    "Square",
    "Wayfarer",
  ],
};

// Size filter labels with lens measurement (single lens icon used in section title)
const SIZE_LABELS: Record<string, string> = {
  Large: "Large (> 54mm)",
  Medium: "Medium (> 51mm and < 54mm)",
  Small: "Small (< 51mm)",
};

const SORT_OPTIONS = [
  "Sort By",
  "Most Popular",
  "Price Low To High",
  "Price High To Low",

];


const GENDERS = ["Men", "Women"];

// --- COMPONENTS ---


import { Loader, Loader2 } from "../components/Loader";
import { Check, ScanLine } from "lucide-react";

// Mobile Filter/Sort Modal Component
const MobileFilterSortModal: React.FC<{
  type: "filter" | "sort";
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: { [key: string]: string[] };
  toggleFilterOption: (category: string, option: string) => void;
  clearAllFilters: () => void;
  sortBy: string;
  setSortBy: (option: string) => void;
}> = ({
  type,
  isOpen,
  onClose,
  selectedFilters,
  toggleFilterOption,
  clearAllFilters,
  sortBy,
  setSortBy,
}) => {
    if (!isOpen) return null;

    const filterCategories = [
      { key: "Gender", title: "Gender", options: FILTER_OPTIONS.Gender },
      { key: "Prices", title: "Prices", options: PRICES },
      { key: "Shape", title: "Shape", options: FILTER_OPTIONS.Shape },
      { key: "FrameColors", title: "Frame Colors", options: FRAME_COLORS },
      { key: "Material", title: "Material", options: MATERIALS },
      // { key: "Collections", title: "Collections", options: COLLECTIONS },
      { key: "Size", title: "Size", options: FILTER_OPTIONS.Size },
      { key: "Brand", title: "Brand", options: FILTER_OPTIONS.Brand },
      { key: "Styles", title: "Styles", options: FILTER_OPTIONS.Styles },
      { key: "Comfort", title: "Comfort", options: COMFORT },
    ];

    if (type === "sort") {
      return (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Sort By</h2>
              <button
                onClick={onClose}
                className="text-sm text-gray-900 font-medium"
              >
                Done
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex-1 overflow-y-auto p-2">
              {SORT_OPTIONS.filter((opt) => opt !== "Sort By").map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-lg mb-1 transition-colors ${sortBy === option
                    ? "bg-gray-100 text-black font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {sortBy === option && (
                      <svg
                        className="w-5 h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Filter Modal
    const [activeCategory, setActiveCategory] = useState<string>("Prices");

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 font-medium"
            >
              Clear all
            </button>
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="text-sm text-gray-900 font-medium"
            >
              Done
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Category Sidebar */}
            <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
              {filterCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full text-left flex items-center justify-between p-4 text-sm font-medium transition-colors ${activeCategory === cat.key
                    ? "bg-white text-black border-r-2 border-black"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {cat.title}
                  {selectedFilters[cat.key]?.length > 0 && (
                    <span className="ml-2 w-5 h-5 inline-flex items-center justify-center bg-white text-white text-xs rounded-full">
                      <Check color="green" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Options Panel */}
            <div className="w-2/3 overflow-y-auto p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {filterCategories.find((c) => c.key === activeCategory)?.title}
              </h3>
              <div className="space-y-3">
                {activeCategory === "Size" && (
                  <p className="text-xs text-gray-500 mb-1">Measurement (one lens)</p>
                )}
                {filterCategories
                  .find((c) => c.key === activeCategory)
                  ?.options.map((option) => {
                    const isSelected =
                      selectedFilters[activeCategory]?.includes(option);
                    const displayLabel =
                      activeCategory === "Size"
                        ? SIZE_LABELS[option] ?? option
                        : activeCategory === "Comfort"
                          ? COMFORT_LABELS[option] ?? option
                          : option;
                    return (
                      <label
                        key={option}
                        className="flex items-center justify-between py-2 cursor-pointer"
                      >
                        <span className="text-gray-700">{displayLabel}</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleFilterOption(activeCategory, option)
                            }
                            className="hidden"
                          />
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected
                              ? "bg-black border-black"
                              : "border-gray-300"
                              }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const AllProducts: React.FC = () => {
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const [getMyFitInitialStep, setGetMyFitInitialStep] = useState<'1' | '4'>('1');
  const [fitEnabled, setFitEnabled] = useState(false);
  const [topMfitEnabled, setTopMfitEnabled] = useState(false);
  const [capturedSession, setCapturedSession] = useState<any>(null);
  const [captureSessionState, setCaptureSessionState] = useState<any>(null);
  const [showAdjustFrame, setShowAdjustFrame] = useState(false);
  const [frameAdjustments, setFrameAdjustments] = useState<AdjustmentValues>({ ...DEFAULT_ADJUSTMENTS });
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedGender, setSelectedGender] = useState<string>("All"); // Removed separate gender state

  const itemsPerPage = 48;
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null); // For infinite scroll
  const navigate = useNavigate();

  // Mobile Infinite Scroll State
  const [isMobile, setIsMobile] = useState(false);
  const [visibleMobileCount, setVisibleMobileCount] = useState(48);

  // Mobile Filter/Sort UI State
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // If user already came through VTO / Get My Fit, default both MFit and Top matches M fit ON
  useEffect(() => {
    const session = getCaptureSession();
    if (session?.measurements?.face_width) {
      setFitEnabled(true);
      setTopMfitEnabled(true);
    }
  }, []);

  // Sync capture session from storage when MFit is on; init frame adjustments
  useEffect(() => {
    if (fitEnabled) {
      const session = getCaptureSession();
      setCaptureSessionState(session);
      if (session?.frameAdjustments) {
        setFrameAdjustments({
          offsetX: session.frameAdjustments.offsetX ?? DEFAULT_ADJUSTMENTS.offsetX,
          offsetY: session.frameAdjustments.offsetY ?? DEFAULT_ADJUSTMENTS.offsetY,
          scaleAdjust: session.frameAdjustments.scaleAdjust ?? DEFAULT_ADJUSTMENTS.scaleAdjust,
          rotationAdjust: session.frameAdjustments.rotationAdjust ?? DEFAULT_ADJUSTMENTS.rotationAdjust,
        });
      }
    } else {
      setCaptureSessionState(null);
      setShowAdjustFrame(false);
    }
  }, [fitEnabled]);

  const [activeFilterCategory, setActiveFilterCategory] = useState<
    string | null
  >(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({
    Size: [],
    Brand: [],
    Styles: [],
    // Removed ShopFor: []
    Prices: [],
    Shape: [],
    Material: [],
    // Collections: [],
    Comfort: [],
    FrameColors: [],
    Gender: [],
  });

  // --- FETCH PRODUCTS (REAL-TIME FILTERING) ---
  const {
    data: productsDataResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["allProducts", selectedFilters, currentPage],

    queryFn: async () => {
      // Force fetch all products for client-side pagination
      const params: any = {
        page: 1,
        limit: 2000, // Fetch all (or a very large number) to bypass backend pagination issues
      };

      // Gender
      // Gender - now part of selectedFilters
      if (selectedFilters.Gender.length > 0) {
        params.gender = selectedFilters.Gender.join("|");
      }

      // Price (Parse ranges like "£80 - 100", "Under £50", "£150+")
      if (selectedFilters.Prices.length > 0) {
        let min = Infinity;
        let max = -Infinity;
        selectedFilters.Prices.forEach((range) => {
          if (range.includes("Under")) {
            // Handle "Under £80"
            const matches = range.match(/(\d+)/);
            if (matches) {
              min = 0;
              const val = parseInt(matches[0]);
              min = 0;
              max = Math.max(max, val);
            }
          } else if (range.includes("+")) {
            // Handle "£140+"
            const matches = range.match(/(\d+)/);
            if (matches) {
              const val = parseInt(matches[0]);
              min = Math.min(min, val);
            }
          } else {
            // Handle "£80 - 100"
            const matches = range.match(/(\d+)/g);
            if (matches && matches.length >= 1) {
              const v1 = parseInt(matches[0]);
              const v2 = matches.length > 1 ? parseInt(matches[1]) : v1;
              min = Math.min(min, v1);
              max = Math.max(max, v2);
            }
          }
        });

        // Only set params if we found valid numbers
        if (min !== Infinity) params.min_price = min;
        if (max !== -Infinity) params.max_price = max;
      }

      // Arrays - Join with | for regex OR logic (Backend now supports regex or split, stick to pipe for now as backend splits it)
      if (selectedFilters.Shape.length > 0) params.shape = selectedFilters.Shape.join("|");
      if (selectedFilters.FrameColors.length > 0) params.colors = selectedFilters.FrameColors.join("|");
      if (selectedFilters.Material.length > 0) params.material = selectedFilters.Material.join("|");
      // if (selectedFilters.Collections.length > 0) params.collections = selectedFilters.Collections.join("|");
      if (selectedFilters.Comfort.length > 0) params.comfort = selectedFilters.Comfort.join("|");
      if (selectedFilters.Size.length > 0) params.size = selectedFilters.Size.join("|");
      if (selectedFilters.Brand.length > 0) params.brand = selectedFilters.Brand.join("|");
      if (selectedFilters.Styles.length > 0) params.style = selectedFilters.Styles.join("|");
      // Removed ShopFor filter from query parameters
      // if (selectedFilters.ShopFor.length > 0) params.category = selectedFilters.ShopFor.join("|");

      console.log("Fetching ALL products for client pagination:", params);
      const response = await getAllProducts(params);
      const products = response.data?.products || response.data?.data || [];

      // Truncate naming_system to first three parts
      const processedProducts = products.map((p: any) => {
        let processedNamingSystem = p.naming_system;
        if (p.naming_system) {
          const parts = p.naming_system.split('.');
          if (parts.length > 3) {
            processedNamingSystem = parts.slice(0, 3).join('.');
          }
        }
        return { ...p, naming_system: processedNamingSystem };
      });

      return { ...response.data, products: processedProducts, data: processedProducts };
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Client-side Pagination Logic
  const allProducts = productsDataResponse?.products || productsDataResponse?.data || [];

  // GA4: Track product list view when products load
  useEffect(() => {
    if (allProducts?.length > 0) {
      trackViewItemList(allProducts, "glasses", "All Eyeglasses");
    }
  }, [allProducts]);

  // Calculate Total Active Filters
  const totalActiveFilters = Object.values(selectedFilters).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  // Client-side sort of the FULL list (Global Sort)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setActiveFilterCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilterOption = (category: string, option: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [category]: updated };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      Size: [],
      Brand: [],
      Styles: [],
      Prices: [],
      Shape: [],
      Material: [],
      Comfort: [],
      FrameColors: [],
      Gender: [],
    });
    setCurrentPage(1);
    setVisibleMobileCount(48);
  };

  const handleFitToggle = () => {
    if (!fitEnabled) {
      const session = getCaptureSession();
      if (session) {
        setGetMyFitInitialStep('4');
        // Don't open popup - just enable VTO product display
      } else {
        setGetMyFitInitialStep('1');
        // No session - open popup to capture
        setIsGetMyFitOpen(true);
      }
      setFitEnabled(true);
    } else {
      setFitEnabled(false);
      setTopMfitEnabled(false); // Off when MFit is off
    }
  };

  const handleTopMfitToggle = () => {
    if (!topMfitEnabled && !captureSession?.measurements?.face_width) return; // need face width
    setTopMfitEnabled((prev) => !prev);
  };

  // Get capture session for VTO product display (merge live frame adjustments)
  const captureSession = fitEnabled && captureSessionState
    ? { ...captureSessionState, frameAdjustments }
    : null;

  const handleFrameAdjustChange = (adj: AdjustmentValues) => {
    setFrameAdjustments(adj);
    if (captureSessionState) {
      const updated = { ...captureSessionState, frameAdjustments: adj };
      saveCaptureSession(updated);
    }
  };

  /** Frame width range for Top matches M fit: e.g. face 130 → show frames 130–145 mm */
  const FRAME_WIDTH_MIN_OFFSET_MM = 0;  // faceWidth + 0
  const FRAME_WIDTH_MAX_OFFSET_MM = 15; // faceWidth + 15
  const TOP_M_FIT_LIMIT = 200; // show more than 50

  // Products whose frame width is in range [faceWidth, faceWidth+15] (e.g. 130 → 130–145), sorted by closest match
  const topMfitProducts = useMemo(() => {
    const faceWidthMm = captureSession?.measurements?.face_width;
    if (!faceWidthMm || !allProducts.length) return [];
    const minFrame = faceWidthMm + FRAME_WIDTH_MIN_OFFSET_MM;
    const maxFrame = faceWidthMm + FRAME_WIDTH_MAX_OFFSET_MM;
    const withWidth: { product: any; width: number }[] = [];
    for (const p of allProducts) {
      const dims = p.dimensions ? parseDimensionsString(p.dimensions) : null;
      if (!dims) continue;
      const frameWidth = dims.width;
      if (frameWidth >= minFrame && frameWidth <= maxFrame) {
        withWidth.push({ product: p, width: frameWidth });
      }
    }
    withWidth.sort((a, b) => Math.abs(a.width - faceWidthMm) - Math.abs(b.width - faceWidthMm));
    return withWidth.slice(0, TOP_M_FIT_LIMIT).map(({ product }) => product);
  }, [captureSession?.measurements?.face_width, allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts]; // Use allProducts
    if (sortBy === "Price Low To High") {
      result.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "Price High To Low") {
      result.sort((a: any, b: any) => b.price - a.price);
    } else if (sortBy === "Newly Added") {
      result.sort((a: any, b: any) => b.id - a.id);
    } else if (sortBy === "Most Popular") {
      result.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
    }
    return result;
  }, [sortBy, allProducts]);

  // When "Top matches M fit" is ON, grid shows only frame-width-matched products (up to 50); otherwise all
  const gridSourceProducts = useMemo(() => {
    if (topMfitEnabled && topMfitProducts.length > 0) {
      let result = [...topMfitProducts];
      if (sortBy === "Price Low To High") {
        result.sort((a: any, b: any) => a.price - b.price);
      } else if (sortBy === "Price High To Low") {
        result.sort((a: any, b: any) => b.price - a.price);
      } else if (sortBy === "Newly Added") {
        result.sort((a: any, b: any) => b.id - a.id);
      } else if (sortBy === "Most Popular") {
        result.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
      }
      return result;
    }
    return filteredAndSortedProducts;
  }, [topMfitEnabled, topMfitProducts, sortBy, filteredAndSortedProducts]);

  // --- PAGINATION LOGIC ---
  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
    setVisibleMobileCount(48); // Reset mobile scroll on filter change
  }, [selectedFilters, sortBy, topMfitEnabled]); // Reset on both filter and sort changes

  // Split Logic: Mobile (Infinite) vs Desktop (Paginated)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalProducts = gridSourceProducts.length; // all products or top M fit count when that toggle is on
  const paginatedProducts = isMobile
    ? gridSourceProducts.slice(0, visibleMobileCount)
    : gridSourceProducts.slice(startIndex, endIndex);

  // Infinite Scroll Observer for Mobile
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleMobileCount((prev) => prev + 48);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isMobile, gridSourceProducts.length]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans relative pb-20 lg:pb-0 pt-[120px]">
      {/* Back Button - Fixed in Top Left Corner */}
      {/* <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#1F1F1F] hover:text-white hover:bg-[#D96C47] border border-gray-200 rounded-full shadow-sm transition-all duration-200 group"
          aria-label="Go back"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform group-hover:-translate-x-1 transition-transform duration-200"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold text-xs uppercase tracking-wider">Back</span>
        </button>
      </div> */}

      {/* --- Shop Our Range Banner --- */}
      <div className="w-full max-w-[1200px] mx-auto mb-0 md:mb-8 px-0 md:px-4">
        <img
          src="/men-collection-banner.png"
          alt="Shop Our Range"
          className="w-full h-auto object-cover md:object-contain scale-110 md:scale-100"
        />
      </div>


      {/* Gender Filter Tabs */}
      {/* <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-6">
        <div className="flex gap-3 justify-center">
          {["All", "Men", "Women"].map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${selectedGender === gender
                ? "bg-[#232320] text-white shadow-lg"
                : "bg-[#F5F5F5] text-[#525252] hover:bg-[#EAEAEA]"
                }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div> */}

      {/* --- Main Content --- */}
      <div className="max-w-[1600px] mx-auto px-0 md:px-8 py-8 flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar Filters - Sticky */}
        <aside className="w-full lg:w-[240px] shrink-0 pr-2 hidden lg:block sticky top-20 self-start z-10" style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-[#1F1F1F] uppercase tracking-[0.15em]" style={{ fontWeight: 800, letterSpacing: '2px', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              FILTERS
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-[#D96C47] underline transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            <GenderFilter />

            <FilterSection title="Prices" isOpen={true}>
              {PRICES.map((price) => (
                <CheckboxItem
                  key={price}
                  label={price}
                  checked={selectedFilters.Prices.includes(price)}
                  onChange={() => toggleFilterOption("Prices", price)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Shape">
              <ShapeFilter
                selectedShapes={selectedFilters.Shape || []}
                onChange={(shape) => toggleFilterOption("Shape", shape)}
              />
            </FilterSection>
            <FilterSection title="Frame Colors">
              {FRAME_COLORS.map((color) => (
                <CheckboxItem
                  key={color}
                  label={color}
                  checked={selectedFilters.FrameColors.includes(color)}
                  onChange={() => toggleFilterOption("FrameColors", color)}
                  color={FRAME_COLOR_MAP[color]}
                />
              ))}
            </FilterSection>
            <FilterSection title="Material">
              {MATERIALS.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  checked={selectedFilters.Material.includes(item)}
                  onChange={() => toggleFilterOption("Material", item)}
                />
              ))}
            </FilterSection>
            {/* <FilterSection title="Collections">
              {COLLECTIONS.map((collection) => (
                <CheckboxItem
                  key={collection}
                  label={collection}
                  checked={selectedFilters.Collections.includes(collection)}
                  onChange={() => toggleFilterOption("Collections", collection)}
                />
              ))}
            </FilterSection> */}
            <FilterSection title="Size">
              <p className="text-xs text-[#525252] mb-2">Measurement (one lens)</p>
              {FILTER_OPTIONS.Size.map((item) => (
                <CheckboxItem
                  key={item}
                  label={SIZE_LABELS[item] ?? item}
                  checked={selectedFilters.Size.includes(item)}
                  onChange={() => toggleFilterOption("Size", item)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Brand">
              {FILTER_OPTIONS.Brand.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  checked={selectedFilters.Brand.includes(item)}
                  onChange={() => toggleFilterOption("Brand", item)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Styles">
              {FILTER_OPTIONS.Styles.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  checked={selectedFilters.Styles.includes(item)}
                  onChange={() => toggleFilterOption("Styles", item)}
                />
              ))}
            </FilterSection>
            <FilterSection title="Comfort">
              {COMFORT.map((item) => (
                <CheckboxItem
                  key={item}
                  label={COMFORT_LABELS[item] ?? item}
                  checked={selectedFilters.Comfort.includes(item)}
                  onChange={() => toggleFilterOption("Comfort", item)}
                />
              ))}
            </FilterSection>
          </div>
        </aside>

        {/* Right Grid */}
        <div className="flex-1 relative">
          {/* Mobile: Face/Frame width + Top matches M fit Toggle + MFit Toggle */}
          <div className="lg:hidden flex items-center justify-end sm:mb-4 mb-0 px-2 flex-wrap gap-2">
            {fitEnabled && captureSession?.measurements?.face_width != null && (
              <span className="text-xs text-gray-600">
                Face: <strong>{captureSession.measurements.face_width.toFixed(0)} mm</strong>
                {topMfitEnabled && (
                  <> · Frame: {Math.round(captureSession.measurements.face_width + FRAME_WIDTH_MIN_OFFSET_MM)}–{Math.round(captureSession.measurements.face_width + FRAME_WIDTH_MAX_OFFSET_MM)} mm</>
                )}
              </span>
            )}
            <div className="flex items-center gap-3">
              {fitEnabled && (
                <>
                  <span className="text-xs font-bold text-[#D96C47] uppercase tracking-wider">
                    Top matches M fit{` (${topMfitProducts.length})`}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={topMfitEnabled}
                    onClick={handleTopMfitToggle}
                    disabled={!captureSession?.measurements?.face_width}
                    className={`relative w-12 h-7 rounded-full p-0.5 transition-colors duration-300 flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${topMfitEnabled
                      ? "bg-[#D96C47]"
                      : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${topMfitEnabled ? "left-[calc(100%-26px)]" : "left-0.5"}`}
                    />
                  </button>
                </>
              )}
              <span className="text-xs font-bold text-[#333] uppercase tracking-wider">
                MFit
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={fitEnabled}
                onClick={handleFitToggle}
                className={`relative w-12 h-7 rounded-full p-0.5 transition-colors duration-300 flex items-center cursor-pointer ${fitEnabled
                  ? "bg-green-500"
                  : "bg-gray-300"
                  }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ease-out ${fitEnabled ? "left-[calc(100%-26px)]" : "left-0.5"}`}
                >
                  <ScanLine className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </div>

          {/* Top Controls - Enhanced Filter Bar */}
          <div className="mb-2 hidden lg:block" style={{ paddingTop: '5px', zIndex: 9, background: '#ffffffff', fontFamily: 'Lynstone, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif', fontSize: '14px', color: '#333', lineHeight: '1.3', marginLeft: '-2rem', marginRight: '-2rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
            {/* Main Filter Bar */}
            <div className="flex items-center gap-3 mb-0 pb-2 relative border-b border-gray-200">
              {/* All Dropdowns - Positioned at parent level */}

              {/* Right Side Controls */}
              <div className="ml-auto flex items-center gap-6 flex-wrap">
                {fitEnabled && captureSession?.measurements?.face_width != null && (
                  <span className="text-sm text-gray-600">
                    Face width: <strong>{captureSession.measurements.face_width.toFixed(0)} mm</strong>
                    {topMfitEnabled && (
                      <> · Frame width: {Math.round(captureSession.measurements.face_width + FRAME_WIDTH_MIN_OFFSET_MM)}–{Math.round(captureSession.measurements.face_width + FRAME_WIDTH_MAX_OFFSET_MM)} mm</>
                    )}
                  </span>
                )}
                {/* Top matches M fit: only show after MFit is completed */}
                {fitEnabled && (
                  <>
                    <span className="text-sm font-bold text-[#D96C47] uppercase tracking-wider">
                      Top matches M fit ({topMfitProducts.length})
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={topMfitEnabled}
                      onClick={handleTopMfitToggle}
                      disabled={!captureSession?.measurements?.face_width}
                      className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#D96C47] disabled:opacity-50 disabled:cursor-not-allowed ${topMfitEnabled
                        ? "bg-[#D96C47]"
                        : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${topMfitEnabled ? "left-[calc(100%-28px)]" : "left-1"}`}
                      />
                    </button>
                  </>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#333] uppercase tracking-wider">
                    MFit
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={fitEnabled}
                    onClick={handleFitToggle}
                    className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${fitEnabled
                      ? "bg-green-500"
                      : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ease-out ${fitEnabled ? "left-[calc(100%-28px)]" : "left-1"}`}
                    >
                      <ScanLine className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                    </span>
                  </button>
                </div>

                {/* Sort By */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#333] hover:text-[#1F1F1F] transition-colors bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-full border border-gray-200"
                  >
                    <span>Sort By</span>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 shadow-lg z-50">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option
                            ? "bg-[#1976D2] text-white"
                            : "text-[#333] hover:bg-[#1976D2] hover:text-white"
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clear All Filters Button */}
            {/* {(selectedFilters.Size.length > 0 ||
              selectedFilters.Brand.length > 0 ||
              selectedFilters.Styles.length > 0 ||
              selectedFilters.ShopFor.length > 0 ||
              selectedFilters.Prices.length > 0 ||
              selectedFilters.Shape.length > 0 ||
              selectedFilters.Material.length > 0 ||
              // selectedFilters.Collections.length > 0 ||
              selectedFilters.Comfort.length > 0 ||
              selectedFilters.FrameColors.length > 0) && (
                <div className="mb-4">
                  <button
                    onClick={() =>
                      setSelectedFilters({
                        Size: [],
                        Brand: [],
                        Styles: [],
                        ShopFor: [],
                        Prices: [],
                        Shape: [],
                        Material: [],
                        // Collections: [],
                        Comfort: [],
                        FrameColors: [],
                      })
                    }
                    className="px-6 py-2 text-sm font-semibold rounded-full bg-[#232320] text-white hover:bg-black transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )} */}
          </div>

          {/* When MFit on but Top matches off: show hint. When Top matches on, grid below shows only matches. */}
          {fitEnabled && !topMfitEnabled && (() => {
            const faceMm = captureSession?.measurements?.face_width;
            const minF = faceMm != null ? Math.round(faceMm + FRAME_WIDTH_MIN_OFFSET_MM) : 130;
            const maxF = faceMm != null ? Math.round(faceMm + FRAME_WIDTH_MAX_OFFSET_MM) : 145;
            return (
              <div className="mb-4 pt-4">
                {topMfitProducts.length > 0 ? (
                  <p className="text-sm text-[#D96C47]">
                    Your face width: <strong>{faceMm?.toFixed(0)} mm</strong>. Frame width range: <strong>{minF}–{maxF} mm</strong>. {topMfitProducts.length} frames match — turn on <strong>Top matches M fit</strong> above to show only these.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Your face width: <strong>{faceMm?.toFixed(0)} mm</strong>. Turn on <strong>Top matches M fit</strong> to filter to frame width {minF}–{maxF} mm.
                  </p>
                )}
              </div>
            );
          })()}

          {/* Product Grid - Multifolks Style - Fixed Spacing */}
          <div className="grid grid-cols-2 lg:grid-cols-3 pt-16 sm:pt-4">
            {paginatedProducts
              .map((product: any, index: number) => (
                <div
                  key={product.skuid ?? product.id ?? `product-${index}`}
                  onClick={() =>
                    navigate(`/product/${product.skuid || product.id}`, {
                      state: { product },
                    })
                  }
                  className="cursor-pointer group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative p-0 bg-[#F7F7F7]">

                    {/* Image Container - 384x332 when VTO (matches measurement tab); else 1.4 for product images */}
                    <div
                      className={`p-0 bg-[#F7F7F7] flex relative rounded overflow-hidden ${fitEnabled && captureSession ? 'mx-auto' : 'aspect-[1.4]'}`}
                      style={fitEnabled && captureSession ? { width: 384, height: 332 } : undefined}
                    >
                      {/* Color Dots - Use variants array from API */}
                      {(() => {
                        // Get colors from variants if available, otherwise use color_names
                        let colorDots: string[] = [];

                        if (product.variants && product.variants.length > 0) {
                          // Extract color_names from each variant
                          colorDots = product.variants
                            .map((v: any) => v.color_names?.[0])
                            .filter((c: string) => c); // Remove undefined/null
                        } else if (product.color_names && product.color_names.length > 0) {
                          colorDots = product.color_names;
                        }

                        if (colorDots.length === 0) return null;

                        return (
                          <div className="absolute top-1 left-1 md:top-2 md:left-2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-sm px-1 py-0.5 md:px-1.5 md:py-1 rounded-full">
                            {colorDots.map((colorName: string, i: number) => {
                              const colorHex = getHexColorsFromNames([colorName])[0] || colorName;
                              return (
                                <span
                                  key={i}
                                  style={{ backgroundColor: colorHex }}
                                  className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full border border-white shadow-sm"
                                  title={colorName}
                                ></span>
                              )
                            })}
                          </div>
                        );
                      })()}

                      {/* VTO Mode: Show captured image with frame overlay + VTO image in small box */}
                      {fitEnabled && captureSession ? (
                        <VtoProductOverlay
                          captureSession={captureSession}
                          productSkuid={product.skuid}
                          productDimensions={product.dimensions}
                          productName={product.name}
                        />
                      ) : (
                        <>
                          {/* Normal Mode: Default product images */}
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0 scale-110"
                          />
                          <img
                            src={product.images?.[1] || product.image}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 opacity-0 group-hover:opacity-100 scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </>
                      )}
                    </div>

                    {/* Price and Naming System */}
                    <div className="flex justify-between items-end mt-1 px-2">
                      <span className="text-xs md:text-lg font-bold text-[#1F1F1F] uppercase tracking-wider">
                        {product.naming_system}
                      </span>
                      <span className="text-xs md:text-base font-bold text-[#1F1F1F]">
                        £{product.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {isLoading ? (
              <div className="col-span-full h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : (
              paginatedProducts.length === 0 && !isFetching && <NoProductsFound />
            )}

          </div>

          {/* Infinite Scroll Trigger (Mobile Only) - use grid source count so M fit shows 50 only */}
          {isMobile && visibleMobileCount < gridSourceProducts.length && (
            <div
              ref={observerTarget}
              className="h-20 flex items-center justify-center mt-8"
            >
              <Loader2 />
            </div>
          )}

          {/* ===== DESKTOP: Pagination Section ===== */}
          <div className="hidden lg:block">
            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                {/* Page Indicator */}
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <span className="text-gray-400">|</span>

                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-teal-700 hover:text-teal-800"
                    }`}
                >
                  Prev
                </button>

                {(() => {
                  const maxVisiblePages = 7;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  const pages = [];
                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push("...");
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push("...");
                    }
                    pages.push(totalPages);
                  }

                  return pages.map((page, index) => (
                    <React.Fragment key={index}>
                      {typeof page === "number" ? (
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                            ? "bg-teal-700 text-white rounded-full"
                            : "text-gray-700 hover:text-teal-700"
                            }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span className="text-gray-400 px-1">...</span>
                      )}
                    </React.Fragment>
                  ));
                })()}

                {/* Next Button */}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-teal-700 hover:text-teal-800"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
            {/* Showing count - when Top matches M fit is on, show face + frame width and 50 M fit matches */}
            <div className="text-center text-sm text-gray-500 my-8 lg:my-16">
              {topMfitEnabled ? (
                <>
                  Face width: <strong className="text-gray-700">{captureSession?.measurements?.face_width?.toFixed(0) ?? '—'} mm</strong>
                  {' · '}
                  Frame width range: <strong className="text-gray-700">{captureSession?.measurements?.face_width != null ? `${captureSession.measurements.face_width - FRAME_WIDTH_MIN_OFFSET_MM}–${captureSession.measurements.face_width + FRAME_WIDTH_MAX_OFFSET_MM}` : '—'} mm</strong>
                  {' · '}
                  Showing {totalProducts} M fit matches only
                </>
              ) : (
                <>
                  Showing {isMobile ? visibleMobileCount : (currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(
                    isMobile ? visibleMobileCount : currentPage * itemsPerPage,
                    totalProducts
                  )}{" "}
                  of {totalProducts} products
                </>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* --- Bottom Sections --- */}
      <NamingSystemSection />

      {/* Mobile Bottom Filter/Sort Bar - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black text-white z-50 shadow-2xl">
        <div className="flex items-center justify-around">
          {/* Filter Button */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-medium">Filter</span>
            {totalActiveFilters > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-white text-black text-xs rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20"></div>


          {/* Sort Button */}
          <button
            onClick={() => setShowMobileSort(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
            <span className="font-medium">Sort</span>
          </button>
        </div>
      </div>
      {/* <WhyChooseMultifolks /> */}
      {/* <StyleBanner /> */}

      {/* Mobile Filter/Sort Modals */}
      <MobileFilterSortModal
        type="filter"
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        selectedFilters={selectedFilters}
        toggleFilterOption={toggleFilterOption}
        clearAllFilters={clearAllFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <MobileFilterSortModal
        type="sort"
        isOpen={showMobileSort}
        onClose={() => setShowMobileSort(false)}
        selectedFilters={selectedFilters}
        toggleFilterOption={toggleFilterOption}
        clearAllFilters={clearAllFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <GetMyFitPopup
        open={isGetMyFitOpen}
        onClose={() => setIsGetMyFitOpen(false)}
        initialStep={getMyFitInitialStep}
      />

      {/* Floating Adjust frame - bottom right, closed by default */}
      {fitEnabled && captureSession && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          {showAdjustFrame ? (
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 max-w-[calc(100vw-2rem)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-600">Changes apply to all frames.</p>
                <button
                  type="button"
                  onClick={() => setShowAdjustFrame(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <FrameAdjustmentControls
                values={frameAdjustments}
                onChange={handleFrameAdjustChange}
                onReset={() => handleFrameAdjustChange({ ...DEFAULT_ADJUSTMENTS })}
              />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setShowAdjustFrame((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border font-bold text-xs uppercase tracking-wider transition-colors ${showAdjustFrame ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            {showAdjustFrame ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            Adjust frame
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;