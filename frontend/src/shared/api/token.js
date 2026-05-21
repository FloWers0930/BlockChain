// src/api/token.js
// ─── Pure storage helpers — NO axios import ───────────────────────────────────

const AUTH_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  LAST_LOGIN: "lastLogin",
};

// ─── Validation schema ────────────────────────────────────────────────────────
// Simple validation without external libraries
const validateAuthData = (data) => {
  if (!data || typeof data !== "object") return false;
  if (!data.user || typeof data.user !== "object") return false;
  if (!data.user.id || !data.user.email || !data.user.role) return false;
  if (data.token && typeof data.token !== "string") return false;
  if (data.refreshToken && typeof data.refreshToken !== "string") return false;
  return true;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely parse JSON from localStorage without throwing. */
const safeParseJSON = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/** Decode a JWT payload without a library. Returns null on failure. */
const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// ─── Storage writers ──────────────────────────────────────────────────────────

/** Persist all auth data returned by the server after validation. */
export const setAuthData = (data) => {
  // Validate incoming data
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

/** Remove every auth key from localStorage. */
export const clearAuthData = () => {
  Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
};

// ─── Storage readers ──────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem(AUTH_KEYS.TOKEN);

export const getRefreshToken = () =>
  localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);

/**
 * Returns true only if a token exists AND has not expired.
 * Falls back to presence-only check if the token is not a JWT.
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // Non-JWT token — trust its presence

  // exp is in seconds; Date.now() is in milliseconds
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
   