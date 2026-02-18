import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Share2, ArrowLeft } from "lucide-react";
import { GetMyFitModal } from "../components/GetMyFitModal";
import { ChatWidget } from "../components/ChatWidget";
import { getProductDetails, addRecentlyViewed } from "../api/retailerApis";
import RecommendedProducts from "../components/RecommendedProducts";
import {
  getProductById,
  getProductBySku,
  getAllProducts,
} from "../api/retailerApis";
import { getHexColorsFromNames } from "../utils/colorNameToHex";
import { useIsMobile } from "@/hooks/useMobile";
import { useCaptureData } from "@/contexts/CaptureContext";
import { VtoProductOverlay } from "@/components/VtoProductOverlay";
import { getCaptureSession } from "@/utils/captureSession";
import { saveProduct } from "@/utils/productFlowStorage";
import { trackViewItem } from "@/utils/analytics";

interface ColorVariant {
  id: string;
  frameColor: string;
  lensColor: string;
  skuid: string;
  brandAlias: string;
  gender: string;
  styleAlias: string;
  shape: string;
  brand: string;
  detail_url: string;
}

interface Product {
  name: string;
  price: string | number;
  description: string;
  features: string[];
  colors: string[] | ColorVariant[]; // Support both for backward compatibility/mock
  color_names?: string[];
  image: string;
  images: string[];
  sizes: string[];
  dimensions?: string;
  skuid?: string;
  id?: string | number;
  brand?: string;
  naming_system?: string;
  style?: string;
  gender?: string;
  material?: string;
  shape?: string;
  lens_guide?: string;
  shipping_info?: string;
  variants?: any[];
}

