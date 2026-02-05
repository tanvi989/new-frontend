import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateEmail } from "../helpers/validateForms";
import { authService } from "../services/authService";
import { syncLocalCartToBackend } from "../api/retailerApis";
import axiosInstance from "../api/axiosConfig";

type FormStep = "email" | "password" | "register";

const Login: React.FC = () => {
  const [step, setStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [emailError, setEmailError] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [pin, setPin] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">("password");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    const returnTo = sessionStorage.getItem("returnTo") || "/";
    navigate(returnTo);
    sessionStorage.removeItem("returnTo");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!validateEmail(newEmail)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || emailError) return;

    setLoading(true);
    setMessage(null);

    try {
      // Check if email exists in database
      const response = await authService.checkEmailExists(email);

      if (response.data?.is_registered) {
        // User exists - show password field
        setUserExists(true);
        setStep("password");

        // Request PIN automatically
        try {
          await authService.requestPin(email);
          setMessage({
            type: "success",
            text: "Welcome back! Enter password or the PIN sent to your email.",
          });
        } catch (pinError) {
          console.error("Failed to send PIN:", pinError);
          setMessage({
            type: "success",
            text: "Welcome back! Please enter your password.",
          });
        }
      } else {
        // New user - show registration form
        setUserExists(false);
        setStep("register");
        setMessage({
          type: "success",
          text: "New user! Please complete your registration.",
        });
      }
    } catch (error: any) {
      console.error("Email check error:", error);
      // If API fails, assume new user
      setUserExists(false);
      setStep("register");
      setMessage({
        type: "success",
        text: "Please complete your registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract error message from any object
  const extractErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (!error) return "An unknown error occurred.";

    // If it's an array, take the first item
    if (Array.isArray(error)) {
      return extractErrorMessage(error[0]);
    }

    // If it's an object, look for common error fields
    if (typeof error === "object") {
      if (error.message) return extractErrorMessage(error.message);
      if (error.error) return extractErrorMessage(error.error);
      if (error.detail) return extractErrorMessage(error.detail);
      if (error.non_field_errors)
        return extractErrorMessage(error.non_field_errors);

      // If no common fields, try to join all values if they are strings
      const values = Object.values(error);
      if (
        values.length > 0 &&
        values.every((v) => typeof v === "string" || Array.isArray(v))
      ) {
        return Object.entries(error)
          .map(([key, val]) => `${key}: ${extractErrorMessage(val)}`)
          .join("\n");
      }
    }

    return "An unknown error occurred.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === "password" && !password) return;
    if (loginMethod === "pin" && !pin) return;

    setLoading(true);
    setMessage(null);

    try {
      let res;
      if (loginMethod === "password") {
        res = await login(email, password);
      } else {
        res = await authService.loginWithPin(email, pin);
      }
      setMessage({ type: "success", text: "Login Successful." });

      if (res) {
        localStorage.setItem("token", res.data.token);
        // Important: Save the name returned from API, or fallback to 'User'
        // Check both possible response structures: res.data.first_name or res.data.data.first_name
        const firstName = res.data?.data?.first_name || res.data?.first_name || localStorage.getItem("firstName") || "User";
        const lastName = res.data?.data?.last_name || res.data?.last_name || localStorage.getItem("lastName") || "";
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);

        // Notify other components (like Cart) that auth state changed
        window.dispatchEvent(new Event("auth-change"));
        window.dispatchEvent(new Event("storage"));

        await syncLocalCartToBackend();
        const returnTo = sessionStorage.getItem("returnTo") || "/";
        navigate(returnTo);
        sessionStorage.removeItem("returnTo");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please check your credentials.";

      if (error?.response?.data) {
        errorMessage = extractErrorMessage(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !password || !mobile) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await authService.register(
        firstName,
        lastName,
        email,
        mobile,
        password
      );

      console.log("Registration response:", response);
      if (response.status || response.success) {
        // 1. Save Token
        localStorage.setItem("token", response.data?.token || "mock-token-" + Date.now());

        // 2. Save User Data explicitly for the Cart Icon
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem("customerID", response.data?.id || "MOCK_ID");

        // 3. Dispatch auth change events so Cart.tsx updates immediately
        window.dispatchEvent(new Event("auth-change"));
        window.dispatchEvent(new Event("storage"));

        await syncLocalCartToBackend();

        setMessage({
          type: "success",
          text: "Registration successful! Redirecting...",
        });

        setTimeout(() => {
          const returnTo = sessionStorage.getItem("returnTo") || "/";
          navigate(returnTo);
          sessionStorage.removeItem("returnTo");
        }, 1000);
      } else {
        const msg = extractErrorMessage(response.data || response);
        setMessage({
          type: "error",
          text:
            msg !== "An unknown error occurred." ? msg : "Registration failed.",
        });
      }
    } catch (error: any) {
      console.error("Registration error full object:", error);

      let errorMessage = "Registration failed. Please try again.";

      if (error?.response?.data) {
        errorMessage = extractErrorMessage(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Implement Google OAuth flow
      // For now, redirect to backend OAuth endpoint
      // window.location.href = `${import.meta.env.VITE_API_URL}/accounts/google/login/`;

      // Placeholder implementation - replace with actual OAuth flow
      setMessage({
        type: "error",
        text: "Google login will be available soon. Please use email login.",
      });
      console.log("Google login initiated");
    } catch (error: any) {
      console.error("Google login error:", error);
      setMessage({
        type: "error",
        text: "Google login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Implement Facebook OAuth flow
      // For now, redirect to backend OAuth endpoint
      // window.location.href = `${import.meta.env.VITE_API_URL}/accounts/facebook/login/`;

      // Placeholder implementation - replace with actual OAuth flow
      setMessage({
        type: "error",
        text: "Facebook login will be available soon. Please use email login.",
      });
      console.log("Facebook login initiated");
    } catch (error: any) {
      console.error("Facebook login error:", error);
      setMessage({
        type: "error",
        text: "Facebook login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-start font-sans overflow-hidden px-4 md:px-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Login Background.png"
          alt="Green Glasses Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <header className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-20">
        <Link to="/" className="transform -rotate-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src="/multifolks-logo.png"
            alt="Multifolks"
            className="h-12 md:h-16 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close login"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#1F1F1F] shadow-md transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Login/Register Card */}
      <div className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-[480px] shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-300 mt-20 md:mt-0">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1F1F1F] mb-3" >
            {step === "register" ? "Complete Your Account" : "Login / Sign Up"}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {step === "register"
              ? "Get ready for unbeatable deals and limitless style"
              : "We do not share your personal details with anyone."}
          </p>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={handleNext} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-left">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full bg-white border ${emailError ? "border-red-500" : "border-gray-200"
                  } rounded-lg px-4 py-2.5 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors`}
                required
                autoFocus
              />
              {emailError && (
                <span className="text-red-500 text-xs font-medium pl-1">
                  {emailError}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {loading ? "Checking..." : "Next"}
            </button>

            <div className="text-right -mt-2">
              <Link
                to="/forgot-password"
                className="text-gray-500 font-medium text-xs hover:text-[#1F1F1F] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-full font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loading}
                className="w-full bg-[#1877F2] text-white py-3.5 rounded-full font-bold text-sm hover:bg-[#166FE5] transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>
          </form>
        )}

        {/* Password Step (Existing User) */}
        {step === "password" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] mb-1">
                Login to Multifolks
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Welcome Back
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Email Display with Change Link */}
              <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 flex justify-between items-center">
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

              {/* Input Field (Password or PIN) */}
              {loginMethod === "password" ? (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors pr-12"
                    required
                    autoFocus
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
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors tracking-widest text-center text-lg"
                    required
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 my-2 px-1">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setMessage({ type: "success", text: "Sending PIN..." });
                    await authService.requestPin(email);
                    setMessage({ type: "success", text: `PIN has been sent to ${email}` });
                  } catch (err: any) {
                    console.error(err);
                    setMessage({ type: "error", text: "Failed to send PIN" });
                  }
                }}
                className="text-gray-500 font-medium text-xs hover:text-[#1F1F1F] transition-colors underline"
              >
                Request PIN
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-base hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {loading ? "Processing..." : "Proceed"}
            </button>

            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setMessage({ type: "success", text: "Sending PIN..." });
                    await authService.requestPin(email);
                    setMessage({ type: "success", text: `PIN has been sent to ${email}` });
                  } catch (err: any) {
                    console.error(err);
                    setMessage({ type: "error", text: "Failed to send PIN" });
                  }
                }}
                className="text-[#1F1F1F] font-bold text-sm underline hover:opacity-80"
              >
                Request PIN
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (loginMethod === "password") {
                    setLoginMethod("pin");
                    setMessage({ type: "success", text: "Enter the PIN sent to your email." });
                  } else {
                    setLoginMethod("password");
                  }
                }}
                className="text-gray-500 font-medium text-sm hover:text-black hidden"
              >
                {/* Hidden toggle for now, prioritizing explicit send button */}
                {loginMethod === "password" ? "Login with PIN" : "Login with Password"}
              </button>

              <Link
                to="/forgot-password"
                className="text-[#1F1F1F] font-bold text-sm underline hover:opacity-80"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        )}

        {/* Registration Step (New User) */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2 border border-gray-200 rounded-lg p-3 bg-white">
              <span className="text-sm font-bold text-[#1F1F1F]">{email}</span>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-xs text-[#232320] font-bold hover:underline"
              >
                Change?
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
                required
                autoFocus
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <p className="text-[10px] text-gray-500 leading-tight">
              *Minimum six characters, at least one letter and one number
              Required
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 mt-2"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm font-medium flex items-start gap-3 ${message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
              } animate-in fade-in slide-in-from-top-2 duration-300`}
          >
            <div className="shrink-0 mt-0.5">
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 text-left whitespace-pre-line">
              {message.text}
            </div>
            <button
              onClick={() => setMessage(null)}
              className={`shrink-0 hover:opacity-70 transition-opacity ${message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
