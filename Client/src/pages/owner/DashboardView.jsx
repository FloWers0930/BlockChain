// src/components/dashboard/owner/DashboardView.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { useAuth } from "@providers/AuthProvider";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DollarIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const TicketIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z" />
    <path d="M8 9h8M8 15h8M12 6v12" />
  </svg>
);
const CarIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-1.6-4.8A2 2 0 0 0 14.5 4H9.5a2 2 0 0 0-1.9 1.2L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);
const PieChartIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);
const RefreshIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2v6h-6M3 22v-6h6M13.5 4.5A8.97 8.97 0 0 1 19 12a9 9 0 1 1-9-9" />
  </svg>
);
const WarningIcon = ({ size = 20, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const ClockIcon = ({ size = 14, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const TrendingUpIcon = ({ size = 20, className = "" }) => (
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
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const TrendingDownIcon = ({ size = 20, className = "" }) => (
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
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);
const CarParkingIcon = ({ size = 16, className = "" }) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </svg>
);
const StationIcon = ({ size = 48, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4 8 4v14" />
    <path d="M10 9a3 3 0 1 0 6 0" />
    <path d="M10 21v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
  </svg>
);

function buildForecast(trendData) {
  if (!Array.isArray(trendData) || trendData.length < 3) return trendData || [];
  const lastDate = new Date(trendData[trendData.length - 1]?.date);
  if (isNaN(lastDate.getTime())) return trendData;
  const w = trendData.slice(-7);
  const avgGrowth =
    w.reduce((sum, d, i, arr) => {
      if (i === 0) return sum;
      return sum + ((d.revenue || 0) - (arr[i - 1].revenue || 0));
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
          Math.round((last?.revenue || 0) + avgGrowth * (i + 1)),
        ),
        isForecast: true,
      };
    }),
  ];
}

function computeRevenueGrowth(trendData) {
  if (!trendData || trendData.length < 6) return null;
  const real = trendData.filter((d) => !d.isForecast);
  if (real.length < 6) return null;
  const half = Math.floor(real.length / 2);
  const recent = real.slice(half).reduce((s, d) => s + (d.revenue || 0), 0);
  const prior = real.slice(0, half).reduce((s, d) => s + (d.revenue || 0), 0);
  if (!prior) return null;
  return (((recent - prior) / prior) * 100).toFixed(1);
}

const heatColor = (pct) => {
  if (pct === 0) return "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)";
  if (pct <= 25) return "linear-gradient(135deg, #34d399 0%, #10b981 100%)";
  if (pct <= 50) return "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
  if (pct <= 75) return "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
  return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
};
const getOccupancyIcon = (pct) => {
  if (pct === 0) return <CarParkingIcon size={14} className="opacity-40" />;
  if (pct <= 25) return <CarParkingIcon size={14} className="opacity-80" />;
  if (pct <= 50) return <CarParkingIcon size={14} className="opacity-90" />;
  return <CarParkingIcon size={14} className="opacity-100" />;
};

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
              : e.value ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

const KpiCard = ({ label, value, sub, icon: Icon, accent, loading, trend }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-10 w-24 mt-2" />
        ) : (
          <>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </p>
            {trend !== undefined && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                  trend >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUpIcon size={16} />
                ) : (
                  <TrendingDownIcon size={16} />
                )}
                <span>{Math.abs(trend)}% vs last period</span>
              </div>
            )}
          </>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {Icon && <Icon size={24} strokeWidth={2} />}
      </div>
    </div>
    {!loading && <p className="text-xs text-slate-500 mt-3">{sub}</p>}
  </div>
);

