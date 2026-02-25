import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  getOrderDetails,
  getThankYou,
  payPartialAmount,
  getMyPrescriptions,
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

  console.log("OrderView: orderId sources - state:", state?.order_id, "searchParams:", searchParams.get("order_id"), "localStorage:", localStorage.getItem("orderId"));
  console.log("OrderView: Final orderId:", orderId);

  const { isLoading, data } = useQuery({
    queryKey: ["orderdetails", orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log("OrderView: No orderId provided");
        return {};
      }
      console.log("OrderView: Fetching order details for orderId:", orderId);
      
      try {
        // Prefer real backend thank-you endpoint (handles live orders)
        const thankYouRes: any = await getThankYou(orderId);
        console.log("OrderView: Thank you API response:", thankYouRes);
        if (thankYouRes?.data?.status) {
          return thankYouRes.data;
        }
      } catch (e) {
        console.error("Failed to fetch order details from thank-you API", e);
      }

      // Fallback to legacy/mock order-details endpoint
      try {
        const legacyRes: any = await getOrderDetails(orderId);
        console.log("OrderView: Legacy API response:", legacyRes);
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

  // Account-stored prescriptions: used as fallback when order cart item has no prescription
  const { data: apiPrescriptions } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => getMyPrescriptions(),
    enabled: !!(data?.order?.order_id),
    retry: false,
  });
  const accountPrescriptions: any[] = useMemo(() => {
    const raw = apiPrescriptions?.data?.data ?? apiPrescriptions?.data;
    return Array.isArray(raw) ? raw : [];
  }, [apiPrescriptions]);

  useEffect(() => {
    if (data) {
      setProductDetails(data);
    }
  }, [data]);

  // Cart with prescription on each item: from order (cart + metadata.prescriptions) then fallback to account-stored
  const cartWithPrescription = useMemo(() => {
    const order = productDetails?.order;
    if (!order?.cart || !Array.isArray(order.cart)) return [];
    const metaList: any[] = order.metadata?.prescriptions ?? [];
    const byCartId = new Map<number, any>();
    const byProductId = new Map<string, any>();
    
    console.log("OrderView: metaList (prescriptions from metadata):", metaList);
    
    metaList.forEach((p: any) => {
      const cartId = p.cart_id ?? p.cartId;
      const productId = p.product_id ?? p.productId;
      // Handle different prescription data structures
      let pres = p.prescription?.prescriptionDetails || p.prescription || p;
      
      // Fix missing protocol in image_url
      if (pres?.image_url && !pres.image_url.startsWith('http')) {
        pres.image_url = 'https:' + pres.image_url;
      }
      
      console.log(`OrderView: Processing prescription for cart_id ${cartId}, product_id ${productId}:`, pres);
      // Store full metadata entry (lens fields + prescription)
      const entry = { ...p, prescriptionDetails: pres };
      if (cartId != null) byCartId.set(Number(cartId), entry);
      if (productId != null) byProductId.set(String(productId), entry);
     
    });
    
    const accountByProduct = new Map<string, any>();
    accountPrescriptions.forEach((p: any) => {
      const sku = p?.data?.associatedProduct?.productSku ?? p?.associatedProduct?.productSku;
      if (sku != null) accountByProduct.set(String(sku), p);
    });

    return order.cart.map((item: any) => {
      const cartId = item.cart_id ?? item.cartId;
      const productId = item.product_id ?? item.product?.products?.skuid ?? item.product?.products?.id;
      const productIdStr = productId != null ? String(productId) : "";
     const metaEntry = byCartId.get(Number(cartId)) || byProductId.get(productIdStr);
      let fromOrder = item.prescription?.prescriptionDetails || item.prescription || metaEntry?.prescriptionDetails;
      const lensInfo = metaEntry ? {
        lens_category: metaEntry.lens_category,
        lens_category_display: metaEntry.lens_category_display,
        lens_type: metaEntry.lens_type,
        lens_package: metaEntry.lens_package,
        lens_index: metaEntry.lens_index,
        coating: metaEntry.coating,
      } : null;
      
      // Fix missing protocol in image_url for item-level prescription too
      if (fromOrder?.image_url && !fromOrder.image_url.startsWith('http')) {
        fromOrder.image_url = 'https:' + fromOrder.image_url;
      }
      
      const fromAccount = !fromOrder && productIdStr ? accountByProduct.get(productIdStr) : null;
      const prescription = fromOrder ?? (fromAccount ? {
        type: fromAccount.type,
        name: fromAccount.name,
        image_url: fromAccount.image_url ?? fromAccount.data?.image_url,
        data: fromAccount.data,
        created_at: fromAccount.created_at,
      } : null);
      
      console.log(`OrderView: Final prescription for cart item ${cartId}:`, prescription);
      return { ...item, prescription: prescription || null, lensInfo: lensInfo || item.lensInfo || null };
    });
  }, [productDetails?.order, accountPrescriptions]);

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
    isBold,
  }: {
    label: string;
    value: React.ReactNode;
    isAlt?: boolean;
    isBold?: boolean;
  }) => (
    <div
      className={`flex justify-between items-center py-3 px-4 ${isAlt ? "bg-[#F9FAFB]" : "bg-white"
        } border-b border-gray-50 last:border-0`}
    >
      <span className="text-[#1F1F1F] font-bold text-xs uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-[#525252] font-medium text-sm text-right ${isBold ? "font-bold" : ""}`}>
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
                label="Order ID"
                value={productDetails?.order?.order_id}
              />
              <SummaryRow
                label="Order Date"
                value={moment(productDetails?.order?.created).format(
                  "DD MMMM YYYY, HH:mm"
                )}
                isAlt
              />
              <SummaryRow
                label="Last Updated"
                value={moment(productDetails?.order?.updated_at || productDetails?.order?.updated).format(
                  "DD MMMM YYYY, HH:mm"
                )}
                isAlt
              />
              <SummaryRow
                label="Payment Status"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      productDetails?.order?.payment_status === "Paid" || productDetails?.order?.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {productDetails?.order?.payment_status || "Pending"}
                  </span>
                }
              />
              <SummaryRow
                label="Order Status"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      productDetails?.order?.order_status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : productDetails?.order?.order_status === "Confirmed" || productDetails?.order?.order_status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {productDetails?.order?.order_status || "Processing"}
                  </span>
                }
              />
              <SummaryRow
                label="Payment Method"
                value={productDetails?.order?.pay_mode || "Card"}
              />
              <SummaryRow
                label="Customer Email"
                value={productDetails?.order?.customer_email}
                isAlt
              />
              <SummaryRow
                label="Order Type"
                value={
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {productDetails?.order?.is_partial ? "Partial Payment" : "Full Payment"}
                  </span>
                }
                isAlt
              />
              {productDetails?.order?.transaction_id && (
                <SummaryRow
                  label="Transaction ID"
                  value={
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {productDetails?.order?.transaction_id}
                    </span>
                  }
                  isAlt
                />
              )}
              {productDetails?.order?.payment_intent_id && (
                <SummaryRow
                  label="Payment Intent ID"
                  value={
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {productDetails?.order?.payment_intent_id}
                    </span>
                  }
                  isAlt
                />
              )}
              <SummaryRow
                label="Items Count"
                value={productDetails?.order?.cart?.length || 0}
                isAlt
              />
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h2 className="text-xl font-bold text-[#1F1F1F] font-serif mb-4">
              Price Breakdown
            </h2>
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              <SummaryRow
                label="Subtotal"
                value={`£${parseFloat(productDetails?.order?.subtotal || 0).toFixed(2)}`}
              />
              {productDetails?.order?.discount_amount > 0 && (
                <SummaryRow
                  label="Discount Amount"
                  value={`-£${parseFloat(productDetails?.order?.discount_amount || 0).toFixed(2)}`}
                  isAlt
                />
              )}
              {productDetails?.order?.lens_discount > 0 && (
                <SummaryRow
                  label="Lens Discount"
                  value={`-£${parseFloat(productDetails?.order?.lens_discount || 0).toFixed(2)}`}
                  isAlt
                />
              )}
              {productDetails?.order?.retailer_lens_discount > 0 && (
                <SummaryRow
                  label="Retailer Lens Discount"
                  value={`-£${parseFloat(productDetails?.order?.retailer_lens_discount || 0).toFixed(2)}`}
                  isAlt
                />
              )}
              <SummaryRow
                label="Shipping Cost"
                value={productDetails?.order?.shipping_cost > 0 ? `£${parseFloat(productDetails?.order?.shipping_cost || 0).toFixed(2)}` : "Free"}
                isAlt
              />
              <SummaryRow
                label="Order Total"
                value={`£${parseFloat(productDetails?.order?.order_total || 0).toFixed(2)}`}
                isAlt
              />
              <SummaryRow
                label="Total Payable"
                value={`£${parseFloat(productDetails?.order?.total_payable || productDetails?.order?.order_total || 0).toFixed(2)}`}
                isBold
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-xl font-bold text-[#1F1F1F] font-serif mb-4">
              Address Information
            </h2>
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              <SummaryRow
                label="Shipping Address"
                value={
                  <div className="text-sm">
                    {productDetails?.order?.shipping_address ? (
                      <div>
                        <div className="font-medium text-[#1F1F1F] mb-1">{productDetails.order.customer_email}</div>
                        <div>{productDetails.order.shipping_address}</div>
                      </div>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                }
              />
              <SummaryRow
                label="Billing Address"
                value={
                  <div className="text-sm">
                    {productDetails?.order?.billing_address ? (
                      <div>
                        <div className="font-medium text-[#1F1F1F] mb-1">{productDetails.order.customer_email}</div>
                        <div>{productDetails.order.billing_address}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Same as shipping</span>
                    )}
                  </div>
                }
                isAlt
              />
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
                    payPartialAmount(orderId, 0).then((res) => {
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
            {(cartWithPrescription.length > 0 ? cartWithPrescription : productDetails?.order?.cart ?? []).map(
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
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Product ID
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem.product_id}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Product Name
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem.name}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            Quantity
                          </span>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {cartItem.quantity}
                          </span>
                        </div>
                        {/* Frame Price, Lens Price, and Item Total removed as requested */}
                        
                      {(cartItem.lens || cartItem.lensInfo) && (
                          <>
                            {(cartItem.lensInfo?.lens_category_display || cartItem.lens?.lensCategoryDisplay) && (
                              <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase">Lens Category</span>
                                <span className="text-sm font-medium text-[#1F1F1F]">
                                  {cartItem.lensInfo?.lens_category_display || cartItem.lens?.lensCategoryDisplay}
                                </span>
                              </div>
                            )}
                            {(cartItem.lensInfo?.lens_type || cartItem.lens?.main_category) && (
                              <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase">Lens Type</span>
                                <span className="text-sm font-medium text-[#1F1F1F]">
                                  {cartItem.lensInfo?.lens_type || cartItem.lens?.main_category}
                                </span>
                              </div>
                            )}
                            {(cartItem.lensInfo?.lens_index || cartItem.lens?.lensIndex) && (
                              <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase">Lens Index</span>
                                <span className="text-sm font-medium text-[#1F1F1F]">
                                  {cartItem.lensInfo?.lens_index || cartItem.lens?.lensIndex}
                                </span>
                              </div>
                            )}
                            {(cartItem.lensInfo?.coating || cartItem.lens?.coating) && (
                              <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase">Coating</span>
                                <span className="text-sm font-medium text-[#1F1F1F]">
                                  {cartItem.lensInfo?.coating || cartItem.lens?.coating}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                   
                      {/* Prescription Preview - Full Details */}
{cartItem?.prescription && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h4 className="text-sm font-bold text-blue-800 mb-3">Prescription Details</h4>

    {/* Name / Type / Meta */}
    <div className="flex items-start gap-4 mb-3">
      {cartItem.prescription.image_url && (
        <img
          src={cartItem.prescription.image_url}
          alt="Prescription"
          className="w-20 h-20 object-cover rounded border border-blue-300"
        />
      )}
      <div className="flex-1 text-sm text-blue-700">
        <div className="font-semibold text-blue-900">{cartItem.prescription.name || 'Prescription'}</div>
        <div className="text-xs text-blue-600 mt-0.5">Type: {cartItem.prescription.type || 'Upload'}</div>
        {cartItem.prescription.prescriptionFor && (
          <div className="text-xs text-blue-600">For: {cartItem.prescription.prescriptionFor}</div>
        )}
        {cartItem.prescription.birthYear && (
          <div className="text-xs text-blue-600">Birth Year: {cartItem.prescription.birthYear}</div>
        )}
           {cartItem.prescription.fileName && (
          <div className="text-xs text-blue-600">File: {cartItem.prescription.fileName}</div>
        )}

        {/* PD below file info - visible for all prescription types */}
        {(cartItem.prescription.pdType || cartItem.prescription.pdRight || cartItem.prescription.pdLeft || cartItem.prescription.pdSingle) && (
          <div className="mt-2 pt-2 border-t border-blue-100">
            <div className="text-xs text-blue-600">
              PD Type: <span className="font-medium">{cartItem.prescription.pdType || 'N/A'}</span>
            </div>
            {cartItem.prescription.pdType === 'Dual' ? (
              <div className="text-xs text-blue-600">
                PD: <span className="font-medium">{cartItem.prescription.pdRight || 'N/A'} (R) / {cartItem.prescription.pdLeft || 'N/A'} (L)</span>
              </div>
            ) : (
              <div className="text-xs text-blue-600">
                PD: <span className="font-medium">{cartItem.prescription.pdSingle || 'N/A'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {cartItem.prescription.type === 'manual' && (
      <>
        {/* OD / OS Full Table */}
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-blue-200 text-blue-900">
                <th className="px-2 py-1.5 text-left font-bold">Eye</th>
                <th className="px-2 py-1.5 text-center font-bold">SPH</th>
                <th className="px-2 py-1.5 text-center font-bold">CYL</th>
                <th className="px-2 py-1.5 text-center font-bold">Axis</th>
                <th className="px-2 py-1.5 text-center font-bold">Prism H</th>
                <th className="px-2 py-1.5 text-center font-bold">Base H</th>
                <th className="px-2 py-1.5 text-center font-bold">Prism V</th>
                <th className="px-2 py-1.5 text-center font-bold">Base V</th>
              </tr>
            </thead>
            <tbody>
              {cartItem.prescription.od && (
                <tr className="bg-white border-b border-blue-100">
                  <td className="px-2 py-1.5 font-bold text-blue-800">OD (Right)</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.sph || '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.cyl || '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.axis ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.prism?.horizontal ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.prism?.baseHorizontal ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.prism?.vertical ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.od.prism?.baseVertical ?? '—'}</td>
                </tr>
              )}
              {cartItem.prescription.os && (
                <tr className="bg-blue-50">
                  <td className="px-2 py-1.5 font-bold text-blue-800">OS (Left)</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.sph || '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.cyl || '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.axis ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.prism?.horizontal ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.prism?.baseHorizontal ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.prism?.vertical ?? '—'}</td>
                  <td className="px-2 py-1.5 text-center">{cartItem.prescription.os.prism?.baseVertical ?? '—'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Power + PD */}
        <div className="grid grid-cols-2 gap-3">
          {(cartItem.prescription.addPower || cartItem.prescription.readingPowerRight || cartItem.prescription.readingPowerLeft) && (
            <div className="p-2 bg-white rounded border border-blue-200">
              <div className="text-xs font-bold text-blue-800 mb-1">Reading / Add Power</div>
              {cartItem.prescription.addPower && (
                <div className="text-xs text-blue-700">Add Power: <span className="font-medium">{cartItem.prescription.addPower}</span></div>
              )}
              {cartItem.prescription.readingPowerRight && (
                <div className="text-xs text-blue-700">Right: <span className="font-medium">{cartItem.prescription.readingPowerRight}</span></div>
              )}
              {cartItem.prescription.readingPowerLeft && (
                <div className="text-xs text-blue-700">Left: <span className="font-medium">{cartItem.prescription.readingPowerLeft}</span></div>
              )}
            </div>
          )}

          <div className="p-2 bg-white rounded border border-blue-200">
            <div className="text-xs font-bold text-blue-800 mb-1">Pupillary Distance (PD)</div>
            <div className="text-xs text-blue-700">Type: <span className="font-medium">{cartItem.prescription.pdType || 'N/A'}</span></div>
            {cartItem.prescription.pdType === 'Dual' ? (
              <>
                <div className="text-xs text-blue-700">Right PD: <span className="font-medium">{cartItem.prescription.pdRight || 'N/A'}</span></div>
                <div className="text-xs text-blue-700">Left PD: <span className="font-medium">{cartItem.prescription.pdLeft || 'N/A'}</span></div>
              </>
            ) : (
              <div className="text-xs text-blue-700">Single PD: <span className="font-medium">{cartItem.prescription.pdSingle || 'N/A'}</span></div>
            )}
          </div>
        </div>
      </>
    )}
  </div>
)}
 </div> {/* ← ADD THIS: closes <div className="flex-1 w-full"> Info Section */}

                    {/* Image Section */}
                    <div className="w-full md:w-[200px] shrink-0">
                      <div className="aspect-[4/3] w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                        <img
                          src={`https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${cartItem.product_id}/${cartItem.product_id}.png`}
                          alt={cartItem?.product?.products?.name || cartItem.name}
                          className="w-full h-full object-contain mix-blend-multiply p-2"
                          onError={(e) => {
                            // Fallback to API endpoint if GCS image fails
                            e.currentTarget.src = `/api/v1/products/image/${cartItem.product_id}`;
                          }}
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