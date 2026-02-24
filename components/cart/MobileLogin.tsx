import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { syncLocalCartToBackend } from "../../api/retailerApis";
import { Loader2 } from "../Loader";
import Toast from "../Toast";

interface MobileLoginProps {
    open: boolean;
    onClose: () => void;
    onNext: (email: string) => void;
    initialEmail?: string;
}

export const MobileLogin: React.FC<MobileLoginProps> = ({
    open,
    onClose,
    onNext,
    initialEmail = "",
}) => {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState<"email" | "password" | "pin" | "forgot_password">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setEmail(initialEmail);
            setStep("email");
            setError("");
            setPassword("");
            setPin("");
            setNewPassword("");
        }
    }, [open, initialEmail]);

    if (!open) return null;

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authService.checkEmailExists(email);
            if (response && response.data && response.data.is_registered) {
                setStep("password");
            } else {
                onNext(email);
            }
        } catch (err) {
            console.error("Error checking email:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError("Please enter your password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authService.login(email, password);
            const token = response?.token ?? response?.data?.token;
            if (response?.success || token || response?.status) {
                await syncLocalCartToBackend();
                setSuccessMessage("Login successful");
            } else {
                setError(response.message || "Invalid credentials");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(
                err?.response?.data?.detail?.msg ||
                err?.response?.data?.message ||
                "Login failed. Please check your password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 font-sans">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('/login-bg.png')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
            </div>

            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
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

            {/* Content Card — slides up from bottom on mobile */}
            <div className="relative z-10 w-full bg-white rounded-t-[24px] shadow-2xl p-8 animate-in slide-in-from-bottom-10 duration-300 border border-gray-100">
                {loading ? (
                    <div className="py-12">
                        <Loader2 />
                    </div>
                ) : (
                    <>
                        {/* Email Step */}
                        {step === "email" && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-3 font-sans leading-tight tracking-tight">
                                        Welcome to Multifolks
                                    </h2>
                                    <p className="text-[#757575] text-[15px] leading-relaxed font-medium">
                                        Enter your email to Login / Signup
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2 relative">
                                        <label htmlFor="mobile-email-input" className="sr-only">Email</label>
                                        <input
                                            id="mobile-email-input"
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all shadow-sm text-base"
                                            required
                                            autoFocus
                                        />
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
                                        Continue
                                    </button>

                                    <p className="text-[#757575] text-[10px] leading-relaxed font-medium">
                                        We'll use your email to send order updates and important service messages.
                                    </p>

                                    <div className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            id="mobileMarketingOptIn"
                                            defaultChecked
                                            className="mt-0.5 cursor-pointer w-3.5 h-3.5 accent-black"
                                        />
                                        <label
                                            htmlFor="mobileMarketingOptIn"
                                            className="text-[#757575] text-[10px] leading-relaxed font-medium cursor-pointer"
                                        >
                                            With your permission, we may also share helpful offers and vision care tips — you can opt out anytime.
                                        </label>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Password Step */}
                        {step === "password" && (
                            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                                <div className="mb-2">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1 font-sans leading-tight tracking-tight">
                                        Login to Multifolks
                                    </h2>
                                    <p className="text-[#757575] text-[15px] leading-relaxed font-medium">
                                        Welcome Back
                                    </p>
                                </div>

                                {/* Email display */}
                                <div className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 flex justify-between items-center">
                                    <span className="text-[#1F1F1F] font-medium text-sm truncate mr-2 break-all">
                                        {email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[#1F1F1F] font-bold text-sm underline hover:opacity-80 whitespace-nowrap"
                                    >
                                        Change?
                                    </button>
                                </div>

                                {/* Password Input */}
                                <div className="flex flex-col gap-2 relative">
                                    <label htmlFor="mobile-password-input" className="sr-only">Password</label>
                                    <div className="relative">
                                        <input
                                            id="mobile-password-input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all shadow-sm text-base pr-10"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    className="w-full bg-[#232320] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    Proceed
                                </button>

                                <div className="flex justify-center items-center gap-4 -mt-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                setError("");
                                                await authService.requestPin(email);
                                                setStep("pin");
                                            } catch (err: any) {
                                                console.error("Failed to send PIN:", err);
                                                setError("Failed to send PIN. Please try again.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="text-sm text-[#1F1F1F] hover:opacity-80 underline font-bold"
                                    >
                                        Request OTP?
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PIN Step */}
                        {step === "pin" && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!pin || pin.length !== 6) {
                                    setError("Please enter a valid 6-digit PIN");
                                    return;
                                }
                                setLoading(true);
                                setError("");
                                try {
                                    const response = await authService.loginWithPin(email, pin);
                                    if (response.success || response.token || response.status) {
                                        await syncLocalCartToBackend();
                                        setSuccessMessage("Login successful");
                                    } else {
                                        setError(response.message || "Invalid PIN");
                                    }
                                } catch (err: any) {
                                    setError(
                                        err?.response?.data?.detail?.msg ||
                                        err?.response?.data?.message ||
                                        "Invalid PIN. Please try again."
                                    );
                                } finally {
                                    setLoading(false);
                                }
                            }} className="flex flex-col gap-5">
                                <div className="text-center mb-1">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1 font-sans">
                                        PIN Sent
                                    </h2>
                                    <p className="text-[16px] text-[#6C757D]">PIN sent to</p>
                                    <p className="text-[16px] text-[#6C757D]">{email}</p>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[16px] text-[#6C757D] underline hover:opacity-80 block mx-auto"
                                    >
                                        Change?
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="mobile-pin-input" className="sr-only">PIN</label>
                                    <input
                                        id="mobile-pin-input"
                                        type="text"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className="w-full h-[48px] bg-white border border-[#CED4DA] rounded px-4 py-2 text-[16px] text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all"
                                        required
                                        autoFocus
                                        maxLength={6}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg mb-4">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-[#343A40] text-white px-4 py-3 rounded text-[16px] font-normal hover:bg-black transition-all mb-3"
                                >
                                    Verify
                                </button>

                                <div className="text-center mb-2">
                                    <p className="text-[14px] text-[#212529]">
                                        Not received your code?{" "}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    setLoading(true);
                                                    await authService.requestPin(email);
                                                    setError("");
                                                } catch (err) {
                                                    setError("Failed to resend code");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="font-bold underline hover:opacity-80"
                                        >
                                            Resend Code
                                        </button>
                                    </p>
                                </div>

                                <div className="text-center mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep("password")}
                                        className="text-[14px] text-[#212529] underline hover:opacity-80 block mx-auto"
                                    >
                                        Use Password?
                                    </button>
                                </div>

                                <p className="text-[12.8px] text-center text-[#212529] leading-relaxed">
                                    By continuing, you agree to Multifolks's{" "}
                                    <a href="/terms" className="underline hover:text-black">Terms of Use</a>
                                    {" "}and{" "}
                                    <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
                                </p>
                            </form>
                        )}

                        {/* Forgot Password Step */}
                        {step === "forgot_password" && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!pin || pin.length !== 6) {
                                    setError("Please enter a valid 6-digit PIN");
                                    return;
                                }
                                if (!newPassword || newPassword.length < 6) {
                                    setError("Password must be at least 6 characters");
                                    return;
                                }
                                setLoading(true);
                                setError("");
                                try {
                                    const response = await authService.resetPassword(email, pin, newPassword);
                                    if (response?.success || response?.status) {
                                        await syncLocalCartToBackend();
                                        onClose();
                                        window.dispatchEvent(new Event("cart-updated"));
                                    } else {
                                        setError(response?.message || "Failed to reset password");
                                    }
                                } catch (err: any) {
                                    setError(
                                        err?.response?.data?.detail?.msg ||
                                        err?.response?.data?.message ||
                                        "Failed to reset password. Please try again."
                                    );
                                } finally {
                                    setLoading(false);
                                }
                            }} className="flex flex-col gap-5">
                                <div className="text-center mb-1">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1 font-sans">
                                        Forgot Password
                                    </h2>
                                    <p className="text-[16px] text-[#6C757D]">Reset code sent to</p>
                                    <p className="text-[16px] text-[#6C757D]">{email}</p>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[16px] text-[#6C757D] underline hover:opacity-80 block mx-auto"
                                    >
                                        Change?
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="mobile-forgot-pin-input" className="sr-only">PIN</label>
                                    <input
                                        id="mobile-forgot-pin-input"
                                        type="text"
                                        placeholder="Enter 6-digit PIN"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className="w-full h-[48px] bg-white border border-[#CED4DA] rounded px-4 py-2 text-[16px] text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all"
                                        required
                                        autoFocus
                                        maxLength={6}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="mobile-new-password-input" className="block text-[10px] font-bold text-gray-400 uppercase ml-2 mt-1 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="mobile-new-password-input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 6 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full h-[48px] bg-white border border-[#CED4DA] rounded px-4 py-2 pr-12 text-[16px] text-[#1F1F1F] font-medium focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
                                    className="w-full bg-[#232320] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-lg"
                                >
                                    Update Password
                                </button>

                                <div className="flex justify-center gap-4 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                setError("");
                                                await authService.requestPin(email);
                                            } catch (err) {
                                                setError("Failed to resend code");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="text-sm text-[#1F1F1F] hover:opacity-80 underline font-bold"
                                    >
                                        Resend Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setStep("password"); setPin(""); setNewPassword(""); setError(""); }}
                                        className="text-sm text-[#1F1F1F] hover:opacity-80 underline font-bold"
                                    >
                                        Use Password?
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>

            {successMessage && (
                <Toast
                    message={successMessage}
                    type="success"
                    duration={2500}
                    onClose={() => {
                        setSuccessMessage(null);
                        onClose();
                        window.dispatchEvent(new Event("cart-updated"));
                    }}
                />
            )}
        </div>
    );
};