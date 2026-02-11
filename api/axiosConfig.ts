import Axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// NOTE: In your full project, import these from your redux setup
// import store from '../redux/store';
// import { error, success } from '../redux/actions/messageActions';

// Mock store/actions for standalone demonstration
const store = {
  dispatch: (action: any) => console.log('Redux Dispatch:', action)
};
const error = (message: string) => ({ type: 'ERROR', payload: message });
const success = (message: string) => ({ type: 'SUCCESS', payload: message });

// Backend URL: use VITE_API_TARGET / VITE_API_URL from .env; default production backend
export const API_BASE_URL = "https://livebackend.multifolks.com";

const env = (import.meta as any)?.env ?? {};
let ENV_API_TARGET = (env.VITE_API_TARGET || env.VITE_API_URL || "").trim();
if (ENV_API_TARGET && (ENV_API_TARGET.includes("http//") || !/^https?:\/\//.test(ENV_API_TARGET))) {
  ENV_API_TARGET = "";
}

// Use relative URL when same-origin so the server can proxy to backend → avoids CORS (backend sends duplicate Access-Control-Allow-Origin).
// Localhost: Vite dev server proxies. Production (live.multifolks.com / multifolks.com): your server must proxy /api/v1, /accounts, /retailer to livebackend.multifolks.com.
const host = typeof window !== "undefined" ? window.location.hostname : "";
const useRelativeApi =
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "live.multifolks.com" ||
  host === "www.multifolks.com" ||
  host === "multifolks.com";
const RESOLVED_BASE_URL = useRelativeApi
  ? ""
  : ENV_API_TARGET
    ? (ENV_API_TARGET.replace(/\/+$/, "") + "/")
    : (API_BASE_URL.replace(/\/+$/, "") + "/");

console.log('[API] Base URL:', RESOLVED_BASE_URL || "(relative – proxy to backend)");

const axios = Axios.create({
  baseURL: RESOLVED_BASE_URL,
  // withCredentials: true,
  // IMPORTANT:
  // Do not force a global Content-Type.
  // Axios will automatically set:
  // - application/json for plain objects
  // - multipart/form-data (with boundary) for FormData
});

// Helper function to get CSRF token from cookies (Note: won't work without withCredentials)
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

axios.interceptors.request.use(function (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) {
  // When skipAuth is true, we intentionally fetch as guest (e.g. merge guest cart before login).
  if (config.skipAuth && config.headers) {
    const guestId = (config as any).guestId || localStorage.getItem('guest_id');
    if (guestId) {
      config.headers['X-Guest-ID'] = guestId;
      delete config.headers['Authorization'];
    }
    return config;
  }
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else if (config.headers) {
    // If no token, send Guest ID
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('guest_id', guestId);
    }
    config.headers['X-Guest-ID'] = guestId;
  }
  
  // Note: CSRF token from cookies won't work without withCredentials
  // If your backend needs CSRF protection, you'll need to implement it differently
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && config.headers) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response: AxiosResponse) {
  if (response?.data?.status && response?.data?.message) {
    store.dispatch(success(response?.data?.message));
  }
  return response;
}, async function (err: AxiosError) {
  const originalRequest = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
  
  if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    
    // Remove invalid token
    localStorage.removeItem('token');
    
    // Ensure guest ID exists
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('guest_id', guestId);
    }
    
    if (originalRequest.headers) {
      delete originalRequest.headers['Authorization'];
      originalRequest.headers['X-Guest-ID'] = guestId;
    }
    
    return axios(originalRequest);
  }
  
  return Promise.reject(err);
});

// Example API call
export const getCityAndState = (pincode: string) => {
  return axios.get(`/accounts/address/check_pincode/?pincode=${pincode}`);
}

export default axios;
