// src/components/dashboard/owner/DashboardView.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { useAuth } from "@providers/AuthProvider";
import { DollarSign, Ticket, Car, PieChart, RefreshCw } from "lucide-react";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Forecast: pure extrapolation from real trend ────────────────────────────
function buildForecast(trendData) {
  if (!Array.isArray(trendData) || trendData.length < 3) return trendData;
  const lastDate = new Date(trendData[trendData.length - 1]?.date);
  if (isNaN(lastDate.getTime())) return trendData;

  const w = trendData.slice(-7);
  const avgGrowth =
    w.reduce((sum, d, i, arr) => {
      if (i === 0) return sum;
      return sum + (d.revenue - arr[i - 1].revenue);
    }, 0) / Math.max(w.length - 1, 1);

  const last = w[w.length - 1];
  return [
    ...trendData,
    ...Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i + 1);
      return {
        date: d.toISOString().split("T")[0],
        forecastRevenue: Math.max(
          0,
          Math.round(last.revenue + avgGrowth * (i + 1)),
        ),
        bookings: null,
        occupancy: null,
        isForecast: true,
      };
    }),
  ];
}

// ─── Compute growth % from trend data ────────────────────────────────────────
function computeRevenueGrowth(trendData) {
  if (!trendData || trendData.length < 6) return null;
  const real = trendData.filter((d) => !d.isForecast);
  const half = Math.floor(real.length / 2);
  const recent = real.slice(half).reduce((s, d) => s + (d.revenue || 0), 0);
  const prior = real.slice(0, half).reduce((s, d) => s + (d.revenue || 0), 0);
  if (!prior) return null;
  return (((recent - prior) / prior) * 100).toFixed(1);
}

