// backend/controllers/analyticsController.js
import Booking from "../models/Booking.js";
import StationSpot from "../models/StationSpot.js";

const formatHour = (hour) => {
  return hour === 0
    ? "12AM"
    : hour < 12
      ? `${hour}AM`
      : hour === 12
        ? "12PM"
        : `${hour - 12}PM`;
};

export const getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get owner's station spots
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

    // Run queries in parallel for performance
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
    const todayBookings = todayBookingsCount;

    // Peak hours processing
    const hourCounts = {};
    hourlyAgg.forEach((h) => {
      hourCounts[h._id] = h.count;
    });

    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const peakHours = peakHour
      ? `${formatHour(parseInt(peakHour[0]))} - ${formatHour((parseInt(peakHour[0]) + 2) % 24)}`
      : "N/A";

    // Average duration
    const avgDurationMs = avgDurationAgg[0]?.avgDuration || 0;
    const avgDurationHours = avgDurationMs / (1000 * 60 * 60);

    // Hourly distribution chart
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: formatHour(i),
      bookings: hourCounts[i] || 0,
    }));

    // Last 7 days revenue chart
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

    // Occupancy by location
    const locationMap = {};
    spots.forEach((spot) => {
      if (!locationMap[spot.location]) {
        locationMap[spot.location] = { total: 0, occupied: 0 };
      }
      locationMap[spot.location].total++;
      if (spot.status === "occupied") {
        locationMap[spot.location].occupied++;
      }
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

    res.json({
      success: true,
      stats: {
        monthlyRevenue,
        totalViews: 0, // TODO: Implement view tracking later
        todayBookings,
        engagementRate: 0, // TODO: Implement proper metric
        totalSpots: spots.length,
        totalBookings,
        peakHours,
        peakPercentage: peakHour
          ? Math.round((peakHour[1] / totalBookings) * 100)
          : 0,
        avgDuration: `${Math.floor(avgDurationHours)}h ${Math.round((avgDurationHours % 1) * 60)}m`,
        retentionRate: 0, // TODO: Implement later
      },
      charts: {
        hourlyDistribution,
        revenueByDay: last7Days,
        occupancyByLocation,
      },
      recentBookings,
      spots,
    });
  } catch (error) {
    next(error);
  }
};
