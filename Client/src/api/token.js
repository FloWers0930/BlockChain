// src/api/token.js
// Centralized auth token management with JWT validation

const AUTH_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  LAST_LOGIN: "lastLogin",
};

// ─── Validation schema ────────────────────────────────────────────────────────
const validateAuthData = (data) => {
  if (!data || typeof data !== "object") return false;
  if (!data.user || typeof data.user !== "object") return false;
  if (!data.user.id || !data.user.email || !data.user.role) return false;
  if (data.token && typeof data.token !== "string") return false;
  if (data.refreshToken && typeof data.refreshToken !== "string") return false;
  return true;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeParseJSON = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// ─── Storage writers ──────────────────────────────────────────────────────────
export const setAuthData = (data) => {
  if (!validateAuthData(data)) {
    console.error("Invalid auth data structure", data);
    return false;
  }

  if (data.token) localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
  if (data.refreshToken)
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refreshToken);
  if (data.user)
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
  localStorage.setItem(AUTH_KEYS.LAST_LOGIN, new Date().toISOString());
  return true;
};

export const clearAuthData = () => {
  Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
};

// ─── Storage readers ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem(AUTH_KEYS.TOKEN);

export const getRefreshToken = () =>
  localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // Non-JWT token — trust its presence
  return payload.exp * 1000 > Date.now();
};

export const getStoredUser = () =>
  safeParseJSON(localStorage.getItem(AUTH_KEYS.USER));

export const getUserRole = () => getStoredUser()?.role ?? null;

export const getUserName = () => {
  const user = getStoredUser();
  return user?.name || user?.username || "";
};

export const getLastLogin = () => {
  const raw = localStorage.getItem(AUTH_KEYS.LAST_LOGIN);
  return raw ? new Date(raw) : null;
};
