import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  login as apiLogin,
  logout as apiLogout,
  getMe as apiGetMe,
} from "@api/authApi";

import { setAuthData, clearAuthData, getToken } from "@api/token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Sync React State with Axios Soft Logout ────────────────────────────────
  // When axios detects a fatal session failure, it clears memory and dispatches this event.
  // This ensures React state updates immediately, triggering RequireAuth to redirect.
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  // ✅ FIX: clearAuth now accepts a { fromLogout } flag.
  // When fromLogout is false (default), we skip calling apiLogout() so we don't
  // accidentally send a logout request to the backend during initAuth failures.
  // Calling apiLogout() on a startup failure would clear the HTTP-only refresh
  // cookie, permanently destroying a perfectly valid session on every page reload.
  const clearAuth = useCallback(async ({ fromLogout = false } = {}) => {
    if (fromLogout) {
      try {
        await apiLogout();
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("Logout API call failed:", err?.message || err);
        }
      }
    }
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check if we have a token in memory (fresh login or existing tab)
        if (!getToken()) {
          // 2. If memory is empty (page refresh), try to restore session via HTTP-only cookie
          const { default: axios } = await import("axios");
          const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          if (data?.token) {
            setAuthData({ token: data.token });
          } else {
            throw new Error("Invalid refresh response");
          }
        }

        // 3. Fetch user profile with the valid token
        // ✅ This now works correctly because isAuthenticated() in token.js only
        // checks for !!_accessToken, not !!_user (which is still null at this point).
        const userData = await apiGetMe();

        if (userData) {
          setAuthData({ user: userData });
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // User data invalid — local clear only, do NOT call apiLogout()
          await clearAuth();
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn(
            "Auth check failed on startup:",
            err?.response?.data?.message || err?.message || err,
          );
        }
        // ✅ FIX: No { fromLogout: true } here — startup failures must not call
        // apiLogout() because that would clear the HTTP-only refresh cookie,
        // destroying a valid session on every hard reload.
        await clearAuth();
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, [clearAuth]);

  const login = useCallback(async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    if (data?.token && data?.user) {
      setAuthData({ token: data.token, user: data.user });
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  // ✅ FIX: Only logout() passes { fromLogout: true } — this is the only place
  // where we intentionally call apiLogout() and clear the refresh cookie.
  const logout = useCallback(async () => {
    await clearAuth({ fromLogout: true });
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiGetMe();
      if (userData) {
        setAuthData({ user: userData });
        setUser(userData);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Failed to refresh user data:", err?.message || err);
      }
    }
  }, []);

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!user?.role) return false;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      authChecked,
      role: user?.role ?? null,
      mustChangePassword: user?.mustChangePassword ?? false,
      login,
      logout,
      refreshUser,
      hasRole,
    }),
    [
      user,
      isAuthenticated,
      loading,
      authChecked,
      login,
      logout,
      refreshUser,
      hasRole,
    ],
  );

  if (!authChecked) {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50/30 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-indigo-500/25">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Statio Nexus"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="h-12 w-12 animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-medium text-slate-500">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

