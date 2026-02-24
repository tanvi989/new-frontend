import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CartItem } from "../../types";
import {
    getLensCoating,
    getTintInfo,
    calculateItemTotal,
    getLensPackagePrice,
    getCartLensOverride,
    getCartLensOverrideBySku,
    parsePrice,
} from "../../utils/priceUtils";
import WhyMutlifolks from "../WhyMutlifolks";
import CouponTermsDialog from "../product/CouponTermsDialog";
import { Footer } from "../Footer";
import ManualPrescriptionModal from "../ManualPrescriptionModal";
import { deletePrescription, removePrescription, getMyPrescriptions, getCartItemId, addPrescription } from "../../api/retailerApis";
import { trackBeginCheckout } from "../../utils/analytics";
import { getProductFlow } from "../../utils/productFlowStorage";

interface MobileCartProps {
    cartItems: CartItem[];
    cartData: any;
    frontendSubtotal: number;
    discountAmount: number;
    shippingCost: number;
    frontendTotalPayable: number;
    couponCode: string;
    setCouponCode: (code: string) => void;
    handleApplyCoupon: () => void;
    handleRemoveCoupon: () => void;
    handleShippingChange: (method: string) => void;
    shippingMethod: string;
    terms: boolean;
    setTerms: (open: boolean) => void;
    handleDeleteItem: (cartId: number) => void;
    handleQuantityChange: (cartId: number, currentQuantity: number, change: number) => void;
    isQuantityUpdating: boolean;
    navigate: (path: string, state?: any) => void;
    authData: { isAuthenticated: boolean; firstName: string };
    setShowLoginModal: (show: boolean) => void;
    userPrescriptions?: any[];
    refetchPrescriptions?: () => void;
    refetchCart?: () => void;
}

