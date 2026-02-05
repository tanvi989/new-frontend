import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentStatus, getThankYou, sendInvoice } from '../../api/retailerApis';
import { Loader } from '../Loader';

const Thanks: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Add countdown state for redirect
    const [countdown, setCountdown] = useState(4);

    // Fallback for order_id if accessed directly or missing state
    const orderId = state?.order_id || searchParams.get('order_id');

    const { isLoading, data: order, refetch } = useQuery({
        queryKey: ['thank-you', orderId],
        queryFn: async () => {
            if (!orderId) return null;
            try {
                const response: any = await getThankYou(orderId);
                if (response?.data?.status) {
                    return response.data;
                }
                return null;
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        enabled: !!orderId,
        retry: false
    });

    // Add countdown timer effect
    useEffect(() => {
        // Only start countdown if order is loaded and payment is successful
        if (order && (order.payment_status === 'Success' || order.payment_status !== 'Failed')) {
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
        }
    }, [order, navigate]);

    const checkPaymentStatus = () => {
        if (order?.transaction_uuid) {
            getPaymentStatus(order.transaction_uuid).then((response) => {
                if (response?.data?.status) {
                    refetch();
                }
            });
        }
    };

    const invoiceSentRef = React.useRef(false);

    // Effect for sending invoice
    React.useEffect(() => {
        if (order && !invoiceSentRef.current) {
            sendInvoice({ order_id: orderId }).then(() => {
                console.log("Invoice sent automatically");
            });
            invoiceSentRef.current = true;
        }
    }, [order, orderId]);

    const handleSendInvoice = () => {
        sendInvoice({ order_id: orderId });
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F3F0E7] flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-2xl font-bold text-[#1F1F1F] mb-4">Order not found</h1>
                <button onClick={() => navigate('/')} className="text-[#D96C47] font-bold underline">Go Home</button>
            </div>
        );
    }

    let statusText = '';
    let StatusIcon = null;
    let statusColorClass = '';
    let showThankYouMessage = false;

    if (order.payment_status === 'Success') {
        statusText = 'Congratulations! The sale has been completed.';
        statusColorClass = 'text-green-500 bg-green-50';
        StatusIcon = (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        );
        showThankYouMessage = true;
    } else if (order.payment_status === 'Failed') {
        statusText = 'Order Failed';
        statusColorClass = 'text-red-500 bg-red-50';
        StatusIcon = (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        );
    } else {
        statusText = 'Order Confirmed'; // Changed from 'Order Pending' to 'Order Confirmed'
        statusColorClass = 'text-green-500 bg-green-50'; // Changed to green to match success
        StatusIcon = (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        ); // Changed to success icon
        showThankYouMessage = true;
    }

    // Extract customer information with fallbacks
    const customerFirstName = order?.order?.customer?.first_name || order?.customer?.first_name || order?.first_name || '';
    const customerLastName = order?.order?.customer?.last_name || order?.customer?.last_name || order?.last_name || '';
    const customerPhone = order?.order?.customer?.phone_number || order?.customer?.phone_number || order?.phone_number || order?.billing_phone || '';
    const customerEmail = order?.order?.customer?.email || order?.customer?.email || order?.order?.user_email || order?.user_email || '';

    // Calculate values for price summary
    const subtotal = parseFloat(order?.order?.subtotal || 0).toFixed(2);
    const shippingCost = parseFloat(order?.order?.shipping_cost || 0).toFixed(2);
    const totalPaid = order?.order?.is_partial 
        ? (parseFloat(order?.order?.order_total || 0) / 2).toFixed(2)
        : parseFloat(order?.order?.order_total || 0).toFixed(2);
    const discount = (parseFloat(subtotal) - parseFloat(totalPaid) + parseFloat(shippingCost)).toFixed(2);

    return (
        <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
            <div className="max-w-[800px] mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => navigate('/')} className="text-[#1F1F1F] hover:text-[#E94D37]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-[#1F1F1F]">Thanks</h1>
                </div>

                <div className="bg-white rounded-xl shadow-[0px_4px_30px_0px_rgba(0,0,0,0.05)] p-6 md:p-10 relative">

                    {/* Status Section */}
                    <div className="flex flex-col items-center justify-center text-center mb-8 relative">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${statusColorClass}`}>
                            {StatusIcon}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#5B5B5B] mb-2">{statusText}</h2>
                        
                        {/* Added thank you message */}
                        {showThankYouMessage && (
                            <p className="text-lg font-medium text-[#1F1F1F] mb-2">Thank you for choosing Multifolks</p>
                        )}
                        
                        <p className="text-[#4596F3] text-sm font-medium mb-1">Order Id : {order?.order?.order_id}</p>
                        {order.payment_status === 'Success' && (
                            <p className="text-gray-500 text-xs mb-4">
                                An order confirmation email has been sent to <b>{customerEmail}</b>
                            </p>
                        )}

                        {/* Auto-redirect notice - Only show for successful orders */}
                        {order.payment_status !== 'Failed' && (
                            <p className="text-center text-gray-500 text-xs mb-4">
                                Redirecting to your orders in {countdown} seconds...
                            </p>
                        )}

                        <button
                            onClick={checkPaymentStatus}
                            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-[#232320] transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
                            title="Refresh Status"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-xs font-bold text-[#525252] uppercase tracking-wider mb-2">Customer Name</h3>
                            <p className="text-base font-bold text-[#313131] mb-1">
                                {customerFirstName && customerLastName ? `${customerFirstName} ${customerLastName}` : 
                                 customerFirstName || customerLastName || 'N/A'}
                            </p>
                            <p className="text-xs text-[#313131] font-medium">Contact No. <span className="font-bold">{customerPhone || 'N/A'}</span></p>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-xs font-bold text-[#525252] uppercase tracking-wider mb-2">Store Address</h3>
                            <p className="text-base font-bold text-[#313131] mb-1">{order?.order?.store?.store_name}</p>
                            <p className="text-xs text-[#313131] font-medium mb-1">{order?.order?.store?.address}</p>
                            <p className="text-xs text-[#313131] font-medium">Store contact no. <span className="font-bold">{order?.order?.retailer?.phone_number}</span></p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-[#313131] mb-1"><strong>Shipping Address</strong></h3>
                            <p className="text-sm text-[#525252]">{order?.shipping_address}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-sm font-medium text-[#313131] mb-1"><strong>Billing Address</strong></h3>
                            <p className="text-sm text-[#525252]">{order?.billing_address}</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    {/* Product Details */}
                    <h3 className="text-base font-bold text-[#525252] mb-4">Order Detail</h3>
                    <div className="space-y-6">
                        {order?.order?.cart?.map((cart: any) => (
                            <div key={cart.cart_id} className="flex gap-4 items-center">
                                <div className="w-[75px] h-[50px] bg-gray-50 rounded border border-gray-100 flex items-center justify-center p-1">
                                    <img
                                        src={cart.product?.products?.image || "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=200"}
                                        alt="Product"
                                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-[#525252]">{cart.product?.products?.naming_system || cart.product?.products?.brand}</h4>
                                    <p className="text-xs text-[#525252]">
                                        <span className="text-[#4596F3]">Frame: </span>
                                        {cart.product?.products?.framecolor} {cart.product?.products?.style} {cart.product?.products?.primary_category}
                                    </p>
                                    <p className="text-xs font-bold text-[#525252] mt-0.5">Frame Size: <span className="ml-2 font-medium">{cart.product?.products?.size}</span></p>
                                    {cart.lens && (
                                        <p className="text-xs font-bold text-[#525252] mt-0.5">Lens: <span className="ml-2 font-medium">{cart.lens?.sub_category}</span></p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6"></div>

                    {/* Price Summary - Updated to match requested format */}
                    <div className="mb-8">
                        <h3 className="text-base font-bold text-[#525252] mb-4">Price Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[#313131]">Subtotal</span>
                                <span className="text-[#1F1F1F]">£{subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#313131]">Discount</span>
                                <span className="text-[#1F1F1F]">-£{discount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#313131]">Shipping</span>
                                <span className="text-[#1F1F1F]">£{shippingCost}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                                <span className="text-[#1F1F1F]">Total Paid</span>
                                <span className="text-[#1F1F1F]">£{totalPaid}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-8"></div>

                    {/* Action Buttons - Added two hyperlinks */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/orders')}
                            className="bg-[#232320] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[250px]"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white border-2 border-[#232320] text-[#232320] px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#F3F0E7] transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[250px]"
                        >
                            Back to Home
                        </button>
                    </div>

                    {/* Original Action Button - Kept for successful orders */}
                    {order.payment_status === 'Success' && (
                        <>
                            <div className="w-full h-px bg-gray-100 my-6"></div>
                            <div className="flex justify-center">
                                <button
                                    onClick={handleSendInvoice}
                                    className="bg-[#232320] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[300px]"
                                >
                                    Send invoice to customer
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Thanks;