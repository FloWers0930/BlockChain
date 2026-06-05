// src/components/dashboard/admin/DashboardView.jsx
import { useEffect, useState, useCallback } from "react";
import api from "@api/axios";

// ─── Premium KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon, accent, loading }) => (
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
    {loading ? (
      <div className="space-y-3">
        <div className="h-8 bg-slate-100 rounded-lg w-2/3 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
      </div>
    ) : (
      <>
        <p
          className="text-3xl font-bold tracking-tighter font-mono"
          style={{ color: accent }}
        >
          {value}
        </p>
        <p className="text-xs mt-2 font-medium text-slate-500">{sub}</p>
      </>
    )}
  </div>
);

// ─── Custom SVG Revenue Chart ─────────────────────────────────────────────────
const RevenueChart = ({ data, loading }) => {
  const [tooltip, setTooltip] = useState(null);

  if (loading) {
    return (
      <div className="h-72 w-full bg-slate-100 rounded-xl animate-pulse" />
    );
  }

  if (!data || data.length === 0 || data.every((d) => d.revenue === 0)) {
    return (
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-semibold text-lg">
            No Revenue Data
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Revenue trends will appear once bookings are made
          </p>
        </div>
      </div>
    );
  }

  const width = 800;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const maxVal = Math.max(...data.map((d) => d.revenue)) * 1.15 || 100;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (width - paddingX * 2)) / (data.length - 1);
    const y =
      height - paddingY - (d.revenue / maxVal) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Smooth curve path generation
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;
  const yAxisSteps = 4;
  const yStepVal = maxVal / yAxisSteps;
  const segmentWidth =
    data.length > 1
      ? (width - paddingX * 2) / (data.length - 1)
      : width - paddingX * 2;

  return (
    <div className="w-full h-72 relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
          const y =
            height - paddingY - (i * (height - paddingY * 2)) / yAxisSteps;
          const val = Math.round(i * yStepVal);
          return (
            <g key={`y-${i}`}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
              >
                ₱{val.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        <path d={areaD} fill="url(#revenueGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Data points and X-axis labels */}
        {points.map((p, i) => (
          <g key={`x-${i}`}>
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontWeight="500"
            >
              {p.label}
            </text>
            {/* Invisible hover area for tooltip */}
            <rect
              x={p.x - segmentWidth / 2}
              y={paddingY}
              width={segmentWidth}
              height={height - paddingY * 2}
              fill="transparent"
              onMouseEnter={() => setTooltip(p)}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "crosshair" }}
            />
          </g>
        ))}

        {/* Tooltip Rendering */}
        {tooltip && (
          <g style={{ pointerEvents: "none" }}>
            <line
              x1={tooltip.x}
              y1={paddingY}
              x2={tooltip.x}
              y2={height - paddingY}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle
              cx={tooltip.x}
              cy={tooltip.y}
              r="5"
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth="3"
            />

            <g transform={`translate(${tooltip.x}, ${tooltip.y - 45})`}>
              <rect
                x="-45"
                y="-15"
                width="90"
                height="30"
                rx="6"
                fill="#0f172a"
              />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ₱{tooltip.revenue.toLocaleString()}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default function AdminDashboardView() {
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    activeBookings: 0,
    totalSpots: 0,
    occupiedSpots: 0,
  });
  const [topLocations, setTopLocations] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
      const [spotsRes, bookingsRes] = await Promise.all([
        api.get("/admin/spots"),
        api.get("/admin/bookings?limit=300"),
      ]);

      const spots = spotsRes.data?.spots || [];
      const bookings = bookingsRes.data?.bookings || [];

      const activeBookings = bookings.filter(
        (b) => b.status === "active" || b.status === "pending",
      ).length;

      const totalRevenue = bookings.reduce(
        (sum, b) => sum + (parseFloat(b.totalCost) || 0),
        0,
      );

      const locMap = {};
      bookings.forEach((b) => {
        const loc = b.spot?.location || "Unknown";
        locMap[loc] = (locMap[loc] || 0) + (parseFloat(b.totalCost) || 0);
      });

      setStats({
        revenue: Math.round(totalRevenue),
        bookings: bookings.length,
        activeBookings,
        totalSpots: spots.length,
        occupiedSpots: activeBookings,
      });

      setTopLocations(
        Object.entries(locMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, revenue], i) => ({
            rank: i + 1,
            name,
            revenue: Math.round(revenue),
          })),
      );

      // ── Generate Chart Data (Last 7 Days) ─────────────────────────────────
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Timezone-safe date string formatter
      const formatDateStr = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push({
          dateStr: formatDateStr(d),
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: 0,
        });
      }

      const dateMap = new Map(days.map((d) => [d.dateStr, d]));

      bookings.forEach((b) => {
        if (!b.createdAt && !b.startDate) return;
        const bDate = new Date(b.createdAt || b.startDate);
        bDate.setHours(0, 0, 0, 0);
        const bDateStr = formatDateStr(bDate);

        if (dateMap.has(bDateStr)) {
          dateMap.get(bDateStr).revenue += parseFloat(b.totalCost) || 0;
        }
      });

      setChartData(days);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Admin dashboard fetch failed:", err);
      }
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const occupancyRate =
    stats.totalSpots > 0
      ? Math.round((stats.occupiedSpots / stats.totalSpots) * 100)
      : 0;

  const occupancyAccent =
    occupancyRate >= 75
      ? "#10b981"
      : occupancyRate >= 40
        ? "#f59e0b"
        : "#f87171";

  const rankAccents = ["#6366f1", "#10b981", "#f59e0b", "#f87171", "#3b82f6"];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Overview
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Platform-wide metrics and performance
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

          {/* Refresh button */}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={`₱${stats.revenue.toLocaleString()}`}
          sub="All platform bookings"
          accent="#10b981"
          loading={initialLoading}
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
        <KpiCard
          label="Total Bookings"
          value={stats.bookings.toLocaleString()}
          sub="All time transactions"
          accent="#6366f1"
          loading={initialLoading}
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
        <KpiCard
          label="Active Sessions"
          value={stats.activeBookings.toLocaleString()}
          sub="Currently parked"
          accent="#8b5cf6"
          loading={initialLoading}
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
        />
        <KpiCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          sub={`${stats.occupiedSpots} of ${stats.totalSpots} spots`}
          accent={occupancyAccent}
          loading={initialLoading}
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
        />
      </div>

      {/* Charts + Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
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
            Revenue Overview
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            Platform earnings trend (Last 7 Days)
          </p>

          <RevenueChart data={chartData} loading={initialLoading} />
        </div>

        {/* Top Locations */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
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
            Top Performing Locations
          </h3>
          <p className="text-slate-400 text-xs mb-6">By total revenue</p>

          {initialLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-100 rounded-xl flex-shrink-0 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded flex-1 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
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
              <p className="text-sm text-slate-400">No location data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topLocations.map((loc, i) => {
                const color = rankAccents[i] ?? "#94a3b8";
                return (
                  <div
                    key={loc.rank}
                    className="flex items-center gap-3 group/item hover:bg-slate-50 transition-colors p-2 -mx-2 rounded-xl"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {loc.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {loc.name}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold font-mono flex-shrink-0"
                      style={{ color }}
                    >
                      ₱{loc.revenue.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

