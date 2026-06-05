// src/components/dashboard/admin/BookingsView.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";

const getStatusBadge = (status) => {
  const config = {
    completed: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      label: "Completed",
    },
    active: { bg: "bg-blue-100", text: "text-blue-700", label: "Active" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
  };
  const c = config[status] || {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: status || "Unknown",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
};

export default function BookingsView() {
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/admin/bookings?limit=1000");
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("[Bookings] fetch error:", err);
      setError("Failed to load bookings. Please check your connection.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData(true);

    socket.on("bookingCreated", handleUpdate);
    socket.on("bookingCompleted", handleUpdate);
    socket.on("bookingUpdated", handleUpdate);
    socket.on("paymentProcessed", handleUpdate);

    fetchData(false);

    return () => {
      socket.off("bookingCreated", handleUpdate);
      socket.off("bookingCompleted", handleUpdate);
      socket.off("bookingUpdated", handleUpdate);
      socket.off("paymentProcessed", handleUpdate);
    };
  }, [socket, fetchData]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const search = searchTerm.toLowerCase();
      return (
        matchesStatus &&
        (!search ||
          (b.user?.name || "").toLowerCase().includes(search) ||
          (b.user?.email || "").toLowerCase().includes(search) ||
          (b.spot?.location || "").toLowerCase().includes(search) ||
          (b.spot?.spotNumber || "").toLowerCase().includes(search))
      );
    });
  }, [bookings, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Platform Bookings
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage all customer transactions • Real-time
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
            onClick={() => fetchData(true)}
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
            onClick={() => fetchData(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bookings Table */}
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

        <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search bookings, customers, or locations..."
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
            {["all", "pending", "active", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
                  statusFilter === s
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "all"
                  ? "All Bookings"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {initialLoading ? (
          <div className="p-8 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded flex-1" />
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-6 bg-slate-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
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
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg">
                No bookings found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "New platform bookings will appear here automatically"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Spot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5 font-mono text-sm text-slate-600">
                      #{b._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-800 text-sm">
                        {b.user?.name || "Guest"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {b.user?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-600 text-sm font-medium">
                      {b.spot?.spotNumber || "—"}
                    </td>
                    <td className="px-6 py-5 text-slate-600 text-sm">
                      {b.spot?.location || "—"}
                    </td>
                    <td className="px-6 py-5 text-right font-semibold text-slate-900 text-sm">
                      ₱{b.totalCost || 0}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

