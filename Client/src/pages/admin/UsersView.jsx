// src/components/dashboard/admin/UsersView.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";

export default function UsersView() {
  const { socket } = useSocket();

  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ── Real-time clock state ───────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  // Fetch ONLY mobile app users (Customers/Drivers)
  const fetchAllUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/admin/users");
      const userList = data?.users || data?.data || [];

      // Filter strictly for app users (exclude staff/admin/owner just in case backend returns them)
      const appUsers = userList.filter(
        (u) =>
          !u.role ||
          u.role.toLowerCase() === "user" ||
          u.role.toLowerCase() === "customer",
      );

      setUsers(appUsers);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("Failed to fetch users:", err);
      setError("Failed to load app users. Please check your connection.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUserActivity = useCallback(async (userId) => {
    if (!userId) return;
    setActivityLoading(true);
    try {
      const { data } = await api.get(`/admin/audit?userId=${userId}&limit=30`);
      setActivities(data.activities || data.audits || data.data || []);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleActivity = (activity) => {
      if (
        selectedUser &&
        (activity.user === selectedUser._id ||
          activity.user === selectedUser.id)
      ) {
        setActivities((prev) => [activity, ...prev].slice(0, 30));
      }
      if (
        activity.action === "user_registered" ||
        activity.action === "user_updated"
      ) {
        fetchAllUsers(true);
      }
    };

    socket.on("userActivity", handleActivity);
    socket.on("auditLogUpdated", handleActivity);

    fetchAllUsers(false);

    return () => {
      socket.off("userActivity", handleActivity);
      socket.off("auditLogUpdated", handleActivity);
    };
  }, [socket, selectedUser, fetchAllUsers]);

  const openActivityModal = useCallback(
    (user) => {
      setSelectedUser(user);
      setShowActivityModal(true);
      fetchUserActivity(user?._id || user?.id);
    },
    [fetchUserActivity],
  );

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      const searchString =
        `${user?.name || ""} ${user?.username || ""} ${user?.email || ""} ${user?.phone || ""}`.toLowerCase();
      const matchesSearch =
        !searchTerm || searchString.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user?.isActive) ||
        (statusFilter === "inactive" && !user?.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      newThisMonth: users.filter((u) => {
        if (!u.createdAt) return false;
        const d = new Date(u.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length,
    };
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mobile App Users
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage customers and drivers registered on the platform
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live indicator with real-time clock */}
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

          <button
            onClick={() => fetchAllUsers(true)}
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
            onClick={() => fetchAllUsers(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: stats.total,
            accent: "#6366f1",
            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          },
          {
            label: "Active Users",
            value: stats.active,
            accent: "#10b981",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            accent: "#f87171",
            icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
          },
          {
            label: "New This Month",
            value: stats.newThisMonth,
            accent: "#f59e0b",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase leading-tight">
                {stat.label}
              </p>
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: `${stat.accent}15`,
                  color: stat.accent,
                }}
              >
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
                    strokeWidth={2.25}
                    d={stat.icon}
                  />
                </svg>
              </div>
            </div>
            {initialLoading ? (
              <div className="h-8 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
            ) : (
              <p
                className="text-3xl font-bold tracking-tighter font-mono"
                style={{ color: stat.accent }}
              >
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-3xl bg-white outline-none transition-all text-sm"
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

        <div className="flex flex-wrap gap-2">
          {["all", "active", "inactive"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "all"
                ? "All Status"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

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

        <div className="max-h-[650px] overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-slate-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-500 font-medium">
                        No app users found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(user.name || user.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 text-sm truncate">
                            {user.name || user.username}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {user.email} {user.phone ? `• ${user.phone}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => openActivityModal(user)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1.5 ml-auto"
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <h3 className="text-2xl font-bold text-slate-900">
                Activity Timeline
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-8 flex-1 overflow-auto">
              {/* User Profile Header */}
              <div className="flex items-center gap-4 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {(selectedUser.name || selectedUser.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xl text-slate-900 truncate">
                    {selectedUser.name || selectedUser.username}
                  </div>
                  <div className="text-slate-500 text-sm truncate">
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              {activityLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
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
                  <p className="text-slate-500 font-medium">
                    Loading activity...
                  </p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-slate-300"
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
                  <p className="text-slate-500 font-medium">
                    No activity recorded yet
                  </p>
                  <p className="text-slate-400 text-sm">
                    App usage and bookings will appear here
                  </p>
                </div>
              ) : (
                <div className="relative pl-8 border-l-2 border-slate-200 space-y-6">
                  {activities.map((activity) => (
                    <div
                      key={activity._id || activity.id}
                      className="relative pb-2"
                    >
                      <div className="absolute -left-[25px] top-1 w-4 h-4 bg-indigo-500 rounded-full ring-4 ring-white"></div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <p className="font-semibold text-slate-800 capitalize">
                            {activity.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-400 shrink-0">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {activity.details && (
                          <p className="text-sm text-slate-600 mt-1">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-medium transition-colors"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

