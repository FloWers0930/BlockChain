// src/components/dashboard/owner/AnalyticsView.jsx
import { useEffect, useState, useCallback } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { useAuth } from "@providers/AuthProvider";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS = {
  active: { label: "Active", bg: "#dcfce7", color: "#16a34a" },
  completed: { label: "Completed", bg: "#eff6ff", color: "#2563eb" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626" },
  pending: { label: "Pending", bg: "#fefce8", color: "#ca8a04" },
  paid: { label: "Paid", bg: "#dcfce7", color: "#16a34a" },
};

const statusBadge = (raw = "") => {
  const key = raw.toLowerCase();
  const s = STATUS[key] ?? { label: raw, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4 text-sm min-w-[180px]">
      <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase mb-3">
        {label}
      </p>
      {payload.map((e) => (
        <div
          key={e.name}
          className="flex justify-between items-center gap-6 mb-1"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: e.color }}
            />
            <span className="text-slate-500 text-xs">{e.name}</span>
          </div>
          <span className="font-semibold text-slate-800">
            {typeof e.value === "number" &&
            e.name.toLowerCase().includes("revenue")
              ? `₱${e.value.toLocaleString()}`
              : e.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, loading }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase leading-tight">
        {label}
      </p>
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
    </div>
    {loading ? (
      <div className="h-8 bg-slate-100 rounded-lg w-2/3 animate-pulse" />
    ) : (
      <p className="text-3xl font-bold text-slate-900 tracking-tight font-mono leading-none">
        {value}
      </p>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsView() {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState(null);
  const [topLocations, setTopLocations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [pulse, setPulse] = useState(false);

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

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/analytics");

      setStats({
        totalRevenue: data.stats?.totalRevenue ?? 0,
        monthlyRevenue: data.stats?.monthlyRevenue ?? 0,
        todayBookings: data.stats?.todayBookings ?? 0,
        activeBookings: data.stats?.activeBookings ?? 0,
        totalSpots: data.stats?.totalSpots ?? 0,
        occupancyRate: data.stats?.occupancyRate ?? 0,
      });

      setTopLocations(data.charts?.occupancyByLocation ?? []);
      setRecentBookings(data.recentBookings ?? []);
      setRevenueTrend(data.charts?.revenueByDay ?? []);

      setPulse(true);
      setTimeout(() => setPulse(false), 800);
      setError(null);
    } catch (err) {
      if (process.env.NODE_ENV === "development")
        console.error("[Analytics] fetch error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load analytics data. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const events = [
      "bookingCreated",
      "bookingUpdated",
      "paymentProcessed",
      "spotUpdated",
    ];
    events.forEach((e) => socket.on(e, () => fetchAnalytics(true)));
    return () =>
      events.forEach((e) => socket.off(e, () => fetchAnalytics(true)));
  }, [socket, fetchAnalytics]);

  useEffect(() => {
    if (isAuthenticated) fetchAnalytics(false);
  }, [isAuthenticated, fetchAnalytics]);

  const rankAccents = ["#6366f1", "#10b981", "#f59e0b", "#f87171", "#3b82f6"];
  const occupancyRate = stats?.occupancyRate ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analytics &amp; Reports
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Deep insights into your station performance
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
                  <span
                    className={`w-2.5 h-2.5 rounded-full bg-emerald-400 ${pulse ? "animate-ping" : "animate-pulse"}`}
                  />
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
            onClick={() => fetchAnalytics(true)}
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

      {/* Error banner */}
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
            onClick={() => fetchAnalytics(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₱${(stats?.totalRevenue ?? 0).toLocaleString()}`}
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
          accent="#10b981"
          loading={initialLoading}
        />
        <StatCard
          label="This Month"
          value={`₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
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
          accent="#6366f1"
          loading={initialLoading}
        />
        <StatCard
          label="Today's Bookings"
          value={stats?.todayBookings ?? "—"}
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          }
          accent="#8b5cf6"
          loading={initialLoading}
        />
        <StatCard
          label="Active Bookings"
          value={stats?.activeBookings ?? "—"}
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
                d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.25}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          }
          accent="#f59e0b"
          loading={initialLoading}
        />
        <StatCard
          label="Total Stations"
          value={stats?.totalSpots ?? "—"}
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.25}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          accent="#3b82f6"
          loading={initialLoading}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.25}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          }
          accent={
            occupancyRate >= 75
              ? "#10b981"
              : occupancyRate >= 40
                ? "#f59e0b"
                : "#f87171"
          }
          loading={initialLoading}
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
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
            Updating chart…
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Revenue Trend</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Daily revenue — last 30 days
            </p>
          </div>
          {revenueTrend.length > 0 && !initialLoading && (
            <span className="text-xs text-slate-400 font-medium">
              {revenueTrend.length} data points
            </span>
          )}
        </div>

        {initialLoading ? (
          <div className="h-80 w-full bg-slate-100 rounded-xl animate-pulse" />
        ) : revenueTrend.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center gap-4">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg">
                No revenue data yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Charts will populate once bookings are made
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={revenueTrend}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return isNaN(d)
                    ? v
                    : d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`
                }
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: 12,
                  color: "#94a3b8",
                  paddingTop: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#6366f1",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                name="Daily Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Stations + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Stations */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
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

          <h3 className="text-sm font-bold text-slate-800 mb-0.5">
            Top Performing Stations
          </h3>
          <p className="text-slate-400 text-xs mb-6">By total revenue</p>

          {initialLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-100 rounded-xl flex-shrink-0 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded flex-1 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : topLocations.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-4">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No station data yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topLocations.map((loc, i) => {
                const color = rankAccents[i] ?? "#94a3b8";
                const pct =
                  loc.total > 0
                    ? Math.round((loc.occupied / loc.total) * 100)
                    : 0;
                return (
                  <div key={loc.location ?? i}>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {loc.location}
                        </p>
                        {loc.total > 0 && (
                          <p className="text-[11px] text-slate-400">
                            {loc.occupied ?? 0}/{loc.total} occupied · {pct}%
                          </p>
                        )}
                      </div>
                      <span
                        className="text-sm font-bold font-mono flex-shrink-0"
                        style={{ color }}
                      >
                        ₱{(loc.revenue ?? 0).toLocaleString()}
                      </span>
                    </div>
                    {loc.total > 0 && (
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
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

          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Recent Bookings
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Latest customer transactions
              </p>
            </div>
          </div>

          {initialLoading ? (
            <div className="p-8 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-4 bg-slate-200 rounded flex-1" />
                  <div className="h-4 bg-slate-200 rounded w-40" />
                  <div className="h-6 bg-slate-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
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
                  No recent bookings
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  New bookings will appear here automatically
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.slice(0, 5).map((b) => (
                    <tr
                      key={b._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 text-sm">
                          {b.user?.name || "Guest"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {b.user?.email || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {b.spot?.location || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900 text-sm">
                        ₱{b.totalCost || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {statusBadge(b.paymentStatus || b.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
