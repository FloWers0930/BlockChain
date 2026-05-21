// src/components/dashboard/admin/DashboardView.jsx
import { useEffect, useState } from "react";
import { PhilippinePeso, CalendarCheck, Car, PieChart } from "lucide-react";
import MetricCard from "@components/ui/MetricCard";
import DashboardSkeleton from "@components/ui/DashboardSkeleton";
import api from "@api/axios";

export default function AdminDashboardView() {
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    activeBookings: 0,
    totalSpots: 0,
    occupiedSpots: 0,
  });
  const [topLocations, setTopLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Admin dashboard fetch failed:", err);
      }
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-slate-600 font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const occupancyRate =
    stats.totalSpots > 0
      ? Math.round((stats.occupiedSpots / stats.totalSpots) * 100)
      : 0;

  const rankColors = [
    "bg-gray-800",
    "bg-gray-500",
    "bg-orange-500",
    "bg-orange-400",
    "bg-orange-300",
  ];

  return (
    <div className="space-y-8">
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₱${stats.revenue.toLocaleString()}`}
          subtitle="All bookings"
          color="blue"
          icon={PhilippinePeso}
        />
        <MetricCard
          title="Total Bookings"
          value={stats.bookings.toLocaleString()}
          subtitle="All time"
          color="green"
          icon={CalendarCheck}
        />
        <MetricCard
          title="Active Sessions"
          value={stats.activeBookings.toLocaleString()}
          subtitle="Currently parked"
          color="purple"
          icon={Car}
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtitle={`${stats.occupiedSpots} of ${stats.totalSpots} spots`}
          color="amber"
          icon={PieChart}
        />
      </div>

      {/* Charts + Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Revenue Overview
          </h3>
          <div className="h-80 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
            Revenue Chart — Coming Soon
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">
            Top Performing Locations
          </h3>
          {topLocations.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No location data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {topLocations.map((loc) => (
                <div key={loc.rank} className="flex items-center gap-4">
                  <div
                    className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-full text-white ${rankColors[loc.rank - 1] ?? "bg-slate-400"}`}
                  >
                    {loc.rank}
                  </div>
                  <div className="flex-1 text-sm font-medium text-slate-700 truncate">
                    {loc.name}
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    ₱{loc.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




