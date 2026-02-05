import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getOrders, getCustomers, getAppoitments } from "../api/retailerApis";

const DashboardCard = ({
  title,
  count,
  icon,
  color,
  onClick,
  loading,
}: any) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
  >
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">
          {title}
        </h3>
        <div
          className={`p-3 rounded-full ${color} text-white group-hover:scale-110 transition-transform shadow-lg`}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-9 w-24 bg-gray-100 animate-pulse rounded"></div>
      ) : (
        <p className="text-3xl font-bold text-[#1F1F1F]">{count}</p>
      )}
    </div>
    <div
      className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 ${color.replace(
        "text-",
        "bg-"
      )}`}
    ></div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-dashboard"],
    queryFn: async () => {
      try {
        const res: any = await getOrders();
        return res?.data?.orders || [];
      } catch (e) {
        return [];
      }
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers-dashboard"],
    queryFn: async () => {
      try {
        const res: any = await getCustomers();
        return res?.data?.customers || [];
      } catch (e) {
        return [];
      }
    },
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments-dashboard"],
    queryFn: async () => {
      try {
        const res: any = await getAppoitments();
        return res?.data?.data || [];
      } catch (e) {
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-[#1F1F1F] mb-2 font-serif">
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium">
            Overview of your store's performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardCard
            title="Total Orders"
            count={orders.length}
            loading={ordersLoading}
            color="bg-[#E94D37]"
            onClick={() => navigate("/orders")}
            icon={
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
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            }
          />
          <DashboardCard
            title="Total Customers"
            count={customers.length}
            loading={customersLoading}
            color="bg-[#F3CB0A]"
            onClick={() => navigate("/customer-view")}
            icon={
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            }
          />
          <DashboardCard
            title="Appointments"
            count={appointments.length}
            loading={appointmentsLoading}
            color="bg-[#232320]"
            onClick={() => navigate("/appoitments")}
            icon={
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1F1F1F] font-serif">
                Recent Orders
              </h2>
              <button
                onClick={() => navigate("/orders")}
                className="text-[#D96C47] text-sm font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-0 divide-y divide-gray-50">
              {ordersLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232320]"></div>
                </div>
              ) : orders.length > 0 ? (
                orders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.order_id || Math.random()}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#F3F0E7] flex items-center justify-center text-[#232320]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-[#1F1F1F] text-sm">
                          Order #{order.order_id}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(order.created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#232320] bg-gray-100 px-3 py-1 rounded-full">
                      ₹{order.order_total}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <p>No recent orders found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#025048] rounded-xl p-8 text-white relative overflow-hidden flex-1 flex flex-col justify-center shadow-soft">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 font-serif">
                  Start New Checkup
                </h2>
                <p className="text-white/80 mb-6 max-w-sm">
                  Create a new eye checkup record for a customer quickly.
                </p>
                <button
                  onClick={() => navigate("/new-eye-check")}
                  className="bg-white text-[#025048] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg"
                >
                  + New Checkup
                </button>
              </div>
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#036c61] rounded-full opacity-50"></div>
              <div className="absolute right-12 top-12 w-12 h-12 bg-[#F3CB0A] rounded-full opacity-20"></div>
            </div>

            <div className="bg-[#232320] rounded-xl p-8 text-white relative overflow-hidden flex-1 flex flex-col justify-center shadow-soft">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2 font-serif">
                  Inventory Status
                </h2>
                <p className="text-white/70 mb-4 text-sm">
                  Manage your frames and lenses inventory.
                </p>
                <button
                  onClick={() => navigate("/inventory")}
                  className="text-white font-bold text-sm underline decoration-[#F3CB0A] underline-offset-4 hover:text-[#F3CB0A] transition-colors"
                >
                  Go to Inventory &rarr;
                </button>
              </div>
              <svg
                className="absolute right-4 bottom-4 text-white/5 w-32 h-32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
