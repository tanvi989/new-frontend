import React from "react";
import { CartItem } from "../types";

interface Offer {
  discount_type: string;
  amt_or_pct: number;
}

interface PartialPriceDetailsProps {
  carts: CartItem[];
  offer: Offer | null;
}

const PartialPriceDetails: React.FC<PartialPriceDetailsProps> = ({
  carts,
  offer,
}) => {
  const products =
    carts?.map((cart) => {
      return {
        lens: cart.lens,
        product: cart.product?.products,
        retailer_lens_discount: cart.retailer_lens_discount || 0,
      };
    }) || [];

  const totalPrice =
    products?.reduce(
      (acc, item) =>
        acc +
        (Number(item.product?.price) || 0) +
        (Number(item.lens?.price) || 0),
      0
    ) || 0;
  const listPrice =
    products?.reduce(
      (acc, item) =>
        acc +
        (Number(item.product?.list_price) || 0) +
        (Number(item.lens?.selling_price) || 0),
      0
    ) || 0;
  const lens_discount =
    products?.reduce(
      (acc, item) => acc + (Number(item.retailer_lens_discount) || 0),
      0
    ) || 0;

  let offerAmount = 0;

  if (offer?.discount_type === "percentage") {
    offerAmount = (listPrice * offer?.amt_or_pct) / 100;
  } else if (offer?.discount_type === "flat") {
    offerAmount = offer?.amt_or_pct;
  }

  const netPrice = listPrice - offerAmount - lens_discount;

  return (
    <div className="bg-white p-6 mb-6 w-full shadow-[0px_4px_30px_0px_rgba(0,0,0,0.05)] rounded-xl font-sans border border-gray-100">
      <h2 className="text-base font-bold text-[#525252] mb-4">Price Details</h2>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#525252]">MRP</span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          ₹{totalPrice.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#525252]">
          Item Discount
        </span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          - ₹{(totalPrice - listPrice).toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#525252]">
          Offer Applied
        </span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          -₹{offerAmount.toFixed(2)}
        </span>
      </div>

      <div className="my-3 border-b border-gray-100"></div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#525252]">
          Total Lens Discount
        </span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          -₹{lens_discount.toFixed(2)}
        </span>
      </div>

      <div className="my-3 border-b border-gray-100"></div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#525252]">Net Price</span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          ₹{netPrice.toFixed(2)}
        </span>
      </div>

      <div className="my-3 border-b border-gray-100"></div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#525252]">Total</span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          ₹{netPrice.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
        <span className="text-xs font-semibold text-[#525252]">
          Payable Amount
        </span>
        <span className="text-xs font-bold text-[#525252] mt-1">
          ₹{(netPrice / 2).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default React.memo(PartialPriceDetails);
