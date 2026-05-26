// src/app/providers/AuthProvider.jsx
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

import { isAuthenticated as isTokenValid } from "@api/token";

const AuthContext = createContext(null);

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/stations",
  "/blog",
  "/help",
  "/contact",
  "/about",
  "/how-it-works",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/press",
  "/sitemap",
  "/social",
  "/download",
  "/unauthorized",
  "/support",
  "/customer-support",
  "/careers",
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const clearAuth = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Logout API call failed:", err?.message || err);
      }
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isTokenValid()) {
          const hadToken = !!localStorage.getItem("token");
          const currentPath = window.location.pathname;
          const isPublicRoute =
            PUBLIC_ROUTES.includes(currentPath) ||
            currentPath.startsWith("/blog/") ||
            currentPath.startsWith("/stations/");

          if (hadToken && !isPublicRoute && import.meta.env.DEV) {
            console.warn(
              "Token expired or invalid on protected route — clearing auth state",
            );
          }
          return;
        }

        const userData = await apiGetMe();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await clearAuth();
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn(
            "Auth check failed on startup:",
            err?.response?.data?.message || err?.message || err,
          );
        }
        await clearAuth();
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    if (data?.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiGetMe();
      if (userData) setUser(userData);
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
