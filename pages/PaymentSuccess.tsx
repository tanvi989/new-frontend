import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { trackPurchase } from '@/utils/analytics';
import { updateOrderWithCart, getThankYou, clearCart } from '@/api/retailerApis';
import { clearOrderRelatedStorage } from '@/utils/productFlowStorage';
import { Loader } from '@/components/Loader';

const PENDING_ORDER_SYNC_KEY = 'multifolks_pending_order_sync';

const ORDER_STEPS = [
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [showMore, setShowMore] = useState(false);
  const orderId = searchParams.get('order_id');

  // Fetch full order details when we have order_id
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['thank-you', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res: any = await getThankYou(orderId);
      return res?.data?.status ? res.data : null;
    },
    enabled: !!orderId,
    retry: false,
  });

  const order = orderData;

  // Order progress step from backend (default: Processing)
  const orderStatus = (order?.order?.order_status ?? order?.order_status ?? order?.delivery_status ?? 'processing').toString().toLowerCase();
  const statusStepMap: Record<string, number> = { processing: 0, dispatched: 1, shipped: 2, delivered: 3 };
  const currentStepIndex = statusStepMap[orderStatus] ?? 0;

  // Clear product flow, local prescriptions, and cart so /cart shows empty after order
  useEffect(() => {
    clearOrderRelatedStorage();
    clearCart().then(() => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }).catch(() => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    });
  }, [queryClient]);

  // Sync order with cart + totals
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_ORDER_SYNC_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { order_id: string; cart_items?: any[]; subtotal?: number; discount_amount?: number; shipping_cost?: number; total_payable?: number };
      const { order_id, ...payload } = data;
      if (!order_id) return;
      sessionStorage.removeItem(PENDING_ORDER_SYNC_KEY);
      updateOrderWithCart(order_id, payload).catch(() => {});
    } catch (_) {}
  }, []);

  // Fire Purchase once per success page (GA4 + Meta) – use ref to avoid duplicate from re-renders/Strict Mode
  const purchaseTrackedRef = useRef(false);
  useEffect(() => {
    const orderIdParam = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');
    if (!orderIdParam || purchaseTrackedRef.current) return;
    purchaseTrackedRef.current = true;
    let value = 0;
    try {
      const raw = sessionStorage.getItem(PENDING_ORDER_SYNC_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { total_payable?: number };
        value = Number(data?.total_payable) || 0;
      }
    } catch (_) {}
    trackPurchase({
      transaction_id: orderIdParam || sessionId || `ord_${Date.now()}`,
      value,
      currency: 'GBP',
      items: [],
    });
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleViewOrders = () => navigate('/orders');
  const handleContinueShopping = () => navigate('/glasses');

  // Price summary from order (when available)
  const subtotal = order?.order?.subtotal != null ? Number(order.order.subtotal).toFixed(2) : null;
  const shippingCost = order?.order?.shipping_cost != null ? Number(order.order.shipping_cost).toFixed(2) : null;
  const orderTotal = order?.order?.order_total != null ? Number(order.order.order_total).toFixed(2) : null;
  const discount = subtotal && orderTotal && shippingCost ? (Number(subtotal) - Number(orderTotal) + Number(shippingCost)).toFixed(2) : null;

  if (orderId && orderLoading) {
    return (
      <div className="min-h-screen bg-[#F3F0E7] flex items-center justify-center p-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-8 px-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-2xl border border-gray-200 overflow-hidden">
        {/* Top: Success block */}
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#00C853] rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center text-[#1F1F1F] mb-2">Thank You!</h1>
          <p className="text-center text-[#525252] text-sm mb-1">Your order has been placed successfully.</p>
          {orderId && (
            <p className="text-center text-[#4596F3] text-sm font-medium mb-4">Order ID: {orderId}</p>
          )}

          {/* Order progress bar */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-[#525252] uppercase tracking-wider mb-3">Order progress</h3>
            <div className="relative flex items-start">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" style={{ marginLeft: '1rem', marginRight: '1rem', width: 'calc(100% - 2rem)' }} />
              <div
                className="absolute top-4 h-0.5 bg-[#00C853] transition-all duration-300"
                style={{ left: '1rem', width: `calc((100% - 2rem) * ${currentStepIndex / (ORDER_STEPS.length - 1)})` }}
              />
              {ORDER_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 min-w-0 relative z-10">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        isCompleted ? 'bg-[#00C853] border-[#00C853] text-white' : 'bg-white border-gray-200 text-[#525252]'
                      } ${isCurrent ? 'ring-2 ring-[#00C853] ring-offset-2' : ''}`}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium mt-2 text-center ${isCurrent ? 'text-[#00C853]' : isCompleted ? 'text-[#313131]' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Show more / Show less */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="flex items-center gap-2 text-sm font-bold text-[#4596F3] hover:text-[#0277BD] transition-colors"
            >
              {showMore ? 'Show less' : 'Show more'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showMore ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {showMore && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-[#525252] space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <p className="font-medium text-[#1F1F1F] mb-2">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Processing:</strong> We’re preparing your order and checking prescription details.</li>
                    <li><strong>Dispatched:</strong> Your order has been handed to our shipping partner.</li>
                    <li><strong>Shipped:</strong> Your order is on its way. You may receive tracking details by email.</li>
                    <li><strong>Delivered:</strong> Your order has been delivered. Enjoy your new glasses!</li>
                  </ul>
                </div>

                {order?.shipping_address && (
                  <div>
                    <p className="font-medium text-[#1F1F1F] mb-1">Shipping address</p>
                    <p className="text-xs">{order.shipping_address}</p>
                  </div>
                )}

                {order?.order?.cart?.length > 0 && (
                  <div>
                    <p className="font-medium text-[#1F1F1F] mb-2">Order items</p>
                    <ul className="space-y-2">
                      {order.order.cart.map((cart: any) => (
                        <li key={cart.cart_id} className="flex gap-2 items-center text-xs">
                          <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shrink-0">
                            <img
                              src={cart.product?.products?.image || cart.product?.image || `/api/v1/products/image/${cart.product_id}`}
                              alt=""
                              className="max-w-full max-h-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <span className="font-medium text-[#313131]">{cart.product?.products?.naming_system || cart.product?.products?.brand}</span>
                          {cart.product?.products?.framecolor && <span className="text-gray-500">— {cart.product.products.framecolor}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subtotal != null && orderTotal != null && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="font-medium text-[#1F1F1F] mb-2">Price summary</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal}</span></div>
                      {discount != null && Number(discount) > 0 && <div className="flex justify-between"><span>Discount</span><span>-£{discount}</span></div>}
                      {shippingCost != null && <div className="flex justify-between"><span>Shipping</span><span>£{shippingCost}</span></div>}
                      <div className="flex justify-between font-bold pt-1"><span>Total paid</span><span>£{orderTotal}</span></div>
                    </div>
                  </div>
                )}

                {order?.order?.store?.store_name && (
                  <p className="text-xs pt-2 border-t border-gray-200">
                    Need help? Contact <span className="font-semibold text-[#1F1F1F]">{order.order.retailer?.phone_number || order.order.store?.store_name}</span>.
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-gray-500 text-xs mb-6">
            Redirecting to your orders in {countdown} seconds...
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleViewOrders}
              className="flex-1 bg-[#1F1F1F] text-white py-3 rounded-md font-bold text-sm hover:bg-black transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={handleContinueShopping}
              className="flex-1 bg-white text-[#1F1F1F] py-3 rounded-md font-bold text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
