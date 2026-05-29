// backend/src/modules/owner/owner.controller.js
const mongoose = require("mongoose");
const { createWorker } = require("tesseract.js");
const { fromBuffer } = require("pdf2pic");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const StationSpot = require("../shared/stationSpot.model.js");
const Booking = require("../shared/booking.model.js");
const Staff = require("../shared/staff.model.js");
const User = require("../shared/user.model.js");

const logger = require("../../config/logger.js");

// ─── Password complexity regex (matches user.model.js) ────────────────────────
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ==================== CIRCUIT BREAKER ====================
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = "CLOSED";
    this.failures = 0;
    this.lastFailureTime = null;
  }

  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error(`Circuit Breaker ${this.name} is OPEN`);
      }
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === "HALF_OPEN") this.state = "CLOSED";
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) this.state = "OPEN";
  }
}

const ocrCircuitBreaker = new CircuitBreaker("OCR");

// ==================== HELPERS ====================
const sendErrorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

// ==================== PERFORM OCR ====================
const performOCR = async (req, res) => {
  const {
    base64,
    type = "image/jpeg",
    category = "Other",
    filename = "document",
  } = req.body;

  logger.info(`📡 OCR request received → ${filename} (${type})`);

  if (!base64 || typeof base64 !== "string") {
    return sendErrorResponse(res, 400, "Valid base64 string is required");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(type)) {
    return sendErrorResponse(
      res,
      400,
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    );
  }

  const base64Size = Buffer.byteLength(base64, "base64");
  const maxSize = 50 * 1024 * 1024;
  if (base64Size > maxSize) {
    return sendErrorResponse(
      res,
      413,
      `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
    );
  }

  let worker = null;

  try {
    const data = await ocrCircuitBreaker.execute(async () => {
      logger.info(`🔍 Starting OCR for ${filename}`);

      const base64Data = base64.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      let imageBuffer = buffer;

      if (type === "application/pdf") {
        logger.info("📄 Converting PDF to image...");
        const pdf2pic = fromBuffer(buffer, {
          density: 300,
          format: "png",
          width: 1200,
          height: 1200,
        });
        const page = await pdf2pic(1);
        imageBuffer = Buffer.from(page.base64, "base64");
      }

      worker = await createWorker("eng", 1, {
        logger: (m) =>
          m.status === "recognizing text" &&
          logger.info(`OCR progress: ${Math.round(m.progress * 100)}%`),
      });

      const result = await worker.recognize(imageBuffer);
      await worker.terminate();
      worker = null;

      return result;
    });

    const extractedText = data.text.trim();
    const confidence = Math.round(data.confidence || 0);

    logger.info(`✅ OCR completed for ${filename}`, { confidence });

    res.json({
      success: true,
      extractedText,
      confidence,
    });
  } catch (error) {
    logger.error("❌ OCR failed", { error: error.message, filename });

    let userMessage =
      "OCR processing failed. Please try again with a clearer document.";
    if (error.message.includes("Circuit Breaker")) {
      userMessage = "OCR service is temporarily unavailable.";
    }

    return sendErrorResponse(res, 503, userMessage);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        logger.warn("Failed to terminate OCR worker", { error: e.message });
      }
    }
  }
};

// ==================== PASSWORD CHANGE ====================
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ownerId = req.user.id;

    if (!currentPassword || !newPassword) {
      return sendErrorResponse(
        res,
        400,
        "Current and new password are required",
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return sendErrorResponse(
        res,
        400,
        "Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character (@$!%*?&)",
      );
    }

    const user = await User.findById(ownerId).select("+password");
    if (!user) return sendErrorResponse(res, 404, "User not found");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendErrorResponse(res, 400, "Current password is incorrect");
    }

    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return sendErrorResponse(
        res,
        400,
        "New password must be different from current password",
      );
    }

    user.password = newPassword;
    await user.save();

    logger.info(`✅ Password changed for owner`, { userId: ownerId });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "password_changed",
        details: "Owner changed their password",
        isCritical: true,
      });
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    logger.error("❌ Change password failed", { error: error.message });
    next(error);
  }
};

// ==================== TWO-FACTOR AUTHENTICATION ====================
const enableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendErrorResponse(res, 404, "User not found");

    const secret = speakeasy.generateSecret({
      name: `Statio-Nexus (${user.email})`,
      length: 20,
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      qrCode: qrCodeUrl,
      secret: secret.base32,
      message: "Scan the QR code with your authenticator app",
    });
  } catch (error) {
    logger.error("2FA enable failed", { error: error.message });
    next(error);
  }
};

const verifyTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return sendErrorResponse(res, 400, "2FA not set up");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (!isValid)
      return sendErrorResponse(res, 400, "Invalid verification code");

    user.twoFactorEnabled = true;
    await user.save();

    logger.info(`✅ 2FA enabled for user`, { userId: req.user.id });
    res.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    logger.error("2FA verify failed", { error: error.message });
    next(error);
  }
};

const disableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendErrorResponse(res, 404, "User not found");

    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    await user.save();

    logger.info(`✅ 2FA disabled for user`, { userId: req.user.id });
    res.json({ success: true, message: "Two-factor authentication disabled" });
  } catch (error) {
    logger.error("2FA disable failed", { error: error.message });
    next(error);
  }
};

// ==================== STAFF CRUD ====================
const getStaff = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const stationStaff = await Staff.find({
      owner: ownerId,
      deletedAt: { $exists: false },
    })
      .select("-passwordHash -salt")
      .lean()
      .sort({ createdAt: -1 });

    const platformUsers = await User.find({
      role: { $in: ["admin", "manager"] },
      _id: { $ne: ownerId },
    })
      .select("-password -passwordHash -salt -twoFactorSecret")
      .lean()
      .sort({ createdAt: -1 });

    const availableStations = await StationSpot.find({
      owner: ownerId,
      deletedAt: { $exists: false },
    })
      .select("_id name code location")
      .lean()
      .sort({ name: 1 });

    const combined = [
      ...platformUsers.map((u) => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        category: u.role.toUpperCase(),
        status: u.isActive !== false ? "active" : "inactive",
        createdAt: u.createdAt,
        lastActive: u.lastLogin || u.updatedAt,
        isPlatform: true,
      })),
      ...stationStaff.map((s) => ({
        ...s,
        category: (s.role || "staff").toUpperCase(),
        status: s.status || "active",
        isActive: !s.deletedAt,
        isPlatform: false,
        lastActive: s.lastLogin || s.updatedAt,
      })),
    ];

    res.json({
      success: true,
      staff: combined,
      availableStations,
    });
  } catch (error) {
    logger.error("❌ Failed to fetch staff list", {
      error: error.message,
      ownerId: req.user.id,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const {
      name,
      username,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      idNumber,
      emergencyContactName,
      emergencyContactPhone,
      role = "attendant",
      password,
      documents = [],
    } = req.body;

    const existing = await Staff.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return sendErrorResponse(res, 409, "Username or email already in use");
    }

    const finalPassword =
      password || `Staff${Math.floor(1000 + Math.random() * 9000)}!`;
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(finalPassword, salt);

    const staff = await Staff.create({
      owner: ownerId,
      name,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone,
      dateOfBirth,
      gender,
      address,
      idNumber,
      emergencyContactName,
      emergencyContactPhone,
      role,
      passwordHash,
      salt,
      documents: documents.map((doc) => ({
        id: doc.id || crypto.randomUUID(),
        name: doc.name,
        category: doc.category || "Other",
        base64: doc.base64,
        uploadedAt: new Date(),
      })),
    });

    logger.info(`✅ Staff created: ${staff.name} (${staff.role})`, {
      ownerId,
      staffId: staff._id,
    });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "staff_created",
        details: `Created new staff member: ${staff.name} (${staff.role})`,
        newValue: { name: staff.name, email: staff.email, role: staff.role },
        isCritical: false,
      });
    }

    const io = req.app.locals.io;
    if (io) io.emit("staffCreated", { staffId: staff._id });

    res.status(201).json({ success: true, staff });
  } catch (error) {
    if (error.code === 11000) {
      return sendErrorResponse(res, 409, "Email or username already exists");
    }
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const {
      name,
      phone,
      role,
      address,
      status,
      gender,
      dateOfBirth,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    const allowedUpdates = {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(role !== undefined && { role }),
      ...(address !== undefined && { address }),
      ...(status !== undefined && { status }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(emergencyContactName !== undefined && { emergencyContactName }),
      ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
    };

    const staff = await Staff.findOneAndUpdate(
      { _id: id, owner: ownerId, deletedAt: { $exists: false } },
      allowedUpdates,
      { new: true, runValidators: true },
    ).select("-passwordHash -salt");

    if (!staff) return sendErrorResponse(res, 404, "Staff not found");

    logger.info(`✅ Staff updated: ${staff.name}`, { staffId: id, ownerId });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "staff_updated",
        details: `Updated staff: ${staff.name}`,
        isCritical: false,
      });
    }

    const io = req.app.locals.io;
    if (io) io.emit("staffUpdated", { staffId: staff._id });

    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const staff = await Staff.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!staff) return sendErrorResponse(res, 404, "Staff not found");

    logger.info(`✅ Staff soft-deleted: ${staff.name}`, {
      staffId: id,
      ownerId,
    });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "staff_deleted",
        details: `Soft-deleted staff: ${staff.name}`,
        isCritical: false,
      });
    }

    const io = req.app.locals.io;
    if (io) io.emit("staffDeleted", { staffId: staff._id });

    res.json({ success: true, message: "Staff deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// ==================== STATION SPOTS ====================
const getOwnerSpots = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = (page - 1) * limit;

    const [spots, total] = await Promise.all([
      // ✅ Only fetch non-deleted spots
      StationSpot.find({ owner: ownerId, deletedAt: { $exists: false } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StationSpot.countDocuments({
        owner: ownerId,
        deletedAt: { $exists: false },
      }),
    ]);

    res.json({
      success: true,
      count: spots.length,
      spots,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const createSpot = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const {
      location,
      address,
      zone,
      hourlyRate,
      totalSpots,
      status = "available",
      spotNumber,
    } = req.body;

    const count = parseInt(totalSpots) || 1;
    const emitAuditLog = req.app.locals?.emitAuditLog;
    const io = req.app.locals?.io;

    if (count > 1) {
      const spots = Array.from({ length: count }, (_, i) => ({
        owner: ownerId,
        spotNumber: `S-${Date.now()}-${i + 1}`,
        location: location?.trim(),
        address: address?.trim(),
        zone: zone?.trim() || "General",
        hourlyRate: parseFloat(hourlyRate) || 50,
        status,
        isEnabled: true,
      }));

      const createdSpots = await StationSpot.insertMany(spots);

      if (typeof emitAuditLog === "function") {
        try {
          await emitAuditLog({
            user: ownerId,
            userName: req.user.name || req.user.username || "Owner",
            userRole: req.user.role || "owner",
            action: "spot_created",
            details: `Created station "${location}" with ${count} spot(s) at ${address}`,
            newValue: {
              location: location?.trim(),
              address: address?.trim(),
              zone: zone?.trim() || "General",
              hourlyRate: parseFloat(hourlyRate) || 50,
              totalSpots: count,
            },
            isCritical: false,
          });
        } catch (auditErr) {
          logger.error("Failed to log station creation", {
            error: auditErr.message,
          });
        }
      }

      if (io && typeof io.emit === "function") {
        io.emit("newLocationRequest", {
          station: location?.trim(),
          address: address?.trim(),
          spots: count,
          owner: ownerId,
        });
      }

      return res.status(201).json({
        success: true,
        message: `Successfully created ${count} spot(s) for station "${location}"`,
        count,
        spots: createdSpots,
      });
    }

    const spot = await StationSpot.create({
      ...req.body,
      owner: ownerId,
      spotNumber: spotNumber || `S-${Date.now()}-1`,
      location: location?.trim(),
      address: address?.trim(),
      zone: zone?.trim() || "General",
      hourlyRate: parseFloat(hourlyRate) || 50,
      isEnabled: true,
    });

    if (typeof emitAuditLog === "function") {
      try {
        await emitAuditLog({
          user: ownerId,
          userName: req.user.name || req.user.username || "Owner",
          userRole: req.user.role || "owner",
          action: "spot_created",
          details: `Created station spot ${spot.spotNumber}`,
          newValue: { spotNumber: spot.spotNumber, location: spot.location },
          isCritical: false,
        });
      } catch (auditErr) {
        logger.error("Failed to log spot creation", {
          error: auditErr.message,
        });
      }
    }

    if (io && typeof io.emit === "function") {
      io.emit("spotCreated", { spot });
    }

    res.status(201).json({ success: true, spot });
  } catch (error) {
    logger.error("❌ Failed to create spot(s)", { error: error.message });
    next(error);
  }
};

const updateSpot = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    // ✅ Whitelist allowed fields for spots (Security)
    const { location, address, zone, hourlyRate, status, isEnabled } = req.body;

    const allowedUpdates = {
      ...(location !== undefined && { location: location.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(zone !== undefined && { zone: zone.trim() || "General" }),
      ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
      ...(status !== undefined && { status }),
      ...(isEnabled !== undefined && { isEnabled }),
    };

    // ✅ Prevent updating soft-deleted spots
    const spot = await StationSpot.findOneAndUpdate(
      { _id: id, owner: ownerId, deletedAt: { $exists: false } },
      allowedUpdates,
      { new: true, runValidators: true },
    );

    if (!spot) return sendErrorResponse(res, 404, "Station spot not found");

    logger.info(`✅ Station spot updated: ${spot.spotNumber}`, {
      spotId: id,
      ownerId,
    });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "spot_updated",
        details: `Updated station spot ${spot.spotNumber}`,
        isCritical: false,
      });
    }

    const io = req.app.locals.io;
    if (io) io.emit("spotUpdated", { spot });

    res.json({ success: true, spot });
  } catch (error) {
    next(error);
  }
};

const deleteSpot = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const spot = await StationSpot.findOneAndUpdate(
      { _id: id, owner: ownerId, deletedAt: { $exists: false } },
      { deletedAt: new Date(), status: "deleted" },
      { new: true },
    );

    if (!spot) return sendErrorResponse(res, 404, "Station spot not found");

    logger.info(`✅ Station spot soft-deleted: ${spot.spotNumber}`, {
      spotId: id,
      ownerId,
    });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "spot_deleted",
        details: `Soft-deleted station spot ${spot.spotNumber}`,
        isCritical: false,
      });
    }

    const io = req.app.locals.io;
    if (io) io.emit("spotDeleted", { spotId: id });

    res.json({ success: true, message: "Station spot deleted" });
  } catch (error) {
    next(error);
  }
};

// ==================== BOOKINGS ====================
const getOwnerBookings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.aggregate([
        {
          $lookup: {
            from: "stationspots",
            localField: "spot",
            foreignField: "_id",
            as: "spot",
          },
        },
        { $unwind: "$spot" },
        {
          $match: {
            "spot.owner": new mongoose.Types.ObjectId(ownerId),
            "spot.deletedAt": { $exists: false }, // Ignore deleted spots
          },
        },
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
            user: { name: 1, email: 1 },
            spot: { spotNumber: 1, location: 1 },
            status: 1,
            startTime: 1,
            endTime: 1,
            totalCost: 1,
            paymentStatus: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Booking.aggregate([
        {
          $lookup: {
            from: "stationspots",
            localField: "spot",
            foreignField: "_id",
            as: "spot",
          },
        },
        { $unwind: "$spot" },
        {
          $match: {
            "spot.owner": new mongoose.Types.ObjectId(ownerId),
            "spot.deletedAt": { $exists: false },
          },
        },
        { $count: "total" },
      ]),
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        total: total[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SETTINGS ====================
const getOwnerSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("settings");
    res.json({ success: true, settings: user?.settings || {} });
  } catch (error) {
    next(error);
  }
};

const updateOwnerSettings = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings: req.body } },
      { new: true, runValidators: true },
    ).select("settings");

    logger.info(`✅ Owner settings updated`, { userId: req.user.id });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "settings_updated",
        details: "Owner updated business settings",
        isCritical: false,
      });
    }

    res.json({ success: true, settings: user.settings });
  } catch (error) {
    next(error);
  }
};

// ====================== EXPORT ALL CONTROLLERS ======================
module.exports = {
  getOwnerSpots,
  createSpot,
  updateSpot,
  deleteSpot,
  getOwnerBookings,
  getOwnerSettings,
  updateOwnerSettings,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  performOCR,
  changePassword,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
};
