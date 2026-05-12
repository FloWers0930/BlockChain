// src/pages/AdminDashboard.jsx
import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";

import DashboardView from "../components/dashboard/admin/DashboardView";
import RevenueView from "../components/dashboard/admin/RevenueView";
import UsersView from "../components/dashboard/admin/UsersView";
import SupportView from "../components/dashboard/admin/SupportView";
import AuditTrailView from "../components/dashboard/AuditTrailView";
import SettingsView from "../components/dashboard/admin/SettingsView";

const adminMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: "fa-th-large" },
  { id: "revenue", label: "Revenue", icon: "fa-money-bill-wave" },
  { id: "users", label: "Users", icon: "fa-users" },
  { id: "support", label: "Support", icon: "fa-headset" },
  { id: "audit", label: "Audit Trail", icon: "fa-shield-alt" },
  { id: "settings", label: "Settings", icon: "fa-cog" },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const currentMenuItems = adminMenuItems.map((item) => ({
    ...item,
    active: item.id === activeView,
    onClick: () => setActiveView(item.id),
  }));

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "revenue":
        return <RevenueView />;
      case "users":
        return <UsersView />;
      case "support":
        return <SupportView />;
      case "audit":
        return <AuditTrailView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <DashboardLayout
      menuItems={currentMenuItems}
      title="Crossroad Admin Portal"
      logoIcon="fa-shield-alt" // ← Better admin icon
      role="admin"
    >
      {renderView()}
    </DashboardLayout>
  );
}
