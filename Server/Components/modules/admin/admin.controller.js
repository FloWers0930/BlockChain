// backend/src/modules/admin/admin.controller.js
// Admin controller - dashboard, users, spots, bookings, audit, and settings

const mongoose = require("mongoose");
const User = require("../shared/user.model.js");
const { z } = require("../../middlewares/validate.js");
const StationSpot = require("../shared/stationSpot.model.js");
const Booking = require("../shared/booking.model.js");
const Audit = require("../audit/audit.model.js");
const Settings = require("../shared/settings.model.js");

// Escape regex special characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ==================== DASHBOARD STATS (OPTIMIZED) ====================
const getDashboardStats = async (req, res, next) => {
  try {
    // ✅ STRICT FILTER: Only count mobile app users (exclude platform staff)
    const userQuery = { role: { $nin: ["admin", "owner", "staff"] } };

    // Calculate 7 days ago for the revenue chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      users,
      spots,
      bookings,
      revenue,
      availableSpots,
      occupiedSpots,
      activeBookings,
      revenueChart,
      topLocations,
    ] = await Promise.all([
      User.countDocuments(userQuery),
      StationSpot.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]),
      StationSpot.countDocuments({ status: "available", isActive: true }),
      StationSpot.countDocuments({ status: "occupied", isActive: true }),
      Booking.countDocuments({ status: "active" }),

      // 📊 Revenue Chart Data (Last 7 Days)
      Booking.aggregate([
        {
          $match: { paymentStatus: "paid", createdAt: { $gte: sevenDaysAgo } },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalCost" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 📍 Top Locations Data (By Revenue)
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $lookup: {
            from: "stationspots",
            localField: "spot",
            foreignField: "_id",
            as: "spot",
          },
        },
        { $unwind: { path: "$spot", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$spot.location", "Unknown"] },
            revenue: { $sum: "$totalCost" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        users,
        spots,
        bookings,
        revenue: revenue[0]?.total || 0,
        availableSpots,
        occupiedSpots,
        activeBookings,
        revenueChart: revenueChart || [],
        topLocations: topLocations || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL USERS ====================
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    // ✅ STRICT FILTER: Only fetch mobile app users (exclude platform staff)
    const query = { role: { $nin: ["admin", "owner", "staff"] } };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -passwordHash -salt -twoFactorSecret")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE USER STATUS ====================
const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    // Schema is validated in middleware; keep guard as extra safety.
    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });
    }

    // Prevent modifying platform staff via this endpoint
    const oldUser = await User.findOne({
      _id: req.params.id,
      role: { $nin: ["admin", "owner", "staff"] },
    }).select("name email isActive role");

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or cannot modify platform staff",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true },
    );

    // Emit audit log for sensitive user status change
    const emitAuditLog =
      req.app.locals?.emitAuditLog || req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "user_status_changed",
        details: `User status changed: ${user.email}`,
        oldValue: { isActive: oldUser.isActive },
        newValue: { isActive: user.isActive },
        isCritical: true,
      });
    }

    // Emit socket event for real-time updates
    const io = req.app.locals?.io || req.app.get("io");
    if (io) io.emit("userUpdated", { userId: user._id, isActive });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL STATION SPOTS ====================
const getAllSpots = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [spots, total] = await Promise.all([
      StationSpot.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        // ✅ FIX: Prevents data loss if an owner account was deleted
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "owner.password": 0,
            "owner.refreshToken": 0,
            "owner.twoFactorSecret": 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      StationSpot.countDocuments(),
    ]);

    res.json({
      success: true,
      spots,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL BOOKINGS ====================
const getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "stationspots",
            localField: "spot",
            foreignField: "_id",
            as: "spot",
          },
        },
        // ✅ FIX: Prevents data loss if a user or spot was deleted
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$spot", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "user.password": 0,
            "user.refreshToken": 0,
            "user.twoFactorSecret": 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Booking.countDocuments(),
    ]);

    res.json({
      success: true,
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET AUDIT LOG ====================
const getAuditLog = async (req, res, next) => {
  try {
    const {
      limit = 100,
      action,
      critical,
      search,
      fromDate,
      toDate,
      timezone,
      userId, // ✅ Added for User Activity Timeline modal
    } = req.query;

    const match = {};

    // ✅ Filter by specific user (for the Activity Timeline modal)
    if (userId) {
      match.user = new mongoose.Types.ObjectId(userId);
    }

    if (action) match.action = action;
    if (critical === "true") match.isCritical = true;

    if (search) {
      match.$or = [
        { details: { $regex: escapeRegex(search), $options: "i" } },
        { action: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    // Handle timezone-aware date filtering
    if (fromDate || toDate) {
      match.createdAt = {};

      // Get timezone offset in minutes (default: UTC)
      const tzOffset = timezone ? parseInt(timezone) : 0;
      const offsetMs = tzOffset * 60 * 1000;

      if (fromDate) {
        // Start of day in user's timezone
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        match.createdAt.$gte = new Date(from.getTime() - offsetMs);
      }

      if (toDate) {
        // End of day in user's timezone
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        match.createdAt.$lte = new Date(to.getTime() - offsetMs);
      }
    }

    const activities = await Audit.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "user.password": 0,
          "user.refreshToken": 0,
          "user.twoFactorSecret": 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ success: true, activities, count: activities.length });
  } catch (error) {
    next(error);
  }
};

// ==================== SETTINGS ====================
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const {
      appName,
      supportEmail,
      currency,
      autoCancel,
      waitlist,
      maintenanceMode,
    } = req.body;

    const oldSettings = await Settings.findOne();

    let settings = oldSettings;
    if (!settings) {
      settings = await Settings.create({
        appName,
        supportEmail,
        currency,
        autoCancel,
        waitlist,
        maintenanceMode,
      });
    } else {
      settings.appName = appName || settings.appName;
      settings.supportEmail = supportEmail || settings.supportEmail;
      settings.currency = currency || settings.currency;
      settings.autoCancel = autoCancel ?? settings.autoCancel;
      settings.waitlist = waitlist ?? settings.waitlist;
      settings.maintenanceMode = maintenanceMode ?? settings.maintenanceMode;
      await settings.save();
    }

    const emitAuditLog =
      req.app.locals?.emitAuditLog || req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "settings_updated",
        details: "Admin updated system settings",
        oldValue: oldSettings ? oldSettings.toObject() : null,
        newValue: settings.toObject(),
        isCritical: true,
      });
    }

    // Emit socket event so all admins see the change in real-time
    const io = req.app.locals?.io || req.app.get("io");
    if (io) io.emit("settingsUpdated", settings);

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// ====================== EXPORT ALL CONTROLLERS ======================
module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllSpots,
  getAllBookings,
  getAuditLog,
  getSettings,
  updateSettings,
  updateUserStatusSchema,
};
