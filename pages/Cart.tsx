import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  deleteProductFromCart,
  updateCartQuantity,
  applyCoupon,
  removeCoupon,
  updateShippingMethod,
  getMyPrescriptions,
} from "../api/retailerApis";
import { CartItem, PrescriptionDetail } from "../types";
import Loader from "../components/Loader";
import DeleteDialog from "../components/DeleteDialog";
import PrescriptionViewer from "../components/PrescriptionViewer";
import { LoginModal } from "../components/LoginModal";
import SignUpModal from "../components/SignUpModal";
import {
  getLensCoating,
  getTintInfo,
  calculateCartSubtotal,
  calculateItemTotal,
  getLensPackagePrice,
  getCartLensOverride,
  formatFrameSize,
  getLensTypeDisplay,
  getLensIndex,
} from "../utils/priceUtils";
import MobileCart from "../components/cart/MobileCart";
import DesktopCart from "../components/cart/DesktopCart";
import { MobileLogin } from "@/components/cart/MobileLogin";
import Toast from "../components/Toast";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
  const pendingDeleteCartIdRef = useRef<number | null>(null);
  const [viewPrescription, setViewPrescription] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState<string>("standard");
  const [isMounting, setIsMounting] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [terms, setTerms] = useState(false);

  // Auth State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [isCouponApplied, setIsCoupoenApplied] = useState(false);
  // Handle initial mount - show loader immediately
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsMounting(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show "added to bag" message when redirected from lens flow without cart_id
  useEffect(() => {
    const msg = (location.state as any)?.addedMessage;
    if (msg) {
      setAddedMessage(msg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Reactive Auth State
  const [authData, setAuthData] = useState({
    isAuthenticated: !!localStorage.getItem("token"),
    firstName: localStorage.getItem("firstName") || "User",
  });

  // Check Auth on Mount & Listen for Updates
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("firstName");
      setAuthData({
        isAuthenticated: !!token,
        firstName: name || "User",
      });

      // If user logs in elsewhere (or via modal), close modals and refresh cart
      if (token) {
        setShowLoginModal(false);
        setShowSignUpModal(false);
        // Ensure cart data is synced with the logged-in user's account
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    };

    // Initial check
    checkAuth();

    // Listen for custom auth event
    window.addEventListener("auth-change", checkAuth);
    // Also listen for storage events in case of multi-tab changes
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [queryClient]);

  const switchToSignUp = (email: string) => {
    setSignUpEmail(email);
    setShowLoginModal(false);
    setShowSignUpModal(true);
  };

  const switchToLogin = (email?: string) => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  // Fetch Cart Data
  const {
    data: cartResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      try {
        console.log("🛒 Fetching cart data...");
        const response: any = await getCart({});
        console.log("🛒 Raw cart response:", response);
        console.log("🛒 Response data:", response?.data);
        return response?.data || {};
      } catch (error: any) {
        console.error("❌ Failed to fetch cart", error);
        return { error: error.message || "Unknown error" };
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  console.log("🛒 Cart Response State:", cartResponse);
  console.log("🛒 Is Loading:", isLoading);

  // Force refetch when returning from prescription pages
  useEffect(() => {
    // Check if we're returning from a prescription page
    const fromPrescription = sessionStorage.getItem("fromPrescription");
    if (fromPrescription) {
      console.log("🔄 Returning from prescription page, refetching cart...");
      refetch();
      sessionStorage.removeItem("fromPrescription");
    }
  }, [refetch]);

  // Fetch User Prescriptions
  const { data: prescriptionsResponse } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => getMyPrescriptions(),
    enabled: authData.isAuthenticated,
  });
  const userPrescriptions = prescriptionsResponse?.data?.data || [];

  console.log("🔍 DEBUG prescriptionsResponse RAW:", prescriptionsResponse);
  console.log(
    "🔍 DEBUG prescriptionsResponse?.data:",
    prescriptionsResponse?.data
  );
  console.log("🔍 DEBUG Prescriptions - Total:", userPrescriptions.length);
  console.log("🔍 DEBUG Prescriptions - Data:", userPrescriptions);

  // Helper to find linked prescription
  const getLinkedPrescription = (item: CartItem) => {
    console.log(
      "🔍 Checking cart_id:",
      item.cart_id,
      "against",
      userPrescriptions.length,
      "prescriptions"
    );

    // Safety check for userPrescriptions
    if (!Array.isArray(userPrescriptions)) {
      console.warn("⚠️ userPrescriptions is not an array");
      return item.prescription || null;
    }

    try {
      // 1. Existing direct link
      if (item.prescription) {
        console.log("✅ Found direct prescription");
        return item.prescription;
      }

      // 2. Try to find link via associatedProduct.cartId (matches DB schema)
      // Check nested data structure from MongoDB
      const matchByCartId = userPrescriptions.find((p: any) => {
        if (!p) return false;

        // Log what we're checking
        const rootCartId = p.associatedProduct?.cartId;
        const dataCartId = p.data?.associatedProduct?.cartId;
        console.log(
          "🔍 Prescription check - Root cartId:",
          rootCartId,
          "Data cartId:",
          dataCartId,
          "Looking for:",
          item.cart_id
        );

        // Check root level associatedProduct
        const rootLink =
          p.associatedProduct?.cartId &&
          String(p.associatedProduct.cartId) === String(item.cart_id);
        if (rootLink) {
          console.log("✅ MATCH at root level!");
          return true;
        }

        // Check nested data level associatedProduct
        const pData = p.data;
        const dataLink =
          pData?.associatedProduct?.cartId &&
          String(pData.associatedProduct.cartId) === String(item.cart_id);
        if (dataLink) {
          console.log("✅ MATCH at data level!");
        }
        return dataLink;
      });
      if (matchByCartId) {
        console.log("✅ Found prescription match via cartId:", matchByCartId);
        return matchByCartId.data || matchByCartId;
      } else {
        console.log("❌ No cartId match found");
      }

      // 3. Fallback: Try prescription_id match
      const pId = (item as any).prescription_id || (item as any).prescriptionId;
      if (pId && userPrescriptions.length > 0) {
        const match = userPrescriptions.find(
          (p: any) =>
            p && (String(p._id) === String(pId) || String(p.id) === String(pId))
        );
        if (match) return match.data || match;
      }
    } catch (err) {
      console.error("Error in getLinkedPrescription:", err);
      return item.prescription || null;
    }

    return null;
  };

  // Only show error screen when query explicitly returned an error (e.g. unexpected throw)
  if (cartResponse && "error" in cartResponse && cartResponse.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold p-4">
        Error loading cart: {String(cartResponse.error)}
      </div>
    );
  }

  const cartItems = (Array.isArray(cartResponse?.cart) ? cartResponse.cart : []) as CartItem[];
  const cartData = cartResponse || {}; // Summary, coupon, shipping (or empty when using local fallback)

  console.log("🛒 Cart Items:", cartItems);
  console.log("🛒 Cart Items Length:", cartItems.length);
  console.log("🛒 Cart Data:", cartData);

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
        setIsCoupoenApplied(true);
        alert("Coupon applied successfully!");
      } else {
        alert(res.data.message || "Failed to apply coupon");
        setIsCoupoenApplied(false);
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
      setIsCoupoenApplied(false);
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
        const methodCost =
          newMethodId === "express" ? 29 : oldData.subtotal > 75 ? 0 : 6;
        const methodObj =
          newMethodId === "express"
            ? {
              id: "express",
              name: "Express Shipping",
              cost: 29,
              free_threshold: null,
            }
            : {
              id: "standard",
              name: "Standard Shipping",
              cost: 6,
              free_threshold: 75,
            };

        // Recalculate totals
        // total_payable = subtotal - discount + new_shipping
        const newTotal =
          Number(oldData.subtotal) -
          Number(oldData.discount_amount || 0) +
          methodCost;

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
    },
  });

  const handleDeleteClick = (cartId: number) => {
    pendingDeleteCartIdRef.current = cartId;
    setSelectedCartId(cartId);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    const idToDelete = pendingDeleteCartIdRef.current ?? selectedCartId;
    pendingDeleteCartIdRef.current = null;
    setDeleteDialog(false);
    setSelectedCartId(null);
    if (idToDelete != null) handleDeleteItem(idToDelete);
  };

  // Update Quantity Mutation with optimistic UI
  const { mutate: handleUpdateQuantity, isPending: isQuantityUpdating } =
    useMutation({
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

  const handleQuantityChange = (
    cartId: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      handleUpdateQuantity({ cartId, quantity: newQuantity });
    }
  };

  const formatPrescriptionDate = (input?: string | number) => {
    if (!input) return null;

    // Handle numeric timestamps (seconds or milliseconds)
    if (typeof input === "number" || /^[0-9]+$/.test(String(input))) {
      const num = Number(input);
      const millis = num > 10 ** 12 ? num : num * 1000;
      const parsed = new Date(millis);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    const str = String(input);

    // Handle DD/MM/YYYY or DD-MM-YYYY or with 2-digit year
    const slashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (slashMatch) {
      const [, d, m, y] = slashMatch;
      const year = Number(y.length === 2 ? `20${y}` : y);
      const parsed = new Date(year, Number(m) - 1, Number(d));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    // Fallback to native parsing (works for ISO strings)
    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    return null;
  };

  const getPrescriptionReceivedText = (
    item?: CartItem,
    linkedPrescription?: any
  ) => {
    if (!item && !linkedPrescription) return "Prescription Received";
    const p =
      linkedPrescription?.data ||
      linkedPrescription ||
      (item?.prescription as PrescriptionDetail | any);
    const candidates = [
      p?.created,
      p?.created_at,
      p?.createdAt,
      p?.date,
      p?.uploaded_at,
      p?.uploadedAt,
      p?.uploaded_on,
      p?.uploadedOn,
      (p?.meta && p?.meta?.created_at) || null,
      (item as any)?.prescription_date,
      (item as any)?.prescription_created_at,
      (item as any)?.prescription_uploaded_at,
      (item as any)?.created_at,
      (item as any)?.updated_at,
    ].filter(Boolean);

    const parsed =
      candidates
        .map((c) => formatPrescriptionDate(c))
        .find((d) => d !== null) || null;

    const formatted = parsed
      ? parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      : null;

    return formatted
      ? `Prescription Received - ${formatted}`
      : "Prescription Received";
  };

  // Helper functions moved to utils/priceUtils.ts

  const hasError = !!cartResponse?.error;

  // Show loader during initial mount or when loading cart data
  if (isMounting || isLoading) {
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

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans pb-20">
      {addedMessage && (
        <Toast
          message={addedMessage}
          type="success"
          onClose={() => setAddedMessage(null)}
          duration={5000}
        />
      )}
      {/* Custom Header / Stepper - Hidden on mobile */}
      <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm h-[80px] flex items-center">
        {/* Updated max-width to 1366px */}
        <div className="w-full max-w-[1366px] mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="https://cdn.multifolks.com/desktop/images/multifolks-logo.svg"
              alt="Multifolks"
              className="h-8 md:h-10 w-auto"
            />
          </a>

          {/* Stepper - Hidden on mobile, visible on medium screens and up */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            <div className="flex items-center gap-4">
              <span className="text-[#025048] font-bold text-base">My Bag</span>
              <div className="w-12 lg:w-24 h-[1px] bg-[#025048]"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 font-medium text-base">
                Address
              </span>
              <div className="w-12 lg:w-24 h-[1px] bg-gray-200"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 font-medium text-base">
                Payment
              </span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:text-[#1F1F1F] transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={() =>
                authData.isAuthenticated && navigate("/my-profile")
              }
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {authData.isAuthenticated ? (
              <span
                className="text-[10px] font-bold uppercase mt-1"
                onClick={() => navigate("/my-profile")}
              >
                {authData.firstName}
              </span>
            ) : (
              <div className="flex items-center mt-1 gap-1 text-[10px] font-color-[black] font-extrabold hover:text-red-400 hover:animate-pulse transition-colors">
                <span
                  className="cursor-pointer"
                  onClick={() => setShowLoginModal(true)}
                >
                  Sign in / sign up
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Mobile View */}
        <div className="block md:hidden">
          {cartItems.length > 0 ? (
            <MobileCart
              cartItems={cartItems}
              cartData={cartData}
              frontendSubtotal={frontendSubtotal}
              discountAmount={discountAmount}
              shippingCost={shippingCost}
              frontendTotalPayable={frontendTotalPayable}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
              handleShippingChange={handleShippingChange}
              shippingMethod={shippingMethod}
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              terms={terms}
              setTerms={setTerms}
              handleDeleteItem={handleDeleteClick}
              handleQuantityChange={handleQuantityChange}
              isQuantityUpdating={isQuantityUpdating}
              navigate={(path, state) => navigate(path, { state })}
              authData={authData}
              setShowLoginModal={setShowLoginModal}
            />
          ) : (
            /* Re-use the empty state from DesktopCart or keep it here for mobile */
            <div className="review-order-wrap w-full px-4 py-8">
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
                        fontSize: "12px",
                        fontFamily: "Lynstone-regular, sans-serif",
                        fontWeight: 600,
                        letterSpacing: "1.2px",
                        wordWrap: "break-word",
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

        {/* Desktop View */}
        <div className="hidden md:block">
          <DesktopCart />
        </div>
      </div>

      <DeleteDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
        itemType="product"
      />

      <PrescriptionViewer
        open={!!viewPrescription}
        onClose={() => setViewPrescription(null)}
        prescription={viewPrescription}
      />

      {/* Auth Modals */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onNext={switchToSignUp}
      />

      <div className="md:hidden">
        <MobileLogin
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onNext={switchToSignUp}
        />
      </div>

      <SignUpModal
        open={showSignUpModal}
        onHide={() => setShowSignUpModal(false)}
        setOpen={setShowSignUpModal}
        initialEmail={signUpEmail}
        onSwitchToLogin={switchToLogin}
        withAuthBackground={false} // Use modal style
      />
    </div>
  );
};

export default Cart;
