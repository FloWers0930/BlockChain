// backend/controllers/adminController.js
import User from "../models/User.js";
import StationSpot from "../models/StationSpot.js";
import Booking from "../models/Booking.js";
import Audit from "../models/Audit.js";
import Settings from "../models/Settings.js";
import SupportTicket from "../models/SupportTicket.js";
import emailService from "../config/email.js";
import logger from "../config/logger.js";

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      users,
      spots,
      bookings,
      revenue,
      availableSpots,
      occupiedSpots,
      activeBookings,
    ] = await Promise.all([
      User.countDocuments(),
      StationSpot.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]),
      StationSpot.countDocuments({ status: "available", isActive: true }),
      StationSpot.countDocuments({ status: "occupied", isActive: true }),
      Booking.countDocuments({ status: "active" }),
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
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").skip(skip).limit(limit),
      User.countDocuments(),
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
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });
    }

    const oldUser = await User.findById(req.params.id).select(
      "name email isActive role",
    );

    if (!oldUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true },
    ).select("-password");

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "status_changed",
        details: `Changed status of user ${user.name} (${user.email}) to ${
          isActive ? "Active" : "Inactive"
        }`,
        oldValue: { isActive: oldUser.isActive },
        newValue: { isActive: user.isActive },
        isCritical: true,
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL STATION SPOTS ====================
export const getAllSpots = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [spots, total] = await Promise.all([
      StationSpot.find()
        .populate("owner", "name email username")
        .skip(skip)
        .limit(limit),
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
export const getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find()
        .populate("user", "name email")
        .populate("spot", "spotNumber location")
        .skip(skip)
        .limit(limit),
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
export const getAuditLog = async (req, res, next) => {
  try {
    const {
      limit = 100,
      action,
      critical,
      search,
      fromDate,
      toDate,
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (critical === "true") query.isCritical = true;

    if (search) {
      query.$or = [
        { details: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const activities = await Audit.find(query)
      .populate("user", "name username email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, activities, count: activities.length });
  } catch (error) {
    next(error);
  }
};

// ==================== SETTINGS ====================
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
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

    const emitAuditLog = req.app.get("emitAuditLog");
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

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SUPPORT TICKETS (Admin) ====================
export const getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE SUPPORT TICKET (Customer) ====================
export const createSupportTicket = async (req, res, next) => {
  try {
    const { title, description, category = "other" } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const ticket = await SupportTicket.create({
      customer: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      status: "open",
    });

    await ticket.populate("customer", "name email");

    const emailSent = await emailService.sendNewTicketNotification(ticket);

    const io = req.app.get("io");
    if (io) io.emit("newSupportTicket", ticket);

    logger.info(`✅ Support ticket created`, {
      ticketId: ticket._id,
      customer: ticket.customer?.email,
      emailSent,
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
      emailSent,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REPLY TO SUPPORT TICKET ====================
export const replyToSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, status, sendEmail = true } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Reply message is required" });
    }

    const ticket = await SupportTicket.findById(id).populate(
      "customer",
      "name email",
    );

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Support ticket not found" });
    }

    if (!ticket.replies) ticket.replies = [];
    ticket.replies.push({
      message: message.trim(),
      repliedBy: req.user._id,
      repliedByName: req.user.name || req.user.username || "Admin",
      repliedAt: new Date(),
    });

    if (status) ticket.status = status;
    ticket.lastUpdated = new Date();
    await ticket.save();

    let emailSent = false;
    if (sendEmail && ticket.customer?.email) {
      emailSent = await emailService.sendSupportReply(
        ticket.customer.email,
        ticket,
        message.trim(),
      );
    }

    logger.info(`✅ Reply sent to ticket`, {
      ticketId: ticket._id,
      repliedBy: req.user.id,
      emailSent,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "support_reply_sent",
        details: `Replied to ticket #${ticket._id.toString().slice(-6)}`,
        targetId: ticket._id,
        targetType: "support_ticket",
      });
    }

    res.json({
      success: true,
      message: "Reply sent successfully",
      ticket,
      emailSent,
    });
  } catch (error) {
    logger.error("Error replying to ticket", { error: error.message });
    next(error);
  }
};

// ==================== GET MY TICKETS (Customer) ====================
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("replies.repliedBy", "name username")
      .lean();

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};
