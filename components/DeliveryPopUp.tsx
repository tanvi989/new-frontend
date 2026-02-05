import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../api/retailerApis";

interface DeliveryPopUpProps {
  open: boolean;
  onHide: () => void;
  selectedProduct: any;
}

const DeliveryPopUp: React.FC<DeliveryPopUpProps> = ({
  open,
  onHide,
  selectedProduct,
}) => {
  const [selectedValue, setSelectedValue] = useState<"instant" | "later">(
    "instant"
  );
  const queryClient = useQueryClient();

  const { mutate: handleAddToCart, isPending } = useMutation({
    mutationFn: async () => {
      return await addToCart(selectedProduct, selectedValue);
    },
    onSuccess: (response: any) => {
      if (response?.data?.status) {
        // Invalidate cart query to trigger a refetch in Navigation
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
      onHide();
    },
    onError: (error) => {
      console.error("Failed to add to cart", error);
      // Still close on error for this demo
      onHide();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onHide}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[474px] w-full p-6 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Delivery Type</h2>
          <button
            onClick={onHide}
            className="text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>

        <div className="py-2">
          <p className="text-[#1F1F1F] font-bold text-sm uppercase tracking-wide mb-4">
            Select Delivery Type:
          </p>

          <div className="flex gap-4 mb-8">
            <label
              className={`flex-1 flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedValue === "instant"
                  ? "border-[#232320] bg-[#F3F0E7]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#232320] mr-3">
                {selectedValue === "instant" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#232320]"></div>
                )}
              </div>
              <input
                type="radio"
                name="deliveryType"
                value="instant"
                checked={selectedValue === "instant"}
                onChange={() => setSelectedValue("instant")}
                className="hidden"
              />
              <span className="font-bold text-[#1F1F1F]">Instant</span>
            </label>

            <label
              className={`flex-1 flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedValue === "later"
                  ? "border-[#232320] bg-[#F3F0E7]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#232320] mr-3">
                {selectedValue === "later" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#232320]"></div>
                )}
              </div>
              <input
                type="radio"
                name="deliveryType"
                value="later"
                checked={selectedValue === "later"}
                onChange={() => setSelectedValue("later")}
                className="hidden"
              />
              <span className="font-bold text-[#1F1F1F]">Later</span>
            </label>
          </div>

          <button
            onClick={() => handleAddToCart()}
            disabled={isPending}
            className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DeliveryPopUp);
