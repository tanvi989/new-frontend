import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import GetMyFitPopup from "../components/getMyFitPopup/GetMyFitPopup";
import { getCaptureSession } from "../utils/captureSession";
import VtoProductOverlay from "../components/VtoProductOverlay";
import { useQuery } from "@tanstack/react-query";
import { getFrames, getAllProducts } from "../api/retailerApis"; // Added getAllProducts
import NamingSystemSection from "../components/NamingSystemSection"; // Added NamingSystemSection
import NoProductsFound from "../components/NoProductsFound";
import { CheckboxItem } from "../components/CheckboxItem";
import { FilterSection } from "../components/FilterSection";
import { GenderFilter } from "../components/GenderFilter";
import { ShapeFilter } from "../components/ShapeFilter";
import { Check, ScanLine } from "lucide-react";
import { getHexColorsFromNames } from "../utils/colorNameToHex";
import { trackViewItemList } from "@/utils/analytics";

// --- FILTER DATA ---
const PRICES = ["£40 - 80", "£80 - 100", "£100 - 120", "£120 - 140"];
const SHOP_FOR = [
  "Eyeglasses",
  "Sunglasses",
  "Computer Glasses",
  "Reading Glasses",
  "Contact Lenses",
];
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
  Multi:
    "linear-gradient(90deg, #FF0000 0%, #00FF00 33%, #0000FF 66%, #FFFF00 100%)",
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

const SORT_OPTIONS = [
  "Sort By",
  "Most Popular",
  "Price Low To High",
  "Price High To Low",
];

// Size filter labels with lens measurement (single lens icon used in section title)
const SIZE_LABELS: Record<string, string> = {
  Large: "Large (> 54mm)",
  Medium: "Medium (> 51mm and < 54mm)",
  Small: "Small (< 51mm)",
};

// --- COMPONENTS ---
import { Loader, Loader2 } from "../components/Loader";

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
      // { key: "ShopFor", title: "Shop For", options: SHOP_FOR },
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
    const [activeCategory, setActiveCategory] = useState<string>("Gender");

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
                    <span className="ml-2 w-5 h-5 inline-flex items-center justify-center bg-black text-white text-xs rounded-full">
                      <Check color="white" />
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