const EnhancedHeatmap = ({ data, loading }) => {
  const [hoveredHour, setHoveredHour] = useState(null);
  if (loading) return <Skeleton className="h-48 w-full" />;
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hourData = data?.find((h) => parseInt(h.hour) === i) || {
      hour: `${i}:00`,
      occupancy: 0,
    };
    const rawPct =
      hourData.occupancy ?? hourData.occupancyRate ?? hourData.count ?? 0;
    const pct =
      rawPct > 0 && rawPct <= 1
        ? Math.round(rawPct * 100)
        : Math.min(rawPct, 100);
    return { ...hourData, pct };
  });
  const timeLabels = [
    "12AM",
    "1AM",
    "2AM",
    "3AM",
    "4AM",
    "5AM",
    "6AM",
    "7AM",
    "8AM",
    "9AM",
    "10AM",
    "11AM",
    "12PM",
    "1PM",
    "2PM",
    "3PM",
    "4PM",
    "5PM",
    "6PM",
    "7PM",
    "8PM",
    "9PM",
    "10PM",
    "11PM",
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 text-xs">
        {[
          ["from-slate-300 to-slate-400", "Empty"],
          ["from-emerald-400 to-emerald-500", "Low"],
          ["from-amber-400 to-amber-500", "Medium"],
          ["from-orange-400 to-orange-500", "High"],
          ["from-red-400 to-red-500", "Full"],
        ].map(([g, l]) => (
          <div key={l} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-lg bg-gradient-to-br ${g}`} />
            <span className="text-slate-500">{l}</span>
          </div>
        ))}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
      >
        {hours.map((slot, i) => (
          <div
            key={i}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredHour(i)}
            onMouseLeave={() => setHoveredHour(null)}
          >
            <div
              className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-white/50"
              style={{ background: heatColor(slot.pct) }}
            >
              {getOccupancyIcon(slot.pct)}
              <span className="text-[10px] font-bold text-white drop-shadow-md">
                {slot.pct}%
              </span>
            </div>
            <div className="text-[9px] text-slate-400 text-center mt-1 font-medium">
              {timeLabels[i]}
            </div>
            {hoveredHour === i && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl whitespace-nowrap">
                  <p className="font-semibold">{timeLabels[i]}</p>
                  <p className="text-slate-300 text-[10px]">
                    {slot.pct}% occupied
                  </p>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardView() {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState(null);
  const [topStations, setTopStations] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [hourlyOccupancy, setHourlyOccupancy] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseTimeoutRef = useRef(null);

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

  const fetchRealData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);
    try {
      const { data } = await api.get("/owner/analytics");
      // ✅ FIX: response is { success, data: { stats, charts } } — unwrap data.data
      const res = data.data;

      setStats({
        monthlyRevenue: res.stats?.monthlyRevenue ?? 0,
        todayBookings: res.stats?.todayBookings ?? 0,
        activeBookings: res.stats?.activeBookings ?? 0,
        totalSpots: res.stats?.totalSpots ?? 0,
        occupancyRate: res.stats?.occupancyRate ?? 0,
        revenueGrowth: res.stats?.revenueGrowth ?? null,
        bookingGrowth: res.stats?.bookingGrowth ?? null,
      });

      // ✅ Use topLocations (has revenue) not occupancyByLocation (no revenue)
      setTopStations(res.charts?.topLocations?.slice(0, 5) ?? []);
      setRevenueTrend(buildForecast(res.charts?.revenueByDay ?? []));
      setHourlyOccupancy(
        Array.isArray(res.charts?.hourlyOccupancy)
          ? res.charts.hourlyOccupancy
          : [],
      );

      setError(null);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => {}, 800);
    } catch (err) {
      if (import.meta.env.DEV) console.error("[Dashboard] fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard data.",
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!socket || !isAuthenticated) return;
    const handler = () => fetchRealData(true);
    const events = [
      "bookingCreated",
      "bookingUpdated",
      "paymentProcessed",
      "spotUpdated",
      "stationCreated",
      "facilityUpdated",
    ];
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, isAuthenticated, fetchRealData]);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);
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

  if (!isAuthenticated)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Please log in to view your dashboard.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Stations Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
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
            onClick={() => fetchRealData(true)}
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
            onClick={() => fetchRealData(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Monthly Revenue"
          value={`₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          sub="Total earnings this month"
          icon={DollarIcon}
          accent="#10b981"
          loading={initialLoading}
          trend={parseFloat(revenueGrowth) || 0}
        />
        <KpiCard
          label="Today's Bookings"
          value={stats?.todayBookings ?? "—"}
          sub="Bookings today"
          icon={TicketIcon}
          accent="#6366f1"
          loading={initialLoading}
          trend={parseFloat(stats?.bookingGrowth) || 0}
        />
        <KpiCard
          label="Active Now"
          value={stats?.activeBookings ?? "—"}
          sub={`${stats?.activeBookings ?? 0} of ${
            stats?.totalSpots ?? 0
          } spots`}
          icon={CarIcon}
          accent="#8b5cf6"
          loading={initialLoading}
        />
        <KpiCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          sub={
            occupancyRate >= 75
              ? "High demand"
              : occupancyRate >= 40
              ? "Moderate"
              : "Low demand"
          }
          icon={PieChartIcon}
          accent={occupancyAccent}
          loading={initialLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Your earnings over time
              </p>
            </div>
            {refreshing && (
              <div className="flex items-center gap-2 text-indigo-500 text-sm">
                <RefreshIcon size={14} className="animate-spin" />
                Updating
              </div>
            )}
          </div>
          {initialLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : revenueTrend.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <TrendingUpIcon size={32} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No revenue data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={revenueTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area
                  yAxisId="left"
                  dataKey="revenue"
                  fill="url(#revGrad)"
                  stroke="none"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{
                    fill: "#6366f1",
                    strokeWidth: 2,
                    stroke: "#fff",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#6366f1",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  name="Revenue"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="forecastRevenue"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Stations */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Stations</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Best performers by revenue
            </p>
          </div>
          {initialLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <Skeleton className="h-4 w-24 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : topStations.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <StationIcon size={32} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No station data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topStations.map((station, i) => {
                const color = rankAccents[i] ?? "#94a3b8";
                const maxRevenue = topStations[0]?.revenue || 1;
                const barPct = Math.round((station.revenue / maxRevenue) * 100);
                return (
                  <div key={station.location || i} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {station.location || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {station.bookings ?? 0} bookings •{" "}
                            {station.total ?? 0} spots
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold" style={{ color }}>
                        ₱{(station.revenue ?? 0).toLocaleString()}
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
      </div>

      {/* Hourly Heatmap */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Hourly Occupancy Heatmap
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Today's parking traffic pattern
          </p>
        </div>
        <EnhancedHeatmap data={hourlyOccupancy} loading={initialLoading} />
      </div>
    </div>
  );
}