const AccordionItem = ({
  title,
  children,
  isOpen,
  onClick,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) => {
  const ACCORDION_PANEL_MAX = 320;
  return (
    <div
      className="border-b border-gray-200 overflow-hidden min-w-0 isolate"
      style={{ contain: "layout paint" }}
    >
      <button
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none group min-w-0"
        onClick={onClick}
      >
        <span className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider group-hover:text-[#D96C47] transition-colors truncate pr-2">
          {title}
        </span>
        <span
          className={`flex-shrink-0 transform transition-transform duration-200 text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M1 1L5 5L9 1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {/* Fixed-height scroll box when open — no transition on height to avoid layout break */}
      <div
        className={
          isOpen
            ? "overflow-hidden opacity-100 pb-4"
            : "max-h-0 overflow-hidden opacity-0 pb-0"
        }
        style={isOpen ? { maxHeight: ACCORDION_PANEL_MAX } : undefined}
      >
        <div
          className="text-sm text-gray-600 leading-relaxed min-w-0 w-full overflow-y-auto overflow-x-hidden break-words pr-1"
          style={{ maxHeight: isOpen ? ACCORDION_PANEL_MAX - 16 : undefined }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { state } = location;
  const { capturedData, setCapturedData } = useCaptureData();
  const [product, setProduct] = useState<Product | null>(null);

  // Restore MFit capture from session so VTO box shows same image and alignment as on /glasses
  useEffect(() => {
    const session = getCaptureSession();
    if (!session) return;
    // Always prefer session when it contains a cropped preview (keeps product page thumb consistent)
    if (!capturedData) {
      setCapturedData(session);
      return;
    }
    // Merge session data: croppedPreviewDataUrl and frameAdjustments so /glasses alignment shows on product page and share
    const updates: Partial<typeof capturedData> = {};
    if (
      session.croppedPreviewDataUrl &&
      session.croppedPreviewDataUrl !== capturedData.croppedPreviewDataUrl
    ) {
      updates.croppedPreviewDataUrl = session.croppedPreviewDataUrl;
    }
    if (
      session.frameAdjustments &&
      JSON.stringify(session.frameAdjustments) !==
        JSON.stringify(capturedData.frameAdjustments)
    ) {
      updates.frameAdjustments = session.frameAdjustments;
    }
    if (Object.keys(updates).length > 0) {
      setCapturedData({ ...capturedData, ...updates });
    }
  }, [capturedData, setCapturedData]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0); // Track the index of selected color
  const [error, setError] = useState<string | null>(null);
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [isInitialButtonVisible, setIsInitialButtonVisible] = useState(true);
  const [showGetMyFitButton, setShowGetMyFitButton] = useState(true);
  const [vtoModalOpen, setVtoModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const initialButtonRef = useRef<HTMLDivElement>(null);
  const stickyButtonRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const fourthImageRef = useRef<HTMLDivElement>(null);
  const recommendedSectionRef = useRef<HTMLDivElement>(null);
  const [vtoThumbHidden, setVtoThumbHidden] = useState(false); // hide VTO when user scrolls to Recommended
  const scrollThreshold = 100; // How many pixels to scroll before showing sticky button
  const topThreshold = 50; // How close to top to show initial button

  // Hide VTO as soon as user scrolls to RECOMMENDED FOR YOU. Fixed at bottom only till image section.
  useEffect(() => {
    const el = recommendedSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVtoThumbHidden(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ensure the VTO modal is closed if the user navigates away from this exact product path.
  useEffect(() => {
    const productPath = id ? `/product/${id}` : null;
    if (productPath && location.pathname !== productPath && vtoModalOpen) {
      setVtoModalOpen(false);
    }
  }, [location.pathname, id, vtoModalOpen]);

  const handleFitComplete = (data: any) => {
    if (data.image) {
      setUserImage(data.image);
    }
  };

  // Auto slide functionality
  useEffect(() => {
    if (product && product.images && product.images.length > 1) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === (product.images.length || 0) - 1 ? 0 : prev + 1
        );
      }, 5000); // Auto slide every 5 seconds
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [product?.images]);

  // GA4 + Meta: Track product view once per product (avoid duplicate ViewContent from re-renders / Strict Mode)
  const viewItemTrackedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product) return;
    const productId = product.skuid ?? String(product.id ?? "");
    if (!productId || viewItemTrackedRef.current === productId) return;
    viewItemTrackedRef.current = productId;
    trackViewItem(product);
  }, [product]);

  // Manual slide controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !product || !product.images) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }

    if (isRightSwipe) {
      setCurrentSlide((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }

    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Scroll handler for sticky button visibility and MFit button
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Show sticky button when user scrolls down past threshold
          if (scrollPosition > scrollThreshold) {
            setIsStickyVisible(true);
            setIsInitialButtonVisible(false);
          }
          // Show initial button and hide sticky when near top
          else if (scrollPosition <= topThreshold) {
            setIsInitialButtonVisible(true);
            setIsStickyVisible(false);
          }

          // Check if MFit button should be hidden based on 4th image position
          if (fourthImageRef.current) {
            const fourthImageRect =
              fourthImageRef.current.getBoundingClientRect();
            const fourthImageBottom = fourthImageRect.bottom + scrollPosition;
            const buttonOffset = scrollPosition + window.innerHeight - 150; // Threshold for when to hide button

            // Hide button when it goes past end of 4th image
            if (buttonOffset >= fourthImageBottom - 150) {
              setShowGetMyFitButton(false);
            } else {
              setShowGetMyFitButton(true);
            }
          }

          lastScrollY = scrollPosition;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("ProductPage mounted, ID:", id);
    window.scrollTo(0, 0);

    if (id) {
      addRecentlyViewed(id).catch((err: any) =>
        console.error("Failed to add to recently viewed", err)
      );
    }

    const initializeProduct = async () => {
      let initialProduct: Product | null = null;
      let initialImages: string[] = [];
      let skuid = id;

      if (state?.product) {
        const p = state.product;
        initialImages =
          p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];

        // Deduplicate colors
        let uniqueColors: any[] = [];
        if (p.colors && p.colors.length > 0) {
          if (typeof p.colors[0] === "string") {
            uniqueColors = Array.from(new Set(p.colors));
          } else {
            uniqueColors = p.colors;
          }
        } else if (p.variants && p.variants.length > 0) {
          uniqueColors = p.variants;
        }

        initialProduct = {
          name: p.name || "",
          price: typeof p.price === "number" ? `£${p.price}` : p.price || "",
          description: p.description || "",
          features:
            typeof p.features === "string"
              ? (console.log("Parsing features string:", p.features),
                p.features
                  .split(",")
                  .map((f: string) => f.trim())
                  .filter((f: string) => f.length > 0))
              : (console.log("Features is array or other:", p.features),
                Array.isArray(p.features) ? p.features : []),
          image: p.image || "",
          images: initialImages,
          colors: uniqueColors,
          sizes: p.sizes || (p.size ? [p.size] : []),
          dimensions: p.dimensions || "",
          skuid: p.skuid || id,
          id: p.id || id,
          brand: p.brand || "",
          naming_system: (() => {
            let ns = p.naming_system || "";
            if (ns) {
              const parts = ns.split('.');
              if (parts.length > 3) {
                return parts.slice(0, 3).join('.');
              }
            }
            return ns;
          })(),
          style: p.style || "",
          gender: p.gender || "",
          material: p.material || "",
          shape: p.shape || "",
          lens_guide: p.lens_guide,
          shipping_info: p.shipping_info,
        };

        console.log("Initial product features:", initialProduct.features);

        // Setup initial color if available
        if (uniqueColors && uniqueColors.length > 0) {
          const first = uniqueColors[0];
          const colorHex = typeof first === "string"
            ? getHexColorsFromNames([first])[0] || first
            : getHexColorsFromNames([first.frameColor])[0] || first.frameColor;
          setSelectedColor(colorHex);
          setSelectedColorIndex(0); // Set initial index
        }
      } else {
        try {
          // Try to fetch from API
          let apiProduct = null;
          try {
            const response = await getProductById(id!);
            if (response.data && response.data.data) {
              apiProduct = response.data.data;
            } else if (response.data) {
              apiProduct = response.data;
            }
          } catch (err) {
            // Try by SKU
            try {
              const skuRes = await getProductBySku(id!);
              if (skuRes.data && skuRes.data.data) {
                apiProduct = skuRes.data.data;
              } else if (skuRes.data) {
                apiProduct = skuRes.data;
              }
            } catch (skuErr) {
              console.error("Product not found by ID or SKU:", id);
              setError("Product not found");
              return; // Exit if initial load fails
            }
          }

          if (apiProduct) {
            const p = apiProduct;
            initialImages =
              p.images && p.images.length > 0
                ? p.images
                : p.image
                ? [p.image]
                : [];
            let uniqueColors: any[] = [];

            if (p.colors && p.colors.length > 0) {
              if (typeof p.colors[0] === "string")
                uniqueColors = Array.from(new Set(p.colors));
              else uniqueColors = p.colors;
            } else if (p.variants && p.variants.length > 0) {
              uniqueColors = p.variants;
            }

            // Map to ensure frameColor is present if missing (backwards compat)
            uniqueColors = uniqueColors.map((c: any) => {
              if (
                typeof c !== "string" &&
                !c.frameColor &&
                c.color_names &&
                c.color_names.length > 0
              ) {
                return { ...c, frameColor: c.color_names[0] };
              }
              return c;
            });

            initialProduct = {
              ...p,
              naming_system: (() => {
                let ns = p.naming_system || "";
                if (ns) {
                  const parts = ns.split('.');
                  if (parts.length > 3) {
                    return parts.slice(0, 3).join('.');
                  }
                }
                return ns;
              })(),
              images: initialImages,
              colors: uniqueColors,
              price: typeof p.price === "number" ? `£${p.price}` : p.price,
              sizes: p.sizes || (p.size ? [p.size] : []),
              dimensions: p.dimensions || "",
              features:
                typeof p.features === "string"
                  ? p.features
                      .split(",")
                      .map((f: string) => f.trim())
                      .filter((f: string) => f.length > 0)
                  : Array.isArray(p.features)
                  ? p.features
                  : [],
              lens_guide: p.lens_guide,
              shipping_info: p.shipping_info,
            };
            skuid = p.skuid || id;

            if (uniqueColors && uniqueColors.length > 0) {
              const first = uniqueColors[0];
              const colorHex = typeof first === "string"
                ? getHexColorsFromNames([first])[0] || first
                : getHexColorsFromNames([first.frameColor])[0] ||
                    first.frameColor;
              setSelectedColor(colorHex);
              setSelectedColorIndex(0); // Set initial index
            }
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Error loading product");
          return;
        }
      }

      setProduct(initialProduct);
      (window as any).__PRODUCT_DEBUG__ = initialProduct;
      if (id && initialProduct) saveProduct(id, initialProduct as any);
      console.log("Product set in state, features:", initialProduct.features);
      if (initialImages.length > 0) setActiveImage(initialImages[0]);

      // Fetch fresh data from backend
      try {
        const freshSku = skuid || id;
        if (freshSku) {
          const response: any = await getProductDetails(freshSku, null, null);
          if (response?.data?.status && response?.data?.data) {
            const fetchedProduct = response.data.data;
            const fetchedImages =
              fetchedProduct.images && fetchedProduct.images.length > 0
                ? fetchedProduct.images
                : fetchedProduct.image
                ? [fetchedProduct.image]
                : initialImages;

            let uniqueColors: any[] = [];
            if (fetchedProduct.color && fetchedProduct.color.length > 0) {
              uniqueColors = fetchedProduct.color;
            } else if (
              fetchedProduct.colors &&
              fetchedProduct.colors.length > 0
            ) {
              if (typeof fetchedProduct.colors[0] === "string")
                uniqueColors = Array.from(new Set(fetchedProduct.colors));
              else uniqueColors = fetchedProduct.colors;
            } else if (
              fetchedProduct.variants &&
              fetchedProduct.variants.length > 0
            ) {
              uniqueColors = fetchedProduct.variants;
            }

            console.log("Unique Colors (Fresh):", uniqueColors);

            uniqueColors = uniqueColors.map((c: any) => {
              if (
                typeof c !== "string" &&
                !c.frameColor &&
                c.color_names &&
                c.color_names.length > 0
              ) {
                return { ...c, frameColor: c.color_names[0] };
              }
              return c;
            });

            // Logic to update selected color based on variant match (same as before)
            let currentVariantColor = "";
            if (
              uniqueColors.length > 0 &&
              typeof uniqueColors[0] !== "string"
            ) {
              const currentVariant = uniqueColors.find(
                (v: ColorVariant) => v.skuid === freshSku
              );
              if (currentVariant) {
                currentVariantColor = getHexColorsFromNames([
                  currentVariant.frameColor,
                ])[0];
              }
            }
            // Fallback logic
            if (!currentVariantColor && fetchedProduct.framecolor) {
              currentVariantColor = getHexColorsFromNames([
                fetchedProduct.framecolor,
              ])[0];
            }

            if (currentVariantColor) {
              setSelectedColor(currentVariantColor);
              // Find the index of the current variant
              const currentVariantIndex = uniqueColors.findIndex(
                (v: ColorVariant) => v.skuid === freshSku
              );
              setSelectedColorIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
            } else if (!selectedColor && uniqueColors.length > 0) {
              const first = uniqueColors[0];
              const colorHex = typeof first === "string"
                ? getHexColorsFromNames([first])[0]
                : getHexColorsFromNames([first.frameColor])[0];
              setSelectedColor(colorHex);
              setSelectedColorIndex(0);
            }

            console.log(
              "Fetched product features (raw):",
              fetchedProduct.features,
              "type:",
              typeof fetchedProduct.features
            );

            setProduct((prev: any) => {
              // Truncate naming_system
              let processedNamingSystem = fetchedProduct.naming_system || prev?.naming_system;
              if (processedNamingSystem) {
                const parts = processedNamingSystem.split('.');
                if (parts.length > 3) {
                  processedNamingSystem = parts.slice(0, 3).join('.');
                }
              }

              const updatedProduct = {
                ...(prev || {}),
                ...fetchedProduct,
                naming_system: processedNamingSystem,
                images:
                  fetchedImages.length > 1
                    ? fetchedImages
                    : fetchedImages.length > 0
                    ? fetchedImages
                    : prev?.images || [],
                colors:
                  uniqueColors.length > 0 ? uniqueColors : prev?.colors || [],
                price:
                  typeof fetchedProduct.price === "number"
                    ? `£${fetchedProduct.price}`
                    : fetchedProduct.price || prev?.price,
                features:
                  typeof fetchedProduct.features === "string"
                    ? fetchedProduct.features
                        .split(",")
                        .map((f: string) => f.trim())
                        .filter((f: string) => f.length > 0)
                    : Array.isArray(fetchedProduct.features)
                    ? fetchedProduct.features
                    : prev?.features || [],
                lens_guide: fetchedProduct.lens_guide || prev?.lens_guide,
                shipping_info:
                  fetchedProduct.shipping_info || prev?.shipping_info,
              };
              console.log(
                "Updated product features after fetch:",
                updatedProduct.features
              );
              (window as any).__PRODUCT_DEBUG__ = updatedProduct;
              return updatedProduct;
            });

            if (
              fetchedImages.length > 0 &&
              (!activeImage || activeImage === initialImages[0])
            ) {
              setActiveImage(fetchedImages[0]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch fresh product details", error);
        // Do not overwrite error if we already displayed content
      } finally {
        // Fetch all products for recommendations if we have a valid product
        if (id) {
          getAllProducts({ limit: 50 })
            .then((res) => {
              // Fetch enough for good recommendations
              const products = res.data?.products || res.data?.data || [];
              if (products.length > 0) {
                setAllProducts(products);
              }
            })
            .catch((err) =>
              console.error("Failed to fetch recommendation pool", err)
            );
        }
      }
    };

    initializeProduct();
  }, [id, state?.product]);

  // Persist product to session flow (per product) so downstream steps can restore it
  useEffect(() => {
    if (id && product) saveProduct(id, product as any);
  }, [id, product]);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleBuyNow = () => {
    // Start configuration flow: Frame Selected -> Select Prescription Type
    navigate(`/product/${id}/select-prescription-type`, {
      state: { product: state?.product || product },
    });
  };

  const handleSelectPdOption = () => {
    navigate(`/product/${id}/select-prescription-source`, {
      state: { product: state?.product || product },
    });
  };

  const productShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${id}`
      : "";
  const productTitle =
    product && ((product as any).naming_system || product.skuid || product.name);

  const handleCopyLink = async () => {
    if (!productShareUrl) return;
    try {
      await navigator.clipboard.writeText(productShareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (_) {}
  };

  const handleShare = async () => {
    if (!productShareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle || "Product",
          url: productShareUrl,
          text: productTitle || "",
        });
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    // Reset auto slide timer when manually clicking
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    }
  };

  const handleColorClick = (colorItem: string | ColorVariant, index: number) => {
    if (typeof colorItem === "string") {
      const hex = getHexColorsFromNames([colorItem])[0] || colorItem;
      setSelectedColor(hex);
      setSelectedColorIndex(index); // Update the selected index
    } else {
      // It's a variant, navigate to it
      const hex = getHexColorsFromNames([colorItem.frameColor])[0];
      setSelectedColor(hex);
      setSelectedColorIndex(index); // Update the selected index
      if (colorItem.skuid !== id) {
        navigate(`/product/${colorItem.skuid}`);
      }
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Mobile View */}
      <div className="block lg:hidden">
        {/* Image Slider for Mobile - Full Width */}
        <div
          className="relative w-full h-[42vh] overflow-hidden bg-white "
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Back button - mobile: go to /glasses */}
          <button
            type="button"
            onClick={() => navigate("/glasses")}
            className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#1F1F1F]"
            aria-label="Go back to glasses"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {product.images && product.images.length > 0 ? (
            <>
              {/* Slides Container */}
              <div
                className="flex transition-transform duration-500 ease-in-out h-[50vh] "
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="w-full flex-shrink-0 relative">
                    {idx === 0 && userImage && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={userImage}
                          alt="My Fit"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <img
                      src={img}
                      alt={`${product.name} - View ${idx + 1}`}
                      className={`w-full h-full object-contain ${
                        idx === 0 && userImage
                          ? "relative z-10 mix-blend-multiply"
                          : "mix-blend-multiply"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Slide Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSlideClick(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? "bg-black w-6" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          )}

          {/* MFit Button for Mobile */}
          {/* <div className="absolute bottom-1 right-0  z-20">
            <button
              onClick={() => setIsGetMyFitOpen(true)}
              className="bg-white text-[#1F1F1F] px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border border-gray-100 group"
            >
              <span className="text-xs font-bold uppercase tracking-widest group-hover:text-[#D96C47] transition-colors">
                MFit
              </span>
              <svg width="36" height="14" viewBox="0 0 46 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M46 2.09996C42.18 2.31792 39.0943 0.035123 34.8499 0.000709066C32.6244 -0.0222336 30.0893 0.505447 26.9576 2.47851C26.0399 1.60669 19.9601 1.60669 19.0424 2.47851C15.9107 0.505447 13.3756 -0.0222336 11.1501 0.000709066C6.90574 0.035123 3.80848 2.31792 0 2.09996V5.95433C1.53716 6.00021 1.8813 6.18375 2.01895 7.26206C3.98055 22.1518 20.7057 18.9284 20.809 6.47053C17.012 2.89148 28.9651 2.89148 25.1796 6.47053C25.2828 18.9284 42.008 22.1404 43.9696 7.26206C44.1187 6.17228 44.4514 6.00021 45.9885 5.95433V2.09996H46ZM1.35362 3.88949C1.5601 3.88949 1.73217 4.06156 1.73217 4.26804C1.73217 4.47452 1.5601 4.64659 1.35362 4.64659C1.14713 4.64659 0.975062 4.47452 0.975062 4.26804C0.975062 4.06156 1.14713 3.88949 1.35362 3.88949ZM44.6349 3.88949C44.4284 3.88949 44.2564 4.06156 44.2564 4.26804C44.2564 4.47452 44.4284 4.64659 44.6349 4.64659C44.8414 4.64659 45.0135 4.47452 45.0135 4.26804C45.0135 4.06156 44.8414 3.88949 44.6349 3.88949ZM34.6549 1.27403C38.8878 1.27403 42.3177 3.44211 42.3177 7.48001C42.3177 11.5179 38.8878 15.9458 34.6549 15.9458C32.2459 15.9458 29.9057 14.6611 28.5062 12.6765C27.4394 11.1738 26.992 9.22365 26.992 7.48001C26.992 3.44211 30.4219 1.27403 34.6549 1.27403ZM11.3337 1.27403C7.10075 1.27403 3.67082 3.44211 3.67082 7.48001C3.67082 11.5179 7.10075 15.9458 11.3337 15.9458C13.7426 15.9458 16.0828 14.6611 17.4823 12.6765C18.5491 11.1738 18.9965 9.22365 18.9965 7.48001C18.9965 3.44211 15.5666 1.27403 11.3337 1.27403Z" fill="#232320"></path>
              </svg>
            </button>
          </div> */}
        </div>

        {/* Product Details for Mobile */}
        <div ref={detailsRef} className="p-6 bg-white">
          {/* Product Name and Price */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <h1 className="text-xl font-normal text-[#1F1F1F] tracking-tight flex-1 mr-4">
                {product.naming_system}
              </h1>
              <span className="text-xl font-normal text-[#1F1F1F] whitespace-nowrap">
                {product.price}
              </span>
            </div>
          </div>

          {/* Initial Buy Now Button - Visible when at top */}
          <div
            ref={initialButtonRef}
            className={`transition-all duration-500 mb-6 ${
              isInitialButtonVisible
                ? "opacity-100 max-h-32"
                : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            <div className="flex items-stretch gap-2">
              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-0 bg-[#2D2D2D] text-white py-3 rounded-full font-[500] text-sm uppercase tracking-wider transition-all hover:bg-black"
              >
                SELECT MULTIFOCAL LENS & BUY NOW
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#1F1F1F] hover:bg-gray-50 items-center justify-center transition-colors"
                title={linkCopied ? "Copied!" : "Share"}
                aria-label={linkCopied ? "Copied!" : "Share"}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Color Selection - Responsive Layout */}
          <div className="mb-2 pb-4 border-b border-gray-200">
            <div className="mb-3">
              <span className="text-xs tex-red-300 font-normal text-[#8B7355] uppercase tracking-wide block mb-2">
                COLOR
              </span>
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {product.colors &&
                  product.colors.map(
                    (colorItem: string | ColorVariant, idx: number) => {
                      const isString = typeof colorItem === "string";
                      const colorVal = isString
                        ? (colorItem as string)
                        : (colorItem as ColorVariant).frameColor;

                      const colorHex =
                        getHexColorsFromNames([colorVal])[0] || colorVal;

                      const isLightColor =
                        [
                          "#ffffff",
                          "#fff",
                          "white",
                          "cream",
                          "#f5f5dc",
                          "#fafafa",
                        ].includes(colorHex.toLowerCase()) ||
                        colorHex.toLowerCase() === "#ffffff";

                      const isSelected = selectedColorIndex === idx; // Check if this color is selected by index

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-1"
                        >
                          <button
                            onClick={() => handleColorClick(colorItem, idx)}
                            className={`w-8 h-8 rounded-full transition-all duration-200 flex-shrink-0 ${
                              isLightColor ? "border border-gray-200" : ""
                            } ${
                              isSelected
                                ? "ring-2 ring-[#1F1F1F] ring-offset-2"
                                : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                            }`}
                            style={{ backgroundColor: colorHex }}
                            aria-label={`Select color ${colorVal}`}
                          />
                          <span className="text-[10px] text-gray-600 font-medium max-w-[60px] text-center leading-tight">
                            {colorVal}
                          </span>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          </div>

          {/* Accordions: contained so toggling open never breaks layout or overflows */}
          <div
            className="mb-6 min-h-0 overflow-hidden flex-shrink-0"
            style={{ contain: "layout paint" }}
          >
            {/* <AccordionItem
              title="FEATURES"
              isOpen={openAccordion === "FEATURES"}
              onClick={() => toggleAccordion("FEATURES")}
            >
              <ul className="list-disc pl-4 space-y-2 text-sm text-gray-600">
                {product.features?.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </AccordionItem> */}

            <AccordionItem
              title="DESCRIPTION"
              isOpen={openAccordion === "DESCRIPTION"}
              onClick={() => toggleAccordion("DESCRIPTION")}
            >
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </AccordionItem>

            <AccordionItem
              title="SIZES"
              isOpen={openAccordion === "SIZES"}
              onClick={() => toggleAccordion("SIZES")}
            >
              <div className="space-y-3">
                {product.sizes && product.sizes.length > 0 && (
                  <ul className="list-none space-y-2 text-sm text-gray-600">
                    {product.sizes.map((size: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {size}
                      </li>
                    ))}
                  </ul>
                )}
                {(product as any).dimensions && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Frame Dimensions:
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      {(product as any).dimensions}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Lens Width - Bridge - Temple - Height in mm)
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/size-guide");
                }}
                className="text-xs font-bold text-[#D96C47] hover:underline uppercase tracking-wider flex items-center gap-1 mt-3"
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Size Guide
              </button>
            </AccordionItem>

            <AccordionItem
              title="LENSE GUIDE"
              isOpen={openAccordion === "LENSE GUIDE"}
              onClick={() => toggleAccordion("LENSE GUIDE")}
            >
              <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                <p>
                  <span className="font-bold text-[#1F1F1F]">
                    Not just lenses. Life upgrades.
                  </span>
                  <br />
                  Multifocal lenses aren't one-size-fits-all. Whether you're
                  reading recipes, running meetings, or road-tripping on
                  weekends — right lens makes all the difference.
                </p>

                <p>
                  We make choosing easy — every frame comes with a Thin 1.6
                  Index lens, Anti-Reflective coating, Anti-Scratch coating, and
                  UV protection at no extra cost.
                </p>

                <p>
                  We break it down simply, so you get what works best for your
                  eyes, your lifestyle, and your frame.
                </p>

                <div>
                  <p className="font-semibold text-[#1F1F1F] mb-2">
                    Explore your options:
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <span className="font-medium text-[#1F1F1F]">
                        Standard
                      </span>{" "}
                      – For calmer days and cozy reads
                    </li>
                    <li>
                      <span className="font-medium text-[#1F1F1F]">
                        Advanced
                      </span>{" "}
                      – For first-timers on the go
                    </li>
                    <li>
                      <span className="font-medium text-[#1F1F1F]">
                        Precision+
                      </span>{" "}
                      – For living life to the fullest
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem
              title="SHIPPING & RETURNS"
              isOpen={openAccordion === "SHIPPING"}
              onClick={() => toggleAccordion("SHIPPING")}
            >
              <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                <p>
                  <span className="font-bold text-[#1F1F1F]">
                    Free delivery. Easy returns.
                  </span>
                  <br />
                  We ship your glasses for free — expect them in 7–12 working
                  days.
                </p>

                <p>
                  Not quite right? You've got 30 days to return or refund. No
                  questions asked.
                </p>
              </div>
            </AccordionItem>
            <AccordionItem
              title="DETAILS"
              isOpen={openAccordion === "DETAILS"}
              onClick={() => toggleAccordion("DETAILS")}
            >
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </AccordionItem>
          </div>
        </div>

        {/* Padding for fixed footer */}
      </div>

      {/* Mobile Fixed Footer */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 lg:hidden transition-transform duration-300 ${
          isStickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-stretch gap-2 mb-3">
          <button
            onClick={handleBuyNow}
            className="flex-1 min-w-0 bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:bg-black shadow-md"
          >
            SELECT MULTIFOCAL LENS & BUY NOW
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#1F1F1F] hover:bg-gray-50 flex items-center justify-center transition-colors"
            title={linkCopied ? "Copied!" : "Share"}
            aria-label={linkCopied ? "Copied!" : "Share"}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-center font-bold text-[#4A90A4] tracking-wide">
          Buy Now Pay Later with Afterpay/Clearpay/Klarna
        </p>
      </div>

      {/* Desktop View - Unchanged */}
      <div className="hidden lg:flex flex-col lg:flex-row h-full min-h-screen items-start">
        {/* Left Column: Image Stack — main product images; small VTO preview when user has MFit */}
        <div className="lg:w-1/2 bg-white relative flex flex-col mt-24">
          {/* Back button - go to /glasses (desktop) */}
          <button
            type="button"
            onClick={() => navigate("/glasses")}
            className="absolute top-6 left-6 z-30 flex items-center gap-2 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm px-4 py-2.5 text-sm font-medium text-[#1F1F1F]"
            aria-label="Go back to glasses"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="w-full max-w-full flex flex-col gap-[1px] relative">
            {product.images && product.images.length > 0 ? (
              product.images.slice(0, 4).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="relative w-full"
                  ref={idx === 3 ? fourthImageRef : null}
                >
                  {idx === 0 && userImage && !capturedData && (
                    <div className="absolute inset-0 z-0 aspect-[4/3]">
                      <img
                        src={userImage}
                        alt="My Fit"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <img
                    src={img}
                    alt={`${product.name} - View ${idx + 1}`}
                    className={`w-full h-auto object-contain ${
                      idx === 0 && userImage && !capturedData
                        ? "relative z-10 mix-blend-multiply aspect-[4/3]"
                        : "mix-blend-multiply"
                    }`}
                  />
                </div>
              ))
            ) : (
              <div className="relative w-full aspect-[4/3]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-2xl mix-blend-multiply"
                />
              </div>
            )}
          </div>


          {/* MFit Button */}
          {/* {showGetMyFitButton && (
            <div className="w-full flex justify-end mt-8 pr-20 z-20 sticky bottom-40 pb-8">
              <button
                onClick={() => setIsGetMyFitOpen(true)}
                className="bg-white text-[#1F1F1F] px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 border border-gray-100 group"
              >
                <span className="text-xs font-bold uppercase tracking-widest group-hover:text-[#D96C47] transition-colors pt-3 pb-3">
                  MFit
                </span>
                <svg width="46" height="18" viewBox="0 0 46 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M46 2.09996C42.18 2.31792 39.0943 0.035123 34.8499 0.000709066C32.6244 -0.0222336 30.0893 0.505447 26.9576 2.47851C26.0399 1.60669 19.9601 1.60669 19.0424 2.47851C15.9107 0.505447 13.3756 -0.0222336 11.1501 0.000709066C6.90574 0.035123 3.80848 2.31792 0 2.09996V5.95433C1.53716 6.00021 1.8813 6.18375 2.01895 7.26206C3.98055 22.1518 20.7057 18.9284 20.809 6.47053C17.012 2.89148 28.9651 2.89148 25.1796 6.47053C25.2828 18.9284 42.008 22.1404 43.9696 7.26206C44.1187 6.17228 44.4514 6.00021 45.9885 5.95433V2.09996H46ZM1.35362 3.88949C1.5601 3.88949 1.73217 4.06156 1.73217 4.26804C1.73217 4.47452 1.5601 4.64659 1.35362 4.64659C1.14713 4.64659 0.975062 4.47452 0.975062 4.26804C0.975062 4.06156 1.14713 3.88949 1.35362 3.88949ZM44.6349 3.88949C44.4284 3.88949 44.2564 4.06156 44.2564 4.26804C44.2564 4.47452 44.4284 4.64659 44.6349 4.64659C44.8414 4.64659 45.0135 4.47452 45.0135 4.26804C45.0135 4.06156 44.8414 3.88949 44.6349 3.88949ZM34.6549 1.27403C38.8878 1.27403 42.3177 3.44211 42.3177 7.48001C42.3177 11.5179 38.8878 15.9458 34.6549 15.9458C32.2459 15.9458 29.9057 14.6611 28.5062 12.6765C27.4394 11.1738 26.992 9.22365 26.992 7.48001C26.992 3.44211 30.4219 1.27403 34.6549 1.27403ZM11.3337 1.27403C7.10075 1.27403 3.67082 3.44211 3.67082 7.48001C3.67082 11.5179 7.10075 15.9458 11.3337 15.9458C13.7426 15.9458 16.0828 14.6611 17.4823 12.6765C18.5491 11.1738 18.9965 9.22365 18.9965 7.48001C18.9965 3.44211 15.5666 1.27403 11.3337 1.27403Z" fill="#232320"></path>
                </svg>
              </button>
            </div>
          )} */}
        </div>

        {/* Right Column: Details (Sticky) */}
        <div className="lg:w-1/2 bg-white p-8 pt-12 md:p-12 lg:p-16 flex flex-col min-h-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hide">
          {/* Product Name and Price */}
          <div className="mb-8 pb-6 border-b border-gray-200 pt-20 bg-white sticky top-0 z-20">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl font-normal text-[#1F1F1F] tracking-tight">
                {(product as any).naming_system ||
                  product.skuid ||
                  product.name}
              </h1>
              <span className="text-2xl md:text-3xl font-normal text-[#1F1F1F]">
                {product.price}
              </span>
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-2 pb-4 border-b border-gray-200">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-normal text-[#8B7355] uppercase tracking-wide block mb-1">
                  COLOR
                </span>
              </div>

              <div className="flex gap-3">
                {/* Use color_names to generate hex codes for display */}
                {product.colors &&
                  product.colors.map(
                    (colorItem: string | ColorVariant, idx: number) => {
                      const isString = typeof colorItem === "string";
                      const colorVal: string = isString
                        ? (colorItem as string)
                        : (colorItem as ColorVariant).frameColor;
                      const colorHex =
                        getHexColorsFromNames([colorVal])[0] || colorVal;
                      const isLightColor = [
                        "#ffffff",
                        "#fff",
                        "white",
                        "cream",
                        "#f5f5dc",
                        "#fafafa",
                      ].includes(colorHex.toLowerCase());

                      const isSelected = selectedColorIndex === idx; // Check if this color is selected by index

                      return (
                        <button
                          key={idx}
                          onClick={() => handleColorClick(colorItem, idx)}
                          className={`w-5 h-5 rounded-full transition-all duration-200 ${
                            isLightColor ? "border border-gray-200" : ""
                          } ${
                            isSelected
                              ? "ring-2 ring-[#1F1F1F] ring-offset-2"
                              : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={colorVal}
                        ></button>
                      );
                    }
                  )}
              </div>
            </div>
          </div>

          {/* Accordions: contained so toggling open never breaks layout or overflows */}
          <div
            className="mb-6 min-h-0 overflow-hidden flex-shrink-0"
            style={{ contain: "layout paint" }}
          >
            {/* <AccordionItem
              title="FEATURES"
              isOpen={openAccordion === "FEATURES"}
              onClick={() => toggleAccordion("FEATURES")}
            >
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {product.features?.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </AccordionItem> */}

            <AccordionItem
              title="DESCRIPTION"
              isOpen={openAccordion === "DESCRIPTION"}
              onClick={() => toggleAccordion("DESCRIPTION")}
            >
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </AccordionItem>

            <AccordionItem
              title="SIZES"
              isOpen={openAccordion === "SIZES"}
              onClick={() => toggleAccordion("SIZES")}
            >
              <div className="space-y-3">
                {product.sizes && product.sizes.length > 0 && (
                  <ul className="list-none space-y-2 text-gray-600">
                    {product.sizes.map((size: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {size}
                      </li>
                    ))}
                  </ul>
                )}
                {(product as any).dimensions && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Frame Dimensions:
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      {(product as any).dimensions}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Lens Width - Bridge - Temple - Height in mm)
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/size-guide");
                }}
                className="text-xs font-bold text-[#D96C47] hover:underline uppercase tracking-wider flex items-center gap-1 mt-3"
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Size Guide
              </button>
            </AccordionItem>

            <AccordionItem
              title="LENSE GUIDE"
              isOpen={openAccordion === "LENSE GUIDE"}
              onClick={() => toggleAccordion("LENSE GUIDE")}
            >
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  <span className="font-bold text-[#1F1F1F]">
                    Not just lenses. Life upgrades.
                  </span>
                  <br />
                  Multifocal lenses aren't one-size-fits-all. Whether you're
                  reading recipes, running meetings, or road-tripping on
                  weekends — right lens makes all the difference.
                </p>

                <p>
                  We make choosing easy — every frame comes with a Thin 1.6
                  Index lens, Anti-Reflective coating, Anti-Scratch coating, and
                  UV protection at no extra cost.
                </p>

                <p>
                  We break it down simply, so you get what works best for your
                  eyes, your lifestyle, and your frame.
                </p>

                <div>
                  <p className="font-semibold text-[#1F1F1F] mb-2">
                    Explore your options:
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <span className="font-medium text-[#1F1F1F]">
                        Standard
                      </span>{" "}
                      – For calmer days and cozy reads
                    </li>
                    <li>
                      <span className="font-medium text-[#1F1F1F]">
                        Advanced
                      </span>{" "}
                      – For first-timers on the go
                    </li>
                    <li>
                      <span className="font-medium text-[#1F1F1F]">
                        Precision+
                      </span>{" "}
                      – For living life to the fullest
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem
              title="SHIPPING & RETURNS"
              isOpen={openAccordion === "SHIPPING"}
              onClick={() => toggleAccordion("SHIPPING")}
            >
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  <span className="font-bold text-[#1F1F1F]">
                    Free delivery. Easy returns.
                  </span>
                  <br />
                  We ship your glasses for free — expect them in 7–12 working
                  days.
                </p>

                <p>
                  Not quite right? You've got 30 days to return or refund. No
                  questions asked.
                </p>
              </div>
            </AccordionItem>

            <AccordionItem
              title="DETAILS"
              isOpen={openAccordion === "DETAILS"}
              onClick={() => toggleAccordion("DETAILS")}
            >
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </AccordionItem>
          </div>

          {/* CTA Buttons */}
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-[6px] space-y-4  mb-[20px] z-30 mt-auto -mx-8 px-8 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16">
            <div className="flex items-stretch gap-2">
              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-0 bg-[#2D2D2D] text-white py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:bg-black"
              >
                SELECT MULTIFOCAL LENS &amp; BUY NOW
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#1F1F1F] hover:bg-gray-50 flex items-center justify-center transition-colors"
                title={linkCopied ? "Copied!" : "Share"}
                aria-label={linkCopied ? "Copied!" : "Share"}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-center font-medium text-[#4A90A4] hover:underline cursor-pointer transition-colors">
              Buy Now Pay Later with Afterpay/Clearpay/Klarna
            </p>
          </div>
        </div>
      </div>

      {/* VTO: mobile = top-left below navbar; desktop = bottom center until scroll to RECOMMENDED */}
      {capturedData && product && (
        <>
          <button
            type="button"
            onClick={() => setVtoModalOpen(true)}
            className={`fixed z-[100] cursor-pointer hover:opacity-95 transition-all duration-500 ease-out p-0 ${
              isMobile
                ? "left-4 top-[4.5rem] w-14 h-14 opacity-100"
                : `left-1/2 -translate-x-1/2 w-[96px] h-[96px] ${vtoThumbHidden ? "bottom-full opacity-0 pointer-events-none" : "bottom-4 opacity-100"}`
            }`}
            aria-label="View try-on"
          >
            {/* Circular cropped preview (object-cover) */}
            <div className="w-full h-full overflow-hidden rounded-full p-0 bg-white shadow-lg ring-2 ring-white">
              <img
                src={capturedData.croppedPreviewDataUrl || capturedData.processedImageDataUrl}
                alt="Your MFit"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </button>
          {vtoModalOpen && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
              onClick={() => setVtoModalOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`relative bg-white rounded-xl shadow-2xl overflow-hidden p-0 ${!isMobile ? "max-w-md w-full" : ""}`}
                onClick={(e) => e.stopPropagation()}
                style={isMobile ? { width: 280, height: 231 } : undefined}
              >
                <div
                  className="mx-auto overflow-hidden"
                  style={isMobile ? { width: 280, height: 231 } : { width: 384, height: 332 }}
                >
                  <VtoProductOverlay
                    captureSession={
                      (() => {
                        const session = getCaptureSession();
                        if (!session) return capturedData;
                        return {
                          ...(capturedData || session),
                          ...session,
                          frameAdjustments: session.frameAdjustments ?? capturedData?.frameAdjustments ?? session.frameAdjustments,
                        };
                      })()
                    }
                    productSkuid={String(product.skuid || product.id || id || "")}
                    productDimensions={product.dimensions}
                    productName={product.name}
                    compact
                  />
                </div>
                <div className="absolute top-2 right-2 z-10 flex justify-between items-center">
             
                  <button
                    type="button"
                    onClick={() => setVtoModalOpen(false)}
                    className="text-gray-500 hover:text-black p-1 rounded-full bg-white/90"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sentinel: when this enters viewport, VTO hides. VTO fixed at bottom only till image section (before RECOMMENDED). */}
      <div ref={recommendedSectionRef} className="h-4 w-full shrink-0" aria-hidden />
      {/* Recommended Products Section */}
      <RecommendedProducts
        products={allProducts}
        currentProductId={product?.id || product?.skuid}
      />

      <GetMyFitModal
        open={isGetMyFitOpen}
        onClose={() => setIsGetMyFitOpen(false)}
        onComplete={handleFitComplete}
      />

      <ChatWidget />
    </div>
  );
};

export default ProductPage;
