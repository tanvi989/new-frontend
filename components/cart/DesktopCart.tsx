import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCart,
    deleteProductFromCart,
    clearCart,
    updateCartQuantity,
    applyCoupon,
    removeCoupon,
    updateShippingMethod,
    getMyPrescriptions,
    updateMyPrescriptionCartId,
    deletePrescription,
    removePrescription
} from "../../api/retailerApis";
import { CartItem } from "../../types";
import Loader from "../Loader";
import DeleteDialog from "../DeleteDialog";
import { LoginModal } from "../LoginModal";
import SignUpModal from "../SignUpModal";
import ManualPrescriptionModal from "../ManualPrescriptionModal";
import { getLensCoating, getTintInfo, calculateCartSubtotal, calculateItemTotal, getLensPackagePrice, getCartLensOverride, getLensTypeDisplay, getLensIndex } from "../../utils/priceUtils";

const DesktopCart: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
    const pendingDeleteCartIdRef = useRef<number | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [shippingMethod, setShippingMethod] = useState<string>("standard");
    const [isMounting, setIsMounting] = useState(true);

    // Prescription Modal State
    const [viewPrescription, setViewPrescription] = useState<any>(null);
    const [prescriptionRefresh, setPrescriptionRefresh] = useState(0);
    // State to track which cart items are in edit mode
    const [editingPrescriptions, setEditingPrescriptions] = useState<Set<number>>(new Set());

    // Auth State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState("");
    
    // Add a flag to prevent unnecessary cart refreshes
    const [preventCartRefresh, setPreventCartRefresh] = useState(false);
    
    // Add refs to track component state
    const isMountedRef = useRef(true);
    const lastAuthStateRef = useRef({
        isAuthenticated: !!localStorage.getItem("token"),
        firstName: localStorage.getItem("firstName") || "User",
    });
    const cartUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle initial mount - show loader immediately
    useEffect(() => {
        isMountedRef.current = true;
        // Small delay to ensure smooth transition
        const timer = setTimeout(() => {
            if (isMountedRef.current) {
                setIsMounting(false);
            }
        }, 100);
        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
        };
    }, []);

    // Check if returning from prescription page
    useEffect(() => {
        if (!isMountedRef.current) return;
        
        const fromPrescription = sessionStorage.getItem("fromPrescription");
        if (fromPrescription === "true") {
            sessionStorage.removeItem("fromPrescription");
            // Force re-render to check localStorage for new prescriptions
            setPrescriptionRefresh(prev => prev + 1);
        }
    }, []);

    // Reactive Auth State
    const [authData, setAuthData] = useState(() => ({
        isAuthenticated: !!localStorage.getItem("token"),
        firstName: localStorage.getItem("firstName") || "User",
    }));

    // Check Auth on Mount & Listen for Updates - Optimized
    useEffect(() => {
        if (!isMountedRef.current) return;

        const checkAuth = () => {
            if (!isMountedRef.current) return;
            
            const token = localStorage.getItem("token");
            const name = localStorage.getItem("firstName");
            
            // Only update if auth state actually changed
            const newAuthState = {
                isAuthenticated: !!token,
                firstName: name || "User",
            };
            
            const authChanged = lastAuthStateRef.current.isAuthenticated !== newAuthState.isAuthenticated || 
                               lastAuthStateRef.current.firstName !== newAuthState.firstName;
            
            if (authChanged) {
                console.log('🔐 Auth state changed, updating...');
                lastAuthStateRef.current = newAuthState;
                setAuthData(newAuthState);

                // If user logs in elsewhere (or via modal), close modals and check for redirect
                if (token && !authData.isAuthenticated) {
                    setShowLoginModal(false);
                    setShowSignUpModal(false);
                    
                    // Check for redirect destination
                    const returnTo = sessionStorage.getItem("returnTo");
                    if (returnTo) {
                        console.log('🔄 Redirecting to:', returnTo);
                        sessionStorage.removeItem("returnTo");
                        navigate(returnTo);
                    } else {
                        // Only refresh cart if not prevented
                        if (!preventCartRefresh) {
                            console.log('🔄 Refreshing cart after login...');
                            queryClient.invalidateQueries({ queryKey: ["cart"] });
                        } else {
                            // Reset the flag after using it
                            setPreventCartRefresh(false);
                        }
                    }
                }
            }
        };

        // Initial check
        checkAuth();

        // Listen for custom auth event
        const handleAuthChange = () => {
            console.log('🔐 Auth change event received');
            checkAuth();
        };
        window.addEventListener("auth-change", handleAuthChange);

        // Listen for cart-updated event with debouncing
        const handleCartUpdate = () => {
            console.log('🔄 Cart update event received');
            // Clear any pending timeout
            if (cartUpdateTimeoutRef.current) {
                clearTimeout(cartUpdateTimeoutRef.current);
            }
            // Debounce the cart refresh
            cartUpdateTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && !preventCartRefresh && !document.hidden) {
                    console.log('🔄 Refreshing cart after update...');
                    queryClient.invalidateQueries({ queryKey: ["cart"] });
                } else if (isMountedRef.current) {
                    // Reset the flag after using it
                    setPreventCartRefresh(false);
                }
            }, 300); // 300ms debounce
        };
        window.addEventListener("cart-updated", handleCartUpdate);

        // Handle visibility change to prevent refreshes when tab is not visible
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('📱 Page hidden, pausing operations');
            } else {
                console.log('📱 Page visible again');
                // Only refresh if it's been more than 5 minutes since last fetch
                const lastFetch = localStorage.getItem('cartLastFetch');
                if (lastFetch) {
                    const timeDiff = Date.now() - parseInt(lastFetch);
                    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
                        console.log('🔄 Data is stale, refreshing...');
                        queryClient.invalidateQueries({ queryKey: ["cart"] });
                    }
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMountedRef.current = false;
            window.removeEventListener("auth-change", handleAuthChange);
            window.removeEventListener("cart-updated", handleCartUpdate);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (cartUpdateTimeoutRef.current) {
                clearTimeout(cartUpdateTimeoutRef.current);
            }
        };
    }, [queryClient, preventCartRefresh, authData.isAuthenticated, navigate]); // Added navigate to dependencies

    const switchToSignUp = (email: string) => {
        setSignUpEmail(email);
        setShowLoginModal(false);
        setShowSignUpModal(true);
    };

    const switchToLogin = (email?: string) => {
        setShowSignUpModal(false);
        setShowLoginModal(true);
    };

    // Fetch user prescriptions from database
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    // Fetch User Prescriptions
    const { data: prescriptionsResponse, refetch: refetchPrescriptions } = useQuery({
        queryKey: ["prescriptions"],
        queryFn: () => getMyPrescriptions(),
        enabled: authData.isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
    });

    const userPrescriptions = prescriptionsResponse?.data?.data || [];

    // Refetch prescriptions when returning from prescription page
    useEffect(() => {
        const fromPrescription = sessionStorage.getItem("fromPrescription");
        if (fromPrescription === "true") {
            console.log("🔄 [DesktopCart] Returning from prescription page, refreshing data...");
            sessionStorage.removeItem("fromPrescription");
            // Refetch prescriptions to get the latest data
            if (authData.isAuthenticated) {
                console.log("🔄 [DesktopCart] Refetching prescriptions from database...");
                // Add a small delay to ensure backend has processed the save
                setTimeout(() => {
                    refetchPrescriptions().then(() => {
                        console.log("✅ [DesktopCart] Prescriptions refetched");
                        // Force re-render to check for new prescriptions
                        setPrescriptionRefresh(prev => prev + 1);
                    });
                }, 1000);
            } else {
                // For non-authenticated users, just refresh the state
                setPrescriptionRefresh(prev => prev + 1);
            }
        }
    }, [refetchPrescriptions, authData.isAuthenticated]);

    // Fetch Cart Data - Optimized
    const {
        data: cartResponse,
        isLoading,
        refetch,
        isFetched,
        isFetching
    } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            try {
                console.log("🛒 Fetching cart data...");
                const response: any = await getCart({});
                // Store last fetch timestamp
                localStorage.setItem('cartLastFetch', Date.now().toString());
                return response?.data || {};
            } catch (error: any) {
                console.error("❌ Failed to fetch cart", error);
                return { error: error.message || "Unknown error" };
            }
        },
        staleTime: 5 * 60 * 1000, // Increased to 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
        refetchOnMount: false, // Changed to false to prevent refetch on mount
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnReconnect: true, // Allow refetch on reconnect
        retry: 2, // Retry failed requests 2 times
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });

    // Force initial fetch if not already fetched
    useEffect(() => {
        if (!isFetched && !isLoading && isMountedRef.current) {
            refetch();
        }
    }, [isFetched, isLoading, refetch]);

    if (cartResponse?.error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold">
                Error loading cart: {JSON.stringify(cartResponse.error)}
            </div>
        );
    }

    const cartItems = (cartResponse?.cart as CartItem[]) || [];
    const cartData = cartResponse; // Contains summary, coupon, shipping info

    // Sync shipping method from server response when available
    useEffect(() => {
        if (cartData?.shipping_method?.id) {
            setShippingMethod(cartData.shipping_method.id);
        }
    }, [cartData?.shipping_method?.id]);

    // Coupon Mutations
    const { mutate: applyCouponMutation } = useMutation({
        mutationFn: applyCoupon,
        onSuccess: (res: any) => {
            if (res.data.success) {
                refetch();
                setCouponCode("");
                alert("Coupon applied successfully!");
            } else {
                alert(res.data.message || "Failed to apply coupon");
            }
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || "Failed to apply coupon");
        },
    });

    const { mutate: removeCouponMutation } = useMutation({
        mutationFn: removeCoupon,
        onSuccess: () => {
            refetch();
            alert("Coupon removed successfully!");
        },
    });

    const { mutate: updateShippingMutation } = useMutation({
        mutationFn: updateShippingMethod,
        onMutate: async (newMethodId: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            // Snapshot the previous value
            const previousCartData = queryClient.getQueryData(["cart"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["cart"], (oldData: any) => {
                if (!oldData) return oldData;

                // Define shipping costs (Must match backend logic)
                // Standard: $6 (Free > $75), Express: $29
                const methodCost = newMethodId === "express" ? 29 : (oldData.subtotal > 75 ? 0 : 6);
                const methodObj = newMethodId === "express"
                    ? { id: "express", name: "Express Shipping", cost: 29, free_threshold: null }
                    : { id: "standard", name: "Standard Shipping", cost: 6, free_threshold: 75 };

                // Recalculate totals
                // total_payable = subtotal - discount + new_shipping
                const newTotal = Number(oldData.subtotal) - Number(oldData.discount_amount || 0) + methodCost;

                return {
                    ...oldData,
                    shipping_method: methodObj,
                    shipping_cost: methodCost, // Update the displayed cost
                    total_payable: newTotal.toFixed(2), // Update the total
                };
            });

            // Return a context object with the snapshotted value
            return { previousCartData };
        },
        onError: (_err, _newMethod, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousCartData) {
                queryClient.setQueryData(["cart"], context.previousCartData);
            }
            alert("Failed to update shipping method.");
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server sync
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

    const handleApplyCoupon = () => {
        if (couponCode.trim()) {
            applyCouponMutation(couponCode);
        }
    };

    const handleRemoveCoupon = () => {
        removeCouponMutation();
    };

    const handleShippingChange = (method: string) => {
        setShippingMethod(method);
        updateShippingMutation(method);
    };

    // Delete Mutation (API + localStorage fallback in deleteProductFromCart)
    const { mutate: handleDeleteItem } = useMutation({
        mutationFn: (cartId: number) =>
            deleteProductFromCart(Number(cartId), undefined, undefined),
        onMutate: async (cartId) => {
            setDeleteDialog(false);
            setSelectedCartId(null);
            await queryClient.cancelQueries({ queryKey: ["cart"] });
            const previous = queryClient.getQueryData(["cart"]);
            queryClient.setQueryData(["cart"], (old: any) => {
                if (!old?.cart) return old;
                return {
                    ...old,
                    cart: (old.cart || []).filter((item: any) => Number(item.cart_id) !== Number(cartId)),
                };
            });
            return { previous };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: any, _cartId, context: any) => {
            console.error("Delete failed:", error);
            if (context?.previous) queryClient.setQueryData(["cart"], context.previous);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    const handleDeleteClick = (cartId: number) => {
        pendingDeleteCartIdRef.current = cartId;
        setSelectedCartId(cartId);
        setDeleteDialog(true);
    };

    useEffect(() => {
        if (!selectedCartId || !viewPrescription) return;

        const existingCartId =
            viewPrescription?.data?.associatedProduct?.cartId;

        // ✅ update only if cartId missing
        if (!existingCartId) {
            updateMyPrescriptionCartId(viewPrescription.id, String(selectedCartId));
        }
    }, [selectedCartId, viewPrescription]);

    const confirmDelete = () => {
        const idToDelete = pendingDeleteCartIdRef.current ?? selectedCartId;
        pendingDeleteCartIdRef.current = null;
        setDeleteDialog(false);
        setSelectedCartId(null);
        if (idToDelete != null) handleDeleteItem(idToDelete);
    };

    // Clear All cart mutation
    const { mutate: handleClearCart, isPending: isClearingCart } = useMutation({
        mutationFn: () => clearCart(),
        onSuccess: () => {
            setDeleteDialog(false);
            setSelectedCartId(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: () => {
            refetch();
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    // Helper function to safely get coating from an item
    const getCoatingFromItem = (item: CartItem) => {
        return (item as any).coating || null;
    };

    // Handle adding duplicate product instead of increasing quantity
    const handleAddDuplicateProduct = async (item: CartItem) => {
        try {
            // You'll need to implement an API call to add the same product to cart
            // This is a placeholder - you'll need to replace with your actual API call
            const productData = {
                product_id: item.product?.products?.skuid || item.product_id,
                quantity: 1,
                // Include any other necessary product data
                lens_type: item.lens?.type,
                lens_index: item.lens?.index,
                // Fixed: Use type assertion to access coating property
                coating: getCoatingFromItem(item)?.type,
            };

            // Call your API to add product to cart
            // await addToCart(productData);
            
            // For now, we'll just show an alert and refresh
            alert("Adding duplicate product to cart...");
            
            // Refresh cart to show new item
            refetch();
            
            console.log("🛒 Added duplicate product to cart:", productData);
        } catch (error) {
            console.error("Error adding duplicate product:", error);
            alert("Failed to add duplicate product. Please try again.");
        }
    };

    // Handle quantity change - +1 adds duplicate, -1 reduces quantity
    const handleQuantityChangeCustom = (
        cartId: number,
        currentQuantity: number,
        change: number
    ) => {
        const currentItem = cartItems.find(item => item.cart_id === cartId);
        if (!currentItem) return;

        if (change > 0) {
            // Add duplicate product instead of increasing quantity
            handleAddDuplicateProduct(currentItem);
        } else if (change < 0 && currentQuantity > 1) {
            // Reduce quantity normally
            handleUpdateQuantity({ cartId, quantity: currentQuantity + change });
        } else if (change < 0 && currentQuantity <= 1) {
            // If quantity is 1 and user tries to reduce, ask if they want to remove the item
            if (window.confirm("Remove this item from cart?")) {
                handleDeleteItem(cartId);
            }
        }
    };

    // Update Quantity Mutation with optimistic UI
    const {
        mutate: handleUpdateQuantity,
        isPending: isQuantityUpdating,
    } = useMutation({
        mutationFn: ({
            cartId,
            quantity,
        }: {
            cartId: number;
            quantity: number;
        }) => updateCartQuantity(cartId, quantity),
        onMutate: async ({ cartId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });
            const previous = queryClient.getQueryData(["cart"]);

            queryClient.setQueryData(["cart"], (oldData: any) => {
                if (!oldData) return oldData;
                const updatedCart = (oldData.cart || []).map((item: CartItem) =>
                    item.cart_id === cartId ? { ...item, quantity } : item
                );

                const subtotal = updatedCart.reduce((sum: number, item: CartItem) => {
                    // calculateItemTotal already includes tint/coating and quantity
                    return sum + calculateItemTotal(item);
                }, 0);

                const shipping_cost = oldData.shipping_cost ?? 0;
                const discount_amount = oldData.discount_amount ?? 0;
                const total_payable = subtotal - discount_amount + shipping_cost;

                return {
                    ...oldData,
                    cart: updatedCart,
                    subtotal,
                    total_payable,
                };
            });

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["cart"], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

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

    // Debug: Log prescription data when it changes
    useEffect(() => {
        if (cartItems.length > 0) {
            console.log("🔍 [DesktopCart] Cart items and prescriptions check:");
            console.log("  Cart Items Count:", cartItems.length);
            console.log("  User Prescriptions Count:", userPrescriptions.length);
            
            if (userPrescriptions.length > 0) {
                console.log("  User Prescriptions Structure:", userPrescriptions.map((p: any) => ({
                    id: p.id || p._id,
                    cartId: p?.data?.associatedProduct?.cartId || p?.associatedProduct?.cartId,
                    productSku: p?.data?.associatedProduct?.productSku || p?.associatedProduct?.productSku,
                })));
            }
            
            // Check each cart item for prescription
            cartItems.forEach((item: CartItem) => {
                const productSku = item.product?.products?.skuid || item.product_id;
                const prescription = getPrescriptionByCartId(item.cart_id, productSku, item);
                console.log(`  Cart Item ${item.cart_id} (SKU: ${productSku}): ${prescription ? '✅ HAS PRESCRIPTION' : '❌ NO PRESCRIPTION'}`);
            });
        }
    }, [cartItems, userPrescriptions, prescriptionRefresh]);

    // Helper function to get prescription from user's prescriptions array (database)
    const getPrescriptionByCartId = (
        cartId: number,
        productSku?: string,
        cartItem?: CartItem
    ): any | null => {
        try {
            console.log(`🔍 [getPrescriptionByCartId] Checking for cartId: ${cartId}, productSku: ${productSku}`);
            console.log(`🔍 [getPrescriptionByCartId] Cart item prescription:`, cartItem?.prescription);
            
            // Check if cart item already has prescription linked
            if (cartItem?.prescription) {
                console.log('✅ Found prescription on cart item:', cartItem.prescription);
                return cartItem.prescription;
            }

            // Check user prescriptions from database
            if (userPrescriptions && userPrescriptions.length > 0) {
                console.log(`🔍 [getPrescriptionByCartId] Checking ${userPrescriptions.length} user prescriptions...`);
                
                // Log first prescription structure for debugging
                if (userPrescriptions.length > 0) {
                    console.log(`🔍 [getPrescriptionByCartId] Sample prescription structure:`, JSON.stringify(userPrescriptions[0], null, 2));
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
                        console.log('✅ [getPrescriptionByCartId] Found matching prescription:', {
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
                    console.log(`🔍 [getPrescriptionByCartId] Trying productSku fallback: ${productSku}`);
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
                        console.log('✅ [getPrescriptionByCartId] Found prescription by productSku:', prescription);
                    }
                }

                if (prescription) {
                    console.log('✅ [getPrescriptionByCartId] Returning prescription from database:', prescription);
                    return prescription;
                }
            } else {
                console.log(`⚠️ [getPrescriptionByCartId] No user prescriptions available (count: ${userPrescriptions?.length || 0})`);
            }

            // Also check localStorage as fallback
            try {
                const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
                console.log(`🔍 [getPrescriptionByCartId] Checking ${localPrescriptions.length} localStorage prescriptions...`);
                const localPrescription = localPrescriptions.find((p: any) => {
                    const pCartId = p?.associatedProduct?.cartId;
                    const matches = pCartId && String(pCartId) === String(cartId);
                    if (matches) {
                        console.log('✅ [getPrescriptionByCartId] Found matching localStorage prescription:', p);
                    }
                    return matches;
                });
                if (localPrescription) {
                    console.log('✅ [getPrescriptionByCartId] Returning prescription from localStorage:', localPrescription);
                    return localPrescription;
                }
            } catch (e) {
                console.error("❌ [getPrescriptionByCartId] Error checking localStorage prescriptions:", e);
            }

            // Check session storage for product-based prescriptions (from product pages)
            try {
                if (productSku) {
                    const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
                    const productPrescription = sessionPrescriptions[productSku];
                    if (productPrescription) {
                        console.log('✅ [getPrescriptionByCartId] Found prescription in sessionStorage for product SKU:', productSku);
                        // Link it to this cart item
                        if (productPrescription.associatedProduct) {
                            productPrescription.associatedProduct.cartId = String(cartId);
                            // Update session storage with cartId
                            sessionPrescriptions[productSku] = productPrescription;
                            sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
                            console.log('✅ [getPrescriptionByCartId] Linked prescription to cartId:', cartId);
                        }
                        return productPrescription;
                    }
                }
            } catch (e) {
                console.error("❌ [getPrescriptionByCartId] Error checking sessionStorage prescriptions:", e);
            }

            console.log(`❌ [getPrescriptionByCartId] No prescription found for cartId: ${cartId}`);
            return null;
        } catch (error) {
            console.error("❌ [getPrescriptionByCartId] Error fetching prescription:", error);
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
            if (authData.isAuthenticated) {
                refetchPrescriptions();
            }
            refetch();
            setPrescriptionRefresh(prev => prev + 1);
            setViewPrescription(null);

            alert("Prescription removed successfully!");
        } catch (error) {
            console.error("Error removing prescription:", error);
            alert("Failed to remove prescription. Please try again.");
        }
    };

    // Helper function to format frame size
    const formatFrameSize = (size?: string): string => {
        if (!size) return "MEDIUM";
        const sizeUpper = size.toUpperCase().trim();
        if (sizeUpper === "S" || sizeUpper === "SMALL") return "SMALL";
        if (sizeUpper === "M" || sizeUpper === "MEDIUM") return "MEDIUM";
        if (sizeUpper === "L" || sizeUpper === "LARGE") return "LARGE";
        return sizeUpper; // Return as-is if already formatted
    };

    // Helper function to get lens type display
    const getLensTypeDisplay = (item: CartItem): string => {
        const itemAny = item as any;
        const lensAny = item.lens as any;

        // Check override first (this is where frontend stores the selected lens category and tier)
        const override = getCartLensOverride(item.cart_id);

        // Use override mainCategory if available, otherwise use backend main_category
        const mainCategory = override?.mainCategory || item.lens?.main_category || "";

        // DEBUG: Log the lens data to see what we're working with
        console.log("🔍 DEBUG getLensTypeDisplay:", {
            cart_id: item.cart_id,
            override_mainCategory: override?.mainCategory,
            backend_main_category: item.lens?.main_category,
            final_mainCategory: mainCategory,
            override_lensCategory: override?.lensCategory,
            lens_category: lensAny?.lens_category,
            lensCategory: itemAny?.lensCategory,
            sub_category: lensAny?.sub_category,
            full_override: override,
            full_lens: lensAny,
            full_item: itemAny
        });

        // Extract prescription tier from main_category
        let tier = "";
        const mainCategoryLower = mainCategory.toLowerCase();
        if (mainCategoryLower.includes("premium progressive")) {
            tier = "Premium Progressive";
        } else if (mainCategoryLower.includes("standard progressive")) {
            tier = "Standard Progressive";
        } else if (mainCategoryLower.includes("bifocal")) {
            tier = "Bifocal";
        } else if (mainCategoryLower.includes("progressive")) {
            // Generic progressive if not specified
            tier = "Progressive";
        } else {
            // Fallback to main_category if it doesn't match known patterns
            tier = mainCategory || "Progressive";
        }

        // Get lens category - check override first, then backend fields
        let category = "";
        const lensCategory = override?.lensCategory || lensAny?.lens_category || itemAny?.lensCategory;

        if (lensCategory) {
            const cat = String(lensCategory).toLowerCase();
            if (cat === "blue") category = "Blue Protect";
            else if (cat === "clear") category = "Clear";
            else if (cat === "photo" || cat === "photochromic") category = "Photochromic";
            else if (cat === "sun" || cat === "sunglasses") category = "Sunglasses";
        } else {
            // Try to extract from sub_category as fallback
            const subCategory = item.lens?.sub_category || "";
            const subLower = subCategory.toLowerCase();
            if (subLower.includes("blue")) {
                category = "Blue Protect";
            } else if (subLower.includes("clear")) {
                category = "Clear";
            } else if (subLower.includes("photo")) {
                category = "Photochromic";
            } else if (subLower.includes("sun")) {
                category = "Sunglasses";
            }
        }

        // Combine tier and category in the format: "Tier-Category"
        const result = category ? `${tier}-${category}` : tier;
        console.log("✅ getLensTypeDisplay result:", result);
        return result;
    };

    // Helper function to extract lens index
    const getLensIndex = (item: CartItem): { index: string; price: number } => {
        const itemAny = item as any;
        const lensAny = (itemAny?.lens ?? itemAny?.lens_data ?? itemAny?.lensData ?? item.lens) as any;
        const sellingPrice = getLensPackagePrice(item);
        const override = getCartLensOverride(item.cart_id);

        console.log("🔍 DEBUG getLensIndex:", {
            cart_id: item.cart_id,
            lens_package: lensAny?.lens_package,
            lensPackage: itemAny?.lensPackage,
            lensPackagePrice: itemAny?.lensPackagePrice,
            lens_title: lensAny?.title,
            lens_name: lensAny?.name,
            sub_category: lensAny?.sub_category,
            lens_category: lensAny?.lens_category,
            lensCategory: itemAny?.lensCategory,
            selling_price: sellingPrice,
            full_lens_object: lensAny
        });

        // Get the lens index number
        let indexNumber = "1.61"; // default
        let lensPackagePrice = sellingPrice;

        // 1. Try to get from item-level fields (from selectLens API call)
        if (override?.lensPackage) {
            indexNumber = String(override.lensPackage);
        } else if (itemAny?.lensPackage) {
            indexNumber = String(itemAny.lensPackage);
            lensPackagePrice = Number(itemAny?.lensPackagePrice ?? itemAny?.lens_package_price ?? sellingPrice);
        }
        // 2. Try to get from lens_package field in lens object
        else if (lensAny?.lens_package) {
            indexNumber = String(lensAny.lens_package);
        }
        // 3. Try to extract from lens title/name (e.g., "1.61 Blue Protect High Index")
        else if (lensAny?.title || lensAny?.name) {
            const lensTitle = lensAny?.title || lensAny?.name;
            const indexMatch = lensTitle.match(/(1\.\d+)/);
            if (indexMatch) {
                indexNumber = indexMatch[1];
            }
        }
        // 4. Try to extract index from sub_category (e.g., "1.61", "1.67", "1.74")
        else {
            const subCategory = lensAny?.sub_category || "";
            const indexMatch = subCategory.match(/(\d\.\d+)/);
            if (indexMatch) {
                indexNumber = indexMatch[1];
            }
        }

        // Get lens category to construct full name
        const lensCategory = itemAny?.lensCategory || lensAny?.lens_category || "";
        const cat = String(lensCategory).toLowerCase();

        // Construct the full lens package name
        let fullName = "";
        if (cat === "blue") {
            fullName = `${indexNumber} Blue Protect High Index`;
        } else if (cat === "photo" || cat === "photochromic") {
            fullName = `${indexNumber} Photochromic High Index`;
        } else if (cat === "sun" || cat === "sunglasses") {
            fullName = `${indexNumber} High Index`;
        } else if (cat === "clear" || cat === "") {
            fullName = `${indexNumber} High Index`;
        } else {
            // Fallback: just use the index number with "High Index"
            fullName = `${indexNumber} High Index`;
        }

        // console.log("✅ getLensIndex result:", { fullName, price: lensPackagePrice });
        const normalizedPrice = Number.isFinite(Number(lensPackagePrice)) ? Number(lensPackagePrice) : 0;
        return { index: fullName, price: normalizedPrice };
    };

    // Helper function to get lens coating - refactored to use shared utility
    // const getLensCoating = ... (logic moved to utils/priceUtils.ts)

    const hasError = !!cartResponse?.error;

    // Show loader during initial mount or when loading cart data
    if (isMounting || (isLoading && !isFetched)) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    // Frontend Calculation of Subtotal to ensure display consistency with item cards
    const frontendSubtotal = calculateCartSubtotal(cartItems);

    const discountAmount = Number(cartData?.discount_amount || 0);
    const shippingCost = Number(cartData?.shipping_cost || 0);
    const frontendTotalPayable = frontendSubtotal - discountAmount + shippingCost;

    console.log("cartItems", cartItems);
    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans pb-20 pt-10">

            {/* Main Content */}
            <div className="max-w-[1366px] mx-auto px-4 md:px-21 py-8">

                {cartItems.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-[36px] font-bold text-black">Your Cart</h1>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                                        handleClearCart();
                                    }
                                }}
                                disabled={isClearingCart}
                                className="text-sm font-bold text-[#E53935] hover:text-[#D32F2F] underline transition-colors disabled:opacity-50"
                            >
                                {isClearingCart ? 'Clearing...' : 'Clear All'}
                            </button>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column: Cart Items */}
                            <div className="flex-1">
                                {/* Satisfaction Banner */}
                                <div className="bg-[#f3f3f3] text-[#2E7D32] px-4 py-3 rounded-md text-center font-bold text-sm mb-6 border border-[#C8E6C9]">
                                    Satisfaction Guaranteed - Hassle Free 30 Days Refunds.
                                </div>

                                <div className="space-y-6">
                                    {cartItems.map((item) => (

                                        <div
                                            key={item.cart_id}
                                            className="bg-white p-4 md:p-6 relative"
                                        >
                                            {/* Remove Link */}
                                            <button
                                                onClick={() => handleDeleteClick(item.cart_id)}
                                                className="absolute top-2 right-2 md:top-0 md:right-0 text-[#E53935] text-xs font-bold hover:underline p-2 pr-4 underline"
                                            >
                                                Remove
                                            </button>

                                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-4">
                                                {/* Image Area */}
                                                <div className="w-full md:w-[240px] flex flex-col items-center shrink-0">
                                                    <div
                                                        className="w-full aspect-[4/3] flex items-center justify-center mb-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                        onClick={() => {
                                                            // PARSE ORIGINAL SKU from composite ID if needed
                                                            const rawProductId = item.product_id || item.product?.products?.skuid;
                                                            let productId = rawProductId;

                                                            if (rawProductId && typeof rawProductId === 'string' && rawProductId.includes('_')) {
                                                                productId = rawProductId.split('_')[0]; // Extract Real SKU
                                                            }

                                                            if (productId) {
                                                                navigate(`/product/${productId}`, {
                                                                    state: { product: item.product?.products }
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                item.product?.products?.image ||
                                                                item.product_details?.image ||
                                                                "/placeholder-product.png"
                                                            }
                                                            alt={item.product?.products?.name || item.product_details?.name}
                                                            className="w-[90%] h-full object-contain mix-blend-multiply"
                                                        />
                                                    </div>
                                                    <h3 className="font-bold text-[#1F1F1F] text-lg uppercase text-center mb-1">
                                                        {item.product?.products?.naming_system ||
                                                            item.product?.products?.brand ||
                                                            item.product_details?.name ||
                                                            "BERG"}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span>Color:</span>
                                                        {(() => {
                                                            const frameColor = item.product?.products?.framecolor || item.product_details?.frame_color;
                                                            const selectedColor = (item as any).selectedColor || (item as any).color;
                                                            const displayColor = selectedColor || frameColor?.toLowerCase() || "#F5F5F5";
                                                            return (
                                                                <div
                                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                                    style={{ backgroundColor: displayColor }}
                                                                ></div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Details Table */}
                                                <div className="flex-1">
                                                    <div className="border border-gray-200 text-sm">
                                                        {/* Prescription For */}

                                                        {/* Frame Price */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Frame Price:
                                                            </div>
                                                            <div className="w-2/3 p-3 text-right font-bold text-[#1F1F1F]">
                                                                £{Number(item.product?.products?.list_price || item.product_details?.price || 0).toFixed(2)}
                                                            </div>
                                                        </div>
                                                        {/* Frame Size */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Frame Size:
                                                            </div>
                                                            <div className="w-2/3 p-3 text-[#525252]">
                                                                {formatFrameSize(item.product?.products?.size)}
                                                            </div>
                                                        </div>
                                                        {/* Lens Type */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Lens Type:
                                                            </div>
                                                            <div className="w-2/3 p-3 text-[#525252]">
                                                                {getLensTypeDisplay(item)}
                                                            </div>
                                                        </div>

                                                        {/* Lens Index - Always show */}
                                                        <div className="flex border-b border-gray-200">
                                                            <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                Lens Index:
                                                            </div>
                                                            <div className="w-2/3 flex justify-between p-3">
                                                                <span className="text-[#525252]">
                                                                    {getLensIndex(item).index}
                                                                </span>
                                                                <span className="font-bold text-[#1F1F1F]">
                                                                    £{getLensIndex(item).price.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Conditionally show Lens Tint (for sunglasses) or Lens Coating (for regular glasses) */}
                                                        {getTintInfo(item) ? (
                                                            /* Sunglasses - Show Lens Tint */
                                                            <div className="flex">
                                                                <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                    Lens Tint:
                                                                </div>
                                                                <div className="w-2/3 flex justify-between p-3">
                                                                    <span className="text-[#525252]">
                                                                        {getTintInfo(item)!.type}
                                                                        {getTintInfo(item)!.color && `-${getTintInfo(item)!.color}`}
                                                                    </span>
                                                                    <span className="font-bold text-[#1F1F1F]">
                                                                        £{Number(getTintInfo(item)!.price).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Regular Glasses - Show Lens Coating */
                                                            <div className="flex">
                                                                <div className="w-1/3 p-3 font-bold text-[#1F1F1F] border-r border-gray-200">
                                                                    Lens Coating:
                                                                </div>
                                                                <div className="w-2/3 flex justify-between p-3">
                                                                    <span className="text-[#525252]">
                                                                        {getLensCoating(item).name}
                                                                    </span>
                                                                    <span className="font-bold text-[#1F1F1F]">
                                                                        £{Number(getLensCoating(item).price || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Two-column layout: Prescription button + Free text on left, Qty + Total on right */}
                                                    <div className="mt-4 flex flex-col md:flex-row items-start justify-between gap-4">
                                                        {/* Left Side: Prescription button and Free items text */}
                                                        <div className="flex flex-col gap-3">
                                                            {(() => {
                                                                const _ = prescriptionRefresh; // Force re-evaluation
                                                                const productSku = item.product?.products?.skuid || item.product_id;
                                                                const prescription = getPrescriptionByCartId(item.cart_id, productSku, item);
                                                                const isEditing = editingPrescriptions.has(item.cart_id);
                                                                
                                                                if (prescription) {
                                                                    // Prescription exists - show View and Edit buttons
                                                                    return (
                                                                        <div className="flex flex-col gap-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        console.log('📋 Opening prescription modal with data:', prescription);
                                                                                        setViewPrescription(prescription);
                                                                                    }}
                                                                                    className="bg-[#E94D37] hover:bg-[#bf3e2b] text-white font-bold text-sm px-4 py-2 rounded-md transition-colors"
                                                                                >
                                                                                    View Prescription
                                                                                </button>
                                                                            </div>
                                                                            
                                                                            {!isEditing ? (
                                                                                // Show Edit Prescription button
                                                                                <button
                                                                                    onClick={() => toggleEditMode(item.cart_id)}
                                                                                    className="text-[#025048] hover:text-[#013a34] text-sm font-medium underline transition-colors w-fit text-left"
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
                                                                                        className="text-[#025048] hover:text-[#013a34] text-sm font-medium underline transition-colors w-fit text-left"
                                                                                        title="Upload a new prescription image to replace existing one"
                                                                                    >
                                                                                        Upload Prescription
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            // Navigate to manual prescription page with cart_id
                                                                                            navigate(`/manual-prescription?cart_id=${item.cart_id}`);
                                                                                        }}
                                                                                        className="text-[#025048] hover:text-[#013a34] text-sm font-medium underline transition-colors w-fit text-left"
                                                                                        title="Add manual prescription to replace existing one"
                                                                                    >
                                                                                        Manual Prescription
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => toggleEditMode(item.cart_id)}
                                                                                        className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors w-fit text-left mt-1"
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
                                                                                // Redirect to manual prescription page with cart_id
                                                                                navigate(`/manual-prescription?cart_id=${item.cart_id}`);
                                                                            }}
                                                                            className="bg-[#E94D37] hover:bg-[#bf3e2b] text-white font-bold text-sm px-4 py-2 rounded-md transition-colors w-fit"
                                                                        >
                                                                            Add Prescription
                                                                        </button>
                                                                    );
                                                                }
                                                            })()}

                                                            <div className="text-[#E53935] text-sm font-medium">
                                                                Case & Cleaning cloth included for Free
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Qty and Total side-by-side */}
                                                        <div className="flex items-center gap-6">
                                                            {/* Quantity controls */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-[#1F1F1F]">
                                                                    Qty
                                                                </span>
                                                                <div className="flex items-center border border-gray-300 rounded bg-white">
                                                                    <button
                                                                        disabled={isQuantityUpdating}
                                                                        onClick={() =>
                                                                            handleQuantityChangeCustom(
                                                                                item.cart_id,
                                                                                item.quantity || 1,
                                                                                -1
                                                                            )
                                                                        }
                                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        title="Reduce quantity or remove item"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="px-2 py-1 text-sm font-bold min-w-[24px] text-center">
                                                                        {item.quantity || 1}
                                                                    </span>
                                                                    <button
                                                                        disabled={isQuantityUpdating}
                                                                        onClick={() =>
                                                                            handleQuantityChangeCustom(
                                                                                item.cart_id,
                                                                                item.quantity || 1,
                                                                                1
                                                                            )
                                                                        }
                                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        title="Add duplicate product"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Total pricing */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-[#1F1F1F]">
                                                                    Total
                                                                </span>
                                                                <span className="font-bold text-2xl text-[#1F1F1F]">
                                                                    £{calculateItemTotal(item).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Summary & Offers */}
                            <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                                {/* Apply Coupon Section */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200">
                                    <h3 className="font-bold text-[#1F1F1F] text-sm mb-4">
                                        Apply Coupon
                                    </h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter code"
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#025048]"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode}
                                            className="bg-[#025048] text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {cartData?.coupon && (
                                        <div className="mt-3 flex justify-between items-center bg-green-50 p-2 rounded border border-green-100">
                                            <span className="text-green-700 text-sm font-medium">
                                                Code <b>{cartData.coupon.code}</b> applied!
                                            </span>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="text-red-500 text-xs font-bold hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs text-gray-500">
                                        Available codes: LAUNCH50 (50% Off)
                                    </div>
                                </div>

                                {/* Shipping Method */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200">
                                    <h3 className="font-bold text-[#1F1F1F] text-sm mb-4">
                                        Shipping Method
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                checked={shippingMethod === "standard"}
                                                onChange={() => handleShippingChange("standard")}
                                                className="accent-[#025048]"
                                            />
                                            <div className="flex-1 text-sm">
                                                <div className="font-bold text-[#1F1F1F]">
                                                    Standard Shipping
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    8-12 working days
                                                </div>
                                            </div>
                                            <div className="font-bold text-[#1F1F1F]">
                                                {cartData?.subtotal > 75 ? "Free" : "£6"}
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                checked={shippingMethod === "express"}
                                                onChange={() => handleShippingChange("express")}
                                                className="accent-[#025048]"
                                            />
                                            <div className="flex-1 text-sm">
                                                <div className="font-bold text-[#1F1F1F]">
                                                    Express Shipping
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    4-6 working days
                                                </div>
                                            </div>
                                            <div className="font-bold text-[#1F1F1F]">£29</div>
                                        </label>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200">
                                    <h3 className="text-lg font-bold text-[#1F1F1F] mb-4">
                                        Price Summary
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between font-bold text-[#1F1F1F]">
                                            <span>Subtotal</span>
                                            {/* Subtotal Calculated in Frontend */}
                                            <span>£{frontendSubtotal.toFixed(2)}</span>
                                        </div>

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between font-bold text-green-600">
                                                <span>Discount ({cartData.coupon?.code})</span>
                                                <span>-£{discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between font-bold text-[#1F1F1F]">
                                            <span>Shipping</span>
                                            <span>£{Number(cartData?.shipping_cost || 0).toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-[#1F1F1F]">
                                            <span>Total Payables</span>
                                            <span>£{frontendTotalPayable.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (localStorage.getItem("token")) {
                                                navigate("/payment");
                                            } else {
                                                // Fixed: Set returnTo to /payment instead of /cart
                                                sessionStorage.setItem("returnTo", "/payment");
                                                setShowLoginModal(true);
                                            }
                                        }}
                                        className="w-full bg-[#1F1F1F] text-white py-3 rounded mt-6 font-bold text-sm hover:bg-black transition-colors"
                                    >
                                        Checkout
                                    </button>
                                    <p className="text-xs pt-2 text-center">
                                        Prices includes applicable VAT
                                    </p>
                                </div>

                                {/* Trust Badges */}
                                <div className="bg-white p-4 md:p-6 rounded border border-gray-200 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 mb-4">
                                        {/* Seal SVG Placeholder */}
                                        <svg
                                            viewBox="0 0 100 100"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-full h-full text-black"
                                        >
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M50 15 L55 35 L75 35 L60 50 L65 70 L50 60 L35 70 L40 50 L25 35 L45 35 Z"
                                                fill="currentColor"
                                                opacity="0.1"
                                            />
                                            <text
                                                x="50"
                                                y="55"
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontWeight="bold"
                                                fill="currentColor"
                                            >
                                                100%
                                            </text>
                                            <text
                                                x="50"
                                                y="65"
                                                textAnchor="middle"
                                                fontSize="8"
                                                fill="currentColor"
                                            >
                                                GUARANTEE
                                            </text>
                                        </svg>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                                        If you're not 100% satisfied with your purchase within 30
                                        days, our Customer Happiness team is ready to assist with a
                                        hassle-free refund, 24/7. Just email us.
                                    </p>

                                    <div className="flex flex-col md:flex-row md:justify-center md:gap-8 text-xs text-gray-500 font-bold mb-6 w-full border-t border-gray-100 pt-4">
                                        <span className="flex items-center gap-2 justify-center mb-2 md:mb-0">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                                            Secure Payment
                                        </span>
                                        <span className="flex items-center gap-2 justify-center">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                                            30 Days Easy Refund
                                        </span>
                                    </div>
                                    <div className="flex justify-center gap-2 md:gap-3 opacity-60">
                                        {/* Payment Icons */}
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                                            className="h-3 md:h-4"
                                            alt="Visa"
                                        />
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                                            className="h-3 md:h-4"
                                            alt="Mastercard"
                                        />
                                        <div className="flex items-center gap-1 text-[6px] md:text-[8px] font-bold border border-gray-300 px-1 rounded">
                                            <svg
                                                width="8"
                                                height="8"
                                                className="md:w-2 md:h-2"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <rect
                                                    x="3"
                                                    y="11"
                                                    width="18"
                                                    height="11"
                                                    rx="2"
                                                    ry="2"
                                                ></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            256 BIT SSL
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State - Replaced with requested Layout */
                    <div className="review-order-wrap w-full">
                        <h4 className="mb-3 text-[28px] font-bold">Your Cart</h4>
                        <ul className="list-group review-order-group list-group-lg list-group-flush-x w-full bg-white rounded-lg shadow-sm p-0 list-none">
                            <li className="list-group-item bg-white border-0 p-6 flex flex-col items-center justify-center">
                                <h6 className="font-size-base mb-4 text-center text-base font-medium">
                                    Your Shopping Cart is empty!
                                </h6>
                                <div className="d-flex align-items-center justify-content-center flex items-center justify-center mb-6">
                                    <img
                                        className="img-fluid max-w-full h-auto"
                                        src="https://cdn.multifolks.com/desktop/images/static-page/cart/cw-empty-cart2.svg"
                                        style={{ width: "150px" }}
                                        alt="Empty Cart"
                                    />
                                </div>
                                <p className="text-center mb-6 text-gray-600">
                                    Add items to it now.
                                </p>
                                <div className="mb-10 px-4 flex justify-center">
                                    <button
                                        onClick={() => navigate("/glasses")}
                                        className="w-[200px] py-6 bg-[#232320] text-white rounded-full uppercase transition-all duration-300 hover:bg-[#1a1a1a]"
                                        style={{
                                            fontSize: '12px',
                                            fontFamily: 'Lynstone-regular, sans-serif',
                                            fontWeight: 600,
                                            letterSpacing: '1.2px',
                                            wordWrap: 'break-word'
                                        }}
                                    >
                                        EXPLORE OUR RANGE
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <DeleteDialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={confirmDelete}
                itemType="product"
            />

            {/* Manual Prescription Modal - Removed onRemove prop */}
            <ManualPrescriptionModal
                open={!!viewPrescription}
                onClose={() => setViewPrescription(null)}
                prescription={viewPrescription}
            />

            {/* Auth Modals */}
            <LoginModal
                open={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    // Prevent cart refresh when closing modal without login
                    setPreventCartRefresh(true);
                }}
                onNext={switchToSignUp}
            />

            <SignUpModal
                open={showSignUpModal}
                onHide={() => {
                    setShowSignUpModal(false);
                    // Prevent cart refresh when closing modal without signup
                    setPreventCartRefresh(true);
                }}
                setOpen={setShowSignUpModal}
                initialEmail={signUpEmail}
                onSwitchToLogin={switchToLogin}
                withAuthBackground={false} // Use modal style
            />
        </div>
    );
};

export default DesktopCart;
