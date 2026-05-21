// src/app/router/guards/RequireAuth.jsx
import { useAuth } from "@providers/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

export default function Authenticate({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Still running the initial JWT check — don't redirect yet
  if (loading) return null;

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but role not permitted
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}



