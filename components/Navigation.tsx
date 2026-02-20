import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CustomerCartView from "./CustomerCartView";
import EditProfile from "./EditProfile";
import { CartItem } from "../types";
import { getCart, isLoggedIn, getFrames } from "../api/retailerApis";
import { GetMyFitModal } from "./GetMyFitModal";
import GetMyFitPopup from "./getMyFitPopup/GetMyFitPopup";
import { LoginModal } from "./LoginModal";
import SignUpModal from "./SignUpModal";
import { Frame } from "../types";


const TRENDING_SEARCHES = [
  "Prescription Glasses Prescription",
  "Men Glasses",
  "Prescription Glasses",
  "Prescription Glasses",
  "Eyewear Glasses Frames",
  "Rx Eyeglasses",
];




export const Navigation: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const [isGetMyFitPopupOpen, setIsGetMyFitPopupOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(
    null
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [userName, setUserName] = useState(
    localStorage.getItem("firstName") || "User"
  );

  // Search State
  const [allProducts, setAllProducts] = useState<Frame[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Frame[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const effectiveScrolled = isScrolled;

  // Close global overlays (MFit, search, mobile menu) whenever the route changes.
  // This prevents leftover fullscreen layers from blocking navigation on new pages.
  useEffect(() => {
    setIsGetMyFitOpen(false);
    setIsGetMyFitPopupOpen(false);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "unset";
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => {
      setUserLoggedIn(isLoggedIn());
      const firstName = localStorage.getItem("firstName");
      // Ensure we always have a valid name, fallback to "User" if empty or null
      setUserName(firstName && firstName.trim() ? firstName : "User");
    };

    // Initial check on mount
    handleAuthChange();

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const { data: cartItems = [], refetch: fetchCart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      try {
        const response: any = await getCart({});
        if (
          response.data &&
          response.data.cart &&
          Array.isArray(response.data.cart)
        ) {
          return response.data.cart as CartItem[];
        }
        return [];
      } catch (error) {
        console.warn("Failed to fetch cart", error);
        return [];
      }
    },
    staleTime: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
    setActiveDropdown(null);
    setIsSearchOpen(false);
  };

  const handleMobileSubmenuToggle = (item: string) => {
    setExpandedMobileItem(expandedMobileItem === item ? null : item);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleLoginNext = (email: string) => {
    setAuthEmail(email);
    setIsLoginModalOpen(false);
    setIsSignUpOpen(true);
  };

  const handleSwitchToLogin = (email?: string) => {
    if (email) {
      setAuthEmail(email);
    }
    setIsSignUpOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen, isMobileMenuOpen]);

  // Fetch products for search
  // Fetch products for search
  useEffect(() => {
    if ((isSearchOpen || isMobileMenuOpen) && allProducts.length === 0) {
      setIsLoading(true);
      getFrames(undefined, 1000).then((response: any) => {
        if (response.data && response.data.data) {
          setAllProducts(response.data.data);
        }
        setIsLoading(false);
      }).catch((err) => {
        console.error("Failed to fetch frames", err);
        setIsLoading(false);
      });
    }
  }, [isSearchOpen, isMobileMenuOpen, allProducts.length]);

  // Filter products based on query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = allProducts.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.name?.toLowerCase().includes(query) // Fallback or extra checks
    );
    // Basic filter by name for now, can be expanded
    const advancedResults = allProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const skuMatch = product.skuid?.toLowerCase().includes(query);
      return nameMatch || skuMatch;
    });
    setFilteredProducts(advancedResults.slice(0, 8)); // Limit to 8 results
  }, [searchQuery, allProducts]);

  const handleProductClick = (product: Frame) => {
    setIsSearchOpen(false);
    navigate(`/product/${product.skuid}`, { state: { product } });
  };

  return (
    <>
      <header
        className={`w-full h-[90px] flex items-center justify-center fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-300 overflow-visible ${effectiveScrolled || isMobileMenuOpen ? "bg-white" : "bg-transparent"
          }`}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className={`w-full max-w-[1480px] px-4 md:px-8 flex items-end justify-between h-[60px] pb-2 relative transition-all duration-300 ${effectiveScrolled ? "" : ""
            }`}
        >
          {/* Logo Area - back to previous size */}
         <div className="flex flex-col justify-center h-full w-auto md:w-[260px] relative shrink-0 z-50">
            <a href="/" className="flex items-center gap-2 group pb-1">
              <img
                src="/Multifolks.png"
                alt="Multifolks logo"
                className="h-14 md:h-16 w-auto object-contain"
              />
            </a>
          </div>

          {/* Center Close Button (Visible when Search is Open) */}


          {/* Desktop Pill Navigation */}
          <div
            className={`hidden lg:flex items-center rounded-[60px] h-[52px] pl-8 pr-2 relative gap-8 z-50 transition-all duration-300 ${effectiveScrolled ? "bg-[#232320]" : "bg-black/70 backdrop-blur-sm"
              }`}
          >
            <nav className="flex items-center gap-8 h-full">
              <div
                className="flex items-center gap-1 cursor-pointer group h-full"
                onMouseEnter={() => handleMouseEnter("multifocals")}
                onMouseLeave={handleMouseLeave}
                onClick={() => setActiveDropdown(activeDropdown === "multifocals" ? null : "multifocals")}
              >
                {activeDropdown === "multifocals" && (
                  <div className="absolute -bottom-[14px] left-[15%] transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#F0EBE4] z-50"></div>
                )}
                <span className="text-white group-hover:text-[#F3CB0A] transition-colors text-base lg:text-lg font-normal">
                  Glasses
                </span>
                <svg
                  className={`text-white group-hover:text-[#F3CB0A] transition-transform duration-200 ${activeDropdown === "multifocals" ? "rotate-180" : ""
                    }`}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <Link
                to="/about"
                className="text-white hover:text-[#F3CB0A] transition-colors text-base lg:text-lg font-normal"
              >
                About Us
              </Link>
              <button
                onClick={() => setIsGetMyFitPopupOpen(true)}
                className="text-white hover:text-[#F3CB0A] transition-colors text-base lg:text-lg font-normal whitespace-nowrap"
              >
               Try-MFit
              </button>
            </nav>
            <div className="flex items-center gap-3 ml-4 relative">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors group shadow-sm ${effectiveScrolled ? "bg-[#333333]" : "bg-black/70"
                  }`}
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
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              {/* Cart */}
              <button
                onClick={handleCartClick}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center text-black hover:bg-[#ffb3c0] transition-colors shadow-sm ${effectiveScrolled
                  ? "bg-[#F5C5C6]"
                  : "bg-[#F5C5C6]/90 backdrop-blur-sm"
                  }`}
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
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#E94D37] text-white text-xs font-bold min-w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartItems.length}
                </span>
              </button>
              {/* Login/Profile Button */}
              {userLoggedIn ? (
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("userMenu")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "userMenu" ? null : "userMenu"
                      )
                    }
                    className={`h-[36px] pl-3 pr-5 rounded-[50px] flex items-center justify-center gap-2 text-[14px] text-[#151001] font-bold transition-colors ml-1 ${effectiveScrolled
                      ? "bg-[#F3CB0A] hover:bg-white"
                      : "bg-[#F3CB0A]/90 hover:bg-white/90 backdrop-blur-sm"
                      }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                      <i className="fa-regular fa-user text-xs"></i>
                    </div>
                    <span className="capitalize max-w-[80px] truncate">
                      {userName}
                    </span>
                  </button>
                  {/* User Menu Dropdown */}
                  {activeDropdown === "userMenu" && (
                    <div className="absolute top-full right-0 mt-3 w-[240px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 font-sans">
                      <div className="flex flex-col">
                        <Link
                          to="/my-profile"
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 text-[14px] font-medium text-[#1F1F1F] border-b border-gray-50 transition-colors"
                        >
                          <i className="fa-solid fa-user text-gray-400 w-5 text-center"></i>{" "}
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 text-[14px] font-medium text-[#1F1F1F] border-b border-gray-50 transition-colors"
                        >
                          <i className="fa-solid fa-list text-gray-400 w-5 text-center"></i>{" "}
                          My Orders
                        </Link>
                        {/* <Link
                          to="/wishlist"
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 text-[14px] font-medium text-[#1F1F1F] border-b border-gray-50 transition-colors"
                        >
                          <i className="fa-solid fa-heart text-gray-400 w-5 text-center"></i>{" "}
                          My Favourites
                        </Link> */}
                        <Link
                          to="/my-prescriptions"
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 text-[14px] font-medium text-[#1F1F1F] border-b border-gray-50 transition-colors"
                        >
                          <i className="fa-solid fa-file-medical text-gray-400 w-5 text-center"></i>{" "}
                          My Perscription
                        </Link>
                        <Link
                          to="/recently-viewed"
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 text-[14px] font-medium text-[#1F1F1F] border-b border-gray-50 transition-colors"
                        >
                          <i className="fa-solid fa-eye text-gray-400 w-5 text-center"></i>{" "}
                          Recently Viewed
                        </Link>
                        <Link
                          to="/offers"
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 text-[14px] font-medium text-[#1F1F1F] transition-colors"
                        >
                          <i className="fa-solid fa-percent text-gray-400 w-5 text-center"></i>{" "}
                          My Offers
                        </Link>
                        <div className="h-px bg-gray-100 my-0"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-4 bg-[#FFEAEA] hover:bg-[#FFD5D5] flex items-center gap-3 text-[14px] font-bold text-[#E94D37] transition-colors"
                        >
                          <i className="fa-solid fa-lock w-5 text-center"></i>{" "}
                          LogOut
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className={`h-10 px-6 rounded-[50px] flex items-center justify-center text-base lg:text-lg text-[#151001] font-medium transition-colors ml-1 whitespace-nowrap ${effectiveScrolled
                    ? "bg-[#F3CB0A] hover:bg-white"
                    : "bg-[#F3CB0A]/90 hover:bg-white/90 backdrop-blur-sm"
                    }`}
                >
                 Login / SignUp
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation - compact black pill, smaller so logo stands out */}
          <div className="lg:hidden flex items-center gap-1 bg-black/90 rounded-full pl-1.5 pr-2 py-1.5 shrink-0">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${effectiveScrolled
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-black/80 text-white hover:bg-black"
                }`}
            >
              {isMobileMenuOpen ? (
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
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
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className={`relative w-8 h-8 rounded-full flex items-center justify-center text-black hover:bg-[#ffb3c0] transition-colors shadow-sm shrink-0 ${effectiveScrolled ? "bg-[#F5C5C6]" : "bg-[#F5C5C6]/90 backdrop-blur-sm"
                }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 bg-[#E94D37] text-white text-[8px] font-bold h-3.5 w-3.5 min-w-[14px] flex items-center justify-center rounded-full border border-white shadow-sm">
                {cartItems.length}
              </span>
            </button>

            {/* Login/User Button */}
            {userLoggedIn ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className={`h-8 px-2.5 rounded-full flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-black font-bold transition-colors shrink-0 ${effectiveScrolled
                  ? "bg-[#F3CB0A] hover:bg-white"
                  : "bg-[#F3CB0A]/90 hover:bg-white/90 backdrop-blur-sm"
                  }`}
              >
                <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                  <i className="fa-regular fa-user text-[10px]"></i>
                </div>
                <span className="capitalize max-w-[48px] truncate">
                  {userName}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className={`h-8 px-2.5 sm:px-3 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] text-black font-bold transition-colors whitespace-nowrap shrink-0 ${effectiveScrolled
                  ? "bg-[#F3CB0A] hover:bg-white"
                  : "bg-[#F3CB0A]/90 hover:bg-white/90 backdrop-blur-sm"
                  }`}
              >
                Login/SignUp
              </button>
            )}
          </div>
        </div>



        {activeDropdown === "multifocals" && !isSearchOpen && (
          <>
            {/* Full-width wrapper to center dropdown in viewport */}
            <div
              className="absolute top-[90px] left-0 right-0 flex justify-center px-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              onMouseEnter={() => handleMouseEnter("multifocals")}
              onMouseLeave={handleMouseLeave}
            >
              {/* Main Dropdown Container - centered by flex parent */}
              <div className="w-[95vw] max-w-7xl min-w-0">
                {/* Beige Background Container */}
                <div className="bg-[#F0EBE4] p-4 sm:p-6 rounded-3xl shadow-2xl overflow-visible">
                <div className="w-full mx-auto min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
                    {/* Card 1 - Buying First */}
                    <div
                      className="group flex flex-col cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full bg-[#E94D37] hover:bg-white min-w-0"
                      onClick={() => handleLinkClick("/multifocals/new")}
                    >
                      <div className="p-4 sm:p-6 flex flex-col h-full transition-all duration-300 rounded-lg border-2 border-transparent group-hover:border-red-200 min-w-0">
                        <div className="flex justify-between items-start w-full">
                          {/* Left side - Text content */}
                          <div className="flex-1">
                            <h3
                              className="font-bold leading-tight text-white group-hover:text-[#1F1F1F]"
                              style={{ fontSize: "17px" }}
                            >
                              Buying your first
                              <br />
                              pair of multifocals?
                            </h3>
                            <p className="text-white/90 text-xs sm:text-sm font-medium mt-2 group-hover:text-[#1F1F1F]">
                              We make it easy
                            </p>
                            {/* Button aligned to left with margin on top */}
                            <button className="mt-6 bg-black text-white uppercase text-xs font-bold tracking-wider px-4 sm:px-6 py-3 rounded-full transition-colors duration-200">
                              Get Started
                            </button>
                          </div>

                          {/* Right side - Image/Icon */}
                          <div className="ml-4 flex-shrink-0 relative w-10 h-10 sm:w-12 sm:h-12">
                            <img
                              src="/drop1yellow.png"
                              alt="Icon 1"
                              className="w-full h-full object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                            />
                            <img
                              src="/drop1red.png"
                              alt="Icon 1 hover"
                              className="w-full h-full object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 - Replacing */}
                    <div
                      className="group flex flex-col cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full bg-[#E94D37] hover:bg-white min-w-0"
                      onClick={() => handleLinkClick("/multifocals/replacing")}
                    >
                      <div className="p-4 sm:p-6 flex flex-col h-full transition-all duration-300 rounded-lg border-2 border-transparent group-hover:border-red-200 min-w-0">
                        <div className="flex justify-between items-start w-full">
                          {/* Left side - Text content */}
                          <div className="flex-1">
                            <h3
                              className="font-bold leading-tight text-white group-hover:text-[#1F1F1F]"
                              style={{ fontSize: "17px" }}
                            >
                              Replacing an
                              <br />
                              existing pair?
                            </h3>
                            <p className="text-white/90 text-xs sm:text-sm font-medium mt-2 group-hover:text-[#1F1F1F]">
                              You are in the right place.
                            </p>
                            {/* Button aligned to left with margin on top */}
                            <button className="mt-6 bg-black text-white uppercase text-xs font-bold tracking-wider px-4 sm:px-6 py-3 rounded-full transition-colors duration-200">
                              Get Started
                            </button>
                          </div>

                          {/* Right side - Image/Icon */}
                          <div className="ml-4 flex-shrink-0 relative w-10 h-10 sm:w-12 sm:h-12">
                            <img
                              src="/drop2yellow.png"
                              alt="Icon 2"
                              className="w-full h-full object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                            />
                            <img
                              src="/drop2red.png"
                              alt="Icon 2 hover"
                              className="w-full h-full object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 - Browse */}
                    <div
                      className="group flex flex-col cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full bg-[#E94D37] hover:bg-white min-w-0"
                      onClick={() => handleLinkClick("/glasses")}
                    >
                      <div className="p-4 sm:p-6 flex flex-col h-full transition-all duration-300 rounded-lg border-2 border-transparent group-hover:border-red-200 min-w-0">
                        <div className="flex justify-between items-start w-full">
                          {/* Left side - Text content */}
                          <div className="flex-1">
                            <h3
                              className="font-bold leading-tight text-white group-hover:text-[#1F1F1F]"
                              style={{ fontSize: "17px" }}
                            >
                              Browse our
                              <br />
                              Multifocals
                            </h3>
                            <p className="text-white/90 text-xs sm:text-sm font-medium mt-2 group-hover:text-[#1F1F1F]">
                              We've got you covered
                            </p>
                            {/* Button aligned to left with margin on top */}
                            <button className="mt-6 bg-black text-white uppercase text-xs font-bold tracking-wider px-4 sm:px-6 py-3 rounded-full transition-colors duration-200">
                              Get Started
                            </button>
                          </div>

                          {/* Right side - Image/Icon */}
                          <div className="ml-4 flex-shrink-0 relative w-10 h-10 sm:w-12 sm:h-12">
                            <img
                              src="/drop3yellow.png"
                              alt="Icon 3"
                              className="w-full h-full object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                            />
                            <img
                              src="/drop3red.png"
                              alt="Icon 3 hover"
                              className="w-full h-full object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4 - Style */}
                    <div
                      className="group flex flex-col cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full bg-[#E94D37] hover:bg-white min-w-0"
               onClick={(e) => {
  e.stopPropagation();
  setActiveDropdown(null);
  setIsGetMyFitPopupOpen(true);
}}
                    >
                      <div className="p-4 sm:p-6 flex flex-col h-full transition-all duration-300 rounded-lg border-2 border-transparent group-hover:border-red-200 min-w-0">
                        <div className="flex justify-between items-start w-full">
                          {/* Left side - Text content */}
                          <div className="flex-1">
                            <h3
                              className="font-bold leading-tight text-white group-hover:text-[#1F1F1F]"
                              style={{ fontSize: "17px" }}
                            >
                              1000+ ways to
                              <br />
                              style yourself
                            </h3>
                            <p className="text-white/90 text-xs sm:text-sm font-medium mt-2 group-hover:text-[#1F1F1F]">
                              We've got options
                            </p>
                            {/* Button aligned to left with margin on top */}
                            <button className="mt-6 bg-black text-white uppercase text-xs font-bold tracking-wider px-4 sm:px-6 py-3 rounded-full transition-colors duration-200">
                              Try-MFit
                            </button>
                          </div>

                          {/* Right side - Image/Icon */}
                          <div className="ml-4 flex-shrink-0 relative w-10 h-10 sm:w-12 sm:h-12">
                            <img
                              src="/drop4yellow.png"
                              alt="Icon 4"
                              className="w-full h-full object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                            />
                            <img
                              src="/drop4red.png"
                              alt="Icon 4 hover"
                              className="w-full h-full object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </>
        )}
      </header>

      {/* Search Overlay - Moved outside header for z-index fix */}
      {isSearchOpen && (
        <>
          {/* Mobile Overlay (Original Style) */}
          <div className="lg:hidden fixed inset-0 z-[150] bg-white overflow-y-auto animate-in fade-in duration-200 font-sans pt-[84px]">
            <div className="max-w-[800px] mx-auto px-4 pt-12 pb-12">
              <div className="relative mb-16">
                <label className="block text-xl font-medium text-[#1F1F1F] mb-3">
                  Search
                </label>
                <input
                  type="text"
                  className="w-full text-2xl md:text-4xl font-medium text-[#1F1F1F] border-b border-gray-200 py-4 focus:outline-none focus:border-[#1F1F1F] placeholder:text-gray-300 transition-colors bg-transparent"
                  placeholder="Type to search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Search Results or Trending */}
              {searchQuery.trim() ? (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    RESULTS
                  </h3>
                  {isLoading ? (
                    <div className="py-4 text-gray-500">Loading...</div>
                  ) : filteredProducts.length > 0 ? (
                    <ul className="flex flex-col">
                      {filteredProducts.map((product) => (
                        <li
                          key={product.id}
                          className="py-4 border-b border-gray-100 last:border-0 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="w-16 h-10 flex-shrink-0 bg-gray-50 rounded flex items-center justify-center">
                            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <div className="font-bold text-[#1F1F1F]">{product.name}</div>
                            <div className="text-sm text-gray-500">£{product.price}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-4 text-gray-500">No results found</div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    TRENDING
                  </h3>
                  <ul className="flex flex-col bg-gray-50 rounded-lg overflow-hidden">
                    {TRENDING_SEARCHES.map((item, idx) => (
                      <li
                        key={idx}
                        className="py-4 px-6 border-b border-gray-100 last:border-0 text-[#1F1F1F] font-bold hover:bg-[#F3F0E7] hover:text-[#D96C47] cursor-pointer transition-colors text-sm md:text-base"
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate("/glasses");
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-12 flex justify-center lg:hidden">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="bg-[#F3F0E7] px-8 py-3 rounded-full text-sm font-bold text-[#1F1F1F] border border-gray-200"
                >
                  Close Search
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Overlay (New Style) */}
          <div className="hidden lg:block fixed inset-0 z-[150] bg-white overflow-y-auto animate-in fade-in duration-200 font-sans pt-[120px]">
            <div className="max-w-[700px] mx-auto px-4">
              <div className="relative mb-12 flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full text-2xl md:text-3xl font-medium text-[#1F1F1F] border-b border-gray-200 py-4 focus:outline-none focus:border-[#1F1F1F] placeholder:text-gray-300 transition-colors bg-transparent pr-10"
                    placeholder="Search for..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-black transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div>
                {searchQuery.trim() ? (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      RESULTS
                    </h3>
                    {isLoading ? (
                      <div className="py-4 text-gray-500">Loading...</div>
                    ) : filteredProducts.length > 0 ? (
                      <ul className="flex flex-col">
                        {filteredProducts.map((product) => (
                          <li
                            key={product.id}
                            className="py-3 border-b border-gray-100 last:border-0 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleProductClick(product)}
                          >
                            <div className="w-16 h-10 flex-shrink-0 bg-gray-50 rounded flex items-center justify-center">
                              <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                            </div>
                            <div>
                              <div className="font-medium text-lg text-[#1F1F1F]">{product.name}</div>
                              <div className="text-sm text-gray-500">£{product.price}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-4 text-gray-500">No results found</div>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      TRENDING
                    </h3>
                    <ul className="flex flex-col">
                      {TRENDING_SEARCHES.map((item, idx) => (
                        <li
                          key={idx}
                          className="py-3 border-b border-gray-100 last:border-0 text-[#1F1F1F] font-medium hover:text-[#D96C47] cursor-pointer transition-colors text-base"
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate("/glasses");
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu Side Drawer - Always mounted for smooth animation */}
      <div
        className={`lg:hidden  fixed inset-0 z-40 ${!isMobileMenuOpen ? "pointer-events-none" : ""
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Side Drawer */}
        <div
          className={`fixed top-[120px] left-0 w-full h-[calc(100vh-120px)] bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Search Bar */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-3 pl-10 bg-gray-100 rounded-full bg-[#F0EBE4] border-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                autoFocus={isMobileMenuOpen}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Results (Inline) or Menu Items */}
          {searchQuery.trim() ? (
            <div className="px-4 py-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                RESULTS
              </h3>
              {isLoading ? (
                <div className="py-4 text-gray-500">Loading...</div>
              ) : filteredProducts.length > 0 ? (
                <ul className="flex flex-col">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      className="py-4 border-b border-gray-100 last:border-0 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleProductClick(product);
                        setIsMobileMenuOpen(false); // Close menu on selection
                      }}
                    >
                      <div className="w-16 h-10 flex-shrink-0 bg-gray-50 rounded flex items-center justify-center">
                        <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div>
                        <div className="font-bold text-[#1F1F1F]">{product.name}</div>
                        <div className="text-sm text-gray-500">£{product.price}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-gray-500">No results found</div>
              )}
            </div>
          ) : (
            /* Menu Items */
            <nav className="px-4 py-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
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
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <div
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200 cursor-pointer"
                    onClick={() => handleMobileSubmenuToggle("eyeglasses")}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {/* <svg
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     >
                       <circle cx="12" cy="12" r="3"></circle>
                       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                     </svg> */}
                      <img src="/sidemenus/app-menu-eyeglasses.png" />
                    </div>
                    <span>Glasses</span>
                    <div
                      className={`ml-auto text-gray-400 transition-transform duration-200 ${expandedMobileItem === "eyeglasses" ? "rotate-180" : ""
                        }`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                  {/* Submenu for Eyeglasses */}
                  {expandedMobileItem === "eyeglasses" && (
                    <ul className="ml-6 space-y-1 mt-2 border-l-2 border-gray-200 pl-4">
                      <li>
                        <Link
                          to="/multifocals/new"
                          className="flex items-center gap-2 text-base font-medium text-black hover:bg-gray-100 p-2 rounded transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>Buying Your First Multifocals?</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/multifocals/replacing"
                          className="flex items-center gap-2 text-base font-medium text-black hover:bg-gray-100 p-2 rounded transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>Replacing An Existing Pair?</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/glasses"
                          className="flex items-center gap-2 text-base font-medium text-black hover:bg-gray-100 p-2 rounded transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>Browse Our Multifocals</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/glasses"
                          className="flex items-center gap-2 text-base font-medium text-black hover:bg-gray-100 p-2 rounded transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>1000+ Ways To Style Yourself</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <Link
                    to="/offers"
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {/* <svg
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     >
                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                       <polyline points="22,6 12,13 2,6"></polyline>
                     </svg> */}
                      <img src="/sidemenus/offers.svg" alt="offers-img" className="w-full h-auto" />
                    </div>
                    <span>Offers</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/my-profile"
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {/* <svg
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     >
                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                       <polyline points="22,6 12,13 2,6"></polyline>
                     </svg> */}
                      <img src="/sidemenus/my-dashboard.svg" alt="my-dashboard-img" className="w-full h-auto" />
                    </div>
                    <span>My Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/customer-view"
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {/* <svg
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     >
                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                       <polyline points="22,6 12,13 2,6"></polyline>
                     </svg> */}
                      <img src="/sidemenus/my-perscription.svg" alt="prescriptions-img" className="w-full h-auto" />
                    </div>
                    <span>My Prescriptions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {/* <svg
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     >
                       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                       <circle cx="12" cy="7" r="4"></circle>
                     </svg> */}
                      <img src="/sidemenus/about.svg" alt="about-us-img" className="w-full h-auto" />
                    </div>
                    <span>About us</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsGetMyFitPopupOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200 w-full text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      <i className="fas fa-camera text-lg"></i>
                    </div>
                    <span>MFit</span>
                  </button>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {/* <svg
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     >
                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                       <polyline points="22,6 12,13 2,6"></polyline>
                     </svg> */}
                      <img src="/sidemenus/contact-us.svg" alt="contact-us-img" className="w-full h-auto" />
                    </div>
                    <span>Contact Us</span>
                  </Link>
                </li>
                {/* <li>
                 <Link
                   to="/wishlist"
                   className="flex items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                    
                     <img src="/sidemenus/my-favorits.svg" alt="favorites-img" className="w-full h-auto"/>
                   </div>
                   <span>My Favorites</span>
                 </Link>
               </li> */}

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex w-full text-left items-center gap-3 text-lg font-medium text-black hover:bg-gray-100 p-3 rounded-lg transition-all duration-200 border-b border-gray-200"
                  >
                    {/* <i className="fa-solid fa-lock w-5 text-center"></i>{" "}
                    */}
                    <img src="/sidemenus/logout.svg" alt="logout-img" className="w-5 h-5" />
                    LogOut
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Floating MFit Button for Mobile */}
      {!isGetMyFitPopupOpen && (
        <button
          onClick={() => setIsGetMyFitPopupOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#E94D37] text-white rounded-full flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(233,77,55,0.4)] z-[40] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 group animate-bounce-slow"
        >
          <div className="relative">
            <svg
              className="w-10 h-auto transition-transform group-hover:rotate-12"
              viewBox="0 0 46 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M46 2.09996C42.18 2.31792 39.0943 0.035123 34.8499 0.000709066C32.6244 -0.0222336 30.0893 0.505447 26.9576 2.47851C26.0399 1.60669 19.9601 1.60669 19.0424 2.47851C15.9107 0.505447 13.3756 -0.0222336 11.1501 0.000709066C6.90574 0.035123 3.80848 2.31792 0 2.09996V5.95433C1.53716 6.00021 1.8813 6.18375 2.01895 7.26206C3.98055 22.1518 20.7057 18.9284 20.809 6.47053C17.012 2.89148 28.9651 2.89148 25.1796 6.47053C25.2828 18.9284 42.008 22.1404 43.9696 7.26206C44.1187 6.17228 44.4514 6.00021 45.9885 5.95433V2.09996H46ZM1.35362 3.88949C1.5601 3.88949 1.73217 4.06156 1.73217 4.26804C1.73217 4.47452 1.5601 4.64659 1.35362 4.64659C1.14713 4.64659 0.975062 4.47452 0.975062 4.26804C0.975062 4.06156 1.14713 3.88949 1.35362 3.88949ZM44.6349 3.88949C44.4284 3.88949 44.2564 4.06156 44.2564 4.26804C44.2564 4.47452 44.4284 4.64659 44.6349 4.64659C44.8414 4.64659 45.0135 4.47452 45.0135 4.26804C45.0135 4.06156 44.8414 3.88949 44.6349 3.88949ZM34.6549 1.27403C38.8878 1.27403 42.3177 3.44211 42.3177 7.48001C42.3177 11.5179 38.8878 15.9458 34.6549 15.9458C32.2459 15.9458 29.9057 14.6611 28.5062 12.6765C27.4394 11.1738 26.992 9.22365 26.992 7.48001C26.992 3.44211 30.4219 1.27403 34.6549 1.27403ZM11.3337 1.27403C7.10075 1.27403 3.67082 3.44211 3.67082 7.48001C3.67082 11.5179 7.10075 15.9458 11.3337 15.9458C13.7426 15.9458 16.0828 14.6611 17.4823 12.6765C18.5491 11.1738 18.9965 9.22365 18.9965 7.48001C18.9965 3.44211 15.5666 1.27403 11.3337 1.27403Z"
                fill="currentColor"
              ></path>
            </svg>
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F3CB0A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F3CB0A]"></span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter leading-none italic">
            MFit
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      <CustomerCartView
        open={isCartOpen}
        close={() => setIsCartOpen(false)}
        carts={cartItems}
        refetch={fetchCart}
      />

      {/* Edit Profile Modal */}
      <EditProfile
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Login Modal - Step 1 */}
      <LoginModal
        open={isLoginModalOpen}
        initialEmail={authEmail}
        onClose={() => setIsLoginModalOpen(false)}
        onNext={handleLoginNext}
      />

      {/* SignUp Modal - Step 2 (Complete Account) */}
      <SignUpModal
        open={isSignUpOpen}
        setOpen={setIsSignUpOpen}
        onHide={() => setIsSignUpOpen(false)}
        initialEmail={authEmail}
        onSwitchToLogin={handleSwitchToLogin}
        withAuthBackground={true}
      />

      {/* MFit / Camera Modal */}
      <GetMyFitModal
        open={isGetMyFitOpen}
        onClose={() => setIsGetMyFitOpen(false)}
      />

  <GetMyFitPopup
  open={isGetMyFitPopupOpen}
  onClose={() => setIsGetMyFitPopupOpen(false)}
/>

    </>
    
  );
};