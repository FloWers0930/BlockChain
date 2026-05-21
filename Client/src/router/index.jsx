// src/app/router/index.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import ErrorBoundary from "../components/ui/ErrorBoundary";
import RequireAuth from "./guards/RequireAuth";
import ConsentBanner from "../components/ui/ConsentBanner";
import NotFound from "../pages/NotFound";

// Public pages
import LandingPage from "../features/marketing/pages/LandingPage";
import Login from "../pages/auth/Login";
import Unauthorized from "../pages/Unauthorized";
import Privacy from "../pages/marketing/Privacy";
import Terms from "../pages/marketing/Terms";
import About from "../pages/marketing/About";
import HowItWorks from "../pages/marketing/HowItWorks";
import Contact from "../pages/marketing/Contact";

// Lazy loaded pages
const Blog = lazy(() => import("../pages/marketing/Blog"));
const Careers = lazy(() => import("../pages/marketing/Careers"));
const CookiePolicy = lazy(() => import("../pages/marketing/CookiePolicy"));
const CustomerSupport = lazy(() => import("../pages/marketing/CustomerSupport"));
const Download = lazy(() => import("../pages/marketing/Download"));
const Help = lazy(() => import("../pages/marketing/Help"));
const Press = lazy(() => import("../pages/marketing/Press"));
const Sitemap = lazy(() => import("../pages/marketing/Sitemap"));
const Social = lazy(() => import("../pages/marketing/Social"));
const Stations = lazy(() => import("../pages/marketing/Stations"));

const AdminDashboard = lazy(() => import("../features/dashboard/admin/pages/AdminDashboard"));
const OwnerDashboard = lazy(() => import("../pages/owner/pages/OwnerDashboard"));
const UserDashboard = lazy(() => import("../features/dashboard/user/UserDashboard"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));

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
