// src/api/authApi.js
import api from "./axios.js";
import {
  setAuthData,
  clearAuthData,
  isAuthenticated,
  getUserRole,
  getUserName,
} from "./token.js";

// ─── Custom Error Class for Auth Errors ─────────────────────────────────────
export class AuthError extends Error {
  constructor(message, statusCode, originalError) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

// ─── Helper: Format API errors consistently ─────────────────────────────────
const formatAuthError = (error, context = "Auth operation failed") => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    context;
  const statusCode = error?.response?.status || 500;

  if (import.meta.env.DEV) {
    console.error(`[Auth API] ${context}:`, {
      message,
      statusCode,
      path: error?.config?.url,
      method: error?.config?.method,
      timestamp: new Date().toISOString(),
    });
  }

  return new AuthError(message, statusCode, error);
};

// ─── Auth API Functions ─────────────────────────────────────────────────────
export const login = async (identifier, password) => {
  try {
    if (import.meta.env.DEV) {
      console.log(`[Auth API] Login attempt for: ${identifier}`);
    }

    const { data } = await api.post(
      "/auth/login",
      { identifier, password },
      {
        timeout: 15000,
      },
    );

    setAuthData(data);

    if (import.meta.env.DEV) {
      console.log(`[Auth API] Login successful for: ${identifier}`, {
        role: data?.user?.role,
        hasToken: !!data?.token,
      });
    }

    return data;
  } catch (error) {
    throw formatAuthError(error, "Login failed");
  }
};

export const logout = async () => {
  try {
    if (import.meta.env.DEV) {
      console.log(
        `[Auth API] Logout initiated for user: ${getUserName() || "unknown"}`,
      );
    }

    await api.post(
      "/auth/logout",
      {},
      {
        timeout: 5000,
        validateStatus: (status) => status < 500,
      },
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        `[Auth API] Backend logout notification failed:`,
        error?.message,
      );
    }
  } finally {
    clearAuthData();
    if (import.meta.env.DEV) {
      console.log(`[Auth API] Local auth state cleared`);
    }
  }
};

export const getMe = async () => {
  try {
    if (!isAuthenticated()) {
      if (import.meta.env.DEV) {
        console.log(`[Auth API] getMe skipped: no valid token`);
      }
      return null;
    }

    const { data } = await api.get("/auth/me", {
      timeout: 10000,
    });

    const userData = data?.user || data;

    if (import.meta.env.DEV && userData) {
      console.log(`[Auth API] User data fetched:`, {
        id: userData?.id,
        role: userData?.role,
        email: userData?.email,
      });
    }

    return userData;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      if (import.meta.env.DEV) {
        console.log(
          `[Auth API] getMe failed with ${error.response.status}: token likely expired`,
        );
      }
      clearAuthData();
      return null;
    }

    if (import.meta.env.DEV) {
      console.warn(`[Auth API] getMe failed:`, error?.message);
    }
    return null;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    if (import.meta.env.DEV) {
      console.log(
        `[Auth API] Password change requested for: ${
          getUserName() || "unknown"
        }`,
      );
    }

    const { data } = await api.post(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      },
      {
        timeout: 15000,
      },
    );

    if (data?.token) {
      setAuthData(data);
      if (import.meta.env.DEV) {
        console.log(`[Auth API] Password changed, tokens refreshed`);
      }
    }

    return data;
  } catch (error) {
    throw formatAuthError(error, "Password change failed");
  }
};

// ─── Utility: Check if user has required role ───────────────────────────────
export const hasRole = (allowedRoles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(userRole);
};