const MenCollection: React.FC = () => {
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const [fitEnabled, setFitEnabled] = useState(false);
  const [getMyFitInitialStep, setGetMyFitInitialStep] = useState<'1' | '4'>('1');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  // State for desktop pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 48;

  // State for mobile infinite scroll (Removed)
  const [visibleProducts, setVisibleProducts] = useState<number>(12);
  // const [isLoadingMore, setIsLoadingMore] = useState(false);
  // const loadMoreRef = useRef<HTMLDivElement>(null);
  // const observerRef = useRef<IntersectionObserver | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null); // For infinite scroll
  const navigate = useNavigate();

  // Mobile Infinite Scroll State
  const [isMobile, setIsMobile] = useState(false);
  const [visibleMobileCount, setVisibleMobileCount] = useState(48);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // If user already came through VTO / Get My Fit, default MFit ON
  useEffect(() => {
    const session = getCaptureSession();
    if (session?.measurements?.face_width) {
      setFitEnabled(true);
    }
  }, []);

  const [activeFilterCategory, setActiveFilterCategory] = useState<
    string | null
  >(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({
    Size: [],
    Brand: [],
    Styles: [],
    // ShopFor: [],
    Prices: [],
    Shape: [],
    Material: [],
    // Collections: [],
    Comfort: [],
    FrameColors: [],
    Gender: [], // Added Gender filter
  });

  // Calculate total active filters for mobile badge
  const totalActiveFilters = useMemo(() => {
    return Object.values(selectedFilters).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }, [selectedFilters]);

  // Data Fetching
  // Data Fetching
  const {
    data: productsDataResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["menProducts", selectedFilters, currentPage],
    queryFn: async () => {
      // Force fetch all products for client-side pagination
      const params: any = {
        page: 1,
        limit: 2000, // Fetch all (or a very large number) to bypass backend pagination issues
        gender: "Men",
      };

      // Gender filter
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

      // Arrays
      if (selectedFilters.Shape.length > 0) params.shape = selectedFilters.Shape.join("|");
      if (selectedFilters.FrameColors.length > 0) params.colors = selectedFilters.FrameColors.join("|");
      if (selectedFilters.Material.length > 0) params.material = selectedFilters.Material.join("|");
      // if (selectedFilters.Collections.length > 0) params.collections = selectedFilters.Collections.join("|");
      if (selectedFilters.Comfort.length > 0) params.comfort = selectedFilters.Comfort.join("|");
      if (selectedFilters.Size.length > 0) params.size = selectedFilters.Size.join("|");
      if (selectedFilters.Brand.length > 0) params.brand = selectedFilters.Brand.join("|");
      if (selectedFilters.Styles.length > 0) params.style = selectedFilters.Styles.join("|");
      // if (selectedFilters.ShopFor.length > 0) params.category = selectedFilters.ShopFor.join("|");

      console.log("Fetching ALL MEN products for client pagination:", params);
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
  const totalProducts = allProducts.length;

  // GA4: Track product list view when products load
  useEffect(() => {
    if (allProducts?.length > 0) {
      trackViewItemList(allProducts, "men", "Men's Eyeglasses");
    }
  }, [allProducts]);

  // Calculate slice indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const products = allProducts.slice(startIndex, endIndex);

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

  // Reset states when filters or sort change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on desktop
    setVisibleMobileCount(48); // Reset mobile scroll on filter change
  }, [selectedFilters, sortBy]);

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
      } else {
        setGetMyFitInitialStep('1');
        setIsGetMyFitOpen(true);
      }
      setFitEnabled(true);
    } else {
      setFitEnabled(false);
    }
  };

  // Get capture session for VTO product display
  const captureSession = fitEnabled ? getCaptureSession() : null;

  // Client-side sort of the current page (Backend handles filtering, but we might verify sorts later if needed)
  // For now, we will assume backend returns the products as is, and we render them.
  // Actually, getAllProducts backend supports sorting? The current implementation plan moves filtering to backend.
  // If backend doesn't support sorting yet (we didn't explicitly check sort param in backend), we might receive a specific order.
  // However, the task is primarily about Pagination and Naming System. `AllProducts` does sort client-side on the current page sometimes?
  // Let's check AllProducts logic. It sorts `products` which are the CURRENT PAGE products.

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts]; // Use allProducts
    // Simple client-side sort of the FETCHED page (users might expect full sort, but with backend pagination, we usually need backend sort.
    // For this task, we will follow AllProducts pattern: client side sort of the returned page)
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

  // Get visible products based on device type
  // With backend pagination, we display the fetched page.
  const visibleProductsList = filteredAndSortedProducts;

  // Calculate total pages for desktop
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // No Client-side Slicing needs to happen 
  // const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex); // Remove slice
  // const paginatedProducts = filteredAndSortedProducts; // We still might need to support mobile infinite scroll logic?

  // Split Logic: Mobile (Infinite) vs Desktop (Paginated)
  const paginatedProducts = isMobile
    ? filteredAndSortedProducts.slice(0, visibleMobileCount)
    : filteredAndSortedProducts.slice(startIndex, endIndex);

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
  }, [isMobile, filteredAndSortedProducts.length]);

  // Load more products function for mobile // Removed as per instruction
  // const loadMoreProducts = useCallback(() => { // Removed as per instruction
  //   if (visibleProducts >= filteredAndSortedProducts.length) return; // Removed as per instruction

  //   setIsLoadingMore(true); // Removed as per instruction
  //   setTimeout(() => { // Removed as per instruction
  //     setVisibleProducts((prev) => // Removed as per instruction
  //       Math.min(prev + 12, filteredAndSortedProducts.length) // Removed as per instruction
  //     ); // Removed as per instruction
  //     setIsLoadingMore(false); // Removed as per instruction
  //   }, 500); // Removed as per instruction
  // }, [visibleProducts, filteredAndSortedProducts.length]); // Removed as per instruction

  // Intersection Observer for infinite scroll (mobile only) // Removed as per instruction
  // useEffect(() => { // Removed as per instruction
  //   // Only set up observer for mobile // Removed as per instruction
  //   if (window.innerWidth >= 1024) return; // Removed as per instruction

  //   if ( // Removed as per instruction
  //     !loadMoreRef.current || // Removed as per instruction
  //     visibleProducts >= filteredAndSortedProducts.length // Removed as per instruction
  //   ) // Removed as per instruction
  //     return; // Removed as per instruction

  //   const observer = new IntersectionObserver( // Removed as per instruction
  //     (entries) => { // Removed as per instruction
  //       if (entries[0].isIntersecting && !isLoadingMore) { // Removed as per instruction
  //         loadMoreProducts(); // Removed as per instruction
  //       } // Removed as per instruction
  //     }, // Removed as per instruction
  //     { // Removed as per instruction
  //       root: null, // Removed as per instruction
  //       rootMargin: "100px", // Removed as per instruction
  //       threshold: 0.1, // Removed as per instruction
  //     } // Removed as per instruction
  //   ); // Removed as per instruction

  //   observer.observe(loadMoreRef.current); // Removed as per instruction
  //   observerRef.current = observer; // Removed as per instruction

  //   return () => { // Removed as per instruction
  //     if (observerRef.current) { // Removed as per instruction
  //       observerRef.current.disconnect(); // Removed as per instruction
  //     } // Removed as per instruction
  //   }; // Removed as per instruction
  // }, [ // Removed as per instruction
  //   loadMoreProducts, // Removed as per instruction
  //   isLoadingMore, // Removed as per instruction
  //   visibleProducts, // Removed as per instruction
  //   filteredAndSortedProducts.length, // Removed as per instruction
  // ]); // Removed as per instruction

  // Handle manual load more (for mobile button) // Removed as per instruction
  // const handleLoadMore = () => { // Removed as per instruction
  //   if (!isLoadingMore) { // Removed as per instruction
  //     loadMoreProducts(); // Removed as per instruction
  //   } // Removed as per instruction
  // }; // Removed as per instruction

  // Handle page change for desktop
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans relative pb-20 lg:pb-0 pt-[120px]">
      {/* --- Men's Collection Banner (Image) --- */}
      <div className="w-full max-w-[1200px] mx-auto mb-8 px-4">
        <img
          src="/men-collection-banner.png"
          alt="Men's Collection"
          className="w-full h-auto object-contain"
          style={{ display: "block", margin: "0 auto" }}
        />
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-[1600px] mx-auto px-0 md:px-8 py-4 lg:py-8 flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar Filters - Hidden on mobile */}
        <aside className="w-full lg:w-[240px] shrink-0 pr-2 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-bold text-[#1F1F1F] uppercase tracking-[0.15em]"
              style={{
                fontWeight: 700,
                letterSpacing: "2px",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
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
          {/* Mobile Get My Fit Toggle - Right side only */}
          <div className="lg:hidden flex items-center justify-end sm:mb-4 mb-0 px-2">
            <div className="flex items-center gap-3">
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

          {/* Top Controls - Enhanced Filter Bar - Only visible on desktop */}
          <div
            className="mb-2 hidden lg:block"
            style={{
              paddingTop: "5px",
              zIndex: 9,
              background: "#ffffffff",
              fontFamily:
                "Lynstone, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif",
              fontSize: "14px",
              color: "#333",
              lineHeight: "1.3",
              marginLeft: "-2rem",
              marginRight: "-2rem",
              paddingLeft: "2rem",
              paddingRight: "2rem",
            }}
          >
            {/* Main Filter Bar */}
            <div className="flex items-center gap-3 mb-0 pb-2 relative border-b border-gray-200">
              {/* Right Side Controls */}
              <div className="ml-auto flex items-center gap-6">
                {/* Get My Fit Toggle - same design as AllProducts */}
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
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 pt-2 lg:pt-4">
            {isLoading ? (
              <div className="col-span-full h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {paginatedProducts.map((product: any) => (
                  <div
                    key={product.id}
                    onClick={() =>
                      navigate(`/product/${product.skuid || product.id}`, {
                        state: { product },
                      })
                    }
                    className="cursor-pointer group bg-white border border-gray-200 hover:bg-gray-50 transition-all"
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
                                );
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
                            {/* Default image - Base image (images[0]) */}
                            <img
                              src={product.images?.[0] || product.image}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0 scale-110"
                            />
                            {/* Hover image - Shows images[1] */}
                            <img
                              src={product.images?.[1] || product.image}
                              alt={product.name}
                              className="absolute w-full h-full object-contain mix-blend-multiply transition-all duration-300 opacity-0 group-hover:opacity-100 scale-110"
                              onError={(e) => {
                                console.error("Failed to load hover image:", e.currentTarget.src);
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </>
                        )}
                      </div>
                      {/* Price and Naming System */}
                      <div className="flex justify-between items-end mt-1 px-1 mx-2">
                        <span className="text-xs md:text-lg font-bold text-[#1F1F1F] uppercase tracking-wider">
                          {product.naming_system}
                        </span>
                        <span className="text-xs md:text-lg font-bold text-[#1F1F1F]">
                          £{product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAndSortedProducts.length === 0 && !isFetching && <NoProductsFound />}
              </>
            )}
          </div>

          {/* Mobile Infinite Scroll Trigger */}
          {isMobile && visibleMobileCount < filteredAndSortedProducts.length && (
            <div
              ref={observerTarget}
              className="h-20 flex items-center justify-center mt-8 lg:hidden"
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
            {/* Showing count */}
            <div className="text-center text-sm text-gray-500 my-8 lg:my-16">
              Showing {isMobile ? visibleMobileCount : (currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(
                isMobile ? visibleMobileCount : currentPage * itemsPerPage,
                totalProducts
              )}{" "}
              of {totalProducts} products
            </div>
          </div>
        </div>
      </div>
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
    </div >
  );
};

export default MenCollection;
