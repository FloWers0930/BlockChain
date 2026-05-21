// src/features/auth/api/authApi.js
import api from "../api/axios.js";
// Corrected path to token.js
import {
  setAuthData,
  clearAuthData,
  getStoredUser,
} from "./token.js";

// Re-export token helpers so consumers can still import from one place
// Corrected path here too
export {
  getToken,
  getRefreshToken,
  isAuthenticated,
  getStoredUser,
  getUserRole,
  getUserName,
  getLastLogin,
} from "./token.js";

// ─── Auth API ─────────────────────────────────────────────────────────────────

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

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.warn("Logout notification failed:", error.message);
  } finally {
    clearAuthData();
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

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const { data } = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    if (data.token) setAuthData(data);
    return data;
  } catch (error) {
    console.error(
      "Password change failed:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export default {
  login,
  logout,
  getMe,
  changePassword,
};
