import React from "react";
import { CartItem } from "../types";

interface PriceDetailsProps {
  carts: CartItem[];
  listPrice: number;
  lens_discount: number;
  netPrice: number;
  offerAmount: number;
}

const PriceDetails: React.FC<PriceDetailsProps> = ({
  carts,
  listPrice,
  lens_discount,
  netPrice,
  offerAmount,
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
    </div>
  );
};

export default React.memo(PriceDetails);
