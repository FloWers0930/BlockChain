// frontend/src/shared/api/axios.js
import axios from "axios";
import {
  getToken,
  getRefreshToken,
  setAuthData,
  clearAuthData,
} from "./token.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SAFE_METHODS = new Set(["get", "head", "options"]);
const CSRF_COOKIE_NAME = "csrfToken";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

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

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Another refresh is already running — queue this request
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
        // Avoid noisy console spam; redirect handled below.
        processQueue(new Error("Invalid refresh response"));
        redirectToLogin();
        return Promise.reject(new Error("Session expired"));
      }

      // Validate refreshed auth data
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
