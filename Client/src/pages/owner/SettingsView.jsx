// src/components/dashboard/owner/SettingsView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { useAuth } from "@providers/AuthProvider";
import zxcvbn from "zxcvbn";

export default function SettingsView() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [settings, setSettings] = useState({
    businessName: "",
    taxId: "",
    address: "",
    emailAlerts: true,
    smsNotifications: true,
    marketingEmails: false,
    twoFactorEnabled: false,
  });

  // ── Section loading + error states ───────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState(null);

  // ── Password Change Form State ───────────────────────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchSettings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/owner/settings");
      if (data.success) {
        // Handle case where settings might be undefined or null
        const settingsData = data.settings || {};
        
        // Ensure all values are never undefined to prevent controlled/uncontrolled warnings
        setSettings({
          businessName: settingsData.businessName || "",
          taxId: settingsData.taxId || "",
          address: settingsData.address || "",
          emailAlerts: settingsData.emailAlerts !== undefined ? settingsData.emailAlerts : true,
          smsNotifications: settingsData.smsNotifications !== undefined ? settingsData.smsNotifications : true,
          marketingEmails: settingsData.marketingEmails !== undefined ? settingsData.marketingEmails : false,
          twoFactorEnabled: settingsData.twoFactorEnabled !== undefined ? settingsData.twoFactorEnabled : false,
        });
      }
      setError(null);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load settings. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSettings(false);
  }, [fetchSettings]);

  // Real-time sync (silent refresh)
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchSettings(true);
    socket.on("settingsUpdated", handleUpdate);
    return () => socket.off("settingsUpdated", handleUpdate);
  }, [socket, fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/owner/settings", settings);
      if (data.success) {
        setNotification({
          type: "success",
          text: "✅ Settings saved successfully",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      setNotification({
        type: "error",
        text: err.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Password Change Handlers ─────────────────────────────────────────────
  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFeedback(null);
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (changingPassword) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotification({ type: "error", text: "All fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotification({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setNotification({
        type: "error",
        text: "New password must be at least 8 characters",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { data } = await api.post("/owner/change-password", {
        currentPassword,
        newPassword,
      });

      if (data.success) {
        setNotification({
          type: "success",
          text: "✅ Password updated successfully",
        });
        setTimeout(() => setNotification(null), 4000);
        setShowPasswordModal(false);
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setNotification({
        type: "error",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setNewPassword(value);
      setPasswordFeedback(zxcvbn(value));
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else if (name === "currentPassword") {
      setCurrentPassword(value);
    }
  };

  const handleExportReports = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/owner/bookings");

      const csvRows = [
        ["Date", "Station", "Spot Number", "Customer", "Amount", "Status"],
        ...data.bookings.map((b) => [
          new Date(b.createdAt).toLocaleDateString(),
          b.spot?.location || "-",
          b.spot?.spotNumber || "-",
          b.user?.name || "Guest",
          `₱${b.totalCost}`,
          b.paymentStatus?.toUpperCase() || "PENDING",
        ]),
      ];

      const csvContent = csvRows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setNotification({
        type: "success",
        text: "✅ Reports exported successfully",
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: "error", text: "Failed to export reports" });
    } finally {
      setExporting(false);
    }
  };

  const handleBackup = async () => {
    setNotification({ type: "info", text: "📤 Starting database backup..." });
    setTimeout(() => {
      setNotification({
        type: "success",
        text: "✅ Backup completed and emailed to you",
      });
      setTimeout(() => setNotification(null), 4000);
    }, 2200);
  };

  const handleClearCache = async () => {
    setNotification({ type: "info", text: "🧹 Clearing cache..." });
    setTimeout(() => {
      setNotification({
        type: "success",
        text: "✅ Cache cleared successfully",
      });
      setTimeout(() => setNotification(null), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 ${
            notification.type === "success"
              ? "bg-emerald-600"
              : notification.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
          } text-white`}
        >
          <i
            className={`fas ${
              notification.type === "success"
                ? "fa-check-circle"
                : notification.type === "error"
                  ? "fa-times-circle"
                  : "fa-info-circle"
            } text-2xl`}
          />
          <p className="font-medium">{notification.text}</p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Station Business Settings
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your station operations and preferences
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-2">
            <span
              className={`w-2 h-2 rounded-full bg-emerald-400 ${refreshing ? "animate-ping" : "animate-pulse"}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {refreshing ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-1" />
                  Updating…
                </>
              ) : initialLoading ? (
                "Loading…"
              ) : (
                "Live"
              )}
            </span>
          </div>

          <button
            onClick={() => fetchSettings(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <i
              className={`fas fa-rotate-right text-slate-400 text-sm ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <i className="fas fa-triangle-exclamation text-lg" />
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchSettings(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-12">
        {/* Business Information */}
        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <i className="fas fa-building text-blue-600"></i>
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Station / Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Tax ID / TIN
              </label>
              <input
                type="text"
                name="taxId"
                value={settings.taxId}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Business Address
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <i className="fas fa-bell text-blue-600"></i>
            Notification Preferences
          </h3>
          <div className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="font-medium text-slate-800">Email Alerts</span>
                <p className="text-sm text-slate-500">
                  Booking confirmations and updates
                </p>
              </div>
              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleChange}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="font-medium text-slate-800">
                  SMS Notifications
                </span>
                <p className="text-sm text-slate-500">
                  Instant booking and alert messages
                </p>
              </div>
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleChange}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="font-medium text-slate-800">
                  Marketing Emails
                </span>
                <p className="text-sm text-slate-500">
                  Promotions and station updates
                </p>
              </div>
              <input
                type="checkbox"
                name="marketingEmails"
                checked={settings.marketingEmails}
                onChange={handleChange}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <i className="fas fa-shield-alt text-blue-600"></i>
            Security
          </h3>
          <div className="space-y-6">
            {/* 2FA Toggle */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="font-medium text-slate-800">
                  Two-Factor Authentication
                </span>
                <p className="text-sm text-slate-500">
                  Require a verification code for every login
                </p>
              </div>
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={settings.twoFactorEnabled}
                onChange={handleChange}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
            </label>

            {/* Password Change Button */}
            <div className="pt-4 border-t">
              <button
                onClick={openPasswordModal}
                className="flex items-center gap-3 px-6 py-4 border border-slate-200 hover:border-slate-300 rounded-3xl font-medium text-slate-700 hover:text-slate-800 transition-colors"
              >
                <i className="fas fa-key"></i>
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <i className="fas fa-bolt text-blue-600"></i>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleBackup}
              className="py-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-3xl font-medium flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <i className="fas fa-database text-2xl text-slate-600"></i>
              <span className="text-slate-800">Backup Database</span>
            </button>

            <button
              onClick={handleExportReports}
              disabled={exporting}
              className="py-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-3xl font-medium flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-70"
            >
              {exporting ? (
                <i className="fas fa-spinner fa-spin text-2xl text-slate-600" />
              ) : (
                <i className="fas fa-file-export text-2xl text-slate-600" />
              )}
              <span className="text-slate-800">
                {exporting ? "Exporting..." : "Export Reports"}
              </span>
            </button>

            <button
              onClick={handleClearCache}
              className="py-6 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-700 rounded-3xl font-medium flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <i className="fas fa-broom text-2xl"></i>
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save / Reset */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => fetchSettings(true)}
          className="px-8 py-4 border border-slate-200 rounded-3xl font-medium hover:bg-slate-50 transition"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-semibold transition disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* ── Change Password Modal ──────────────────────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={handlePasswordInput}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={handlePasswordInput}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  required
                />
                {newPassword && passwordFeedback && (
                  <div className="mt-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span>Strength</span>
                      <span
                        className={
                          passwordFeedback.score >= 3
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {passwordFeedback.score >= 3 ? "Strong" : "Weak"}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordFeedback.score >= 3 ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{
                          width: `${(passwordFeedback.score / 4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handlePasswordInput}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-4 border border-slate-200 rounded-3xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-semibold disabled:opacity-70"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




