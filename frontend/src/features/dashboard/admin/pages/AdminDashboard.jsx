// src/features/dashboard/admin/pages/AdminDashboard.jsx
import { useState, lazy, Suspense } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Headphones,
  ShieldCheck,
  Settings,
} from "lucide-react";
import DashboardLayout from "../../shared/components/DashboardLayout";
import DashboardSkeleton from "../../shared/components/DashboardSkeleton";

const DashboardView = lazy(
  () => import("../views/DashboardView"),
);
const RevenueView = lazy(
  () => import("../views/BookingView"),
);
const UsersView = lazy(() => import("../views/UsersView"));
const SupportView = lazy(
  () => import("../views/SupportView"),
);
const AuditTrailView = lazy(
  () => import("../../shared/components/AuditTrailView"),
);
const SettingsView = lazy(
  () => import("../views/SettingsView"),
);

const ADMIN_VIEWS = {
  dashboard: DashboardView,
  revenue: RevenueView,
  users: UsersView,
  support: SupportView,
  audit: AuditTrailView,
  settings: SettingsView,
};

const ADMIN_MENU = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "users", label: "Users", icon: Users },
  { id: "support", label: "Support", icon: Headphones },
  { id: "audit", label: "Audit Trail", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const ActiveView = ADMIN_VIEWS[activeView] ?? ADMIN_VIEWS.dashboard;

  const menuItems = ADMIN_MENU.map((item) => ({
    ...item,
    active: item.id === activeView,
    onClick: () => setActiveView(item.id),
  }));

  return (
    <DashboardLayout
      menuItems={menuItems}
      title="Crossroad Admin Portal"
      role="admin"
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <ActiveView />
      </Suspense>
    </DashboardLayout>
  );
}

