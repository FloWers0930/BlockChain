// src/app/router/guards/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading, role } = useAuth();
  const location = useLocation();

  // ── Still running the initial JWT check — show branded loading ──────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50/30">
        {/* Ambient glow effects matching your design system */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative flex flex-col items-center gap-4">
          {/* Brand logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Statio Nexus"
              className="w-7 h-7 object-contain"
            />
          </div>

          {/* Premium spinner */}
          <div className="h-10 w-10 animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-medium text-slate-500">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  // ── Not authenticated — redirect to login with return path ───────────────
  if (!isAuthenticated || !user) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Auth Guard] Redirecting to /login (from: ${location.pathname})`,
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Authenticated but role not permitted — redirect to unauthorized ──────
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Auth Guard] Access denied: user role "${user.role}" not in [${allowedRoles.join(", ")}]`,
      );
    }
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location, attemptedRole: user.role }}
        replace
      />
    );
  }

  // ── All checks passed — render protected content ─────────────────────────
  return children;
}
