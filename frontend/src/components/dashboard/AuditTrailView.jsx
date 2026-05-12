// src/components/dashboard/AuditTrailView.jsx
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";

const getActionIcon = (action) => {
  const icons = {
    staff_created: "👷",
    staff_updated: "✏️",
    staff_deleted: "🗑️",
    settings_updated: "⚙️",
    system_config_changed: "⚙️",
    station_created: "📍",
    station_updated: "✏️",
    station_deleted: "🗑️",
    logged_in: "🔑",
    token_refreshed: "🔄",
    password_changed: "🔐",
  };
  return icons[action] || "📌";
};

const ActivityRow = memo(({ activity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = useMemo(
    () => new Date(activity.createdAt).toLocaleString(),
    [activity.createdAt],
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex gap-6">
        <div className="w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-600 text-4xl flex items-center justify-center rounded-3xl">
          {getActionIcon(activity.action)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-gray-900">
                {activity.userName || "System"}
              </span>
              <span className="ml-3 text-sm text-gray-500 capitalize">
                {activity.action.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{formattedDate}</span>
              {activity.isCritical && (
                <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-3xl">
                  CRITICAL
                </span>
              )}
            </div>
          </div>

          <p className="mt-2 text-gray-700 leading-relaxed">
            {activity.details}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-700 px-4 py-1 rounded-3xl">
            <span>🔒</span>
            <span className="font-medium tracking-wider">PERMANENT RECORD</span>
          </div>

          {(activity.oldValue || activity.newValue) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              <span className="text-xl leading-none">
                {isExpanded ? "▼" : "▶"}
              </span>
              <span>
                {isExpanded ? "Hide change details" : "View change details"}
              </span>
            </button>
          )}

          {isExpanded && (activity.oldValue || activity.newValue) && (
            <div className="mt-6 border border-gray-200 rounded-3xl p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-8">
                {activity.oldValue && (
                  <div>
                    <div className="text-red-600 font-semibold mb-3 text-sm tracking-wider">
                      BEFORE
                    </div>
                    <div className="bg-white border border-red-100 rounded-2xl p-5 text-sm max-h-80 overflow-auto">
                      {Object.entries(activity.oldValue).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b last:border-none"
                        >
                          <span className="font-medium text-gray-500 capitalize">
                            {key}
                          </span>
                          <span className="text-gray-700 text-right">
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
                    <div className="bg-white border border-green-100 rounded-2xl p-5 text-sm max-h-80 overflow-auto">
                      {Object.entries(activity.newValue).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b last:border-none"
                        >
                          <span className="font-medium text-gray-500 capitalize">
                            {key}
                          </span>
                          <span className="text-gray-700 text-right">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function AuditTrailView() {
  const { socket } = useSocket();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasNewActivities, setHasNewActivities] = useState(false);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);

  const fetchAuditLog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ limit: "100" });
      if (actionFilter) params.append("action", actionFilter);
      if (criticalOnly) params.append("critical", "true");
      if (search) params.append("search", search);

      const { data } = await api.get(`/admin/audit?${params.toString()}`);
      setActivities(data.activities || []);
      setHasNewActivities(false);
    } catch (err) {
      setError("Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, criticalOnly]);

  // Initial load + filter changes
  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  // Join audit room + listen for live updates
  useEffect(() => {
    if (!socket) return;

    // Join the audit room so backend can broadcast to us
    socket.emit("joinAuditRoom");

    const handleAuditUpdate = (newActivity) => {
      setActivities((prev) => [newActivity, ...prev].slice(0, 100));
      setHasNewActivities(true);
    };

    socket.on("auditLogUpdated", handleAuditUpdate);

    return () => {
      socket.off("auditLogUpdated", handleAuditUpdate);
      // Optionally leave room when component unmounts
      // socket.emit("leaveAuditRoom");
    };
  }, [socket]);

  const exportToCSV = useCallback(() => {
    if (activities.length === 0) return alert("No data to export");

    const headers = ["Date", "User", "Action", "Details", "Critical"];
    const rows = activities.map((a) => [
      new Date(a.createdAt).toLocaleString(),
      a.userName || "System",
      a.action.replace(/_/g, " "),
      `"${(a.details || "").replace(/"/g, '""')}"`,
      a.isCritical ? "Yes" : "No",
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
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-3xl text-sm font-medium transition"
          >
            🔄 Refresh
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
          <option value="station_created">Station Created</option>
          <option value="station_updated">Station Updated</option>
          <option value="station_deleted">Station Deleted</option>
          <option value="settings_updated">Settings Updated</option>
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

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 animate-pulse h-28"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-8 text-center">
          {error}
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
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityRow key={activity._id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
