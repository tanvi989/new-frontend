
import React, { useState, useEffect } from "react";
import OtpModal from "../OtpModal";
import { validateEmail, validateName } from "../../helpers/validateForms";

interface CustomerDetailDialogProps {
    open: boolean;
    onHide: () => void;
    setOpen: (val: boolean) => void;
}

const CustomerDetailDialog: React.FC<CustomerDetailDialogProps> = ({ open, onHide, setOpen }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        order_id: '',
        email: '',
        number: ''
    });

    const [registered, setRegistered] = useState(false);
    const [otpPopUp, setOtpPopUp] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [numberError, setNumberError] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    useEffect(() => {
        if (snackMessage) {
            const timer = setTimeout(() => setSnackMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackMessage]);

    const handleBack = () => {
        setOtpPopUp(false);
        setOpen(true);
    };

    const handleFormChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === "email") {
            setEmailError(value.length > 0 && !validateEmail(value));
        }
        if (name === "number") {
            const phoneRegex = /^\d{10}$/;
            setNumberError(value.length > 0 && !phoneRegex.test(value));
        }
    };

    const validateForm = () => {
        const phoneRegex = /^\d{10}$/;
        const orderRegex = /^([A-Z]{2})\d{13}$/;

        if (!form.firstName.trim() || !validateName(form.firstName.trim())) {
            setSnackMessage('Invalid First Name (Letters only)');
            return false;
        }
        
        if (!form.lastName.trim() || !validateName(form.lastName.trim())) {
            setSnackMessage('Invalid Last Name (Letters only)');
            return false;
        }

        if (!orderRegex.test(form.order_id.trim())) {
            // Make regex validation optional or show warning if strict validation is needed
            // setSnackMessage('Invalid order ID format (e.g. AB1234567890123)');
            // return false;
        }

        if (form.email && !validateEmail(form.email)) {
             setSnackMessage('Invalid Email Address');
             return false;
        }

        if (!form.number || !phoneRegex.test(form.number)) {
            setSnackMessage('Invalid Mobile Number (10 digits)');
            return false;
        }

        return true;
    };

    const handleCustomerDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setRegistered(true);
        onHide();
        setOtpPopUp(true);
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onHide}></div>
                    
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[475px] p-6 transform transition-all scale-100">
                        {/* Header */}
                        <div className="text-center mb-6 relative">
                             <h2 className="text-[#015490] font-bold text-lg leading-tight mb-1">Start the quiz for 100% Cashback</h2>
                             <p className="text-[#1F1F1F] font-bold text-sm uppercase tracking-wide">Customer detail</p>
                             <button 
                                onClick={onHide}
                                className="absolute right-0 top-0 text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                             >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCustomerDetailsSubmit} className="flex flex-col gap-4">
                             {/* Split Name Fields for better data handling */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="firstName" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        placeholder="First Name"
                                        value={form.firstName}
                                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="lastName" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        placeholder="Last Name"
                                        value={form.lastName}
                                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="order_id" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Order ID</label>
                                <input
                                    id="order_id"
                                    type="text"
                                    placeholder="Enter Order ID"
                                    value={form.order_id}
                                    onChange={(e) => handleFormChange('order_id', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">E-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter Your Email"
                                    value={form.email}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                    className={`w-full bg-gray-50 border ${emailError ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors`}
                                />
                                {emailError && <span className="text-red-500 text-xs font-medium">Please enter a valid email</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="number" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Mobile</label>
                                <input
                                    id="number"
                                    type="text"
                                    placeholder="Enter mobile no."
                                    value={form.number}
                                    onChange={(e) => handleFormChange('number', e.target.value)}
                                    maxLength={10}
                                    className={`w-full bg-gray-50 border ${numberError ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors`}
                                />
                                {numberError && <span className="text-red-500 text-xs font-medium">Please enter a valid mobile number</span>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-2"
                            >
                                SUBMIT
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Snackbar / Toast */}
            {snackMessage && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[80] bg-[#333] text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-300">
                    {snackMessage}
                </div>
            )}

            <OtpModal
                open={otpPopUp}
                handleBack={handleBack}
                onHide={() => setOtpPopUp(false)}
                form={form}
                setForm={setForm}
                registered={registered}
                isClaimCheck="true"
            />
        </>
    );
};

export default React.memo(CustomerDetailDialog);
