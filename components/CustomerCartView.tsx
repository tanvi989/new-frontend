import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DeleteDialog from "./DeleteDialog";
import Offers from "./Offers";
import { deleteProductFromCart } from "../api/retailerApis";
import { CartItem } from "../types";

interface CustomerCartViewProps {
  open: boolean;
  close: () => void;
  carts: CartItem[];
  refetch: () => void;
  onCheckout?: () => void;
  buttonText?: string;
}

const CustomerCartView: React.FC<CustomerCartViewProps> = ({
  open,
  close,
  carts,
  refetch,
  onCheckout,
  buttonText,
}) => {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartItem | null>(null);
  const navigate = useNavigate();

  const { mutate: handleDeleteItem, isPending } = useMutation({
    mutationFn: (cartId: number) =>
      deleteProductFromCart(cartId, undefined, undefined),
    onSuccess: () => {
      setDeleteDialog(false);
      setSelectedCart(null);
      refetch();
    },
    onError: (error) => {
      console.error("Delete failed", error);
      setDeleteDialog(false);
      refetch();
    },
  });

  const handleDelete = () => {
    if (selectedCart) {
      handleDeleteItem(selectedCart.cart_id);
    }
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
      return;
    }
    close();
    if (localStorage.getItem("token")) {
      navigate("/payment");
    } else {
      navigate("/login", { state: { returnTo: "/payment" } });
    }
  };

  if (!carts) {
    return 'No Cart'
  }

  // Safely calculate subtotal even when carts is undefined/null/empty
  const subtotal = Array.isArray(carts)
    ? carts.reduce((sum, item) => {
      const price = Number(item.product?.products?.list_price) || 0;
      return sum + price;
    }, 0)
    : 0;

  // Safely get applied offer and discount
  const appliedOffer = Array.isArray(carts)
    ? carts.find((c) => c.offer)?.offer || null
    : null;

  const offerAmount = Array.isArray(carts)
    ? carts.reduce((sum, item) => sum + (item.offer_applied_discount || 0), 0)
    : 0;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[199] transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* Sidebar Drawer - Slides from Right */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[475px] bg-white shadow-2xl z-[200] transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1F1F1F] font-sans">
              Cart View
            </h2>
            <button
              onClick={close}
              className="p-2 text-gray-400 hover:text-[#E94D37] transition-colors rounded-full hover:bg-gray-50"
            >
              <svg
                width="24"
                height="24"
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
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {carts && carts.length > 0 ? (
              <ul className="space-y-6">
                {carts.map((cart) => (
                  <li
                    key={cart.cart_id}
                    className="flex gap-4 p-3 rounded-xl hover:bg-[#F3F0E7]/50 transition-colors group"
                  >
                    {/* Product Image */}
                    <div className="w-[100px] h-[100px] shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={
                          cart.product?.products?.image ||
                          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=300"
                        }
                        alt="Product"
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="relative">
                        <div className="flex justify-between items-start">
                          <h4 className="text-base font-bold text-[#525252]">
                            {cart.product?.products?.naming_system || cart.product?.products?.brand}
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedCart(cart);
                              setDeleteDialog(true);
                            }}
                            className="absolute top-0 right-0 text-gray-300 hover:text-[#E94D37] transition-colors"
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
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        <p className="text-[12px] text-[#525252] mt-1 font-medium">
                          {cart.product?.products?.framecolor}{" "}
                          {cart.product?.products?.style} For{" "}
                          {cart.product?.products?.gender}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div className="space-y-0.5">
                          {cart.lens && (
                            <p className="text-[12px] font-bold text-[#525252]">
                              Lens:{" "}
                              <span className="text-[#4596F3] ml-1">
                                {cart.lens.sub_category}
                              </span>
                            </p>
                          )}
                          <p className="text-[12px] font-bold text-[#525252]">
                            Size:{" "}
                            <span className="text-[#4596F3] ml-1">
                              {cart.product?.products?.size}
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[12px] font-bold text-[#525252]">
                            <span className="text-[#4596F3] text-[13px] mr-2">
                              £{cart.product?.products?.list_price}.00
                            </span>
                            <span className="line-through text-gray-400 decoration-red-500/50">
                              £{cart.product?.products?.price}.00
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mb-4 opacity-50"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p className="font-medium">Your cart is empty</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {carts && carts.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              {/* Offers Section */}
              <Offers
                refetch={refetch}
                listPrice={subtotal}
                offer={appliedOffer}
                offerAmount={offerAmount}
              />

              <div className="flex items-center justify-between mb-4 pt-2">
                <span className="text-[#1F1F1F] font-bold">Subtotal</span>
                <span className="text-[#1F1F1F] font-bold text-lg">
                  £{subtotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className={`w-full py-3 font-bold rounded-full transition-colors shadow-lg uppercase tracking-wider text-sm ${onCheckout
                    ? "bg-[#E94D37] hover:bg-red-600 text-white"
                    : "bg-[#232320] hover:bg-black text-white"
                  }`}
              >
                {onCheckout ? (buttonText || "Checkout") : "Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        itemType="product"
        onConfirm={handleDelete}
      />
    </>
  );
};

export default React.memo(CustomerCartView);
