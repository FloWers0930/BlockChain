// backend/src/modules/analytics/analytics.controller.js
const Booking = require("../shared/booking.model");
const StationSpot = require("../shared/stationSpot.model");

// Simple in-memory TTL cache for analytics (low-severity performance win)
const analyticsCache = new Map(); // key -> { value, expiresAt }
const TTL_MS =
  Number(process.env.ANALYTICS_CACHE_TTL_MS) || 60 * 1000; // 60s default

function getCached(key) {
  const cached = analyticsCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    analyticsCache.delete(key);
    return null;
  }
  return cached.value;
}

function setCached(key, value) {
  analyticsCache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

const formatHour = (hour) =>
  hour === 0
    ? "12AM"
    : hour < 12
      ? `${hour}AM`
      : hour === 12
        ? "12PM"
        : `${hour - 12}PM`;

const getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Cache by owner only (analytics shape currently same per owner)
    const cacheKey = `ownerAnalytics:${ownerId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const spots = await StationSpot.find({ owner: ownerId });
    const spotIds = spots.map((s) => s._id);

    if (spotIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          monthlyRevenue: 0,
          totalViews: 0,
          todayBookings: 0,
          engagementRate: 0,
          totalSpots: 0,
          totalBookings: 0,
          peakHours: "N/A",
          peakPercentage: 0,
          avgDuration: "0h 0m",
          retentionRate: 0,
        },
        charts: {
          hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            label: formatHour(i),
            bookings: 0,
          })),
          revenueByDay: [],
          occupancyByLocation: [],
        },
        recentBookings: [],
        spots: [],
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalBookings,
      monthlyRevenueAgg,
      todayBookingsCount,
      hourlyAgg,
      recentBookings,
      avgDurationAgg,
      last7DaysAgg,
    ] = await Promise.all([
      Booking.countDocuments({ spot: { $in: spotIds } }),

      Booking.aggregate([
        {
          $match: {
            spot: { $in: spotIds },
            paymentStatus: "paid",
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]),

      Booking.countDocuments({
        spot: { $in: spotIds },
        createdAt: { $gte: today },
      }),

      Booking.aggregate([
        { $match: { spot: { $in: spotIds } } },
        { $group: { _id: { $hour: "$startTime" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Booking.find({ spot: { $in: spotIds } })
        .populate("user", "name email")
        .populate("spot", "spotNumber location zone")
        .sort({ createdAt: -1 })
        .limit(10),

      Booking.aggregate([
        {
          $match: {
            spot: { $in: spotIds },
            endTime: { $exists: true },
            startTime: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: { $subtract: ["$endTime", "$startTime"] } },
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            spot: { $in: spotIds },
            createdAt: {
              $gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalCost" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

    const hourCounts = {};
    hourlyAgg.forEach((h) => {
      hourCounts[h._id] = h.count;
    });

    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const peakHours = peakHour
      ? `${formatHour(parseInt(peakHour[0]))} - ${formatHour((parseInt(peakHour[0]) + 2) % 24)}`
      : "N/A";

    const avgDurationMs = avgDurationAgg[0]?.avgDuration || 0;
    const avgDurationHours = avgDurationMs > 0 ? avgDurationMs / (1000 * 60 * 60) : 0;

    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: formatHour(i),
      bookings: hourCounts[i] || 0,
    }));

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = last7DaysAgg.find((d) => d._id === dateStr);
      last7Days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: date.toDateString(),
        revenue: dayData?.revenue || 0,
        bookings: dayData?.bookings || 0,
      });
    }

    const locationMap = {};
    spots.forEach((spot) => {
      if (!locationMap[spot.location])
        locationMap[spot.location] = { total: 0, occupied: 0 };
      locationMap[spot.location].total++;
      if (spot.status === "occupied") locationMap[spot.location].occupied++;
    });

    const occupancyByLocation = Object.entries(locationMap).map(
      ([location, data]) => ({
        location,
        total: data.total,
        occupied: data.occupied,
        available: data.total - data.occupied,
        occupancyRate:
          data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
      }),
    );

    // Validate data before sending response
    const validStats = {
      monthlyRevenue: Math.max(0, monthlyRevenue || 0),
      totalViews: 0,
      todayBookings: Math.max(0, todayBookingsCount || 0),
      engagementRate: 0,
      totalSpots: Math.max(0, spots.length || 0),
      totalBookings: Math.max(0, totalBookings || 0),
      peakHours: peakHours || "N/A",
      peakPercentage: peakHour
        ? Math.min(100, Math.max(0, Math.round((peakHour[1] / Math.max(1, totalBookings)) * 100)))
        : 0,
      avgDuration: avgDurationMs > 0
        ? `${Math.floor(avgDurationHours)}h ${Math.round((avgDurationHours % 1) * 60)}m`
        : "N/A",
      retentionRate: 0,
    };

    const response = {
      success: true,
      stats: validStats,
      charts: {
        hourlyDistribution: hourlyDistribution || [],
        revenueByDay: last7Days || [],
        occupancyByLocation: occupancyByLocation || [],
      },
      recentBookings: recentBookings || [],
      spots: spots || [],
    };

    setCached(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getOwnerAnalytics };

