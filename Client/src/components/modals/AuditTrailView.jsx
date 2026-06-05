// src/features/dashboard/shared/components/AuditTrailView.jsx
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";

// ─── Action Icon Helper (Replaces Emojis with SVGs) ───────────────────────
const ActionIcon = ({ action }) => {
  const category = useMemo(() => {
    if (!action) return "default";
    if (action.includes("staff")) return "staff";
    if (action.includes("spot") || action.includes("station")) return "spot";
    if (action.includes("booking") || action.includes("payment"))
      return "booking";
    return "default";
  }, [action]);

  const config = {
    staff: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
    spot: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    },
    auth: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
    booking: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    default: {
      bg: "bg-slate-100",
      text: "text-slate-500",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  };

  const { bg, text, icon } = config[category];

  return (
    <div
      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-5 h-5 ${text}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
    </div>
  );
};

// ─── Activity Row (Memoized for performance) ──────────────────────────────
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
        <td className="px-6 py-5 text-sm text-slate-500 font-medium whitespace-nowrap">
          {formattedDate}
        </td>
        <td className="px-6 py-5">
          <span className="font-semibold text-slate-800">
            {activity.userName || "System"}
          </span>
          {activity.userRole && (
            <span className="ml-2 text-xs font-medium text-slate-400 capitalize">
              ({activity.userRole})
            </span>
          )}
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-3">
            <ActionIcon action={activity.action} />
            <span className="capitalize font-medium text-slate-700">
              {activity.action.replace(/_/g, " ")}
            </span>
            {activity.isCritical && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 rounded-full">
                Critical
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-5 text-slate-600 text-sm max-w-md truncate">
          {activity.details}
        </td>
      </tr>

      {isExpanded && (activity.oldValue || activity.newValue) && (
        <tr className="bg-slate-50/50">
          <td colSpan="4" className="p-0">
            <div className="mx-6 my-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activity.oldValue && (
                  <div>
                    <div className="text-red-600 font-semibold mb-3 text-xs tracking-widest uppercase flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      Before
                    </div>
                    <div className="bg-slate-50 border border-red-100 rounded-2xl p-5 text-sm max-h-80 overflow-auto">
                      {Object.entries(activity.oldValue).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b border-slate-100 last:border-none gap-4"
                        >
                          <span className="font-medium text-slate-500 capitalize">
                            {key}
                          </span>
                          <span className="text-slate-700 text-right font-mono text-xs break-all">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activity.newValue && (
                  <div>
                    <div className="text-emerald-600 font-semibold mb-3 text-xs tracking-widest uppercase flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      After
                    </div>
                    <div className="bg-slate-50 border border-emerald-100 rounded-2xl p-5 text-sm max-h-80 overflow-auto">
                      {Object.entries(activity.newValue).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b border-slate-100 last:border-none gap-4"
                        >
                          <span className="font-medium text-slate-500 capitalize">
                            {key}
                          </span>
                          <span className="text-slate-700 text-right font-mono text-xs break-all">
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

// ─── Error Parser ─────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────
export default function AuditTrailView() {
  const { socket } = useSocket();

  const [activities, setActivities] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasNewActivities, setHasNewActivities] = useState(false);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);

  const [expandedRows, setExpandedRows] = useState(new Set());

  // ── Real-time clock state ───────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const fetchAuditLog = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setError("");

      try {
        const params = new URLSearchParams({ limit: "100" });
        if (actionFilter) params.append("action", actionFilter);
        if (criticalOnly) params.append("critical", "true");
        if (search) params.append("search", search);

        const { data } = await api.get(`/audit?${params.toString()}`);
        setActivities(data.activities || []);
        setHasNewActivities(false);
        setError("");
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[AuditTrail] fetch failed:", err);
        }
        setError(parseError(err));
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [search, actionFilter, criticalOnly],
  );

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
    if (activities.length === 0) return;

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
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Complete activity log • All actions are permanent
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* ✅ Live indicator with real-time clock */}
          <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-full px-5 py-2.5">
            <div className="flex items-center gap-2">
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-indigo-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span className="text-xs text-slate-400 font-medium">
                    Syncing…
                  </span>
                </>
              ) : initialLoading ? (
                <span className="text-xs text-slate-400 font-medium">
                  Loading…
                </span>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400 font-medium">
                    Live
                  </span>
                </>
              )}
            </div>

            {!refreshing && !initialLoading && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAuditLog(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${refreshing ? "animate-spin" : "hover:rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={activities.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 shadow-xl shadow-emerald-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchAuditLog(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 pl-12 border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-3xl bg-white outline-none transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-5 py-3 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white text-sm font-medium text-slate-600"
        >
          <option value="">All Actions</option>
          <option value="staff_created">Staff Created</option>
          <option value="staff_updated">Staff Updated</option>
          <option value="staff_deleted">Staff Deleted</option>
          <option value="station_created">Station Created</option>
          <option value="spot_created">Spot Created</option>
          <option value="spot_updated">Spot Updated</option>
          <option value="spot_deleted">Spot Deleted</option>
\          <option value="booking_created">Booking Created</option>
          <option value="booking_cancelled">Booking Cancelled</option>
          <option value="payment_processed">Payment Processed</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none px-4 py-3 border border-slate-200 rounded-3xl hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={criticalOnly}
            onChange={(e) => setCriticalOnly(e.target.checked)}
            className="w-5 h-5 accent-red-600"
          />
          <span className="text-sm font-medium text-slate-700">
            Critical Only
          </span>
        </label>
      </div>

      {/* New Activities Banner */}
      {hasNewActivities && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex justify-between items-center">
          <span className="font-medium flex items-center gap-2 text-indigo-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            New activities detected in real-time
          </span>
          <button
            onClick={() => fetchAuditLog(true)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl transition-colors"
          >
            Load New
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        {refreshing && !initialLoading && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
            <svg
              className="animate-spin w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Updating…
          </div>
        )}

        {initialLoading ? (
          <div className="p-8 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg">
                No activities found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {search || actionFilter || criticalOnly
                  ? "Try adjusting your filters"
                  : "Activity logs will appear here as actions are performed"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
    </div>
  );
}

