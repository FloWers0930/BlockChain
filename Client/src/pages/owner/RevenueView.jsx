// src/components/dashboard/owner/RevenueView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";

// ─── Stat Card (consistent with StaffView design) ─────────────────────────
const StatCard = ({ label, value, icon, accent }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
        {label}
      </p>
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
    </div>
    <p
      className="text-4xl font-bold tracking-tighter font-mono"
      style={{ color: accent }}
    >
      ₱{value.toLocaleString()}
    </p>
  </div>
);

// ─── Empty State Placeholder ──────────────────────────────────────────────
const EmptyState = ({
  icon = "receipt",
  title = "No transactions yet",
  subtitle = "Bookings will appear here once they are made",
}) => (
  <div className="h-64 flex flex-col items-center justify-center text-slate-300 py-12">
    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
      {icon === "receipt" ? (
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
      ) : (
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
      )}
    </div>
    <p className="text-slate-600 font-semibold text-lg mb-1">{title}</p>
    <p className="text-slate-400 text-sm max-w-[240px] text-center">
      {subtitle}
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
export default function RevenueView() {
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);

  // ── Section loading + error states ──────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [showAllModal, setShowAllModal] = useState(false);
  const [notification, setNotification] = useState("");

  // ── Pagination for "All Bookings" modal ─────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Fetch owner's bookings
  const fetchRevenue = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/owner/bookings");
      setBookings(data.bookings || []);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to fetch revenue data:", err);
      }
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load revenue data. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchRevenue(true);

    socket.on("bookingCreated", handleUpdate);
    socket.on("bookingUpdated", handleUpdate);
    socket.on("paymentProcessed", handleUpdate);
    socket.on("bookingCompleted", handleUpdate);

    fetchRevenue(false);

    return () => {
      socket.off("bookingCreated", handleUpdate);
      socket.off("bookingUpdated", handleUpdate);
      socket.off("paymentProcessed", handleUpdate);
      socket.off("bookingCompleted", handleUpdate);
    };
  }, [socket, fetchRevenue]);

  // Calculate stats
  const calculateStats = () => {
    let todayRevenue = 0;
    let totalRevenue = 0;
    let pendingPayouts = 0;
    let monthlyRevenue = 0;

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();

    bookings.forEach((b) => {
      const amount = parseFloat(b.totalCost) || 0;
      if (b.paymentStatus === "paid") {
        totalRevenue += amount;
        if (b.createdAt >= todayStart) todayRevenue += amount;

        const bookingDate = new Date(b.createdAt);
        if (
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        ) {
          monthlyRevenue += amount;
        }
      } else if (b.paymentStatus === "pending") {
        pendingPayouts += amount;
      }
    });

    return { todayRevenue, totalRevenue, pendingPayouts, monthlyRevenue };
  };

  const stats = calculateStats();

  // Pagination helpers for modal
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const downloadCSV = () => {
    if (bookings.length === 0) {
      setNotification("No data to export");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const headers = [
      "Booking ID",
      "Customer",
      "Customer Email",
      "Station Spot",
      "Location",
      "Amount",
      "Payment Status",
      "Date",
    ];
    const rows = bookings.map((b) => [
      b._id?.slice(-8),
      b.user?.name || "Guest",
      b.user?.email || "—",
      b.spot?.spotNumber || "—",
      b.spot?.location || "—",
      b.totalCost || 0,
      b.paymentStatus || "pending",
      new Date(b.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setNotification("✅ Report downloaded");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-emerald-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">{notification}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Revenue Center
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time earnings and transactions
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

          {/* Refresh button */}
          <button
            onClick={() => fetchRevenue(true)}
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

          {/* Generate Report */}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 shadow-xl shadow-emerald-300 text-sm"
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
            Generate Report
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
            onClick={() => fetchRevenue(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={stats.todayRevenue}
          accent="#10b981"
          icon={
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Pending Payouts"
          value={stats.pendingPayouts}
          accent="#f59e0b"
          icon={
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="This Month"
          value={stats.monthlyRevenue}
          accent="#6366f1"
          icon={
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Earnings (YTD)"
          value={stats.totalRevenue}
          accent="#64748b"
          icon={
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Recent Transactions Table */}
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

        <div className="px-6 py-5 border-b flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">
            Recent Transactions
          </h3>
          <button
            onClick={() => setShowAllModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
          >
            View All Bookings
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {initialLoading ? (
          <div className="p-8 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded flex-1" />
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-6 bg-slate-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Station Spot
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 8).map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5 font-medium text-slate-800">
                      #{b._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {b.user?.name || "Guest"}
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium">
                      {b.user?.email || "—"}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {b.spot?.spotNumber} - {b.spot?.location}
                    </td>
                    <td className="px-6 py-5 text-right font-semibold text-slate-900">
                      ₱{b.totalCost || 0}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-4 py-1 text-xs font-semibold rounded-full ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {(b.paymentStatus || "pending").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View All Bookings Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                All Bookings
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {bookings.length === 0 ? (
                <EmptyState
                  icon="document"
                  title="No bookings found"
                  subtitle="All your booking transactions will appear here"
                />
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                          Booking ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                          Station Spot
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentBookings.map((b) => (
                        <tr key={b._id}>
                          <td className="px-6 py-5 font-medium text-slate-800">
                            #{b._id?.slice(-8)}
                          </td>
                          <td className="px-6 py-5 text-slate-700">
                            {b.user?.name || "Guest"}
                          </td>
                          <td className="px-6 py-5 text-slate-600 font-medium">
                            {b.user?.email || "—"}
                          </td>
                          <td className="px-6 py-5 text-slate-600">
                            {b.spot?.spotNumber} - {b.spot?.location}
                          </td>
                          <td className="px-6 py-5 text-right font-semibold text-slate-900">
                            ₱{b.totalCost || 0}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span
                              className={`px-4 py-1 text-xs font-semibold rounded-full ${
                                b.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {(b.paymentStatus || "pending").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-500">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 border-t pt-6">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-5 py-2 text-sm font-medium border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-40 flex items-center gap-2"
                      >
                        ← Previous
                      </button>

                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-slate-400">Page</span>
                        <span className="font-semibold text-slate-800">
                          {currentPage}
                        </span>
                        <span className="text-slate-400">of</span>
                        <span className="font-semibold text-slate-800">
                          {totalPages}
                        </span>
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2 text-sm font-medium border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-40 flex items-center gap-2"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

