// src/components/dashboard/admin/SettingsView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../../../shared/api/axios";
import { useSocket } from "../../../../app/providers/SocketProvider";

export default function SettingsView() {
  const { socket } = useSocket();

  const [generalSettings, setGeneralSettings] = useState({
    appName: "Statio Nexus",
    supportEmail: "support@stationexus.com",
    currency: "PHP (₱)",
  });

  const [parkingSettings, setParkingSettings] = useState({
    autoCancel: true,
    waitlist: true,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/settings");

      if (data.success && data.settings) {
        setGeneralSettings({
          appName: data.settings.appName || "Statio Nexus",
          supportEmail: data.settings.supportEmail || "support@stationexus.com",
          currency: data.settings.currency || "PHP (₱)",
        });

        setParkingSettings({
          autoCancel: data.settings.autoCancel ?? true,
          waitlist: data.settings.waitlist ?? true,
          maintenanceMode: data.settings.maintenanceMode ?? false,
        });

        setLastUpdated(new Date());
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load settings:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates via shared SocketContext
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchSettings();

    socket.on("settingsUpdated", handleUpdate);
    socket.on("auditLogUpdated", (audit) => {
      if (audit.action === "settings_updated") handleUpdate();
    });

    fetchSettings(); // Initial load

    return () => {
      socket.off("settingsUpdated", handleUpdate);
      socket.off("auditLogUpdated", handleUpdate);
    };
  }, [socket, fetchSettings]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSetting = (key) => {
    setParkingSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        appName: generalSettings.appName,
        supportEmail: generalSettings.supportEmail,
        currency: generalSettings.currency,
        autoCancel: parkingSettings.autoCancel,
        waitlist: parkingSettings.waitlist,
        maintenanceMode: parkingSettings.maintenanceMode,
      };

      const { data } = await api.put("/admin/settings", payload);

      if (data.success) {
        setMessage({
          type: "success",
          text: "✅ Settings saved successfully!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
        fetchSettings();
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
      setMessage({ type: "error", text: "❌ Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-2xl text-center text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">System Settings</h2>
        <p className="text-gray-500">
          Configure application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
              General Settings
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Name
                </label>
                <input
                  type="text"
                  name="appName"
                  value={generalSettings.appName}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  value={generalSettings.supportEmail}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <select
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 outline-none"
                >
                  <option>PHP (₱)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parking Settings */}
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
              Parking Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    Auto-cancel unpaid reservations
                  </p>
                  <p className="text-sm text-gray-500">
                    Automatically cancel bookings if payment not received within
                    15 minutes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parkingSettings.autoCancel}
                    onChange={() => toggleSetting("autoCancel")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Enable waitlist</p>
                  <p className="text-sm text-gray-500">
                    Allow users to join waitlist when parking is full
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parkingSettings.waitlist}
                    onChange={() => toggleSetting("waitlist")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Maintenance mode</p>
                  <p className="text-sm text-gray-500">
                    Temporarily disable new bookings
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parkingSettings.maintenanceMode}
                    onChange={() => toggleSetting("maintenanceMode")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Database: Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">API Server: Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Payment Gateway: Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Email Service: Degraded</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Backup &amp; Maintenance
            </h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition flex items-center justify-center gap-2">
                <i className="fas fa-database"></i> Backup Database
              </button>
              <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition flex items-center justify-center gap-2">
                <i className="fas fa-file-export"></i> Export Logs
              </button>
              <button className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl transition flex items-center justify-center gap-2">
                <i className="fas fa-exclamation-triangle"></i> Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Buttons */}
      <div className="mt-10 flex justify-end gap-4">
        <button
          onClick={handleReset}
          className="px-8 py-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-medium"
        >
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition disabled:opacity-70"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}

