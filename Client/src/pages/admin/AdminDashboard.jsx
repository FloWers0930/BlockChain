// src/pages/admin/AdminDashboard.jsx
import { useState, lazy, Suspense, useEffect } from "react";

import DashboardLayout from "@components/layout/DashboardLayout";
import DashboardSkeleton from "@components/ui/DashboardSkeleton";

// TODO: Import your actual backend API services here
// import { verifyAdminSession, fetchDashboardStats } from "@/services/api";

const DashboardView = lazy(() => import("./DashboardView"));
const BookingView = lazy(() => import("./BookingView"));
const UsersView = lazy(() => import("./UsersView"));
const SupportView = lazy(() => import("./SupportView"));
const AuditTrailView = lazy(() => import("@components/modals/AuditTrailView"));

const ADMIN_VIEWS = {
  dashboard: DashboardView,
  booking: BookingView,
  users: UsersView,
  support: SupportView,
  audit: AuditTrailView,
};

// ─── Inline SVG Icon Components ─────────────────────────────────────────────
const IconDashboard = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const IconTrendingUp = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const IconUsers = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const IconSupport = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const IconAudit = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

// ─── Menu Configuration ─────────────────────────────────────────────────────
const ADMIN_MENU = [
  { id: "dashboard", label: "Dashboard", icon: IconDashboard },
  { id: "booking", label: "Booking", icon: IconTrendingUp },
  { id: "users", label: "Users", icon: IconUsers },
  { id: "support", label: "Support", icon: IconSupport },
  { id: "audit", label: "Audit Trail", icon: IconAudit },
  // ✅ REMOVED: settings menu item
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const ActiveView = ADMIN_VIEWS[activeView] ?? ADMIN_VIEWS.dashboard;

  // ─── Backend Connection: Authentication & Session Check ───────────────────
  useEffect(() => {
    const initAdminSession = async () => {
      try {
        // TODO: Replace with your actual backend API call
        // const response = await verifyAdminSession();
        // if (!response.authenticated) {
        //   window.location.href = "/login"; // Redirect if not authorized
        //   return;
        // }

        // Simulating backend connection delay for demo purposes
        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsAdminAuthenticated(true);
      } catch (error) {
        console.error("Admin session verification failed:", error);
        // Handle error state or redirect
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAdminSession();
  }, []);

  const menuItems = ADMIN_MENU.map((item) => ({
    ...item,
    active: item.id.toLowerCase() === activeView.toLowerCase(),
    onClick: () => setActiveView(item.id),
  }));

  // Show skeleton while verifying admin session
  if (isAuthLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAdminAuthenticated) {
    return null; // Or redirect to login
  }

  return (
    <DashboardLayout menuItems={menuItems} title="Admin Portal" role="admin">
      <Suspense fallback={<DashboardSkeleton />}>
        <ActiveView />
      </Suspense>
    </DashboardLayout>
  );
}

