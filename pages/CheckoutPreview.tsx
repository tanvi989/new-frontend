import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "../api/retailerApis";
import { CartItem } from "../types";
import Loader from "../components/Loader";
import { getLensCoating, getTintInfo, calculateItemTotal, getLensPackagePrice, getCartLensOverride, getLensTypeDisplay, getLensIndex } from "../utils/priceUtils";

const CheckoutPreview: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);
    const [isLensExpanded, setIsLensExpanded] = useState(true);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // If not mobile, redirect to cart immediately
            if (!mobile) {
                navigate("/cart", { replace: true });
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [navigate]);

    // Fetch Cart Data
    const { data: cartResponse, isLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const response = await getCart({});
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const cartItems: CartItem[] = cartResponse?.cart || [];

    // Get the most recently added item (last item in the array)
    const latestItem = cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;





    // If no item found content loaded, redirect to cart
    useEffect(() => {
        if (!isLoading && !latestItem) {
            navigate("/cart", { replace: true });
        }
    }, [isLoading, latestItem, navigate]);

    if (isLoading || !latestItem) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    const framePrice = latestItem.product?.products?.list_price || 0;
    const lensInfo = getLensIndex(latestItem);
    const coatingInfo = getLensCoating(latestItem);

    return (
        <div className="min-h-screen bg-[#E8E6DD] font-sans">
            {/* Header */}
            <div className="bg-[#E8E6DD] border-b border-gray-300 px-4 py-4 flex items-center justify-between">
                <h1 className="text-base font-bold text-[#1F1F1F] uppercase tracking-wide">CHECKOUT</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="px-4 py-6">
                {/* Product Card */}
                <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    {/* Product Header with Image, Color, and Price */}
                    <div className="flex items-center justify-between mb-3">
                        {/* Product Image */}
                        <div className="w-20 h-16 flex items-center justify-center">
                            <img
                                src={latestItem.product?.products?.image || "/placeholder-product.png"}
                                alt={latestItem.product?.products?.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Color Circle */}
                        {(() => {
                            const frameColor = latestItem.product?.products?.framecolor;
                            const selectedColor = (latestItem as any).selectedColor || (latestItem as any).color;
                            const displayColor = selectedColor || frameColor?.toLowerCase() || "#808080";
                            return (
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: displayColor }}
                                ></div>
                            );
                        })()}

                        {/* Total Price */}
                        <div className="text-right">
                            <div className="text-2xl font-bold text-[#1F1F1F]">
                                £{calculateItemTotal(latestItem).toFixed(0)}
                            </div>
                        </div>
                    </div>

                    {/* Product Name and Frame Price */}
                    <div className="flex items-center justify-between text-sm mb-4">
                        <div className="font-semibold text-[#1F1F1F]">
                            {latestItem.product?.products?.naming_system || latestItem.product?.products?.brand || "EIG885II"}
                        </div>
                        <div className="text-gray-600">
                            {latestItem.product?.products?.framecolor || "Grey"}
                        </div>
                        <div className="font-semibold text-[#1F1F1F]">
                            £{framePrice}
                        </div>
                    </div>

                    {/* Expandable Lens Details */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Lens Header */}
                        <button
                            onClick={() => setIsLensExpanded(!isLensExpanded)}
                            className="w-full flex items-center justify-between p-3 bg-[#F5F5F5] hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#1F1F1F] text-sm">Lenses:</span>
                                <span className="text-[#E94D37] text-sm font-medium">{getLensTypeDisplay(latestItem)}</span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-600 transition-transform ${isLensExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Lens Details - Expandable */}
                        {isLensExpanded && (
                            <div className="p-3 space-y-3 bg-white">
                                {/* Index */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-[#1F1F1F] mb-0.5">Index:</div>
                                        <div className="text-xs text-[#E94D37] font-medium">{lensInfo.index}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">+</span>
                                        <span className="text-sm font-semibold text-[#1F1F1F]">£{lensInfo.price}</span>
                                    </div>
                                </div>

                                {/* Coating */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-[#1F1F1F] mb-0.5">Coating:</div>
                                        <div className="text-xs text-[#E94D37] font-medium">{coatingInfo.name}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">+</span>
                                        <span className="text-sm font-semibold text-[#1F1F1F]">£{Number(coatingInfo.price || 0).toFixed(0)}</span>
                                    </div>
                                </div>

                                {/* Add Ons */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-[#1F1F1F] mb-0.5">Add Ons:</div>
                                        <div className="text-xs text-[#E94D37] font-medium">Case & Cleaning cloth included</div>
                                    </div>
                                    <div className="text-sm font-semibold text-[#1F1F1F]">Free</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <button
                    onClick={() => navigate("/cart")}
                    className="w-full bg-[#1F1F1F] text-white py-4 rounded-lg font-bold text-base hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <span>Continue to Cart</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CheckoutPreview;
