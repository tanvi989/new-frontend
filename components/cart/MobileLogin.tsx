import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { syncLocalCartToBackend } from "../../api/retailerApis";
import { Loader2 } from "../Loader";

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
                // Not registered -> Go to Sign Up
                onNext(email);
            }
        } catch (err) {
            console.error("Error checking email:", err);
            // If error (e.g. network), we could assume sign up or show error.
            // For safety, let's assume sign up if we can't verify, or show error.
            // onNext(email);
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
            // login handles storage and event dispatch

            if (response.success || response.token || response.status) {
                // Sync guest cart to authenticated user cart
                await syncLocalCartToBackend();
                onClose();
                // Dispatch event to refresh cart
                window.dispatchEvent(new Event('cart-updated'));
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

    // Consistent styling with the provided screenshot
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 font-sans">
            {/* Background with Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/Login Background.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-[400px] bg-white rounded-[24px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-[#E85131] to-[#01AF9A] py-3.5 px-6 flex items-center justify-between">
                    <div className="flex-1 text-center">
                        <span className="text-white font-bold text-[17px] tracking-tight">Complete Your Checkout</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="p-8 pb-10">
                    {loading ? (
                        <div className="py-12">
                            <Loader2 />
                        </div>
                    ) : (
                        <>
                            {step === "password" ? (
                                <div className="text-center">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1">
                                        Enter Password
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 mb-8">
                                        <p className="text-[#757575] text-[15px]">{email}</p>
                                        <button onClick={() => setStep("email")} className="text-[#1F1F1F] text-sm font-bold underline">Change?</button>
                                    </div>

                                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-8">
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#0066CC] z-10">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-white border border-[#CED4DA] rounded-[10px] px-5 py-3.5 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#1F1F1F] transition-all text-base pr-12"
                                                    required
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                                            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg -mt-4">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="w-full bg-[#1F1F1F] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-md uppercase tracking-widest"
                                        >
                                            Login
                                        </button>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        setLoading(true);
                                                        await authService.requestPin(email);
                                                        setStep("pin");
                                                    } catch (err) {
                                                        setError("Failed to request PIN");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="text-sm font-bold underline text-[#1F1F1F]"
                                            >
                                                Login with PIN?
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        setLoading(true);
                                                        await authService.requestPin(email);
                                                        setStep("forgot_password");
                                                    } catch (err) {
                                                        setError("Failed to request reset PIN");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="text-sm font-bold underline text-[#1F1F1F]"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : step === "email" ? (
                                <div className="text-center">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-2 leading-tight">
                                        Login / Sign Up
                                    </h2>
                                    <p className="text-[#757575] text-[15px] leading-snug font-medium mb-10 px-4">
                                        To place an order and get your favourite eyewear at your doorstep.
                                    </p>

                                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-8">
                                        <div className="relative">
                                            {/* Label on Border */}
                                            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#0066CC] z-10">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white border border-[#CED4DA] rounded-[10px] px-5 py-3.5 text-[#1F1F1F] font-medium placeholder:text-transparent focus:outline-none focus:border-[#1F1F1F] transition-all text-base"
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg -mt-4">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="w-full bg-[#1F1F1F] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-md active:scale-[0.98] tracking-widest uppercase"
                                        >
                                            Next
                                        </button>
                                    </form>
                                </div>
                            ) : step === "pin" ? (
                                <div className="text-center">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1">
                                        PIN Sent
                                    </h2>
                                    <p className="text-[#757575] text-[15px] mb-1">PIN sent to</p>
                                    <p className="text-[#1F1F1F] font-bold text-[15px] mb-1">{email}</p>
                                    <button onClick={() => setStep("email")} className="text-[#757575] text-sm underline mb-8 block mx-auto">Change?</button>

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
                                                onClose();
                                                window.dispatchEvent(new Event('cart-updated'));
                                            } else {
                                                setError(response.message || "Invalid PIN");
                                            }
                                        } catch (err: any) {
                                            setError(err?.response?.data?.detail?.msg || err?.response?.data?.message || "Invalid PIN. Please try again.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }} className="flex flex-col gap-8">
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#0066CC] z-10">
                                                PIN
                                            </label>
                                            <input
                                                type="text"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                className="w-full bg-white border border-[#CED4DA] rounded-[10px] px-5 py-3.5 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#1F1F1F] transition-all text-base tracking-[0.5em] text-center"
                                                required
                                                autoFocus
                                                maxLength={6}
                                            />
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg -mt-4">
                                                {error}
                                            </div>
                                        )}

                                        <button type="submit" className="w-full bg-[#1F1F1F] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-md uppercase tracking-widest">
                                            Verify
                                        </button>

                                        <div className="space-y-3">
                                            <p className="text-sm text-[#757575]">
                                                Not received your code?{" "}
                                                <button type="button" onClick={async () => {
                                                    try {
                                                        setLoading(true);
                                                        await authService.requestPin(email);
                                                        setError("");
                                                    } catch (err) { setError("Failed to resend code"); } finally { setLoading(false); }
                                                }} className="font-bold underline text-[#1F1F1F]">Resend Code</button>
                                            </p>
                                            <button type="button" onClick={() => setStep("password")} className="text-sm font-bold underline text-[#1F1F1F]">Use Password?</button>
                                        </div>
                                    </form>
                                </div>
                            ) : step === "forgot_password" ? (
                                <div className="text-center">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1">
                                        Forgot Password
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 mb-8">
                                        <p className="text-[#757575] text-[15px]">{email}</p>
                                        <button onClick={() => setStep("email")} className="text-[#1F1F1F] text-sm font-bold underline">Change?</button>
                                    </div>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!pin || pin.length !== 6) { setError("Please enter a valid 6-digit PIN"); return; }
                                        if (!newPassword || newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
                                        setLoading(true);
                                        setError("");
                                        try {
                                            const response = await authService.resetPassword(email, pin, newPassword);
                                            if (response.success || response.status) {
                                                await syncLocalCartToBackend();
                                                onClose();
                                                window.dispatchEvent(new Event('cart-updated'));
                                            } else { setError(response.message || "Failed to reset password"); }
                                        } catch (err: any) { setError(err?.response?.data?.detail?.msg || err?.response?.data?.message || "Failed to reset password. Please try again."); } finally { setLoading(false); }
                                    }} className="flex flex-col gap-6">
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#0066CC] z-10">
                                                Enter PIN
                                            </label>
                                            <input
                                                type="text"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                className="w-full bg-white border border-[#CED4DA] rounded-[10px] px-5 py-3.5 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#1F1F1F] transition-all text-base"
                                                required
                                                autoFocus
                                                maxLength={6}
                                            />
                                        </div>

                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#3D2E28] z-10">
                                                Set Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full bg-white border border-[#CED4DA] rounded-[10px] px-5 py-3.5 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#1F1F1F] transition-all text-base pr-12"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showPassword ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg -mt-2">
                                                {error}
                                            </div>
                                        )}

                                        <button type="submit" className="w-full bg-[#1F1F1F] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-md uppercase tracking-widest">
                                            Update
                                        </button>
                                    </form>
                                </div>
                            ) : null}
                            {/* PIN and Forgot Password steps would follow same pattern */}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};