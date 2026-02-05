import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { getOffers, removeOffer } from "../api/retailerApis"; // DISABLED: Functions removed
import PromoOffers from "./PromoOffers";
import { OfferDetails, OfferWrapper } from "../types";

interface OffersProps {
  refetch: () => void;
  offer: OfferDetails | null;
  listPrice: number;
  offerAmount: number;
}

const Offers: React.FC<OffersProps> = ({
  refetch,
  offer,
  listPrice,
  offerAmount,
}) => {
  // DISABLED: This component uses removed mock functions (getOffers, removeOffer)
  // TODO: Implement with real backend offers API
  return null;

  /* ORIGINAL CODE DISABLED:
  const [open, setOpen] = useState(false);

  const { data: offers = [] } = useQuery({
    queryKey: ["cart-offers"],
    queryFn: async () => {
      try {
        const response = await getOffers();
        if (response?.data?.status && Array.isArray(response.data.offers)) {
          return response.data.offers as OfferWrapper[];
        }
        return [];
      } catch (e) {
        return [] as OfferWrapper[];
      }
    },
    retry: false,
  });

  const handleRemoveOffer = async () => {
    try {
      const response = await removeOffer();
      if (response?.data?.status) {
        refetch();
      }
    } catch (e) {
      console.error("Failed to remove offer", e);
    }
  };

  return (
    <div className="w-full mb-0 font-sans">
      {offers.length > 0 ? (
        <>
          {offer ? (
            <div
              onClick={handleRemoveOffer}
              className="bg-[#E0F2E9] border border-[#2D4628]/20 rounded-xl p-4 flex items-center justify-between cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded-full bg-[#2D4628] flex items-center justify-center text-white shadow-md shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </div>
                <div>
                  <p className="text-[#2D4628] text-sm font-bold leading-tight mb-0.5">
                    Coupon "{offer.coupon_code}" Applied
                  </p>
                  <p className="text-[#2D4628]/80 text-xs font-bold">
                    You saved £{offerAmount?.toFixed(0)}
                  </p>
                </div>
              </div>
              <button className="z-10 w-7 h-7 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-[#E94D37] transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              onClick={() => setOpen(true)}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:border-gray-300 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#E94D37] shadow-sm shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="5" x2="5" y2="19"></line>
                    <circle cx="6.5" cy="6.5" r="2.5"></circle>
                    <circle cx="17.5" cy="17.5" r="2.5"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[#1F1F1F] font-bold text-sm mb-0.5 group-hover:text-[#000] transition-colors">
                    Apply Coupon Code
                  </h4>
                  <p className="text-gray-500 text-[11px] font-bold">
                    You Have{" "}
                    <span className="text-[#4596F3]">
                      {offers.length} Coupons
                    </span>{" "}
                    to Apply
                  </p>
                </div>
              </div>
              <div className="text-gray-300 group-hover:text-[#1F1F1F] transition-colors">
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
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          )}

          {open && (
            <PromoOffers
              open={open}
              totalPrice={listPrice}
              onClose={() => setOpen(false)}
              offers={offers}
              refetch={refetch}
            />
          )}
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 opacity-70 text-center">
          <span className="text-sm font-bold text-gray-400">
            No Coupons Available
          </span>
        </div>
      )}
    </div>
  );
  */
};

export default React.memo(Offers);