const MobileCart: React.FC<MobileCartProps> = ({
    cartItems,
    cartData,
    frontendSubtotal,
    discountAmount,
    shippingCost,
    frontendTotalPayable,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleShippingChange,
    shippingMethod,
    terms,
    setTerms,
    handleDeleteItem,
    handleQuantityChange,
    isQuantityUpdating,
    navigate,
    authData,
    setShowLoginModal,
    userPrescriptions = [],
    refetchPrescriptions,
    refetchCart,
}) => {
    const queryClient = useQueryClient();
    const [shippingOpen, setShippingOpen] = useState(true);
    const [cartItemsOpen, setCartItemsOpen] = useState(true);
    const [priceDetailsOpen, setPriceDetailsOpen] = useState(true);
    const [viewPrescription, setViewPrescription] = useState<any>(null);
    const [viewPrescriptionCartId, setViewPrescriptionCartId] = useState<number | null>(null);
    const [prescriptionRefresh, setPrescriptionRefresh] = useState(0);
    const [editingPrescriptions, setEditingPrescriptions] = useState<Set<number>>(new Set());
    const [showDuplicateWarning, setShowDuplicateWarning] = useState<string | null>(null);

    useEffect(() => {
        const fromPrescription = sessionStorage.getItem("fromPrescription");
        if (fromPrescription === "true") {
            sessionStorage.removeItem("fromPrescription");
            setPrescriptionRefresh(prev => prev + 1);
        }
    }, []);

    // --- Local Helper Functions matching DesktopCart ---

    const formatFrameSize = (size?: string): string => {
        if (!size) return "MEDIUM";
        const sizeUpper = size.toUpperCase().trim();
        if (sizeUpper === "S" || sizeUpper === "SMALL") return "SMALL";
        if (sizeUpper === "M" || sizeUpper === "MEDIUM") return "MEDIUM";
        if (sizeUpper === "L" || sizeUpper === "LARGE") return "LARGE";
        return sizeUpper;
    };

    const getLensTypeDisplay = (item: CartItem): string => {
        const itemAny = item as any;
        const lensAny = item.lens as any;
        const sku = itemAny?.product?.products?.skuid ?? itemAny?.product_id ?? item?.product_id;

        const override = getCartLensOverride(item.cart_id) ?? (sku ? getCartLensOverrideBySku(String(sku)) : null);

        let tier = "";

        if (override?.lensType === "single") {
            tier = "Single Vision";
        } else if (override?.lensType === "bifocal") {
            tier = "Bifocal";
        } else if (override?.lensType === "progressive" && override?.prescriptionTier) {
            const prescriptionTier = override.prescriptionTier.toLowerCase();
            if (prescriptionTier === "precision") {
                tier = "Precision+ Progressive";
            } else if (prescriptionTier === "advanced") {
                tier = "Advanced Progressive";
            } else if (prescriptionTier === "standard") {
                tier = "Standard Progressive";
            } else {
                tier = "Progressive";
            }
        } else {
            const mainCategory = override?.mainCategory || item.lens?.main_category || "";
            const mainCategoryLower = mainCategory.toLowerCase();

            if (mainCategoryLower.includes("single vision")) {
                tier = "Single Vision";
            } else if (mainCategoryLower.includes("precision progressive")) {
                tier = "Precision+ Progressive";
            } else if (mainCategoryLower.includes("advanced progressive") || mainCategoryLower.includes("premium progressive")) {
                tier = "Advanced Progressive";
            } else if (mainCategoryLower.includes("standard progressive")) {
                tier = "Standard Progressive";
            } else if (mainCategoryLower.includes("bifocal")) {
                tier = "Bifocal";
            } else if (mainCategoryLower.includes("progressive")) {
                tier = "Progressive";
            } else {
                tier = mainCategory || "Progressive";
            }
        }

        let category = "";
        const lensCategory = override?.lensCategory || lensAny?.lens_category || itemAny?.lensCategory;

        if (lensCategory) {
            const cat = String(lensCategory).toLowerCase();
            if (cat === "blue") category = "Blue Protect";
            else if (cat === "clear") category = "Clear";
            else if (cat === "photo" || cat === "photochromic") category = "Photochromic";
            else if (cat === "sun" || cat === "sunglasses") category = "Sunglasses";
        } else {
            const subCategory = item.lens?.sub_category || "";
            const subLower = subCategory.toLowerCase();
            if (subLower.includes("blue")) category = "Blue Protect";
            else if (subLower.includes("clear")) category = "Clear";
            else if (subLower.includes("photo")) category = "Photochromic";
            else if (subLower.includes("sun")) category = "Sunglasses";
        }

        return category ? `${tier}-${category}` : tier;
    };

    const getLensIndex = (item: CartItem): { index: string; price: number } => {
        const itemAny = item as any;
        const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData ?? item.lens) as any;
        const sellingPrice = getLensPackagePrice(item);
        const sku = itemAny?.product?.products?.skuid ?? itemAny?.product_id ?? item?.product_id;
        const override = getCartLensOverride(item.cart_id) ?? (sku ? getCartLensOverrideBySku(String(sku)) : null);

        let indexNumber = "1.61";
        let lensPackagePrice: number = override
            ? Number(override.lensPackagePrice ?? 0)
            : (lensAny?.selling_price && Number(lensAny.selling_price) > 0)
                ? Number(lensAny.selling_price)
                : sellingPrice;

        if (override?.lensPackage) {
            indexNumber = String(override.lensPackage);
        } else if (itemAny?.lensPackage) {
            indexNumber = String(itemAny.lensPackage);
        } else if (lensAny?.lens_package) {
            indexNumber = String(lensAny.lens_package);
        } else if (lensAny?.title || lensAny?.name) {
            const lensTitle = lensAny?.title || lensAny?.name;
            const indexMatch = lensTitle.match(/(1\.\d+)/);
            if (indexMatch) indexNumber = indexMatch[1];
        } else {
            const subCategory = lensAny?.sub_category || "";
            const indexMatch = subCategory.match(/(\d\.\d+)/);
            if (indexMatch) indexNumber = indexMatch[1];
        }

        const lensCategory = itemAny?.lensCategory || lensAny?.lens_category || "";
        const cat = String(lensCategory).toLowerCase();

        let fullName = "";
        if (cat === "blue") {
            fullName = `${indexNumber} Blue Protect High Index`;
        } else if (cat === "photo" || cat === "photochromic") {
            fullName = `${indexNumber} Photochromic High Index`;
        } else if (cat === "sun" || cat === "sunglasses") {
            fullName = `${indexNumber} High Index`;
        } else {
            fullName = `${indexNumber} High Index`;
        }

        const normalizedPrice = Number.isFinite(Number(lensPackagePrice)) ? Number(lensPackagePrice) : 0;
        return { index: fullName, price: normalizedPrice };
    };

    // --- End Helper Functions ---

    // ✅ FIX: Order now matches DesktopCart exactly:
    //    1. cartItem.prescription
    //    2. localStorage       ← was step 3, moved up
    //    3. sessionStorage      ← was step 4, moved up
    //    4. userPrescriptions   ← was step 2, moved down
    // The API prescription (userPrescriptions) often lacks PD fields.
    // localStorage has the full prescription including PD — so it must win.
    const getPrescriptionByCartId = (
        cartId: number,
        productSku?: string,
        cartItem?: CartItem
    ): any | null => {
        try {
            const activeCartIds = new Set(cartItems.map(ci => String(ci.cart_id)));

            // 1. Prescription stored directly on cart item (from backend)
            if (cartItem?.prescription && typeof cartItem.prescription === "object" && Object.keys(cartItem.prescription).length > 0) {
                const pres = cartItem.prescription as any;
                const presCartId = pres?.associatedProduct?.cartId || pres?.data?.associatedProduct?.cartId || pres?.cartId || pres?.data?.cartId;
                if (!presCartId || (String(presCartId) === String(cartId) && activeCartIds.has(String(cartId)))) {
                    return cartItem.prescription;
                }
            }

            // 2. localStorage (same device — has full PD data)
            try {
                const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
                const localMatches = localPrescriptions.filter((p: any) => {
                    const pCartId = p?.associatedProduct?.cartId || p?.data?.associatedProduct?.cartId;
                    return pCartId && String(pCartId) === String(cartId) && activeCartIds.has(String(pCartId));
                });
                if (localMatches.length > 0) {
                    const getLocalDate = (p: any) => {
                        const raw = p?.createdAt ?? p?.created_at ?? p?.prescriptionDetails?.createdAt ?? 0;
                        if (typeof raw === 'number') return raw;
                        if (typeof raw === 'string') return new Date(raw).getTime() || 0;
                        return 0;
                    };
                    return localMatches.sort((a: any, b: any) => getLocalDate(b) - getLocalDate(a))[0];
                }
            } catch (e) { console.error(e); }

            // 3. sessionStorage (product page flow)
            try {
                if (productSku) {
                    const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
                    const productPrescription = sessionPrescriptions[productSku];
                    if (productPrescription) {
                        if (productPrescription.associatedProduct) {
                            productPrescription.associatedProduct.cartId = String(cartId);
                            sessionPrescriptions[productSku] = productPrescription;
                            sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
                        }
                        return productPrescription;
                    }
                }
            } catch (e) { console.error(e); }

            // 4. userPrescriptions from API (checked last — may lack PD fields)
            if (userPrescriptions && userPrescriptions.length > 0) {
                const getPrescriptionDate = (p: any) => {
                    const raw = p?.created_at ?? p?.data?.created_at ?? p?.createdAt ?? p?.data?.createdAt ?? p?.updated_at ?? p?.data?.uploadedAt ?? 0;
                    if (typeof raw === 'number') return raw;
                    if (typeof raw === 'string') return new Date(raw).getTime() || 0;
                    return 0;
                };

                let matches = userPrescriptions.filter((p: any) => {
                    if (!p) return false;
                    const dataCartId = p?.data?.associatedProduct?.cartId;
                    const rootCartId = p?.associatedProduct?.cartId;
                    const directCartId = p?.data?.cartId || p?.cartId;
                    const deepDataCartId = p?.data?.data?.associatedProduct?.cartId;

                    const matchesCartId =
                        (dataCartId && String(dataCartId) === String(cartId)) ||
                        (rootCartId && String(rootCartId) === String(cartId)) ||
                        (directCartId && String(directCartId) === String(cartId)) ||
                        (deepDataCartId && String(deepDataCartId) === String(cartId));

                    if (!matchesCartId) return false;

                    const prescriptionCartId = rootCartId || dataCartId || directCartId || deepDataCartId;
                    return prescriptionCartId && activeCartIds.has(String(prescriptionCartId));
                });

                if (matches.length === 0 && productSku != null && productSku !== "") {
                    const productSkuStr = String(productSku);
                    matches = userPrescriptions.filter((p: any) => {
                        if (!p) return false;
                        const pCartId = p?.associatedProduct?.cartId ?? p?.data?.associatedProduct?.cartId ?? p?.data?.cartId ?? p?.cartId;
                        if (pCartId != null && !activeCartIds.has(String(pCartId))) return false;

                        const dataSku = p?.data?.associatedProduct?.productSku;
                        const rootSku = p?.associatedProduct?.productSku;
                        const deepDataSku = p?.data?.data?.associatedProduct?.productSku;
                        return (dataSku && String(dataSku) === productSkuStr) ||
                            (rootSku && String(rootSku) === productSkuStr) ||
                            (deepDataSku && String(deepDataSku) === productSkuStr);
                    });
                }

                if (matches.length > 0) {
                    const photoMatches = matches.filter((p: any) => p && p.type === "photo");
                    const pool = photoMatches.length > 0 ? photoMatches : matches;
                    return pool.sort((a: any, b: any) => getPrescriptionDate(b) - getPrescriptionDate(a))[0];
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching prescription:", error);
            return null;
        }
    };

    const handleRemovePrescription = async (cartId: number, prescription: any) => {
        if (!window.confirm("Are you sure you want to remove this prescription?")) return;

        try {
            if (prescription.id || prescription._id) {
                await deletePrescription(prescription.id || prescription._id);
            }
            try { await removePrescription(cartId); } catch (err) { console.warn(err); }

            try {
                const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
                const filtered = localPrescriptions.filter((p: any) => {
                    const pCartId = p?.associatedProduct?.cartId;
                    return !pCartId || String(pCartId) !== String(cartId);
                });
                localStorage.setItem('prescriptions', JSON.stringify(filtered));
            } catch (e) { console.error(e); }

            if (authData.isAuthenticated && refetchPrescriptions) refetchPrescriptions();
            if (refetchCart) refetchCart();
            setPrescriptionRefresh(prev => prev + 1);
            setViewPrescription(null);
            alert("Prescription removed successfully!");
        } catch (error) {
            console.error("Error removing prescription:", error);
            alert("Failed to remove prescription. Please try again.");
        }
    };

    const toggleEditMode = (cartId: number) => {
        const newEditingSet = new Set(editingPrescriptions);
        if (newEditingSet.has(cartId)) newEditingSet.delete(cartId);
        else newEditingSet.add(cartId);
        setEditingPrescriptions(newEditingSet);
    };

    const checkForDuplicateProduct = (currentItem: CartItem, change: number): boolean => {
        if (change <= 0) return false;
        const currentSku = currentItem.product?.products?.skuid || currentItem.product_id;
        const currentPrescription = getPrescriptionByCartId(currentItem.cart_id, currentSku, currentItem);
        const hasPrescription = !!currentPrescription;

        const duplicateExists = cartItems.some(item => {
            if (item.cart_id === currentItem.cart_id) return false;
            const itemSku = item.product?.products?.skuid || item.product_id;
            const itemPrescription = getPrescriptionByCartId(item.cart_id, itemSku, item);
            return itemSku === currentSku && !!itemPrescription !== hasPrescription;
        });

        if (duplicateExists) {
            const productName = currentItem.product?.products?.naming_system || currentItem.product?.products?.brand || "This product";
            setShowDuplicateWarning(`${productName} already exists in your cart with a different prescription state.`);
            setTimeout(() => setShowDuplicateWarning(null), 5000);
            return true;
        }
        return false;
    };

    const handleQuantityChangeWithCheck = (cartId: number, currentQuantity: number, change: number) => {
        const currentItem = cartItems.find(item => item.cart_id === cartId);
        if (!currentItem) return;
        if (change > 0 && checkForDuplicateProduct(currentItem, change)) return;
        handleQuantityChange(cartId, currentQuantity, change);
    };

    /**
     * Builds a normalised prescription object for the viewer.
     * ✅ Now matches desktop logic exactly — including getProductFlow fallback.
     */
    const buildMergedPrescription = (prescription: any, item: CartItem, productSku?: string) => {
        // ✅ Same as desktop: check getProductFlow as additional PD source
        const flow = getProductFlow(productSku || "");

        const base      = prescription?.prescriptionDetails || {};
        const dataLayer = prescription?.data               || {};
        const deepBase  = dataLayer?.prescriptionDetails   || {};
        const pd        = (item as any).product_details    || {};

        const firstDefined = (...vals: any[]) => vals.find(v => v !== undefined && v !== null) ?? null;

        // ✅ Priority matches desktop: prescription root → base → product_details → flow
        const pdRight = firstDefined(
            prescription?.pdRight, prescription?.pdOD, prescription?.pd_right, prescription?.pd_od,
            base?.pdRight,  base?.pdOD,  base?.pd_right,
            deepBase?.pdRight, deepBase?.pdOD, deepBase?.pd_right,
            dataLayer?.pdRight, dataLayer?.pdOD, dataLayer?.pd_right, dataLayer?.pd_right_mm,
            pd.pd_right_mm, pd.pd_right, pd.pdRight, pd.pdOD, pd.pd_od,
            flow?.pdRight,
        );

        const pdLeft = firstDefined(
            prescription?.pdLeft, prescription?.pdOS, prescription?.pd_left, prescription?.pd_os,
            base?.pdLeft,  base?.pdOS,  base?.pd_left,
            deepBase?.pdLeft, deepBase?.pdOS, deepBase?.pd_left,
            dataLayer?.pdLeft, dataLayer?.pdOS, dataLayer?.pd_left, dataLayer?.pd_left_mm,
            pd.pd_left_mm, pd.pd_left, pd.pdLeft, pd.pdOS, pd.pd_os,
            flow?.pdLeft,
        );

        const pdSingle = firstDefined(
            prescription?.pdSingle, prescription?.pd_single, prescription?.totalPD,
            base?.pdSingle,  base?.pd_single,  base?.totalPD,
            deepBase?.pdSingle, deepBase?.pd_single,
            dataLayer?.pdSingle, dataLayer?.pd_single, dataLayer?.pd_single_mm,
            pd.pd_single_mm, pd.pd_single, pd.pdSingle,
            flow?.pdSingle,
        );

        const rawPdType = firstDefined(
            prescription?.pdType, base?.pdType, deepBase?.pdType, dataLayer?.pdType,
            flow?.pdType,
            (pdRight != null && pdLeft != null) ? "dual" : (pdSingle != null ? "single" : null),
        ) ?? "single";

        const pdType =
            typeof rawPdType === "string"
                ? rawPdType.charAt(0).toUpperCase() + rawPdType.slice(1).toLowerCase()
                : "Single";

        return {
            ...prescription,
            pdSingle,
            pdRight,
            pdLeft,
            pdType,
            prescriptionDetails: {
                ...deepBase,
                ...base,
                pdSingle,
                pdRight,
                pdLeft,
                pdType,
            },
            data: {
                ...dataLayer,
                pdSingle,
                pdRight,
                pdLeft,
                pdType,
            },
        };
    };

    return (
        <div className="md:hidden max-w-[1366px] mx-auto px-4 md:px-21 bg-white pb-24">
            {/* Duplicate Warning */}
            {showDuplicateWarning && (
                <div className="fixed top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">{showDuplicateWarning}</p>
                        <button onClick={() => setShowDuplicateWarning(null)} className="ml-auto text-yellow-600 hover:text-yellow-800">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Cart Header */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">Cart ({cartItems.length} items)</h1>
            </div>

            {/* Cart Items */}
            {cartItems.map((item, index) => (
                <div key={getCartItemId(item) ?? item.product_id ?? index} className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
                    {/* Item Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                                <img
                                    src={item.product?.products?.image || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=300"}
                                    alt={item.product?.products?.name}
                                    className="w-full h-full object-contain mix-blend-multiply p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {item.product?.products?.naming_system || item.product?.products?.brand || "BERG"}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.product?.products?.framecolor?.toLowerCase() || "#F5F5F5" }} />
                                    <span className="text-sm text-gray-600">{formatFrameSize(item.product?.products?.size)}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { const id = getCartItemId(item); if (id != null) handleDeleteItem(id); }}
                                className="flex items-center gap-1.5 text-red-600 text-sm font-semibold hover:text-red-700 hover:underline"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                            </button>
                        </div>
                    </div>

                    {/* Price Details Table */}
                    <div className="p-4 min-w-0 overflow-x-auto">
                        <table className="w-full border border-gray-200 border-collapse text-sm" style={{ tableLayout: "fixed", minWidth: "280px" }}>
                            <colgroup>
                                <col style={{ width: "38%" }} />
                                <col />
                                <col style={{ width: "5rem", minWidth: "5rem" }} />
                            </colgroup>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-2 font-bold text-[#1F1F1F] border-r border-gray-200">Frame Price:</td>
                                    <td className="py-3 px-2 text-[#525252]"></td>
                                    <td className="py-3 px-2 text-right font-bold text-[#1F1F1F] whitespace-nowrap bg-gray-50 rounded-[1px]">£{parsePrice(item.product?.products?.list_price ?? item.product?.products?.price ?? (item as any).price ?? 0).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-2 font-bold text-[#1F1F1F] border-r border-gray-200">Frame Size:</td>
                                    <td className="py-3 px-2 text-[#525252]" colSpan={2}>{formatFrameSize(item.product?.products?.size)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-2 font-bold text-[#1F1F1F] border-r border-gray-200">Lens Type:</td>
                                    <td className="py-3 px-2 text-[#525252]" colSpan={2}>{getLensTypeDisplay(item)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-2 font-bold text-[#1F1F1F] border-r border-gray-200">Lens Index:</td>
                                    <td className="py-3 px-2 text-[#525252] truncate">{getLensIndex(item).index}</td>
                                    <td className="py-3 px-2 text-right font-bold text-[#1F1F1F] whitespace-nowrap bg-gray-50 rounded-[1px]">£{getLensIndex(item).price.toFixed(2)}</td>
                                </tr>
                                {getTintInfo(item) ? (
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-2 font-bold text-[#1F1F1F] border-r border-gray-200">Lens Tint:</td>
                                        <td className="py-3 px-2 text-[#525252] truncate">{getTintInfo(item)!.type}{getTintInfo(item)!.color ? `-${getTintInfo(item)!.color}` : ""}</td>
                                        <td className="py-3 px-2 text-right font-bold text-[#1F1F1F] whitespace-nowrap bg-gray-50 rounded-[1px]">£{Number(getTintInfo(item)!.price).toFixed(2)}</td>
                                    </tr>
                                ) : (
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-2 font-bold text-[#1F1F1F] border-r border-gray-200">Lens Coating:</td>
                                        <td className="py-3 px-2 text-[#525252] truncate">{getLensCoating(item).name}</td>
                                        <td className="py-3 px-2 text-right font-bold text-[#1F1F1F] whitespace-nowrap bg-gray-50 rounded-[1px]">£{Number(getLensCoating(item).price || 0).toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-2 text-gray-700 font-medium border-r border-gray-200">Quantity</td>
                                    <td className="py-3 px-2 text-right" colSpan={2}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button disabled={isQuantityUpdating} onClick={() => handleQuantityChangeWithCheck(item.cart_id, item.quantity || 1, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 font-bold border border-gray-300 rounded hover:bg-gray-50">-</button>
                                            <span className="min-w-[20px] text-center font-bold">{item.quantity || 1}</span>
                                            <button disabled={isQuantityUpdating} onClick={() => handleQuantityChangeWithCheck(item.cart_id, item.quantity || 1, 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 font-bold border border-gray-300 rounded hover:bg-gray-50">+</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-2 text-gray-900 font-bold text-lg" colSpan={2}>Subtotal</td>
                                    <td className="py-3 px-2 text-right text-gray-900 font-bold text-lg">£{calculateItemTotal(item).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Free Items Note */}
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="text-sm text-blue-800 font-medium">Case & Cleaning cloth included for Free</p>
                        </div>

                        {/* Prescription Section */}
                        <div className="mt-4">
                            {(() => {
                                const _ = prescriptionRefresh;
                                const productSku = item.product?.products?.skuid || item.product_id;
                                const prescription = getPrescriptionByCartId(item.cart_id, productSku, item);
                                const isEditing = editingPrescriptions.has(item.cart_id);

                                if (prescription) {
                                    return (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    // ✅ Pass productSku so buildMergedPrescription can use getProductFlow
                                                    const merged = buildMergedPrescription(prescription, item, productSku);
                                                    setViewPrescription(merged);
                                                    setViewPrescriptionCartId(item.cart_id);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors w-full"
                                            >
                                                View Prescription
                                            </button>
                                            {!isEditing ? (
                                                <button onClick={() => toggleEditMode(item.cart_id)} className="text-teal-700 hover:text-teal-800 text-sm font-medium underline transition-colors self-start">Edit Prescription</button>
                                            ) : (
                                                <div className="flex flex-col gap-2 pl-4 border-l-2 border-teal-200">
                                                    <button onClick={() => { const sku = item.product?.products?.skuid || item.product_id; navigate(`/upload-prescription?cart_id=${item.cart_id}`, { state: { cartId: item.cart_id, cart_id: item.cart_id, product: item.product?.products || (sku ? { skuid: sku } : undefined) } }); }} className="text-teal-700 hover:text-teal-800 text-sm font-medium underline self-start">Upload Prescription</button>
                                                    <button onClick={() => { const sku = item.product?.products?.skuid || item.product_id; navigate(`/manual-prescription?cart_id=${item.cart_id}`, { state: { cartId: item.cart_id, cart_id: item.cart_id, product: item.product?.products || (sku ? { skuid: sku } : undefined) } }); }} className="text-teal-700 hover:text-teal-800 text-sm font-medium underline self-start">Manual Prescription</button>
                                                    <button onClick={() => { const sku = item.product?.products?.skuid || item.product_id; if (sku) navigate(`/product/${sku}/add-prescription?cart_id=${item.cart_id}`, { state: { cartId: item.cart_id, cart_id: item.cart_id, product: item.product?.products || { skuid: sku } } }); }} className="text-teal-700 hover:text-teal-800 text-sm font-medium underline self-start">Take Photo</button>
                                                    <button onClick={() => toggleEditMode(item.cart_id)} className="text-gray-500 hover:text-gray-700 text-xs font-medium self-start mt-1">Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                } else {
                                    const sku = item.product?.products?.skuid || item.product_id;
                                    return (
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => { navigate(`/manual-prescription?cart_id=${item.cart_id}`, { state: { cartId: item.cart_id, cart_id: item.cart_id, product: item.product?.products || (sku ? { skuid: sku } : undefined) } }); }} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors w-full">Add Prescription</button>
                                            {sku && <button onClick={() => navigate(`/product/${sku}/add-prescription?cart_id=${item.cart_id}`, { state: { cartId: item.cart_id, cart_id: item.cart_id, product: item.product?.products || { skuid: sku } } })} className="text-teal-700 hover:text-teal-800 text-sm font-medium underline self-start">Or take photo</button>}
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            ))}

            {/* Coupon Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Apply Coupon</h3>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={cartData?.coupon?.code || couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!cartData?.coupon}
                        placeholder="Enter code"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 disabled:bg-gray-50"
                    />
                    <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || !!cartData?.coupon}
                        className="bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                    >
                        Apply
                    </button>
                </div>

                {cartData?.coupon && (
                    <div className="mt-3 flex justify-between items-center bg-green-50 p-2 rounded border border-green-100">
                        <span className="text-green-700 text-sm font-medium">Code <b>{cartData.coupon.code}</b> applied!</span>
                        <button onClick={handleRemoveCoupon} className="text-red-500 text-xs font-medium hover:underline">Remove</button>
                    </div>
                )}
            </div>

            {/* Shipping Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Method</h3>
                <div className="space-y-2">
                    {[{ id: "standard", label: "Standard Shipping", time: "8-12 working days", price: cartData?.subtotal > 75 ? "Free" : "£6" }, { id: "express", label: "Express Shipping", time: "4-6 working days", price: "£29" }].map((method) => (
                        <label key={method.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <input type="radio" name="shipping_mobile" checked={shippingMethod === method.id} onChange={() => handleShippingChange(method.id)} className="sr-only" />
                                <div className={`w-5 h-5 rounded-full border ${shippingMethod === method.id ? "border-red-500" : "border-gray-300"} bg-white`} />
                                {shippingMethod === method.id && <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500" />}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">{method.label}</div>
                                <div className="text-sm text-gray-600">{method.time} - {method.price}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Price Details</h3>
                <table className="w-full border-collapse">
                    <tbody>
                        <tr className="border-b border-gray-200"><td className="py-2 text-gray-700 font-medium">Price</td><td className="py-2 text-right text-gray-900 font-medium">£{frontendSubtotal.toFixed(2)}</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 text-gray-700 font-medium">Subtotal</td><td className="py-2 text-right text-gray-900 font-medium">£{frontendSubtotal.toFixed(0)}</td></tr>
                        {discountAmount > 0 && (<tr className="border-b border-gray-200"><td className="py-2 text-green-600 font-medium">Discount ({cartData.coupon?.code})</td><td className="py-2 text-right text-green-600 font-medium">-£{discountAmount.toFixed(2)}</td></tr>)}
                        <tr className="border-b border-gray-200"><td className="py-2 text-gray-700 font-medium">Shipping</td><td className="py-2 text-right text-gray-900 font-medium">£{Number(shippingCost).toFixed(2)}</td></tr>
                        <tr><td className="py-3 text-gray-900 font-bold text-lg">Total Payables</td><td className="py-3 text-right text-gray-900 font-bold text-lg">£{frontendTotalPayable.toFixed(2)}</td></tr>
                    </tbody>
                </table>
                <p className="mt-4 text-center text-sm text-gray-600">Prices includes applicable VAT</p>
            </div>

            {/* Trust & Policy Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex flex-col items-center gap-4">
                    <img src="/fda.png" alt="FDA Approved" className="w-48 h-auto object-contain" />
                    <div className="flex justify-center items-center gap-6">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span><p className="text-gray-700 text-sm font-medium">Secure Payment</p></div>
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span><p className="text-gray-700 text-sm font-medium">30 Days Easy Refund</p></div>
                    </div>
                    <img src="/sda.png" alt="Payment Methods" className="w-56 h-auto object-contain" />
                </div>
            </div>

            {/* Mobile Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex flex-col px-4 py-3 gap-3">
                    <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-bold text-gray-800">Total:</p>
                        <p className="text-lg font-bold text-gray-800">£{frontendTotalPayable.toFixed(0)}</p>
                    </div>
                    <button onClick={() => { trackBeginCheckout(cartItems); if (localStorage.getItem("token")) navigate("/payment"); else { sessionStorage.setItem("returnTo", "/payment"); setShowLoginModal(true); } }} className="w-full bg-gray-800 text-white py-3 rounded font-medium text-sm hover:bg-black transition-colors">Checkout</button>
                </div>
            </div>

            <ManualPrescriptionModal
                open={!!viewPrescription}
                onClose={() => { setViewPrescription(null); setViewPrescriptionCartId(null); }}
                prescription={viewPrescription}
                cartId={viewPrescriptionCartId ?? undefined}
                onSavePD={viewPrescriptionCartId != null && viewPrescription && refetchCart && refetchPrescriptions ? async (pd) => {
                    const userStr = localStorage.getItem("user");
                    const user = userStr ? JSON.parse(userStr) : null;
                    const userId = user?._id ?? user?.id ?? "";
                    const base = viewPrescription.prescriptionDetails || viewPrescription.data || viewPrescription;
                    const baseObj = typeof base === "object" && base ? base : {};
                    const updated = { ...viewPrescription, ...baseObj, ...pd, prescriptionDetails: { ...baseObj, ...pd }, data: { ...baseObj, ...pd } };
                    await addPrescription(userId, viewPrescription.type || "upload", viewPrescription.type || "upload", updated, viewPrescriptionCartId);
                    refetchCart();
                    refetchPrescriptions();
                    setPrescriptionRefresh((p) => p + 1);
                    setViewPrescription(updated);
                } : undefined}
            />
        </div>
    );
};

export default MobileCart;