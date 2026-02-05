import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  getOrderDetails,
  getThankYou,
  payPartialAmount,
} from "../api/retailerApis";
import { Loader } from "./Loader";
import PrescriptionViewer from "./PrescriptionViewer";

// Placeholder for product image since asset is not available
const PRODUCT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=200";

interface OrderViewProps { }

const OrderView: React.FC<OrderViewProps> = () => {
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showPrescriptionViewer, setShowPrescriptionViewer] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle direct access or missing state gracefully
  const orderId =
    state?.order_id ||
    searchParams.get("order_id") ||
    localStorage.getItem("orderId") ||
    undefined;

  const { isLoading, data } = useQuery({
    queryKey: ["orderdetails", orderId],
    queryFn: async () => {
      if (!orderId) return {};
      try {
        // Prefer real backend thank-you endpoint (handles live orders)
        const thankYouRes: any = await getThankYou(orderId);
        if (thankYouRes?.data?.status) {
          return thankYouRes.data;
        }
      } catch (e) {
        console.error("Failed to fetch order details from thank-you API", e);
      }

      // Fallback to legacy/mock order-details endpoint
      try {
        const legacyRes: any = await getOrderDetails({ order_id: orderId });
        if (legacyRes?.data?.status) {
          return legacyRes.data;
        }
      } catch (error) {
        console.error("Failed to fetch order details from legacy API", error);
      }
      return {};
    },
    enabled: !!orderId,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setProductDetails(data);
    }
  }, [data]);

  if (isLoading || loading) {
    return <Loader />;
  }

  if (!orderId || !productDetails?.order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F0E7] font-sans p-4">
        <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">
          Order Not Found
        </h2>
        <button
          onClick={() => navigate("/")}
          className="text-[#D96C47] underline font-bold hover:text-[#bf5630]"
        >
          Back to Home
        </button>
      </div>
    );
  }

  let offer: any = null;
  let offer_applied_discount = 0;

  if (data && data.order && Array.isArray(data.order.cart)) {
    for (const cart of data.order.cart) {
      if (cart.offer !== null) {
        offer = cart.offer;
      }
      if (cart.offer_applied_discount) {
        offer_applied_discount += cart.offer_applied_discount;
      }
    }
  }

  // Helper for summary rows
  const SummaryRow = ({
    label,
    value,
    isAlt,
  }: {
    label: string;
    value: React.ReactNode;
    isAlt?: boolean;
  }) => (
    <div
      className={`flex justify-between items-center py-3 px-4 ${isAlt ? "bg-[#F9FAFB]" : "bg-white"
        } border-b border-gray-50 last:border-0`}
    >
      <span className="text-[#1F1F1F] font-bold text-xs uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[#525252] font-medium text-sm text-right">
        {value}
      </span>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans pt-32">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] font-bold text-[#1F1F1F] font-sans">
            Order Details
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-[#1F1F1F] hover:text-[#E94D37] underline decoration-1 underline-offset-4"
          >
            Back to Home
          </button>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold text-[#1F1F1F] font-serif mb-4 flex items-center gap-2">
              Order Summary
            </h2>
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              <SummaryRow
                label="Order Id"
                value={productDetails?.order?.order_id}
              />
              <SummaryRow
                label="Date"
                value={moment(productDetails?.order?.created).format(
                  "DD MMMM YYYY"
                )}
                isAlt
              />
              <SummaryRow
                label="Paid Via"
                value={productDetails?.order?.pay_mode}
              />
              {/* <SummaryRow
                label="Partial Payment"
                value={productDetails?.pay_mode_partial || "-"}
                isAlt
              /> */}
              <SummaryRow
                label="Shipping Address"
                value={productDetails?.shipping_address}
              />
              <SummaryRow
                label="Billing Address"
                value={productDetails?.billing_address}
                isAlt
              />
              <SummaryRow
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${productDetails?.order?.order_status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {productDetails?.order?.order_status}
                  </span>
                }
              />
              {/* <SummaryRow
                label="State"
                value={productDetails?.order?.is_partial ? "Partial" : "Full"}
                isAlt
              />
              <SummaryRow
                label="RRN Number"
                value={productDetails?.rrn_no || "N/A"}
              />
              <SummaryRow
                label="Approval Code"
                value={productDetails?.approval_code || "N/A"}
                isAlt
              /> */}
              {/* <SummaryRow
                label="Coupon Applied"
                value={offer?.coupon_code || "Not Applied"}
              /> */}
            </div>
          </div>

          {/* Price Summary */}
          <div>
            <h2 className="text-xl font-bold text-[#1F1F1F] font-serif mb-4">
              Price Summary
            </h2>
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              {(() => {
                // Get pricing data directly from order database fields
                const order = productDetails?.order;

                const subtotal = Number(order?.subtotal || 0);
                const discount = Number(order?.discount_amount || order?.discount || 0);
                const tax = Number(order?.tax || 0);
                const shipping = Number(order?.shipping_cost || 0);
                const totalPayable = Number(order?.total_payable || order?.order_total || 0);

                return (
                  <>
                    <SummaryRow
                      label="Subtotal"
                      value={`£${subtotal.toFixed(2)}`}
                    />
                    <SummaryRow
                      label="Discount"
                      value={discount > 0 ? `-£${discount.toFixed(2)}` : `£0.00`}
                      isAlt
                    />
                    {tax > 0 && (
                      <SummaryRow
                        label="Tax"
                        value={`£${tax.toFixed(2)}`}
                      />
                    )}
                    <SummaryRow
                      label="Shipping"
                      value={`£${shipping.toFixed(2)}`}
                      isAlt={tax > 0 ? false : true}
                    />
                    <div className="flex justify-between items-center py-4 px-4 bg-[#232320] text-white">
                      <span className="font-bold text-sm uppercase tracking-wider">
                        Total Paid
                      </span>
                      <span className="font-bold text-lg">
                        £{totalPayable.toFixed(2)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

        </div>

        {/* Product Details */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-[#1F1F1F] font-serif">
              Product Detail
            </h2>

            {productDetails?.order?.is_partial && (
              <button
                onClick={() => {
                  if (!productDetails?.is_partner) {
                    navigate("/payment", {
                      state: { order_id: productDetails?.order?.order_id },
                    });
                  } else {
                    setLoading(true);
                    payPartialAmount({
                      order_id: orderId,
                      pay_mode_code: "100",
                    }).then((res) => {
                      if (res?.data?.status) {
                        navigate("/thank-you", {
                          state: {
                            order_id: res?.data?.order_id,
                            invoice_number: res?.data?.invoice_no,
                          },
                        });
                      }
                      setLoading(false);
                    });
                  }
                }}
                className="bg-[#232320] text-white px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black transition-colors shadow-lg active:translate-y-0.5 active:shadow-none"
              >
                Mark as Delivered
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
            {productDetails?.order?.cart?.map(
              (cartItem: any, index: number) => (
                <div
                  key={index}
                  className="p-6 border-b border-gray-100 last:border-0"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Info Section */}
                    <div className="flex-1 w-full">
                      <h3 className="text-lg font-bold text-[#1F1F1F] mb-4">
                        {cartItem?.product?.products?.name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {/* <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Store Skuid
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F] underline decoration-gray-300 underline-offset-2">
                            {cartItem?.product?.products?.store_skuid}
                          </span>
                        </div> */}
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Skuid
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F] underline decoration-gray-300 underline-offset-2">
                            {cartItem?.product?.products?.skuid}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Shape
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.product?.products?.shape}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Style
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.product?.products?.style}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Color
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.product?.products?.framecolor}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Size
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.product?.products?.size}
                          </span>
                        </div>
                        {/* <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Weight
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.product?.products?.weight} gm
                          </span>
                        </div> */}
                        {/* <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Lens ID
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.lens?.lens_id || "-"}
                          </span>
                        </div> */}
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Lens Coating
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem?.lens?.sub_category || "-"}
                          </span>
                        </div>
                        {/* <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Lens Discount
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            £{" "}
                            {cartItem?.retailer_lens_discount?.toFixed(2) ||
                              "0.00"}
                          </span>
                        </div> */}
                      </div>

                      {/* View Prescription Button */}
                      {cartItem?.prescription && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setSelectedPrescription(cartItem.prescription);
                              setShowPrescriptionViewer(true);
                            }}
                            className="px-4 py-2 bg-[#232320] text-white rounded-lg font-semibold text-sm hover:bg-black transition-colors shadow-sm">
                            👁️ View Prescription
                          </button>
                          {cartItem?.prescription_mode && (
                            <span className="ml-3 text-xs text-gray-500">
                              Added via: {cartItem.prescription_mode}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Image Section */}
                    <div className="w-full md:w-[200px] shrink-0">
                      <div className="aspect-[4/3] w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                        <img
                          src={
                            cartItem?.product?.products?.image ||
                            PRODUCT_PLACEHOLDER
                          }
                          alt={cartItem?.product?.products?.name}
                          className="w-full h-full object-contain mix-blend-multiply p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Prescription Viewer Modal */}
      <PrescriptionViewer
        open={showPrescriptionViewer}
        onClose={() => {
          setShowPrescriptionViewer(false);
          setSelectedPrescription(null);
        }}
        prescription={selectedPrescription}
      />
    </div>
  );
};

export default React.memo(OrderView);
