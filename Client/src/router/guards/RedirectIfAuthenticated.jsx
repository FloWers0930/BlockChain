import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

export default function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user, authChecked, role } = useAuth();
  const location = useLocation();

  // ✅ FIX: Show a spinner instead of null while auth is being checked.
  // Returning null caused the login page to briefly render before the
  // refresh call completed — in a new tab the token is wiped from memory
  // so AuthProvider needs a moment to restore the session via the cookie.
  // Without this, the user sees the login page flash even though they're
  // already authenticated.
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600 w-12 h-12" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const defaultRedirect =
      role === "admin"
        ? "/admin/dashboard"
        : role === "owner"
        ? "/owner/dashboard"
        : "/user/dashboard";

    const redirectTo = location.state?.from?.pathname || defaultRedirect;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

