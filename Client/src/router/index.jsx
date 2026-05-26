import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";

import ErrorBoundary from "../components/ui/ErrorBoundary";
import RequireAuth from "./guards/RequireAuth";
import CookieBanner from "../components/ui/ConsentBanner";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";
import Login from "../pages/auth/Login";
import LandingPage from "../pages/marketing/LandingPage";
import Privacy from "../pages/marketing/Privacy";
import Terms from "../pages/marketing/Terms";
import HowItWorks from "../pages/marketing/HowItWorks";
import Contact from "../pages/marketing/Contact";
import CookiePolicy from "../pages/marketing/CookiePolicyPage";

const Blog = lazy(() => import("../pages/marketing/Blog"));
const Careers = lazy(() => import("../pages/marketing/Careers"));
const CustomerSupport = lazy(
  () => import("../pages/marketing/CustomerSupport"),
);
const Download = lazy(() => import("../pages/marketing/Download"));
const Help = lazy(() => import("../pages/marketing/Help"));
const Press = lazy(() => import("../pages/marketing/Press"));
const Sitemap = lazy(() => import("../pages/marketing/Sitemap"));
const Social = lazy(() => import("../pages/marketing/Social"));
const Stations = lazy(() => import("../pages/marketing/Stations"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const OwnerDashboard = lazy(() => import("../pages/owner/OwnerDashboard"));

const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));

// ── Fix 3: single Suspense wrapper instead of repeating it on every route ──
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function LazyRoute({ component: Component }) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}

function AppRouter() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* ── Eager Public Routes ─────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Lazy Public Routes ──────────────────────────────────── */}
          <Route path="/blog" element={<LazyRoute component={Blog} />} />
          <Route path="/careers" element={<LazyRoute component={Careers} />} />
          <Route
            path="/download"
            element={<LazyRoute component={Download} />}
          />
          <Route path="/help" element={<LazyRoute component={Help} />} />
          <Route path="/press" element={<LazyRoute component={Press} />} />
          <Route path="/sitemap" element={<LazyRoute component={Sitemap} />} />
          <Route path="/social" element={<LazyRoute component={Social} />} />
          <Route
            path="/stations"
            element={<LazyRoute component={Stations} />}
          />
          <Route
            path="/support"
            element={<LazyRoute component={CustomerSupport} />}
          />

          {/* Fix 1: redirect alias to canonical URL instead of rendering twice */}
          <Route
            path="/customer-support"
            element={<Navigate to="/support" replace />}
          />

          {/* ── Protected Routes ────────────────────────────────────── */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <LazyRoute component={AdminDashboard} />
              </RequireAuth>
            }
          />
          <Route
            path="/owner/*"
            element={
              <RequireAuth allowedRoles={["owner", "admin"]}>
                <LazyRoute component={OwnerDashboard} />
              </RequireAuth>
            }
          />
          {/* Fix 2: "user" added — regular users can change their own password */}
          <Route
            path="/change-password"
            element={
              <RequireAuth allowedRoles={["user", "staff", "owner", "admin"]}>
                <LazyRoute component={ChangePassword} />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <CookieBanner />
      </Router>
    </ErrorBoundary>
  );
}

export default AppRouter;
