import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    const handleRetryPayment = () => {
        navigate('/cart');
    };

    const handleContinueShopping = () => {
        navigate('/glasses');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 md:p-12 transform transition-all">
                {/* Cancel Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                </div>

                {/* Cancel Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-center text-[#232320] mb-4">
                    Payment Cancelled
                </h1>
                <p className="text-center text-gray-600 text-lg mb-8">
                    Your payment was cancelled. No charges have been made to your account.
                </p>

                {/* Information Box */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-8 border border-orange-200">
                    <h2 className="text-xl font-bold text-[#232320] mb-3">What Happened?</h2>
                    <p className="text-gray-700 mb-4">
                        You've cancelled the payment process. Your items are still in your cart and waiting for you.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>No payment has been processed</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Your cart items are saved</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>You can retry payment anytime</span>
                        </li>
                    </ul>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                    <h2 className="text-lg font-bold text-[#232320] mb-2">Need Help?</h2>
                    <p className="text-gray-700 text-sm">
                        If you experienced any issues during checkout, please contact our support team. We're here to help!
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleRetryPayment}
                        className="flex-1 bg-[#232320] text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        Return to Cart
                    </button>
                    <button
                        onClick={handleContinueShopping}
                        className="flex-1 bg-white text-[#232320] py-4 rounded-full font-bold text-sm uppercase tracking-widest border-2 border-[#232320] hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
