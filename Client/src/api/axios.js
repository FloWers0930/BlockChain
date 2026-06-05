import axios from "axios";
import { getToken, setAuthData, clearAuthData } from "./token.js";

// 🔑 Use relative path for Vite dev proxy. Falls back to env var in production.
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://statio-nexus-server-1.onrender.com";

const REQUEST_TIMEOUT = 15000;
const SLOW_REQUEST_THRESHOLD = 5000;
const REQUEST_ABORT_TIMEOUT = 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: REQUEST_TIMEOUT,
  withCredentials: true, // 🔑 Sends HTTP-only refresh cookie automatically
});

// ── Request Tracking & Timeout ────────────────────────────────────────────────
let requestCounter = 0;
const activeRequests = new Map();

api.interceptors.request.use(
  (config) => {
    const requestId = ++requestCounter;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      activeRequests.delete(requestId);
    }, REQUEST_ABORT_TIMEOUT);

    activeRequests.set(requestId, { abortController, timeoutId });
    config.signal = abortController.signal;
    config._requestId = requestId;
    config._startTime = Date.now();

    // 🔑 Attach access token from memory
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor (Timing + 401 Refresh Queue + Password Enforcement) ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const redirectToLogin = () => {
  clearAuthData();
  // ✅ Dispatch event so AuthProvider updates state → React Router handles redirect softly
  window.dispatchEvent(new Event("auth-changed"));
};

api.interceptors.response.use(
  (response) => {
    const { _requestId, _startTime } = response.config;
    const duration = Date.now() - _startTime;

    if (import.meta.env.DEV && duration > SLOW_REQUEST_THRESHOLD) {
      console.warn(
        `⚠️ Slow request: ${response.config.method?.toUpperCase()} ${
          response.config.url
        } took ${duration}ms`,
      );
    }

    if (activeRequests.has(_requestId)) {
      clearTimeout(activeRequests.get(_requestId).timeoutId);
      activeRequests.delete(_requestId);
    }
    return response;
  },
  async (error) => {
    const { config } = error;
    if (config?._requestId && activeRequests.has(config._requestId)) {
      clearTimeout(activeRequests.get(config._requestId).timeoutId);
      activeRequests.delete(config._requestId);
    }

    if (error.name === "AbortError" || error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error(
          "Request timeout. Please check your connection and try again.",
        ),
      );
    }

    // ✅ NEW: Catch 403 with mustChangePassword flag from backend middleware
    if (
      error.response?.status === 403 &&
      error.response?.data?.mustChangePassword
    ) {
      window.location.replace("/change-password");
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    // Don't retry auth endpoints to avoid loops
    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/change-password") // ✅ Don't retry password change itself
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 🔑 Browser sends refreshToken cookie automatically. Use raw axios to avoid interceptor loops.
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      if (!data?.token) {
        processQueue(new Error("Invalid refresh response"));
        redirectToLogin();
        return Promise.reject(new Error("Session expired"));
      }

      // 🔒 Store new token in memory
      setAuthData({ token: data.token });
      processQueue(null, data.token);
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      redirectToLogin(); // Triggers soft logout
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

