import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { Loader2 } from "./Loader";

interface SignInModalProps {
    open: boolean;
    onHide: () => void;
    email: string;
    onSuccess?: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({
    open,
    onHide,
    email,
    onSuccess,
}) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showMergeLoader, setShowMergeLoader] = useState(false);
    const [error, setError] = useState("");

    // Listen for cart merge events
    useEffect(() => {
        const handleMergeStart = () => {
            console.log('🔄 Cart merge started - showing loader');
            setShowMergeLoader(true);
        };

        const handleMergeComplete = () => {
            console.log('✅ Cart merge complete - hiding loader');
            setShowMergeLoader(false);
        };

        window.addEventListener('cart-merging', handleMergeStart);
        window.addEventListener('cart-merge-complete', handleMergeComplete);

        return () => {
            window.removeEventListener('cart-merging', handleMergeStart);
            window.removeEventListener('cart-merge-complete', handleMergeComplete);
        };
    }, []);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authService.login(email, password);
            if (response.success || response.status) {
                // Login successful - authService.login() already:
                // 1. Stored token and user data
                // 2. Dispatched 'auth-change' event
                // 3. Called syncLocalCartToBackend() to merge guest cart
                // Just close the modal and let the events handle UI updates
                onHide();
                if (onSuccess) {
                    onSuccess();
                }
                // NO PAGE RELOAD - it interrupts the cart merge!
            } else {
                setError(response.msg || "Login failed. Please check your password.");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err?.response?.data?.detail?.msg || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-start p-0 sm:p-8 font-sans">
            {/* Background Image - Specs */}
            <div className="absolute inset-0 bg-[url('/login-bg.png')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
            </div>

            {/* Close Button - Top Right */}
            <button
                onClick={onHide}
                className="absolute top-6 right-6 text-white hover:text-gray-200 transition-colors z-20 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/20"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            {/* Content Card - Bottom Left */}
            <div className="relative z-10 w-full sm:max-w-[420px] bg-white sm:rounded-[20px] rounded-t-[24px] shadow-2xl p-8 md:p-10 animate-in slide-in-from-bottom-10 duration-300 sm:ml-12 sm:mb-12 border border-gray-100">
                {loading ? (
                    <div className="py-12">
                        <Loader2 />
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-3 font-sans leading-tight tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-[#757575] text-[15px] leading-relaxed font-medium">
                                Please enter your password for <span className="font-bold text-black">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2 relative">
                                <label htmlFor="password-input" className="sr-only">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password-input"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all shadow-sm text-base pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
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
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
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
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-[#232320] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-2"
                            >
                                Login
                            </button>

                            <div className="flex justify-between items-center mt-4 px-2">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await authService.requestPin(email);
                                            alert(`PIN has been sent to ${email}`);
                                        } catch (err) {
                                            console.error(err);
                                            alert("Failed to send PIN");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="text-sm text-gray-500 hover:text-black underline"
                                >
                                    Request PIN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Logic to reset password or go back
                                        onHide();
                                    }}
                                    className="text-sm text-gray-500 hover:text-black underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Cart Merge Loader Overlay */}
                {showMergeLoader && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-[20px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                            <p className="text-gray-700 font-medium text-base">Merging your cart...</p>
                            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignInModal;
