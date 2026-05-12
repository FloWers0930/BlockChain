// src/components/dashboard/admin/DashboardView.jsx
import { useEffect, useState } from "react";
import MetricCard from "../MetricCard";
import api from "../../../api/axios";

export default function DashboardView() {
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    activeBookings: 0,
    totalSpots: 0,
    occupiedSpots: 0,
  });
  const [topLocations, setTopLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const [spotsRes, bookingsRes] = await Promise.all([
        api.get("/owner/spots"),
        api.get("/owner/bookings?limit=300"),
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

      // Top locations
      const locMap = {};
      bookings.forEach((b) => {
        const loc = b.spot?.location || "Unknown";
        locMap[loc] = (locMap[loc] || 0) + (parseFloat(b.totalCost) || 0);
      });

      const sortedLocations = Object.entries(locMap)
        .sort((a, b) => b[1] - a[1])
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`₱${stats.revenue.toLocaleString()}`}
          subtitle="This month"
          color="blue"
        />
        <MetricCard
          title="Total Bookings"
          value={stats.bookings.toLocaleString()}
          subtitle="All bookings"
          color="green"
        />
        <MetricCard
          title="Active Sessions"
          value={stats.activeBookings.toLocaleString()}
          subtitle="Currently parked"
          color="purple"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${stats.totalSpots > 0 ? Math.round((stats.occupiedSpots / stats.totalSpots) * 100) : 0}%`}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="h-80 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-dashed">
            [Revenue Chart - Coming Soon]
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold mb-5">
            Top Performing Locations
          </h3>
          <div className="space-y-5">
            {topLocations.map((loc) => (
              <div key={loc.rank} className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full text-white ${loc.rank === 1 ? "bg-gray-800" : loc.rank === 2 ? "bg-gray-600" : "bg-orange-500"}`}
                >
                  {loc.rank}
                </div>
                <div className="flex-1">{loc.name}</div>
                <div className="font-semibold">
                  ₱{loc.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
