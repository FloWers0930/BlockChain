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
} from "../api/auth.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const clearAuth = useCallback(() => {
    apiLogout(); // clears token from localStorage
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Initialize authentication on app startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        const userData = await apiGetMe();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.warn(
          "Auth check failed on startup:",
          err?.response?.data?.message || err.message,
        );
        clearAuth();
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, [clearAuth]);

  const login = useCallback(async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    if (data?.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiGetMe();
      if (userData) setUser(userData);
    } catch (err) {
      console.warn("Failed to refresh user data:", err.message);
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
      role: user?.role || null,
      mustChangePassword: user?.mustChangePassword || false,
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

  // Global loading screen while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Verifying access...
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
