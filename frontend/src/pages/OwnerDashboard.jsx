// src/pages/OwnerDashboard.jsx
import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";

import DashboardView from "../components/dashboard/owner/DashboardView";
import AnalyticsView from "../components/dashboard/owner/AnalyticsView";
import LocationsView from "../components/dashboard/owner/LocationsView";
import RevenueView from "../components/dashboard/owner/RevenueView";
import StaffView from "../components/dashboard/owner/StaffView";
import SettingsView from "../components/dashboard/owner/SettingsView";
import AuditTrailView from "../components/dashboard/AuditTrailView";

// Crossroad Owner-specific navigation
const ownerMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: "fa-th-large" },
  { id: "analytics", label: "Analytics", icon: "fa-chart-line" },
  { id: "locations", label: "Crossroad Facilities", icon: "fa-building" },
  { id: "revenue", label: "Revenue", icon: "fa-dollar-sign" },
  { id: "staff", label: "Staff", icon: "fa-user-tie" },
  { id: "audit", label: "Audit Trail", icon: "fa-shield-alt" },
  { id: "settings", label: "Settings", icon: "fa-cog" },
];

export default function OwnerDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const currentMenuItems = ownerMenuItems.map((item) => ({
    ...item,
    active: item.id === activeView,
    onClick: () => setActiveView(item.id),
  }));

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "analytics":
        return <AnalyticsView />;
      case "locations":
        return <LocationsView />;
      case "revenue":
        return <RevenueView />;
      case "staff":
        return <StaffView />;
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
      title="Crossroad Owner Portal"
      logoIcon="fa-crown"
      role="owner"
    >
      {renderView()}
    </DashboardLayout>
  );
}
