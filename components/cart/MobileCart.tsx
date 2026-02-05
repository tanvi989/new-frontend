import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CartItem } from "../../types";
import {
    formatFrameSize,
    getLensTypeDisplay,
    getLensIndex,
    getLensCoating
} from "../../utils/priceUtils";
import WhyMutlifolks from "../WhyMutlifolks";
import CouponTermsDialog from "../product/CouponTermsDialog";
import { Footer } from "../Footer";
import ManualPrescriptionModal from "../ManualPrescriptionModal";
import { deletePrescription, removePrescription, getMyPrescriptions } from "../../api/retailerApis";

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
    // Changed all to true to keep sections open by default
    const [shippingOpen, setShippingOpen] = useState(true);
    const [cartItemsOpen, setCartItemsOpen] = useState(true);
    const [priceDetailsOpen, setPriceDetailsOpen] = useState(true);
    const [viewPrescription, setViewPrescription] = useState<any>(null);
    const [prescriptionRefresh, setPrescriptionRefresh] = useState(0);
    // State to track which cart items are in edit mode
    const [editingPrescriptions, setEditingPrescriptions] = useState<Set<number>>(new Set());
    // State to show duplicate warning
    const [showDuplicateWarning, setShowDuplicateWarning] = useState<string | null>(null);

    // Check if returning from prescription page
    useEffect(() => {
        const fromPrescription = sessionStorage.getItem("fromPrescription");
        if (fromPrescription === "true") {
            sessionStorage.removeItem("fromPrescription");
            setPrescriptionRefresh(prev => prev + 1);
        }
    }, []);

    // Helper function to get prescription from user's prescriptions array (database)
    // Updated to match DesktopCart implementation
    const getPrescriptionByCartId = (
        cartId: number,
        productSku?: string,
        cartItem?: CartItem
    ): any | null => {
        try {
            console.log(`🔍 [MobileCart getPrescriptionByCartId] Checking for cartId: ${cartId}, productSku: ${productSku}`);
            console.log(`🔍 [MobileCart getPrescriptionByCartId] Cart item prescription:`, cartItem?.prescription);
            
            // Check if cart item already has prescription linked
            if (cartItem?.prescription) {
                console.log('✅ Found prescription on cart item:', cartItem.prescription);
                return cartItem.prescription;
            }

            // Check user prescriptions from database
            if (userPrescriptions && userPrescriptions.length > 0) {
                console.log(`🔍 [MobileCart getPrescriptionByCartId] Checking ${userPrescriptions.length} user prescriptions...`);
                
                // Log first prescription structure for debugging
                if (userPrescriptions.length > 0) {
                    console.log(`🔍 [MobileCart getPrescriptionByCartId] Sample prescription structure:`, JSON.stringify(userPrescriptions[0], null, 2));
                }
                
                // ✅ FIX: Check multiple possible locations for cartId
                let prescription = userPrescriptions.find((p: any) => {
                    if (!p) return false;
                    
                    // Check nested data.associatedProduct.cartId
                    const dataCartId = p?.data?.associatedProduct?.cartId;
                    // Check root level associatedProduct.cartId
                    const rootCartId = p?.associatedProduct?.cartId;
                    // Also check if data itself has cartId
                    const directCartId = p?.data?.cartId || p?.cartId;
                    // Check if associatedProduct is at root level with cartId
                    const rootAssociatedCartId = p?.associatedProduct?.cartId;
                    
                    // Also check deeply nested structures
                    const deepDataCartId = p?.data?.data?.associatedProduct?.cartId;
                    
                    const matches = (dataCartId && String(dataCartId) === String(cartId)) ||
                                   (rootCartId && String(rootCartId) === String(cartId)) ||
                                   (directCartId && String(directCartId) === String(cartId)) ||
                                   (rootAssociatedCartId && String(rootAssociatedCartId) === String(cartId)) ||
                                   (deepDataCartId && String(deepDataCartId) === String(cartId));
                    
                    if (matches) {
                        console.log('✅ [MobileCart getPrescriptionByCartId] Found matching prescription:', {
                            dataCartId,
                            rootCartId,
                            directCartId,
                            rootAssociatedCartId,
                            deepDataCartId,
                            fullPrescription: p
                        });
                    }
                    
                    return matches;
                });

                // Optional fallback (if cartId missing, try productSku)
                if (!prescription && productSku) {
                    console.log(`🔍 [MobileCart getPrescriptionByCartId] Trying productSku fallback: ${productSku}`);
                    prescription = userPrescriptions.find((p: any) => {
                        if (!p) return false;
                        const dataSku = p?.data?.associatedProduct?.productSku;
                        const rootSku = p?.associatedProduct?.productSku;
                        const deepDataSku = p?.data?.data?.associatedProduct?.productSku;
                        return (dataSku && dataSku === productSku) ||
                               (rootSku && rootSku === productSku) ||
                               (deepDataSku && deepDataSku === productSku);
                    });
                    if (prescription) {
                        console.log('✅ [MobileCart getPrescriptionByCartId] Found prescription by productSku:', prescription);
                    }
                }

                if (prescription) {
                    console.log('✅ [MobileCart getPrescriptionByCartId] Returning prescription from database:', prescription);
                    return prescription;
                }
            } else {
                console.log(`⚠️ [MobileCart getPrescriptionByCartId] No user prescriptions available (count: ${userPrescriptions?.length || 0})`);
            }

            // Also check localStorage as fallback
            try {
                const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
                console.log(`🔍 [MobileCart getPrescriptionByCartId] Checking ${localPrescriptions.length} localStorage prescriptions...`);
                const localPrescription = localPrescriptions.find((p: any) => {
                    const pCartId = p?.associatedProduct?.cartId;
                    const matches = pCartId && String(pCartId) === String(cartId);
                    if (matches) {
                        console.log('✅ [MobileCart getPrescriptionByCartId] Found matching localStorage prescription:', p);
                    }
                    return matches;
                });
                if (localPrescription) {
                    console.log('✅ [MobileCart getPrescriptionByCartId] Returning prescription from localStorage:', localPrescription);
                    return localPrescription;
                }
            } catch (e) {
                console.error("❌ [MobileCart getPrescriptionByCartId] Error checking localStorage prescriptions:", e);
            }

            // Check session storage for product-based prescriptions (from product pages)
            try {
                if (productSku) {
                    const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
                    const productPrescription = sessionPrescriptions[productSku];
                    if (productPrescription) {
                        console.log('✅ [MobileCart getPrescriptionByCartId] Found prescription in sessionStorage for product SKU:', productSku);
                        // Link it to this cart item
                        if (productPrescription.associatedProduct) {
                            productPrescription.associatedProduct.cartId = String(cartId);
                            // Update session storage with cartId
                            sessionPrescriptions[productSku] = productPrescription;
                            sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
                            console.log('✅ [MobileCart getPrescriptionByCartId] Linked prescription to cartId:', cartId);
                        }
                        return productPrescription;
                    }
                }
            } catch (e) {
                console.error("❌ [MobileCart getPrescriptionByCartId] Error checking sessionStorage prescriptions:", e);
            }

            console.log(`❌ [MobileCart getPrescriptionByCartId] No prescription found for cartId: ${cartId}`);
            return null;
        } catch (error) {
            console.error("❌ [MobileCart getPrescriptionByCartId] Error fetching prescription:", error);
            return null;
        }
    };

    // Handle remove prescription
    const handleRemovePrescription = async (cartId: number, prescription: any) => {
        if (!window.confirm("Are you sure you want to remove this prescription?")) {
            return;
        }

        try {
            // If prescription has an ID, delete it from database
            if (prescription.id || prescription._id) {
                const prescriptionId = prescription.id || prescription._id;
                await deletePrescription(prescriptionId);
                console.log("✅ Prescription deleted from database");
            }

            // Also remove from cart via API
            try {
                await removePrescription(cartId);
                console.log("✅ Prescription removed from cart");
            } catch (err) {
                console.warn("Warning: Could not remove prescription from cart via API", err);
            }

            // Remove from localStorage
            try {
                const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
                const filtered = localPrescriptions.filter((p: any) => {
                    const pCartId = p?.associatedProduct?.cartId;
                    return !pCartId || String(pCartId) !== String(cartId);
                });
                localStorage.setItem('prescriptions', JSON.stringify(filtered));
                console.log("✅ Prescription removed from localStorage");
            } catch (e) {
                console.error("Error removing from localStorage:", e);
            }

            // Refresh prescriptions and cart
            if (authData.isAuthenticated && refetchPrescriptions) {
                refetchPrescriptions();
            }
            if (refetchCart) {
                refetchCart();
            }
            setPrescriptionRefresh(prev => prev + 1);
            setViewPrescription(null);

            alert("Prescription removed successfully!");
        } catch (error) {
            console.error("Error removing prescription:", error);
            alert("Failed to remove prescription. Please try again.");
        }
    };

    // Toggle edit mode for a specific cart item
    const toggleEditMode = (cartId: number) => {
        const newEditingSet = new Set(editingPrescriptions);
        if (newEditingSet.has(cartId)) {
            newEditingSet.delete(cartId);
        } else {
            newEditingSet.add(cartId);
        }
        setEditingPrescriptions(newEditingSet);
    };

    // Check if product with different prescription state already exists
    const checkForDuplicateProduct = (currentItem: CartItem, change: number): boolean => {
        if (change <= 0) return false; // Only check when increasing quantity
        
        const currentSku = currentItem.product?.products?.skuid || currentItem.product_id;
        const currentPrescription = getPrescriptionByCartId(currentItem.cart_id, currentSku, currentItem);
        const hasPrescription = !!currentPrescription;

        // Check if there's another item with the same SKU but different prescription state
        const duplicateExists = cartItems.some(item => {
            if (item.cart_id === currentItem.cart_id) return false; // Skip current item
            
            const itemSku = item.product?.products?.skuid || item.product_id;
            const itemPrescription = getPrescriptionByCartId(item.cart_id, itemSku, item);
            const itemHasPrescription = !!itemPrescription;
            
            // Check if same product but different prescription state
            return itemSku === currentSku && itemHasPrescription !== hasPrescription;
        });

        if (duplicateExists) {
            const productName = currentItem.product?.products?.naming_system || currentItem.product?.products?.brand || "This product";
            setShowDuplicateWarning(`${productName} already exists in your cart with a different prescription state. Please manage prescriptions separately.`);
            setTimeout(() => setShowDuplicateWarning(null), 5000);
            return true;
        }

        return false;
    };

    // Handle quantity change with duplicate check
    const handleQuantityChangeWithCheck = (cartId: number, currentQuantity: number, change: number) => {
        const currentItem = cartItems.find(item => item.cart_id === cartId);
        if (!currentItem) return;

        // Check for duplicates when increasing quantity
        if (change > 0 && checkForDuplicateProduct(currentItem, change)) {
            return; // Don't proceed with quantity change
        }

        // Proceed with normal quantity change
        handleQuantityChange(cartId, currentQuantity, change);
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
                        <button
                            onClick={() => setShowDuplicateWarning(null)}
                            className="ml-auto text-yellow-600 hover:text-yellow-800"
                        >
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

            {/* Cart Items with Table Structure */}
            {cartItems.map((item) => (
                <div key={item.cart_id} className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
                    {/* Item Header with Product Info */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-start gap-4">
                            {/* Product Image */}
                            <div
                                className="w-24 h-24 bg-white rounded border border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden"
                                onClick={() => {
                                    const productId = item.product?.products?.skuid;
                                    if (productId) {
                                        navigate(`/product/${productId}`, {
                                            state: { product: item.product?.products },
                                        });
                                    }
                                }}
                            >
                                <img
                                    src={
                                        item.product?.products?.image ||
                                        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=300"
                                    }
                                    alt={item.product?.products?.name}
                                    className="w-full h-full object-contain mix-blend-multiply p-2"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {item.product?.products?.naming_system || item.product?.products?.brand || "BERG"}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{
                                            backgroundColor: item.product?.products?.framecolor?.toLowerCase() || "#F5F5F5",
                                        }}
                                    />
                                    <span className="text-sm text-gray-600">
                                        {formatFrameSize(item.product?.products?.size)}
                                    </span>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => handleDeleteItem(item.cart_id)}
                                className="text-red-500 text-sm font-medium hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>

                    {/* Price Details Table */}
                    <div className="p-4">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 text-gray-700 font-medium">Frame</td>
                                    <td className="py-3 text-right text-gray-900 font-medium">£{Number(item.product?.products?.list_price).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 text-gray-700 font-medium">{getLensTypeDisplay(item)}</td>
                                    <td className="py-3 text-right text-gray-900 font-medium">
                                        {getLensIndex(item).index}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 text-gray-700 font-medium">Lens Index</td>
                                    <td className="py-3 text-right text-gray-900 font-medium">£{Number(item.lens?.selling_price || 0).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 text-gray-700 font-medium">{getLensCoating(item).name}</td>
                                    <td className="py-3 text-right text-gray-900 font-medium">£{Number(getLensCoating(item).price || 0).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 text-gray-700 font-medium">Quantity</td>
                                    <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                disabled={isQuantityUpdating}
                                                onClick={() => handleQuantityChangeWithCheck(item.cart_id, item.quantity || 1, -1)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 font-bold border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="min-w-[20px] text-center font-bold">
                                                {item.quantity || 1}
                                            </span>
                                            <button
                                                disabled={isQuantityUpdating}
                                                onClick={() => handleQuantityChangeWithCheck(item.cart_id, item.quantity || 1, 1)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 font-bold border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-gray-900 font-bold text-lg">Subtotal</td>
                                    <td className="py-3 text-right text-gray-900 font-bold text-lg">
                                        £{(
                                            (Number(item.product?.products?.list_price || 0) +
                                                Number(item.lens?.selling_price || 0) +
                                                Number(getLensCoating(item).price || 0)) *
                                            (item.quantity || 1)
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Free Items Note */}
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Case & Cleaning cloth included for Free</span>
                            </p>
                        </div>

                        {/* Prescription Section */}
                        <div className="mt-4">
                            {(() => {
                                const _ = prescriptionRefresh; // Force re-evaluation
                                const productSku = item.product?.products?.skuid || item.product_id;
                                const prescription = getPrescriptionByCartId(item.cart_id, productSku, item);
                                const isEditing = editingPrescriptions.has(item.cart_id);
                                
                                if (prescription) {
                                    // Prescription exists - show View and Edit buttons
                                    return (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    console.log('📋 Opening prescription modal with data:', prescription);
                                                    setViewPrescription(prescription);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors w-full"
                                            >
                                                View Prescription
                                            </button>
                                            
                                            {!isEditing ? (
                                                // Show Edit Prescription button
                                                <button
                                                    onClick={() => toggleEditMode(item.cart_id)}
                                                    className="text-teal-700 hover:text-teal-800 text-sm font-medium underline transition-colors self-start"
                                                >
                                                    Edit Prescription
                                                </button>
                                            ) : (
                                                // Show Upload and Manual options
                                                <div className="flex flex-col gap-2 pl-4 border-l-2 border-teal-200">
                                                    <button
                                                        onClick={() => {
                                                            // Navigate to upload prescription page with cart_id
                                                            navigate(`/upload-prescription?cart_id=${item.cart_id}`);
                                                        }}
                                                        className="text-teal-700 hover:text-teal-800 text-sm font-medium underline transition-colors self-start"
                                                        title="Upload a new prescription image to replace existing one"
                                                    >
                                                        Upload Prescription
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // Navigate to manual prescription page with cart_id
                                                            navigate(`/manual-prescription?cart_id=${item.cart_id}`);
                                                        }}
                                                        className="text-teal-700 hover:text-teal-800 text-sm font-medium underline transition-colors self-start"
                                                        title="Add manual prescription to replace existing one"
                                                    >
                                                        Manual Prescription
                                                    </button>
                                                    <button
                                                        onClick={() => toggleEditMode(item.cart_id)}
                                                        className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors self-start mt-1"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                } else {
                                    // No prescription - show ONLY Add Prescription button
                                    return (
                                        <button
                                            onClick={() => {
                                                // Check for duplicate before adding prescription
                                                const hasDuplicateWithPrescription = cartItems.some(cartItem => {
                                                    if (cartItem.cart_id === item.cart_id) return false;
                                                    const itemSku = cartItem.product?.products?.skuid || cartItem.product_id;
                                                    const currentSku = item.product?.products?.skuid || item.product_id;
                                                    const itemPrescription = getPrescriptionByCartId(cartItem.cart_id, itemSku, cartItem);
                                                    
                                                    return itemSku === currentSku && !!itemPrescription;
                                                });

                                                if (hasDuplicateWithPrescription) {
                                                    setShowDuplicateWarning("This product already exists in your cart with a prescription. Please use that item or remove it first.");
                                                    setTimeout(() => setShowDuplicateWarning(null), 5000);
                                                    return;
                                                }

                                                // Redirect to manual prescription page with cart_id
                                                navigate(`/manual-prescription?cart_id=${item.cart_id}`);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors w-full"
                                        >
                                            Add Prescription
                                        </button>
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
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || !!cartData?.coupon}
                        className="bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                    >
                        Apply
                    </button>
                </div>

                {!cartData?.coupon && (
                    <div className="border border-dashed border-teal-700 bg-teal-50 p-3 rounded flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">Available Code:</span>
                                <button className="bg-white border border-teal-700 px-2 py-0.5 rounded text-xs font-bold">
                                    LAUNCH50
                                </button>
                            </div>
                            <span
                                onClick={() => setTerms(true)}
                                className="text-teal-700 underline text-xs cursor-pointer"
                            >
                                View Details
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setCouponCode("LAUNCH50");
                                handleApplyCoupon();
                            }}
                            className="bg-teal-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                            Apply
                        </button>
                    </div>
                )}

                <CouponTermsDialog
                    open={terms}
                    onClose={() => setTerms(false)}
                    couponCode="LAUNCH50"
                    onAgree={() => {
                        setCouponCode("LAUNCH50");
                        handleApplyCoupon();
                        setTerms(false);
                    }}
                />

                {cartData?.coupon && (
                    <div className="mt-3 flex justify-between items-center bg-green-50 p-2 rounded border border-green-100">
                        <span className="text-green-700 text-sm font-medium">
                            Code <b>{cartData.coupon.code}</b> applied!
                        </span>
                        <button
                            onClick={handleRemoveCoupon}
                            className="text-red-500 text-xs font-medium hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Shipping Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Method</h3>
                <div className="space-y-2">
                    {[
                        {
                            id: "standard",
                            label: "Standard Shipping",
                            time: "8-12 working days",
                            price: cartData?.subtotal > 75 ? "Free" : "£6",
                        },
                        {
                            id: "express",
                            label: "Express Shipping",
                            time: "4-6 working days",
                            price: "£29",
                        },
                    ].map((method) => (
                        <label
                            key={method.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                        >
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <input
                                    type="radio"
                                    name="shipping_mobile"
                                    checked={shippingMethod === method.id}
                                    onChange={() => handleShippingChange(method.id)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded-full border ${shippingMethod === method.id ? "border-red-500" : "border-gray-300"
                                        } bg-white transition-colors`}
                                />
                                {shippingMethod === method.id && (
                                    <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                    {method.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {method.time} - {method.price}
                                </div>
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
                        <tr className="border-b border-gray-200">
                            <td className="py-2 text-gray-700 font-medium">Price</td>
                            <td className="py-2 text-right text-gray-900 font-medium">£{frontendSubtotal.toFixed(2)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td className="py-2 text-gray-700 font-medium">Subtotal</td>
                            <td className="py-2 text-right text-gray-900 font-medium">£{frontendSubtotal.toFixed(0)}</td>
                        </tr>
                        {discountAmount > 0 && (
                            <tr className="border-b border-gray-200">
                                <td className="py-2 text-green-600 font-medium">Discount ({cartData.coupon?.code})</td>
                                <td className="py-2 text-right text-green-600 font-medium">-£{discountAmount.toFixed(2)}</td>
                            </tr>
                        )}
                        <tr className="border-b border-gray-200">
                            <td className="py-2 text-gray-700 font-medium">Shipping</td>
                            <td className="py-2 text-right text-gray-900 font-medium">£{Number(shippingCost).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="py-3 text-gray-900 font-bold text-lg">Total Payables</td>
                            <td className="py-3 text-right text-gray-900 font-bold text-lg">£{frontendTotalPayable.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Prices includes applicable VAT</p>
                </div>
            </div>

            {/* Trust & Policy Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src="/fda.png"
                        alt="FDA Approved"
                        className="w-48 h-auto object-contain"
                    />
                    <div className="flex justify-center items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <p className="text-gray-700 text-sm font-medium">Secure Payment</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <p className="text-gray-700 text-sm font-medium">30 Days Easy Refund</p>
                        </div>
                    </div>
                    <img
                        src="/sda.png"
                        alt="Payment Methods"
                        className="w-56 h-auto object-contain"
                    />
                </div>
            </div>

            {/* Mobile Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex flex-col px-4 py-3 gap-3">
                    <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-bold text-gray-800">Total:</p>
                        <p className="text-lg font-bold text-gray-800">£{frontendTotalPayable.toFixed(0)}</p>
                    </div>

                 <button
    onClick={() => {
        if (localStorage.getItem("token")) {
            navigate("/payment");
        } else {
            sessionStorage.setItem("returnTo", "/payment");  // ← Fixed to redirect to payment
            setShowLoginModal(true);
        }
    }}
    className="w-full bg-gray-800 text-white py-3 rounded font-medium text-sm hover:bg-black transition-colors"
>
    Checkout
</button>
                </div>
            </div>

            {/* Manual Prescription Modal - Removed onRemove prop to hide the remove button */}
            <ManualPrescriptionModal
                open={!!viewPrescription}
                onClose={() => setViewPrescription(null)}
                prescription={viewPrescription}
            />
        </div>
    );
};

export default MobileCart;
