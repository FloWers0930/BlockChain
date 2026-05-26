// src/api/axios.js
import axios from "axios";
import {
  getToken,
  getRefreshToken,
  setAuthData,
  clearAuthData,
} from "./token.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SAFE_METHODS = new Set(["get", "head", "options"]);
const CSRF_COOKIE_NAME = "csrfToken";

// ── Request timeout configuration ─────────────────────────────────────────────
const REQUEST_TIMEOUT = 15000;
const SLOW_REQUEST_THRESHOLD = 5000;
const REQUEST_ABORT_TIMEOUT = 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
});

// ── Request timeout handler ───────────────────────────────────────────────────
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

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const { _requestId, _startTime } = response.config;
    const duration = Date.now() - _startTime;

    if (import.meta.env.DEV && duration > SLOW_REQUEST_THRESHOLD) {
      console.warn(
        `⚠️ Slow request: ${response.config.method.toUpperCase()} ${response.config.url} took ${duration}ms`,
      );
    }

    if (activeRequests.has(_requestId)) {
      const { timeoutId } = activeRequests.get(_requestId);
      clearTimeout(timeoutId);
      activeRequests.delete(_requestId);
    }

    return response;
  },
  (error) => {
    const { config } = error;
    if (config?._requestId && activeRequests.has(config._requestId)) {
      const { timeoutId } = activeRequests.get(config._requestId);
      clearTimeout(timeoutId);
      activeRequests.delete(config._requestId);
    }

    if (error.name === "AbortError" || error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error(
          "Request timeout. Please check your connection and try again.",
        ),
      );
    }

    return Promise.reject(error);
  },
);

// ── Refresh queue ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];
let csrfBootstrapPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const redirectToLogin = () => {
  clearAuthData();
  window.location.href = "/login?expired=true";
};

const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  const found = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));
  if (!found) return "";
  return decodeURIComponent(found.split("=")[1] || "");
};

const ensureCsrfToken = async () => {
  const existing = readCookie(CSRF_COOKIE_NAME);
  if (existing) return existing;

  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = axios
      .get(`${API_BASE_URL}/csrf-token`, {
        withCredentials: true,
        timeout: 10000,
      })
      .finally(() => {
        csrfBootstrapPromise = null;
      });
  }

  await csrfBootstrapPromise;
  return readCookie(CSRF_COOKIE_NAME);
};

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = true;

    const method = (config.method || "get").toLowerCase();
    if (!SAFE_METHODS.has(method)) {
      const csrfToken = await ensureCsrfToken();
      if (csrfToken) config.headers["x-csrf-token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — handle 401 with token refresh ─────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
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
      const storedRefreshToken = getRefreshToken();
      if (!storedRefreshToken) {
        processQueue(new Error("No refresh token available"));
        redirectToLogin();
        return Promise.reject(new Error("No refresh token available"));
      }

      const csrfToken = await ensureCsrfToken();
      const refreshHeaders = { "Content-Type": "application/json" };
      if (csrfToken) refreshHeaders["x-csrf-token"] = csrfToken;

      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        { headers: refreshHeaders, withCredentials: true },
      );

      if (!data?.token || !data?.user) {
        processQueue(new Error("Invalid refresh response"));
        redirectToLogin();
        return Promise.reject(new Error("Session expired"));
      }

      const isValid = setAuthData(data);
      if (!isValid) {
        processQueue(new Error("Invalid auth data"));
        redirectToLogin();
        return Promise.reject(new Error("Failed to refresh session"));
      }

      processQueue(null, data.token);
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
