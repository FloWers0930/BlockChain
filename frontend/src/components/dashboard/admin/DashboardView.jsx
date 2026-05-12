// src/components/dashboard/admin/DashboardView.jsx
import { useEffect, useState, useCallback } from "react";
import MetricCard from "../MetricCard";
import api from "../../../api/axios";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function buildRevenueTrend(bookings) {
  const days = 30;
  const map = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map[key] = 0;
  }

  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in map) {
      map[key] += parseFloat(b.totalCost) || 0;
    }
  });

  return Object.entries(map).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-lg text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-indigo-600">
        ₱{payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

export default function DashboardView() {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    activeBookings: 0,
    totalSpots: 0,
    occupiedSpots: 0,
  });
  const [topLocations, setTopLocations] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch data using proper admin endpoints
  const fetchRealData = useCallback(async () => {
    try {
      setLoading(true);
      const [spotsRes, bookingsRes] = await Promise.all([
        api.get("/admin/spots"),
        api.get("/admin/bookings?limit=300"),
      ]);

      const spots = spotsRes.data?.spots || [];
      const bookings = bookingsRes.data?.bookings || [];

      const totalSpots = spots.length;
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

      const sortedLocations = Object.entries(locMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, revenue], i) => ({
          rank: i + 1,
          name,
          revenue: Math.round(revenue),
        }));

      setStats({
        revenue: Math.round(totalRevenue),
        bookings: bookings.length,
        activeBookings,
        totalSpots,
        occupiedSpots: activeBookings,
      });

      setTopLocations(sortedLocations);
      setRevenueTrend(buildRevenueTrend(bookings));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Admin dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates via shared SocketContext
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchRealData();

    socket.on("bookingCreated", handleUpdate);
    socket.on("bookingCompleted", handleUpdate);
    socket.on("spotUpdated", handleUpdate);
    socket.on("spotDeleted", handleUpdate);

    return () => {
      socket.off("bookingCreated", handleUpdate);
      socket.off("bookingCompleted", handleUpdate);
      socket.off("spotUpdated", handleUpdate);
      socket.off("spotDeleted", handleUpdate);
    };
  }, [socket, fetchRealData]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) fetchRealData();
  }, [isAuthenticated, fetchRealData]);

  const occupancyRate =
    stats.totalSpots > 0
      ? Math.round((stats.occupiedSpots / stats.totalSpots) * 100)
      : 0;

  const xTickFormatter = (value, index) => (index % 5 === 0 ? value : "");

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500">
            Real-time overview of your parking network
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            LIVE
          </div>

          <button
            onClick={fetchRealData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-3xl hover:bg-gray-50 transition disabled:opacity-70"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-1">
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          title="Total Revenue"
          value={`₱${stats.revenue.toLocaleString()}`}
          subtitle="All bookings"
          color="blue"
          icon="fa-money-bill-wave"
        />
        <MetricCard
          title="Total Bookings"
          value={stats.bookings.toLocaleString()}
          subtitle="All time"
          color="green"
          icon="fa-ticket"
        />
        <MetricCard
          title="Active Sessions"
          value={stats.activeBookings.toLocaleString()}
          subtitle="Currently parked"
          color="purple"
          icon="fa-car"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtitle={`${stats.occupiedSpots}/${stats.totalSpots} spots`}
          color="amber"
          icon="fa-chart-pie"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
              <p className="text-sm text-gray-400">Last 30 days</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 px-4 py-1.5 rounded-2xl">
              <i className="fas fa-chart-area"></i>
              Daily Revenue
            </div>
          </div>

          {loading ? (
            <div className="h-72 bg-gray-50 rounded-2xl animate-pulse" />
          ) : revenueTrend.every((d) => d.revenue === 0) ? (
            <div className="h-72 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-dashed border-gray-200">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart
                data={revenueTrend}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  stroke="#d1d5db"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={xTickFormatter}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₱${(v / 1000).toFixed(1)}k` : `₱${v}`
                  }
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Locations */}
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold mb-5">
            Top Performing Locations
          </h3>
          <div className="space-y-6">
            {topLocations.length > 0 ? (
              topLocations.map((loc) => (
                <div key={loc.rank} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-2xl text-white ${
                      loc.rank === 1
                        ? "bg-amber-500"
                        : loc.rank === 2
                          ? "bg-gray-400"
                          : "bg-gray-700"
                    }`}
                  >
                    #{loc.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {loc.name}
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{
                          width: `${Math.round((loc.revenue / topLocations[0].revenue) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="font-semibold text-gray-700 shrink-0">
                    ₱{loc.revenue.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-10">
                No booking data yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
