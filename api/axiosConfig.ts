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

// Use backend from Vite env or fallback to local backend (must be http:// or https://, no typo)
export const API_BASE_URL = "http://localhost:5000";

// Prefer Vite env if present (dev/prod), otherwise fallback to localhost:5000
const env = (import.meta as any)?.env ?? {};
let ENV_API_TARGET = (env.VITE_API_TARGET || env.VITE_API_URL || "").trim();
// Fix malformed URL (e.g. "https://http//localhost:5000" -> use default)
if (ENV_API_TARGET && (ENV_API_TARGET.includes("http//") || !/^https?:\/\//.test(ENV_API_TARGET))) {
  ENV_API_TARGET = "";
}
let RESOLVED_BASE_URL = ENV_API_TARGET ? (ENV_API_TARGET.replace(/\/+$/, "") + "/") : (API_BASE_URL + "/");
// Final guard: never use a malformed URL (e.g. https://http//localhost:5000)
if (RESOLVED_BASE_URL.includes("http//")) {
  RESOLVED_BASE_URL = API_BASE_URL + "/";
}

// One-time log so you can confirm backend base URL in browser console
console.log('[API] Base URL:', RESOLVED_BASE_URL);

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

axios.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
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
