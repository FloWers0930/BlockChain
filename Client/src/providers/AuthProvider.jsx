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
  isAuthenticated as isTokenValid, // ← checks JWT expiry, not just presence
} from "../../features/auth/api/authApi.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Wipe local auth state + call server logout ──────────────────────────
  const clearAuth = useCallback(async () => {
    try {
      await apiLogout(); // notifies server + clears localStorage
    } catch {
      // server call failing shouldn't block the local wipe
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // ── Initialise on mount: verify token is valid before hitting /me ────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // isTokenValid() decodes the JWT and checks exp — skips the network
        // call entirely if the token is already expired or missing
        if (!isTokenValid()) {
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
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Auth check failed on startup:",
            err?.response?.data?.message || err.message,
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
  // clearAuth is stable (useCallback with no deps) — safe to omit from array
  // to prevent double-firing in React StrictMode

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    if (data?.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await clearAuth();
  }, [clearAuth]);

  // ── Refresh user data from server (e.g. after profile update) ────────────
  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiGetMe();
      if (userData) setUser(userData);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to refresh user data:", err.message);
      }
    }
  }, []);

  // ── Role helper ──────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (allowedRoles) => {
      if (!user?.role) return false;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      return roles.includes(user.role);
    },
    [user],
  );

  // ── Context value (memoised to prevent unnecessary re-renders) ───────────
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

  // ── Branded loading screen while the initial auth check runs ─────────────
  if (!authChecked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600" />
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

