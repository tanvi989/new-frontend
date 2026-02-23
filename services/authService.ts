import axiosInstance from "../api/axiosConfig";
import { syncLocalCartToBackend } from "../api/retailerApis";

export const authService = {
  // Check if email exists in database
  checkEmailExists: async (email: string) => {
    try {
      // Use simple check-email endpoint
      const response = await axiosInstance.get(
        `/api/v1/accounts/check-email?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking email:", error);
      // If error, assume new user
      return { success: true, data: { is_registered: false } };
    }
  },

  register: async (
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    password: string,
    countryCode: string = "44"
  ) => {
    const payload = {
      first_name: (firstName ?? "").trim(),
      last_name: (lastName ?? "").trim(),
      email: (email ?? "").trim() || undefined,
      mobile: (mobile ?? "").trim(),
      password: password ?? "",
      country_code: countryCode ?? "44",
    };

    const response = await axiosInstance.post("/api/v1/auth/simple-register", payload, {
      headers: { "Content-Type": "application/json" },
    });

    const data = response.data;
    if (data?.success) {
      data.status = true;
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const payload = {
      username: email,
      password: password,
    };

    const response = await axiosInstance.post(
      "/api/v1/auth/login",
      payload, // Send JSON
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Store token + user details
    const token = response.data.token || response.data.data?.token;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      // Handle both response structures: response.data.data or response.data
      const userData = response.data.data || response.data;
      if (userData) {
        // Only update if we have a value from API, otherwise preserve existing or use fallback
        const firstName = userData.first_name || "";
        const lastName = userData.last_name || "";
        const phone = userData.mobile || userData.phone || "";

        // Set firstName with fallback to preserve existing or "User"
        localStorage.setItem("firstName", firstName || localStorage.getItem("firstName") || "User");
        if (lastName) localStorage.setItem("lastName", lastName);
        if (phone) localStorage.setItem("phone", phone);
      } else {
        // If no userData, ensure we at least have a fallback firstName
        if (!localStorage.getItem("firstName")) {
          localStorage.setItem("firstName", "User");
        }
      }

      // Merge guest cart with user cart BEFORE firing auth-change, so cart refetch sees merged cart
      console.log("🔍 Login successful, merging guest cart...");
      try {
        await syncLocalCartToBackend();
        console.log("✅ Guest cart merged successfully after login");
      } catch (error) {
        console.error("⚠️ Failed to merge guest cart, but login was successful:", error);
      }

      window.dispatchEvent(new Event("auth-change"));
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("phone");
    window.dispatchEvent(new Event("auth-change"));
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const phone = localStorage.getItem("phone");

    // In a real app, you might decode the token or fetch user profile here
    return token
      ? {
        email: email || "user@example.com",
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || "",
      }
      : null;
  },

  // Google OAuth Login
  googleLogin: async (accessToken: string) => {
    try {
      const response = await axiosInstance.post("/accounts/google/callback/", {
        access_token: accessToken,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("email", response.data.email || "");
        localStorage.setItem("firstName", response.data.first_name || "");
        localStorage.setItem("lastName", response.data.last_name || "");

        try {
          await syncLocalCartToBackend();
        } catch (error) {
          console.error("⚠️ Failed to merge guest cart after Google login:", error);
        }
        window.dispatchEvent(new Event("auth-change"));
      }

      return response.data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  },

  // Facebook OAuth Login
  facebookLogin: async (accessToken: string) => {
    try {
      const response = await axiosInstance.post(
        "/accounts/facebook/callback/",
        {
          access_token: accessToken,
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("email", response.data.email || "");
        localStorage.setItem("firstName", response.data.first_name || "");
        localStorage.setItem("lastName", response.data.last_name || "");

        try {
          await syncLocalCartToBackend();
        } catch (error) {
          console.error("⚠️ Failed to merge guest cart after Facebook login:", error);
        }
        window.dispatchEvent(new Event("auth-change"));
      }

      return response.data;
    } catch (error) {
      console.error("Facebook login error:", error);
      throw error;
    }
  },

  // PIN Authentication
  requestPin: async (email: string) => {
    const response = await axiosInstance.post("/api/v1/auth/request-pin", { email });
    return response.data;
  },

  // Request a new reset PIN (for forgot-password flow only; uses same endpoint as initial "Send Reset PIN")
  requestResetPin: async (email: string) => {
    const response = await axiosInstance.post("/api/v1/auth/forgot-password", { email });
    return response.data;
  },

  loginWithPin: async (email: string, pin: string) => {
    const response = await axiosInstance.post("/api/v1/auth/login-with-pin", { email, pin });

    if (response.data.success && response.data.data) {
      const { token, first_name, last_name, mobile, id } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("firstName", first_name || "");
      localStorage.setItem("lastName", last_name || "");
      localStorage.setItem("phone", mobile || "");
      localStorage.setItem("customerID", id || "");

      try {
        await syncLocalCartToBackend();
      } catch (error) {
        console.error("⚠️ Failed to merge guest cart after PIN login:", error);
      }
      window.dispatchEvent(new Event("auth-change"));
    }

    return response.data;
  },

  resetPassword: async (email: string, pin: string, newPassword: string) => {
    const response = await axiosInstance.post("/api/v1/auth/reset-password", {
      email,
      pin,
      new_password: newPassword,
    });
    return response.data;
  },
};
