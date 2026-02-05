import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import axiosInstance from "../api/axiosConfig";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} `;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (step === "email") {
        if (!email) return;

        // Use axiosInstance to ensure correct Base URL
        const response = await axiosInstance.post("/api/v1/auth/forgot-password", { email });
        const data = response.data;

        if (data.success || data.status) {
          setMessage({
            type: "success",
            text: data.msg || "Reset PIN sent to your email.",
          });
          setStep("reset");
          setTimer(30); // Start 30s timer
        } else {
          setMessage({
            type: "error",
            text: data.msg || "Failed to send PIN.",
          });
        }
      } else {
        // Step 2: Reset Password
        if (!pin || !newPassword) return;

        const res = await authService.resetPassword(email, pin, newPassword);
        if (res.success) {
          setMessage({
            type: "success",
            text: "Password reset successful! Redirecting to login...",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setMessage({
            type: "error",
            text: res.msg || "Failed to reset password.",
          });
        }
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setMessage({
        type: "error",
        text: error?.response?.data?.msg || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    try {
      setLoading(true);
      await authService.requestPin(email);
      setTimer(30);
      setMessage({ type: "success", text: "PIN resent successfully." });
    } catch (e) {
      setMessage({ type: "error", text: "Failed to resend PIN." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-start bg-gray-50 font-sans relative p-4 md:p-12 lg:p-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Login Background.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[24px] shadow-xl p-8 md:p-10 backdrop-blur-sm bg-white/95">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1F1F1F] mb-1">
            Forgot Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {step === "email" ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="sr-only"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
                required
                autoFocus
              />
            </div>
          ) : (
            <>
              {/* Email Display with Change Link */}
              <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 flex justify-between items-center">
                <span className="text-[#6B8E23] font-bold text-sm truncate mr-2">
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

              <div className="flex flex-col gap-2 relative">
                <div className="flex flex-col">
                  <label
                    htmlFor="pin"
                    className="text-xs font-bold text-gray-500 ml-1"
                  >
                    Enter your PIN
                  </label>
                  <span className="text-[10px] text-gray-400 ml-1 mb-1">
                    (Enter the PIN sent to your registered email)
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="pin"
                    type="text"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors pr-20"
                    required
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {timer > 0 ? (
                      <span className="text-gray-500 font-medium text-sm">
                        {formatTime(timer)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendPin}
                        className="text-[#1F1F1F] font-bold text-sm underline hover:opacity-80"
                        disabled={loading}
                      >
                        Resend?
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="newPassword"
                  className="text-xs font-bold text-gray-500 ml-1"
                >
                  Set Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "email" && (
            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#1F1F1F] font-bold text-sm hover:text-[#D96C47] transition-colors"
              >
                Back to login
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#232320] text-white px-6 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? "Processing..." : step === "email" ? "Send Reset PIN" : "Update"}
          </button>
        </form>

        {message && (
          <div
            className={`mt - 6 p - 4 rounded - lg text - sm font - medium ${message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
              } `}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
