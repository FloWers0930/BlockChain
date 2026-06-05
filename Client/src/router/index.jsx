import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import RequireAuth from "./guards/RequireAuth";

import ErrorBoundary from "../components/ui/ErrorBoundary";

// ── Lazy-loaded pages (code-split per route) ──────────────────────────────────
const LandingPage = lazy(() => import("../pages/marketing/LandingPage"));
const Stations = lazy(() => import("../pages/marketing/Stations"));
const Blog = lazy(() => import("../pages/marketing/Blog"));
const Help = lazy(() => import("../pages/marketing/Help"));
const Contact = lazy(() => import("../pages/marketing/Contact"));
const HowItWorks = lazy(() => import("../pages/marketing/HowItWorks"));
const Privacy = lazy(() => import("../pages/marketing/Privacy"));
const Terms = lazy(() => import("../pages/marketing/Terms"));
const CookiePolicy = lazy(() => import("../pages/marketing/CookiePolicyPage"));
const Press = lazy(() => import("../pages/marketing/Press"));
const Sitemap = lazy(() => import("../pages/marketing/Sitemap"));
const Social = lazy(() => import("../pages/marketing/Social"));
const Download = lazy(() => import("../pages/marketing/Download"));
const Careers = lazy(() => import("../pages/marketing/Careers"));
const CustomerSupport = lazy(() =>
  import("../pages/marketing/CustomerSupport"),
);

const Login = lazy(() => import("../pages/auth/Login"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminDashboardView = lazy(() => import("../pages/admin/DashboardView"));
const AdminUsersView = lazy(() => import("../pages/admin/UsersView"));
const AdminBookingView = lazy(() => import("../pages/admin/BookingView"));
const AdminSupportView = lazy(() => import("../pages/admin/SupportView"));

const OwnerDashboard = lazy(() => import("../pages/owner/OwnerDashboard"));
const OwnerDashboardView = lazy(() => import("../pages/owner/DashboardView"));
const OwnerLocationsView = lazy(() => import("../pages/owner/LocationsView"));
const OwnerAnalyticsView = lazy(() => import("../pages/owner/AnalyticsView"));
const OwnerRevenueView = lazy(() => import("../pages/owner/RevenueView"));
const OwnerStaffView = lazy(() => import("../pages/owner/StaffView"));

const UserDashboard = lazy(() => import("../pages/User/Dashboard"));
const UserCreateTransaction = lazy(() =>
  import("../pages/User/CreateTransaction"),
);
const UserMyTransactions = lazy(() => import("../pages/User/MyTransactions"));
const UserVerifyTransactions = lazy(() =>
  import("../pages/User/VerifyTransactions"),
);

const NotFound = lazy(() => import("../pages/NotFound"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));

// ── Suspense fallback matching your design system ─────────────────────────────
const RouteFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50/30">
    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none" />
    <div
      className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none"
      style={{ animationDelay: "1s" }}
    />
    <div className="relative flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
        <img
          src="/assets/star-removebg-preview.jpg"
          alt="Statio Nexus"
          className="w-7 h-7 object-contain"
        />
      </div>
      <div className="h-10 w-10 animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600" />
      <p className="text-sm font-medium text-slate-500">Loading route…</p>
    </div>
  </div>
);

// ── Protected layout wrapper — auth guard only, no layout wrapper.
// Each dashboard (Admin, Owner, User) manages its own DashboardLayout,
// so wrapping here was redundant and caused DashboardLayout to render
// without menuItems on routes like /change-password, crashing with
// "Cannot read properties of undefined (reading 'map')".
const ProtectedLayout = () => (
  <RequireAuth>
    <Outlet />
  </RequireAuth>
);

// ── Router configuration ──────────────────────────────────────────────────────
const router = createBrowserRouter(
  [
    {
      element: (
        <ErrorBoundary>
          <ScrollRestoration />
          <Outlet />
        </ErrorBoundary>
      ),
      children: [
        // ── Public marketing routes ───────────────────────────────────────────
        { path: "/", element: <LandingPage /> },
        { path: "/stations", element: <Stations /> },
        { path: "/blog", element: <Blog /> },
        { path: "/help", element: <Help /> },
        { path: "/contact", element: <Contact /> },
        { path: "/how-it-works", element: <HowItWorks /> },
        { path: "/privacy", element: <Privacy /> },
        { path: "/terms", element: <Terms /> },
        { path: "/cookie-policy", element: <CookiePolicy /> },
        { path: "/press", element: <Press /> },
        { path: "/sitemap", element: <Sitemap /> },
        { path: "/social", element: <Social /> },
        { path: "/download", element: <Download /> },
        { path: "/careers", element: <Careers /> },
        { path: "/customer-support", element: <CustomerSupport /> },

        // ── Auth routes (redirect if already logged in) ───────────────────────
        { path: "/login", element: <Login /> },

        // ── Protected routes (auth guard only — each dashboard owns its layout)
        {
          element: <ProtectedLayout />,
          children: [
            // Password change (accessible to all authenticated roles)
            { path: "/change-password", element: <ChangePassword /> },

            // Admin routes
            {
              path: "/admin",
              element: (
                <RequireAuth allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RequireAuth>
              ),
              children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <AdminDashboardView /> },
                { path: "users", element: <AdminUsersView /> },
                { path: "bookings", element: <AdminBookingView /> },
                { path: "support", element: <AdminSupportView /> },
              ],
            },

            // Owner routes
            {
              path: "/owner",
              element: (
                <RequireAuth allowedRoles={["owner"]}>
                  <OwnerDashboard />
                </RequireAuth>
              ),
              children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <OwnerDashboardView /> },
                { path: "locations", element: <OwnerLocationsView /> },
                { path: "analytics", element: <OwnerAnalyticsView /> },
                { path: "revenue", element: <OwnerRevenueView /> },
                { path: "staff", element: <OwnerStaffView /> },
              ],
            },

            // User routes
            {
              path: "/user",
              element: (
                <RequireAuth allowedRoles={["user"]}>
                  <UserDashboard />
                </RequireAuth>
              ),
              children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <UserDashboard /> },
                {
                  path: "transactions/create",
                  element: <UserCreateTransaction />,
                },
                { path: "transactions", element: <UserMyTransactions /> },
                {
                  path: "transactions/verify",
                  element: <UserVerifyTransactions />,
                },
              ],
            },
          ],
        },

        // ── Fallback routes ───────────────────────────────────────────────────
        { path: "/unauthorized", element: <Unauthorized /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    // 🔑 Recover from chunk load failures (common after deployments)
    async lazy(route) {
      try {
        return await route.lazy();
      } catch (err) {
        if (
          err.name === "ChunkLoadError" ||
          err.message?.includes("Loading chunk")
        ) {
          window.location.reload();
          return { element: <RouteFallback /> };
        }
        throw err;
      }
    },
  },
);

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

