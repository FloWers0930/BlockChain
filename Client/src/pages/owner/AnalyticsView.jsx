// src/components/dashboard/owner/AnalyticsView.jsx
import { useEffect, useState, useCallback } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { useAuth } from "@providers/AuthProvider";
import {
  DollarSign,
  Calendar,
  Ticket,
  Car,
  MapPin,
  PieChart,
  RefreshCw,
} from "lucide-react";

import {
  LineChart,
  Line,
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
};

const statusBadge = (raw = "") => {
  const key = raw.toLowerCase();
  const s = STATUS[key] ?? { label: raw, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

// ─── Stat card with Lucide icons ─────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent, loading }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase leading-tight">
        {label}
      </p>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        {Icon && <Icon size={22} strokeWidth={2.5} />}
      </div>
    </div>
    {loading ? (
      <Skeleton className="h-8 w-24" />
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

  const [lastUpdated, setLastUpdated] = useState(null);
  const [pulse, setPulse] = useState(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setError(null);
    }

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

      setLastUpdated(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 800);

      setError(null);
    } catch (err) {
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

  // Real-time socket updates
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

  // Initial authenticated load
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
          <div className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-2">
            <span
              className={`w-2 h-2 rounded-full bg-emerald-400 ${pulse ? "animate-ping" : "animate-pulse"}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : initialLoading
                  ? "Loading…"
                  : "Connecting…"}
            </span>
            {refreshing && (
              <span className="text-xs font-medium text-indigo-500 flex items-center gap-1">
                <i className="fas fa-spinner animate-spin" />
                Updating
              </span>
            )}
          </div>

          {/* Refresh Button - Icon Only */}
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <i className="fas fa-triangle-exclamation text-lg" />
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

      {/* Stat Cards with Icons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₱${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          accent="#10b981"
          loading={initialLoading}
        />
        <StatCard
          label="This Month"
          value={`₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          icon={Calendar}
          accent="#6366f1"
          loading={initialLoading}
        />
        <StatCard
          label="Today's Bookings"
          value={stats?.todayBookings ?? "—"}
          icon={Ticket}
          accent="#8b5cf6"
          loading={initialLoading}
        />
        <StatCard
          label="Active Bookings"
          value={stats?.activeBookings ?? "—"}
          icon={Car}
          accent="#f59e0b"
          loading={initialLoading}
        />
        <StatCard
          label="Total Stations"
          value={stats?.totalSpots ?? "—"}
          icon={MapPin}
          accent="#3b82f6"
          loading={initialLoading}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={PieChart}
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
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
        {refreshing && !initialLoading && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10">
            <i className="fas fa-spinner animate-spin text-indigo-500" />
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
          <Skeleton className="h-80 w-full" />
        ) : revenueTrend.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-slate-300">
            <i className="fas fa-chart-line text-5xl mb-4" />
            <p className="text-sm text-slate-400">No revenue data yet</p>
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

      {/* Top Stations + Recent Bookings (rest of your original code) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Stations */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10">
              <i className="fas fa-spinner animate-spin text-indigo-500" />
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
                  <Skeleton className="w-7 h-7 rounded-xl flex-shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : topLocations.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center">
              <i className="fas fa-store text-4xl text-slate-200 mb-3" />
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

        {/* Recent Bookings - unchanged from your original */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
          {/* ... your original recent bookings code ... */}
        </div>
      </div>
    </div>
  );
}




