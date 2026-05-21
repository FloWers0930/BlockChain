// backend/src/modules/station/station.controller.js
// Station & Booking controller - Public spot browsing + user booking management

const StationSpot = require("../shared/stationSpot.model.js");
const Booking = require("../shared/booking.model.js");

// ==================== PUBLIC ROUTES (No login required) ====================

// Escape regex special characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSpots = async (req, res, next) => {
  try {
    const { location, status, type, page = 1, limit = 50 } = req.query;

    const query = { isActive: true };

    if (location) query.location = { $regex: escapeRegex(location), $options: "i" };
    if (status) query.status = status;
    if (type) query.type = type;

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const skip = (parseInt(page) - 1) * parsedLimit;

    const [spots, total] = await Promise.all([
      StationSpot.find(query)
        .populate("owner", "name username")
        .skip(skip)
        .limit(parsedLimit)
        .sort({ createdAt: -1 }),
      StationSpot.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: spots.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
      spots,
    });
  } catch (error) {
    next(error);
  }
};

const getSpot = async (req, res, next) => {
  try {
    const spot = await StationSpot.findById(req.params.id).populate(
      "owner",
      "name email username",
    );

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: "Station spot not found",
      });
    }

    res.json({ success: true, spot });
  } catch (error) {
    next(error);
  }
};

// ==================== PROTECTED ROUTES (Login required) ====================

const createBooking = async (req, res, next) => {
  try {
    const { spotId, startTime, endTime, vehicle } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Validate that booking start time is not in the past
    const now = new Date();
    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book a time slot in the past",
      });
    }

    const hours = (end - start) / (1000 * 60 * 60);

    const spot = await StationSpot.findById(spotId);
    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Station spot not found" });
    }

    if (spot.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "This station spot is currently not available",
      });
    }

    const totalCost = Math.ceil(hours) * spot.hourlyRate;

    // Use a session for transaction to prevent race conditions
    const session = await require("mongoose").startSession();
    session.startTransaction();

    try {
      const booking = await Booking.create(
        [{
          spot: spotId,
          user: req.user.id,
          startTime: start,
          endTime: end,
          totalCost,
          vehicle,
          status: "pending",
          paymentStatus: "pending",
        }],
        { session }
      );

      // Update station spot status within transaction
      await StationSpot.findByIdAndUpdate(
        spotId,
        { status: "reserved" },
        { session }
      );

      await session.commitTransaction();

      // === AUDIT LOG ===
      const emitAuditLog = req.app.get("emitAuditLog");
      if (emitAuditLog) {
        emitAuditLog({
          user: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: "booking_created",
          details: `New booking created for spot ${spot.spotNumber}`,
          newValue: booking[0],
          isCritical: false,
        });
      }

      // === REAL-TIME NOTIFICATIONS ===
      const notificationService = req.app.get("notificationService");
      if (notificationService) {
        notificationService.sendBookingNotification({
          type: "bookingCreated",
          bookingId: booking[0]._id,
          userId: req.user.id,
          ownerId: spot.owner,
          spotNumber: spot.spotNumber,
          message: `New booking for spot ${spot.spotNumber}`,
        });
      }

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking: booking[0],
      });
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 1000);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ user: req.user.id })
        .populate("spot", "spotNumber location zone hourlyRate type")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Booking.countDocuments({ user: req.user.id }),
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("spot");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not authorized",
      });
    }

    // Verify user authorization: ensure booking user matches current user
    if (booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - you cannot complete this booking",
      });
    }

    if (!["pending", "active"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be completed",
      });
    }

    booking.status = "completed";
    booking.paymentStatus = "paid";
    booking.completedAt = new Date();
    await booking.save();

    // Free up the station spot
    await StationSpot.findByIdAndUpdate(booking.spot, {
      status: "available",
      occupiedSince: null,
    });

    // === REAL-TIME NOTIFICATIONS ===
    const notificationService = req.app.get("notificationService");
    if (notificationService) {
      notificationService.sendBookingNotification({
        type: "bookingCompleted",
        bookingId: booking._id,
        userId: req.user.id,
        message: "Your booking has been completed successfully",
      });
    }

    res.json({
      success: true,
      message: "Booking completed successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// ====================== EXPORT ALL CONTROLLERS ======================
module.exports = {
  getSpots,
  getSpot,
  createBooking,
  getMyBookings,
  completeBooking,
};

