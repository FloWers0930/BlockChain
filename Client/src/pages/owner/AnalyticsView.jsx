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

const DollarIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CalendarIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TicketIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z" />
    <path d="M8 9h8M8 15h8M12 6v12" />
  </svg>
);
const CarIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-1.6-4.8A2 2 0 0 0 14.5 4H9.5a2 2 0 0 0-1.9 1.2L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);
const MapPinIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const PieChartIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);
const RefreshIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2v6h-6M3 22v-6h6M13.5 4.5A8.97 8.97 0 0 1 19 12a9 9 0 1 1-9-9" />
  </svg>
);
const ClockIcon = ({ size = 14, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const WarningIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const EmptyStateIcon = ({ size = 40, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const STATUS = {
  active: { label: "Active", bg: "#dcfce7", color: "#16a34a" },
  completed: { label: "Completed", bg: "#eff6ff", color: "#2563eb" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626" },
  pending: { label: "Pending", bg: "#fefce8", color: "#ca8a04" },
  paid: { label: "Paid", bg: "#dcfce7", color: "#16a34a" },
};
const statusBadge = (raw = "") => {
  const s = STATUS[raw.toLowerCase()] ?? {
    label: raw,
    bg: "#f1f5f9",
    color: "#64748b",
  };
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

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

const StatCard = ({ label, value, icon, accent, loading }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 group">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase leading-tight">
        {label}
      </p>
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);
    try {
      const { data } = await api.get("/owner/analytics");
      // ✅ FIX: response is { success, data: { stats, charts } } — unwrap data.data
      const res = data.data;

      setStats({
        totalRevenue: res.stats?.totalRevenue ?? 0,
        monthlyRevenue: res.stats?.monthlyRevenue ?? 0,
        todayBookings: res.stats?.todayBookings ?? 0,
        activeBookings: res.stats?.activeBookings ?? 0,
        totalSpots: res.stats?.totalSpots ?? 0,
        occupancyRate: res.stats?.occupancyRate ?? 0,
      });

      // ✅ Use topLocations (has revenue) not occupancyByLocation
      setTopLocations(res.charts?.topLocations ?? []);
      setRecentBookings(res.charts?.recentBookings ?? []);
      setRevenueTrend(res.charts?.revenueByDay ?? []);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("[Analytics] fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load analytics data.",
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!socket || !isAuthenticated) return;
    const handler = () => fetchAnalytics(true);
    const events = [
      "bookingCreated",
      "bookingUpdated",
      "paymentProcessed",
      "spotUpdated",
      "spotCreated",
    ];
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, isAuthenticated, fetchAnalytics]);

  useEffect(() => {
    if (isAuthenticated) fetchAnalytics(false);
  }, [isAuthenticated, fetchAnalytics]);

  const rankAccents = ["#6366f1", "#10b981", "#f59e0b", "#f87171", "#3b82f6"];
  const occupancyRate = stats?.occupancyRate ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Deep insights into your station performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2.5">
            {refreshing ? (
              <>
                <RefreshIcon
                  size={16}
                  className="animate-spin text-indigo-500"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Syncing…
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-600 font-medium">Live</span>
              </>
            )}
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <ClockIcon size={14} className="text-slate-400" />
              <span className="text-xs font-mono font-semibold text-slate-700">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 flex items-center justify-center transition-all disabled:opacity-60"
          >
            <RefreshIcon
              size={18}
              className={`text-slate-600 transition-transform duration-500 ${
                refreshing ? "animate-spin" : "hover:rotate-180"
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-red-700">
            <WarningIcon size={20} />
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₱${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<DollarIcon />}
          accent="#10b981"
          loading={initialLoading}
        />
        <StatCard
          label="This Month"
          value={`₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          icon={<CalendarIcon />}
          accent="#6366f1"
          loading={initialLoading}
        />
        <StatCard
          label="Today's Bookings"
          value={stats?.todayBookings ?? "—"}
          icon={<TicketIcon />}
          accent="#8b5cf6"
          loading={initialLoading}
        />
        <StatCard
          label="Active Now"
          value={stats?.activeBookings ?? "—"}
          icon={<CarIcon />}
          accent="#f59e0b"
          loading={initialLoading}
        />
        <StatCard
          label="Total Spots"
          value={stats?.totalSpots ?? "—"}
          icon={<MapPinIcon />}
          accent="#3b82f6"
          loading={initialLoading}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={<PieChartIcon />}
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

      {/* Revenue Trend */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
        {refreshing && !initialLoading && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
            <RefreshIcon size={14} className="animate-spin" />
            Updating chart…
          </div>
        )}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
            <p className="text-sm text-slate-500 mt-0.5">
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
          <div className="h-80 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <EmptyStateIcon size={32} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No revenue data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={revenueTrend}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
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
                strokeWidth={3}
                fill="url(#areaGrad)"
                dot={{ fill: "#6366f1", strokeWidth: 2, stroke: "#fff", r: 4 }}
                activeDot={{
                  r: 6,
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Performing Stations */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
              <RefreshIcon size={14} className="animate-spin" />
              Updating…
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 mb-0.5">
            Top Performing Stations
          </h3>
          <p className="text-sm text-slate-500 mb-6">By total revenue</p>
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
            <div className="h-48 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <MapPinIcon size={32} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No station data yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topLocations.map((loc, i) => {
                const color = rankAccents[i] ?? "#94a3b8";
                const maxRevenue = topLocations[0]?.revenue || 1;
                const barPct = Math.round((loc.revenue / maxRevenue) * 100);
                return (
                  <div key={loc.location ?? i} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {loc.location}
                          </p>
                          <p className="text-xs text-slate-400">
                            {loc.bookings ?? 0} bookings • {loc.total ?? 0}{" "}
                            spots
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold" style={{ color }}>
                        ₱{(loc.revenue ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                        style={{
                          width: `${Math.max(barPct, 4)}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
              <RefreshIcon size={14} className="animate-spin" />
              Updating…
            </div>
          )}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Recent Bookings
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Latest customer transactions
            </p>
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
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <TicketIcon size={32} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No recent bookings</p>
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

