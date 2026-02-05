import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
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

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    navigate('/glasses');
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8 md:p-12 border border-gray-200">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#00C853] rounded-full flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-[#1F1F1F] mb-3">
          Thank You!
        </h1>
        <p className="text-center text-[#525252] text-sm mb-6">
          Your order has been placed successfully.
        </p>

        {/* Auto-redirect notice */}
        <p className="text-center text-gray-500 text-xs mb-8">
          Redirecting to your orders in {countdown} seconds...
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleViewOrders}
            className="w-full bg-[#1F1F1F] text-white py-3 rounded-md font-bold text-sm hover:bg-black transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full bg-white text-[#1F1F1F] py-3 rounded-md font-bold text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
