// src/api/auth.js
import api from "./axios.js";

const AUTH_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  LAST_LOGIN: "lastLogin",
};

const setAuthData = (data) => {
  if (data.token) localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
  if (data.refreshToken)
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refreshToken);

  if (data.user) {
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
  }

  localStorage.setItem(AUTH_KEYS.LAST_LOGIN, new Date().toISOString());
};

export const login = async (identifier, password) => {
  try {
    const { data } = await api.post("/auth/login", { identifier, password });
    setAuthData(data);
    return data;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  try {
    const { data } = await api.post("/auth/refresh", { refreshToken });
    setAuthData(data);
    return data;
  } catch (err) {
    console.warn("Token refresh failed:", err.message);
    logout();
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.warn("Logout notification failed:", error.message);
  } finally {
    // Clear all auth data
    Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
  }
};

export const getMe = async () => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user || data;
  } catch (error) {
    console.error("Failed to fetch user data:", error.message);
    return null;
  }
};

export const getToken = () => localStorage.getItem(AUTH_KEYS.TOKEN);

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getUserRole = () => {
  const userStr = localStorage.getItem(AUTH_KEYS.USER);
  return userStr ? JSON.parse(userStr).role : null;
};

export const getUserName = () => {
  const userStr = localStorage.getItem(AUTH_KEYS.USER);
  return userStr
    ? JSON.parse(userStr).name || JSON.parse(userStr).username
    : "";
};

export default {
  login,
  refreshToken,
  logout,
  getMe,
  getToken,
  isAuthenticated,
  getUserRole,
  getUserName,
};