// ─── Heatmap color: green → amber → red ──────────────────────────────────────
const heatColor = (pct) =>
  `hsl(${Math.max(0, 120 - Math.round(pct * 1.2))}, 75%, 48%)`;

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4 text-sm min-w-[210px]">
      <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase mb-3">
        {label}
      </p>
      {payload.map((e) => (
        <div
          key={e.name}
          className="flex justify-between items-center mb-1.5 gap-6"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: e.color }}
            />
            <span className="text-slate-500 text-xs">{e.name}</span>
          </div>
          <span className="font-semibold text-slate-800">
            {e.name.includes("Revenue") || e.name === "Forecast"
              ? `₱${(e.value || 0).toLocaleString()}`
              : (e.value ?? "—")}
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

// ─── Premium KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, accent, loading }) => (
  <div className="card-premium p-8 interactive-card animate-fade-in">
    <div className="flex justify-between items-start mb-6">
      <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
        {label}
      </p>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-premium hover:shadow-2xl transition-all duration-300"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        {Icon && <Icon size={28} strokeWidth={2.25} />}
      </div>
    </div>
    {loading ? (
      <>
        <Skeleton className="h-12 w-32 mb-4" />
        <Skeleton className="h-4 w-40" />
      </>
    ) : (
      <>
        <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none tracking-tight font-sans">
          {value}
        </p>
        <p className="text-sm mt-4 font-semibold" style={{ color: accent }}>
          {sub}
        </p>
      </>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardView() {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState(null);
  const [topStations, setTopStations] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [hourlyOccupancy, setHourlyOccupancy] = useState([]);

  // ── Section loading + error states ───────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);
  const [pulse, setPulse] = useState(false);

  const fetchRealData = useCallback(async (isRefresh = false) => {
    // Show refreshing indicator for live/manual updates (but keep old data visible)
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setError(null);
    }

    try {
      const { data } = await api.get("/analytics");

      const s = {
        monthlyRevenue: data.stats?.monthlyRevenue ?? 0,
        todayBookings: data.stats?.todayBookings ?? 0,
        activeBookings: data.stats?.activeBookings ?? 0,
        totalSpots: data.stats?.totalSpots ?? 0,
        occupancyRate: data.stats?.occupancyRate ?? 0,
        revenueGrowth: data.stats?.revenueGrowth ?? null,
        bookingGrowth: data.stats?.bookingGrowth ?? null,
      };

      setStats(s);
      setTopStations(data.charts?.occupancyByLocation?.slice(0, 5) ?? []);

      const raw = data.charts?.revenueByDay ?? [];
      setRevenueTrend(buildForecast(raw));

      setHourlyOccupancy(
        Array.isArray(data.charts?.hourlyOccupancy) &&
          data.charts.hourlyOccupancy.length
          ? data.charts.hourlyOccupancy
          : [],
      );

      setLastUpdated(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 800);

      setError(null); // clear any previous error on success
    } catch (err) {
      console.error("[Dashboard] fetch error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dashboard data. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Real-time socket updates (silent refresh — never shows skeletons) ─────
  useEffect(() => {
    if (!socket) return;
    const events = [
      "bookingCreated",
      "bookingUpdated",
      "paymentProcessed",
      "spotUpdated",
    ];
    events.forEach((e) => socket.on(e, () => fetchRealData(true)));
    return () =>
      events.forEach((e) => socket.off(e, () => fetchRealData(true)));
  }, [socket, fetchRealData]);

  // ── Initial authenticated load ───────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) fetchRealData(false);
  }, [isAuthenticated, fetchRealData]);

  const revenueGrowth = useMemo(() => {
    if (stats?.revenueGrowth != null) return stats.revenueGrowth;
    return computeRevenueGrowth(revenueTrend.filter((d) => !d.isForecast));
  }, [stats, revenueTrend]);

  const occupancyRate = stats?.occupancyRate ?? 0;
  const occupancyAccent =
    occupancyRate >= 75
      ? "#10b981"
      : occupancyRate >= 40
        ? "#f59e0b"
        : "#f87171";

  const rankAccents = ["#6366f1", "#10b981", "#f59e0b", "#f87171", "#3b82f6"];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Station Overview
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
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
            onClick={() => fetchRealData(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Error Banner (global) ──────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <i className="fas fa-triangle-exclamation text-lg" />
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchRealData(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Cards (section loading) ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Monthly Revenue"
          value={`₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          sub={
            revenueGrowth != null
              ? `${revenueGrowth > 0 ? "↑" : "↓"} ${Math.abs(revenueGrowth)}% vs prior period`
              : "Computing trend…"
          }
          icon={DollarSign}
          accent="#10b981"
          loading={initialLoading}
        />
        <KpiCard
          label="Today's Bookings"
          value={stats?.todayBookings ?? "—"}
          sub={
            stats?.bookingGrowth != null
              ? `${stats.bookingGrowth > 0 ? "↑" : "↓"} ${Math.abs(stats.bookingGrowth)}% vs yesterday`
              : "Live updates active"
          }
          icon={Ticket}
          accent="#6366f1"
          loading={initialLoading}
        />
        <KpiCard
          label="Active Bookings"
          value={stats?.activeBookings ?? "—"}
          sub={`${stats?.activeBookings ?? 0} of ${stats?.totalSpots ?? 0} spots occupied`}
          icon={Car}
          accent="#8b5cf6"
          loading={initialLoading}
        />
        <KpiCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          sub={
            occupancyRate >= 75
              ? "High demand — great performance"
              : occupancyRate >= 40
                ? "Moderate traffic today"
                : "Low demand period"
          }
          icon={PieChart}
          accent={occupancyAccent}
          loading={initialLoading}
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Revenue Trend (section loading + refresh indicator) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10">
              <i className="fas fa-spinner animate-spin text-indigo-500" />
              Updating chart…
            </div>
          )}

          {initialLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : revenueTrend.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-slate-200">
              <i className="fas fa-chart-line text-4xl mb-3" />
              <p className="text-sm text-slate-400">No trend data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={revenueTrend}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
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
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`
                  }
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
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
                    paddingTop: 16,
                  }}
                />
                <Area
                  yAxisId="left"
                  dataKey="revenue"
                  fill="url(#revGrad)"
                  stroke="none"
                  legendType="none"
                />
                <Area
                  yAxisId="left"
                  dataKey="forecastRevenue"
                  fill="url(#forecastGrad)"
                  stroke="none"
                  legendType="none"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#6366f1",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  name="Revenue (₱)"
                  connectNulls={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="forecastRevenue"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  name="Forecast"
                  connectNulls
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#10b981",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  name="Bookings"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Stations (section loading + refresh indicator) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10">
              <i className="fas fa-spinner animate-spin text-indigo-500" />
              Updating…
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-800 mb-0.5">
            Top Stations
          </h3>
          <p className="text-slate-400 text-xs mb-6">By revenue this month</p>

          {initialLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : topStations.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center">
              <i className="fas fa-store text-4xl text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No station data yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topStations.map((station, i) => {
                const color = rankAccents[i] ?? "#94a3b8";
                const pct =
                  station.total > 0
                    ? Math.round((station.occupied / station.total) * 100)
                    : 0;
                return (
                  <div key={station.location ?? i}>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {station.location}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {station.occupied ?? 0}/{station.total ?? 0} occupied
                          · {pct}%
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold font-mono"
                        style={{ color }}
                      >
                        ₱{(station.revenue ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          opacity: 0.75,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Hourly Heatmap (section loading + refresh indicator) ─────────────── */}
      {hourlyOccupancy.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10">
              <i className="fas fa-spinner animate-spin text-indigo-500" />
              Updating…
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Hourly Occupancy
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Today's traffic pattern
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-400" />{" "}
                Low
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-amber-400" />{" "}
                Medium
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-red-400" />{" "}
                High
              </div>
            </div>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
            {hourlyOccupancy.map((slot, i) => {
              const pct = slot.occupancy ?? slot.occupancyRate ?? 0;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1"
                  title={`${slot.hour} — ${pct}% occupied`}
                >
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center
                               text-[10px] font-bold text-white shadow-sm
                               hover:scale-110 transition-transform duration-150 cursor-default"
                    style={{ backgroundColor: heatColor(pct) }}
                  >
                    {pct}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {slot.hour?.replace(":00", "") ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}




