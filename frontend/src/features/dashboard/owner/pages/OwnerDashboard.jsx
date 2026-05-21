// src/features/dashboard/owner/pages/OwnerDashboard.jsx
import { useState, lazy, Suspense } from "react";
import {
  LayoutDashboard,
  BarChart2,
  Building2,
  DollarSign,
  UserCog,
  ShieldCheck,
  Settings,
} from "lucide-react";

import DashboardLayout from "../../shared/components/DashboardLayout";
import DashboardSkeleton from "../../shared/components/DashboardSkeleton";

// Lazy loaded views
const OwnerDashboardView = lazy(
  () => import("../views/DashboardView"),
);
const AnalyticsView = lazy(
  () => import("../views/AnalyticsView"),
);
const LocationsView = lazy(
  () => import("../views/LocationsView"),
);
const OwnerRevenueView = lazy(
  () => import("../views/RevenueView"),
);
const StaffView = lazy(() => import("../views/StaffView"));
const OwnerSettingsView = lazy(
  () => import("../views/SettingsView"),
);
const OwnerAuditView = lazy(
  () => import("../../shared/components/AuditTrailView"),
); // ← Fixed

const OWNER_VIEWS = {
  dashboard: OwnerDashboardView,
  analytics: AnalyticsView,
  locations: LocationsView,
  revenue: OwnerRevenueView,
  staff: StaffView,
  audit: OwnerAuditView,
  settings: OwnerSettingsView,
};

const OWNER_MENU = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "locations", label: "Facilities", icon: Building2 },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "staff", label: "Staff", icon: UserCog },
  { id: "audit", label: "Audit Trail", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function OwnerDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const ActiveView = OWNER_VIEWS[activeView] ?? OWNER_VIEWS.dashboard;

  const menuItems = OWNER_MENU.map((item) => ({
    ...item,
    active: item.id === activeView,
    onClick: () => setActiveView(item.id),
  }));

  return (
    <DashboardLayout
      menuItems={menuItems}
      title="Statio Nexus Owner Portal"
      logoIcon="fa-crown"
      role="owner"
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <ActiveView />
      </Suspense>
    </DashboardLayout>
  );
}

