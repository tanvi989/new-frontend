import React from "react";
import { useMutation } from "@tanstack/react-query";
// import { applyOffer } from "../api/retailerApis"; // DISABLED: Function removed
import { OfferWrapper } from "../types";
import moment from "moment";

interface PromoOffersProps {
  open: boolean;
  totalPrice: number;
  onClose: () => void;
  offers: OfferWrapper[];
  refetch: () => void;
}

const PromoOffers: React.FC<PromoOffersProps> = ({
  open,
  totalPrice,
  onClose,
  offers,
  refetch,
}) => {
  // DISABLED: This component uses removed mock function (applyOffer)
  // TODO: Implement with real backend offers API
  return null;

  /* ORIGINAL CODE DISABLED:
  const { mutate: handleApply, isPending } = useMutation({
    mutationFn: (offerId: number) => applyOffer(offerId),
    onSuccess: (res: any) => {
      if (res?.data?.status) {
        refetch();
        onClose();
      }
    },
    onError: (err) => {
      console.error("Failed to apply offer", err);
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-[#1F1F1F]">Promo Offers</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors p-1.5 rounded-full hover:bg-gray-100"
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
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 bg-[#F9FAFB] flex-1">
          {offers.map((offerWrapper) => {
            const offer = offerWrapper.data.offer;
            const isValid = offerWrapper.is_valid;
            const discountAmount =
              offer.discount_type === "percentage"
                ? Math.floor((totalPrice * offer.amt_or_pct) / 100)
                : Math.floor(offer.amt_or_pct);

            return (
              <div
                key={offerWrapper.id}
                className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden hover:shadow-md transition-shadow duration-200 flex"
              >
                <div className="w-[80px] bg-[#FFF9E5] border-r border-gray-100 flex flex-col items-center justify-center p-2 text-[#F3CB0A] relative overflow-hidden">
                  <div className="absolute top-[-10px] bottom-[-10px] left-[-4px] border-l-2 border-dashed border-white w-[2px]"></div>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  <span className="text-[10px] font-bold uppercase mt-2 tracking-widest rotate-0 text-center text-[#B49300]">
                    Sale
                  </span>
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#F3CB0A]/10 text-[#9A7D00] text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-[#F3CB0A]/20">
                      {offer.coupon_code}
                    </span>

                    <button
                      onClick={() => isValid && handleApply(offer.offer_id)}
                      disabled={!isValid || isPending}
                      className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded transition-colors ${
                        isValid
                          ? "text-[#D96C47] hover:bg-[#D96C47]/10 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isPending ? "Applying..." : "Apply"}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#1F1F1F] text-sm">
                      {offer.discount_type === "percentage"
                        ? `Get Rs. ${discountAmount} Off`
                        : `Flat Rs. ${discountAmount} Off`}
                    </h4>

                    {!isValid && (
                      <p className="text-red-500 text-xs font-medium mt-1">
                        {offerWrapper.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600">
                      + Terms & Conditions
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      Valid till{" "}
                      {moment(offer.expiry_time).format("DD MMM YYYY")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  */
};

export default React.memo(PromoOffers);
