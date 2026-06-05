// src/router/guards/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, authChecked, mustChangePassword } = useAuth();
  const location = useLocation();

  // ⏳ Wait for AuthProvider to finish session validation
  // ✅ Return a stable loading UI to keep React Router tree intact
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600 w-12 h-12" />
      </div>
    );
  }

  // 🚪 Not authenticated → redirect to login & save return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 🔑 Force password change before accessing protected routes
  if (mustChangePassword && location.pathname !== "/change-password") {
    return (
      <Navigate
        to="/change-password"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 🛡️ Role mismatch → unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ All checks passed → render protected content
  return children;
}

