import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { getOrders } from "../api/retailerApis";
import AccountSidebar from "../components/AccountSidebar";
import { Loader } from "../components/Loader";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("firstName") || "User";

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      try {
        const response: any = await getOrders();
        if (response?.data?.status) {
          return response.data.orders;
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch orders", error);
        return [];
      }
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pb-12">
      {/* Hero Banner with Models */}
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img
          src="recent banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-cyan-400/20 to-purple-500/20 mix-blend-overlay"></div>

        {/* Trapezoid Label */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0 z-10">
          <div
            className="bg-white px-12 py-4 relative shadow-lg"
            style={{
              clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              paddingLeft: "4rem",
              paddingRight: "4rem",
            }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F] uppercase tracking-widest text-center whitespace-nowrap">
              My Orders
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-0 md:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-auto shadow-soft rounded-sm overflow-hidden">
            <AccountSidebar activeItem="MY ORDERS" />
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white p-8 rounded-sm shadow-soft min-h-[500px] w-full">
            <div className="mb-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">
                Hello, {userName}
              </h2>
              <p className="text-[#525252] text-sm font-medium">
                View a snapshot of your recent orders here. Click on View
                Details for detailed order information.
              </p>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div
                    key={order.order_id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-[#232320] transition-colors group bg-white"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-3 py-1 bg-[#F3F0E7] text-[#1F1F1F] text-xs font-bold uppercase tracking-wider rounded">
                            {order.order_status || "Processing"}
                          </span>
                          <span className="text-xs text-gray-400 font-bold">
                            {moment(order.created).format("DD MMM YYYY")}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1F1F1F]">
                          Order #{order.order_id}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#1F1F1F]">
                          £{(() => {
                            // Parse cart_summary from database
                            let cartSummary: any = null;

                            try {
                              const cartSummaryStr = order.cart_summary;
                              if (typeof cartSummaryStr === 'string') {
                                cartSummary = JSON.parse(cartSummaryStr);
                              } else if (typeof cartSummaryStr === 'object') {
                                cartSummary = cartSummaryStr;
                              }
                            } catch (e) {
                              console.error('Failed to parse cart_summary:', e);
                            }

                            if (cartSummary) {
                              // Calculate total from cart_summary: subtotal - discount + tax + shipping
                              const subtotal = Number(cartSummary.subtotal || 0);
                              const discount = Number(cartSummary.discount || 0);
                              const tax = Number(cartSummary.tax || 0);
                              const shipping = Number(cartSummary.shipping || 0);
                              const total = subtotal - discount + tax + shipping;
                              return total.toFixed(2);
                            }

                            // Fallback to order_total if cart_summary not available
                            return order.order_total || '0.00';
                          })()}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {order.cart?.length || 0} Item(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        onClick={() =>
                          navigate("/order-details", {
                            state: { order_id: order.order_id },
                          })
                        }
                        className="text-sm font-bold text-[#025048] hover:text-[#1F1F1F] underline decoration-[#025048] underline-offset-4 transition-colors flex items-center gap-2"
                      >
                        View Details
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
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1F1F1F] mb-1">
                  No Orders Yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Looks like you haven't placed any orders yet.
                </p>
                <button
                  onClick={() => navigate("/glasses/men")}
                  className="px-8 py-3 bg-[#232320] text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-black transition-all"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
