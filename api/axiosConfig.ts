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
export const API_BASE_URL = "https://testbackend.multifolks.com/";

const env = (import.meta as any)?.env ?? {};
let ENV_API_TARGET = (env.VITE_API_TARGET || env.VITE_API_URL || "").trim();
if (ENV_API_TARGET && (ENV_API_TARGET.includes("http//") || !/^https?:\/\//.test(ENV_API_TARGET))) {
  ENV_API_TARGET = "";
}

// Use direct API calls for all domains since backend CORS is completely open
// No restrictions - all frontend domains can access backend directly
const host = typeof window !== "undefined" ? window.location.hostname : "";
const useRelativeApi = false;  // Always use direct API calls
const RESOLVED_BASE_URL = API_BASE_URL.replace(/\/+$/, "") + "/";  // Always use backend URL

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
    const url = originalRequest.url || '';
    const method = (originalRequest.method || 'GET').toUpperCase();
    const hadToken = !!localStorage.getItem('token');
    // Do NOT retry cart mutations with guest_id when user had a token (would add to wrong cart).
    const isCartMutation = method !== 'GET' &&
      (url.includes('/api/v1/cart/add') || url.includes('/api/v1/cart/item/') ||
       url.includes('/api/v1/cart/quantity') || url.includes('/api/v1/cart/clear'));
    // Do NOT retry GET /api/v1/cart with guest when user had a token: retry would return empty guest cart and UI would show 0 items.
    const isCartGet = method === 'GET' && url.includes('/api/v1/cart');
    if (hadToken && (isCartMutation || isCartGet)) {
      if (isCartMutation) localStorage.removeItem('token');
      return Promise.reject(err);
    }

    originalRequest._retry = true;
    localStorage.removeItem('token');

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
