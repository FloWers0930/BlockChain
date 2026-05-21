// src/app/router/index.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import ErrorBoundary from "../../shared/components/ErrorBoundary";
import RequireAuth from "./guards/RequireAuth";
import ConsentBanner from "../../features/marketing/components/ConsentBanner";
import NotFound from "../../pages/NotFound";

// Public pages
import LandingPage from "../../features/marketing/pages/LandingPage";
import Login from "../../features/auth/pages/Login";
import Unauthorized from "../../pages/Unauthorized";
import Privacy from "../../features/marketing/pages/Privacy";
import Terms from "../../features/marketing/pages/Terms";
import About from "../../features/marketing/pages/About";
import HowItWorks from "../../features/marketing/pages/HowItWorks";
import Contact from "../../features/marketing/pages/Contact";

// Lazy loaded pages
const Blog = lazy(() => import("../../features/marketing/pages/Blog"));
const Careers = lazy(() => import("../../features/marketing/pages/Careers"));
const CookiePolicy = lazy(() => import("../../features/marketing/pages/CookiePolicy"));
const CustomerSupport = lazy(() => import("../../features/marketing/pages/CustomerSupport"));
const Download = lazy(() => import("../../features/marketing/pages/Download"));
const Help = lazy(() => import("../../features/marketing/pages/Help"));
const Press = lazy(() => import("../../features/marketing/pages/Press"));
const Sitemap = lazy(() => import("../../features/marketing/pages/Sitemap"));
const Social = lazy(() => import("../../features/marketing/pages/Social"));
const Stations = lazy(() => import("../../features/marketing/pages/Stations"));

const AdminDashboard = lazy(() => import("../../features/dashboard/admin/pages/AdminDashboard"));
const OwnerDashboard = lazy(() => import("../../features/dashboard/owner/pages/OwnerDashboard"));
const UserDashboard = lazy(() => import("../../features/dashboard/user/pages/UserDashboard"));
const ChangePassword = lazy(() => import("../../features/auth/pages/ChangePassword"));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Other public pages */}
        <Route
          path="/blog"
          element={
            <Suspense fallback={<Loading />}>
              <Blog />
            </Suspense>
          }
        />
        <Route
          path="/careers"
          element={
            <Suspense fallback={<Loading />}>
              <Careers />
            </Suspense>
          }
        />
        <Route
          path="/cookie-policy"
          element={
            <Suspense fallback={<Loading />}>
              <CookiePolicy />
            </Suspense>
          }
        />
        <Route
          path="/customer-support"
          element={
            <Suspense fallback={<Loading />}>
              <CustomerSupport />
            </Suspense>
          }
        />
        <Route
          path="/download"
          element={
            <Suspense fallback={<Loading />}>
              <Download />
            </Suspense>
          }
        />
        <Route
          path="/help"
          element={
            <Suspense fallback={<Loading />}>
              <Help />
            </Suspense>
          }
        />
        <Route
          path="/press"
          element={
            <Suspense fallback={<Loading />}>
              <Press />
            </Suspense>
          }
        />
        <Route
          path="/sitemap"
          element={
            <Suspense fallback={<Loading />}>
              <Sitemap />
            </Suspense>
          }
        />
        <Route
          path="/social"
          element={
            <Suspense fallback={<Loading />}>
              <Social />
            </Suspense>
          }
        />
        <Route
          path="/stations"
          element={
            <Suspense fallback={<Loading />}>
              <Stations />
            </Suspense>
          }
        />

        {/* Protected pages */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <Suspense fallback={<Loading />}>
                <AdminDashboard />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route
          path="/owner/*"
          element={
            <RequireAuth allowedRoles={["owner", "admin"]}>
              <Suspense fallback={<Loading />}>
                <OwnerDashboard />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard/*"
          element={
            <RequireAuth allowedRoles={["user", "staff", "owner", "admin"]}>
              <Suspense fallback={<Loading />}>
                <UserDashboard />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route
          path="/change-password"
          element={
            <RequireAuth allowedRoles={["admin", "owner", "staff"]}>
              <Suspense fallback={<Loading />}>
                <ChangePassword />
              </Suspense>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ConsentBanner />
    </Router>
    </ErrorBoundary>
  );
}

export default App;
