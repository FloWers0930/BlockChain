// src/features/dashboard/shared/components /AuditTrailView.jsx
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { RefreshCw } from "lucide-react";

const getActionIcon = (action) => {
  const icons = {
    staff_created: "👷",
    staff_updated: "✏️",
    staff_deleted: "🗑️",
    settings_updated: "⚙️",
    system_config_changed: "⚙️",
    spot_created: "📍",
    spot_updated: "✏️",
    spot_deleted: "🗑️",
    logged_in: "🔑",
    token_refreshed: "🔄",
    password_changed: "🔐",
    booking_created: "📅",
    booking_cancelled: "❌",
    payment_processed: "💳",
  };
  return icons[action] || "📌";
};

const ActivityRow = memo(({ activity, isExpanded, onToggle }) => {
  const formattedDate = useMemo(
    () => new Date(activity.createdAt).toLocaleString(),
    [activity.createdAt],
  );

  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
      >
        <td className="px-6 py-5 text-sm text-slate-500 font-medium">
          {formattedDate}
        </td>
        <td className="px-6 py-5">
          <span className="font-semibold text-slate-900">
            {activity.userName || "System"}
          </span>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getActionIcon(activity.action)}</span>
            <span className="capitalize font-medium text-slate-700">
              {activity.action.replace(/_/g, " ")}
            </span>
          </div>
        </td>
        <td className="px-6 py-5 text-slate-600 text-sm max-w-md truncate">
          {activity.details}
        </td>
      </tr>

      {isExpanded && (activity.oldValue || activity.newValue) && (
        <tr className="bg-slate-50">
          <td colSpan="4" className="p-0">
            <div className="mx-6 my-4 bg-white border border-slate-200 rounded-3xl p-6">
              <div className="grid grid-cols-2 gap-8">
                {activity.oldValue && (
                  <div>
                    <div className="text-red-600 font-semibold mb-3 text-sm tracking-wider">
                      BEFORE
                    </div>
                    <div className="bg-slate-50 border border-red-100 rounded-2xl p-5 text-sm max-h-80 overflow-auto">
                      {Object.entries(activity.oldValue).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b last:border-none"
                        >
                          <span className="font-medium text-slate-500 capitalize">
                            {key}
                          </span>
                          <span className="text-slate-700 text-right">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activity.newValue && (
                  <div>
                    <div className="text-green-600 font-semibold mb-3 text-sm tracking-wider">
                      AFTER
                    </div>
                    <div className="bg-slate-50 border border-green-100 rounded-2xl p-5 text-sm max-h-80 overflow-auto">
                      {Object.entries(activity.newValue).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b last:border-none"
                        >
                          <span className="font-medium text-slate-500 capitalize">
                            {key}
                          </span>
                          <span className="text-slate-700 text-right">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

const parseError = (err) => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;
  if (status === 401) return "Session expired — please log in again.";
  if (status === 403)
    return message || "You don't have permission to view audit logs.";
  if (status === 404)
    return "Audit log endpoint not found (404). Check API URL config.";
  if (status >= 500) return `Server error (${status}). Check backend logs.`;
  if (message) return message;
  if (!navigator.onLine) return "No internet connection.";
  return "Failed to load audit trail.";
};

export default function AuditTrailView() {
  const { socket } = useSocket();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasNewActivities, setHasNewActivities] = useState(false);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);

  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchAuditLog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ limit: "100" });
      if (actionFilter) params.append("action", actionFilter);
      if (criticalOnly) params.append("critical", "true");
      if (search) params.append("search", search);

      // ← updated from /admin/audit to /audit
      const { data } = await api.get(`/audit?${params.toString()}`);
      setActivities(data.activities || []);
      setHasNewActivities(false);
    } catch (err) {
      console.error(
        "[AuditTrail] fetch failed:",
        err?.response?.status,
        err?.response?.data ?? err.message,
      );
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, criticalOnly]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  useEffect(() => {
    if (!socket) return;

    const handleAuditUpdate = (newActivity) => {
      setActivities((prev) => [newActivity, ...prev].slice(0, 100));
      setHasNewActivities(true);
    };

    socket.on("auditLogUpdated", handleAuditUpdate);
    return () => socket.off("auditLogUpdated", handleAuditUpdate);
  }, [socket]);

  const toggleRow = useCallback((id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const exportToCSV = useCallback(() => {
    if (activities.length === 0) return alert("No data to export");

    const headers = ["Date", "User", "Action", "Details"];
    const rows = activities.map((a) => [
      new Date(a.createdAt).toLocaleString(),
      a.userName || "System",
      a.action.replace(/_/g, " "),
      `"${(a.details || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activities]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Audit Trail</h2>
          <p className="text-gray-500 flex items-center gap-2">
            Complete activity log • All actions are permanent
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-3xl">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              LIVE
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-medium transition"
          >
            📤 Export CSV
          </button>
          <button
            onClick={fetchAuditLog}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 rounded-2xl text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm flex flex-wrap gap-4 items-end">
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] px-5 py-3 border border-gray-200 rounded-3xl focus:border-blue-500 outline-none"
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-5 py-3 border border-gray-200 rounded-3xl focus:border-blue-500 outline-none"
        >
          <option value="">All Actions</option>
          <option value="staff_created">Staff Created</option>
          <option value="staff_updated">Staff Updated</option>
          <option value="staff_deleted">Staff Deleted</option>
          <option value="spot_created">Spot Created</option>
          <option value="spot_updated">Spot Updated</option>
          <option value="spot_deleted">Spot Deleted</option>
          <option value="settings_updated">Settings Updated</option>
          <option value="booking_created">Booking Created</option>
          <option value="booking_cancelled">Booking Cancelled</option>
          <option value="payment_processed">Payment Processed</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={criticalOnly}
            onChange={(e) => setCriticalOnly(e.target.checked)}
            className="w-5 h-5 accent-red-600"
          />
          <span className="text-sm font-medium">Critical Only</span>
        </label>
      </div>

      {hasNewActivities && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-3xl p-4 flex justify-between items-center">
          <span className="font-medium flex items-center gap-2">
            🔔 New activities detected
          </span>
          <button
            onClick={fetchAuditLog}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-3xl"
          >
            Load New
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 animate-pulse h-20"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-8 text-center">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchAuditLog}
            className="mt-4 block mx-auto px-6 py-2 bg-red-600 text-white rounded-3xl text-sm"
          >
            Try Again
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-gray-400">
          No activities found
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <ActivityRow
                  key={activity._id}
                  activity={activity}
                  isExpanded={expandedRows.has(activity._id)}
                  onToggle={() => toggleRow(activity._id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



