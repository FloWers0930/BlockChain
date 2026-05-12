import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import ConsentBanner from "./components/ConsentBanner";
import NotFound from "./pages/NotFound";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";

// Lazy load heavy dashboard pages (better performance)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    Loading Admin Dashboard...
                  </div>
                }
              >
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/*"
          element={
            <ProtectedRoute allowedRoles={["owner", "admin"]}>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    Loading Owner Dashboard...
                  </div>
                }
              >
                <OwnerDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Change Password Route */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={["admin", "owner", "staff"]}>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    Loading...
                  </div>
                }
              >
                <ChangePassword />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Cookie Consent Banner */}
      <ConsentBanner />
    </Router>
  );
}

export default App;
