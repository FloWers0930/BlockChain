// backend/controllers/ownerController.js
import mongoose from "mongoose";
import { createWorker } from "tesseract.js";
import { fromBuffer } from "pdf2pic";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

import StationSpot from "../models/StationSpot.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";
import redis from "../config/redis.js";
import logger from "../config/logger.js";

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

function extractSuggestedFields(text, category) {
  const fields = {};
  // Add regex extraction logic here as needed
  return fields;
}

// ==================== PERFORM OCR ====================
export const performOCR = async (req, res) => {
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

  const hash = crypto
    .createHash("sha256")
    .update(base64)
    .digest("hex")
    .slice(0, 16);

  const cacheKey = `statio-nexus:ocr:v1:${hash}`;

  try {
    const cached = await redis.getCompressed(cacheKey);
    if (cached) {
      logger.info(`✅ OCR cache hit for ${filename}`);
      return res.json(cached);
    }
  } catch (e) {
    logger.warn("Redis cache read failed", { error: e.message });
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
    const suggestedFields = extractSuggestedFields(extractedText, category);

    const responsePayload = {
      success: true,
      extractedText,
      confidence,
      suggestedFields,
    };

    try {
      await redis.setCompressed(cacheKey, responsePayload, 86400);
      logger.info(`✅ OCR result cached for ${filename}`);
    } catch (e) {
      logger.warn("Redis cache write failed", { error: e.message });
    }

    logger.info(`✅ OCR completed for ${filename}`, { confidence });
    res.json(responsePayload);
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
      } catch (e) {}
    }
  }
};

// ==================== PASSWORD CHANGE ====================
export const changePassword = async (req, res, next) => {
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

    if (newPassword.length < 8) {
      return sendErrorResponse(
        res,
        400,
        "New password must be at least 8 characters long",
      );
    }

    const User = mongoose.model("User");
    const user = await User.findById(ownerId);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendErrorResponse(res, 400, "Current password is incorrect");
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.password = passwordHash;
    await user.save();

    logger.info(`✅ Password changed for owner`, { userId: ownerId });

    const emitAuditLog = req.app.get("emitAuditLog");
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

export const enableTwoFactor = async (req, res, next) => {
  try {
    const User = mongoose.model("User");
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

export const verifyTwoFactor = async (req, res, next) => {
  try {
    const { token } = req.body;
    const User = mongoose.model("User");
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

    if (!isValid) {
      return sendErrorResponse(res, 400, "Invalid verification code");
    }

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

export const disableTwoFactor = async (req, res, next) => {
  try {
    const User = mongoose.model("User");
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
export const getStaff = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const staff = await Staff.find({ owner: ownerId })
      .select("-passwordHash -salt")
      .sort({ createdAt: -1 });

    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
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

    const emitAuditLog = req.app.get("emitAuditLog");
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

    res.status(201).json({ success: true, staff });
  } catch (error) {
    if (error.code === 11000) {
      return sendErrorResponse(res, 409, "Email or username already exists");
    }
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const staff = await Staff.findOneAndUpdate(
      { _id: id, owner: ownerId },
      req.body,
      { new: true, runValidators: true },
    ).select("-passwordHash -salt");

    if (!staff) return sendErrorResponse(res, 404, "Staff not found");

    logger.info(`✅ Staff updated: ${staff.name}`, { staffId: id, ownerId });

    const emitAuditLog = req.app.get("emitAuditLog");
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

    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
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

    const emitAuditLog = req.app.get("emitAuditLog");
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

    res.json({ success: true, message: "Staff deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// ==================== STATION SPOTS ====================
export const getOwnerSpots = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const spots = await StationSpot.find({ owner: ownerId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: spots.length, spots });
  } catch (error) {
    next(error);
  }
};

export const createSpot = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const spot = await StationSpot.create({ ...req.body, owner: ownerId });

    logger.info(`✅ Station spot created: ${spot.spotNumber}`, {
      spotId: spot._id,
      ownerId,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "spot_created",
        details: `Created station spot ${spot.spotNumber}`,
        newValue: spot,
        isCritical: false,
      });
    }

    res.status(201).json({ success: true, spot });
  } catch (error) {
    next(error);
  }
};

export const updateSpot = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const spot = await StationSpot.findOneAndUpdate(
      { _id: id, owner: ownerId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!spot) return sendErrorResponse(res, 404, "Station spot not found");

    logger.info(`✅ Station spot updated: ${spot.spotNumber}`, {
      spotId: id,
      ownerId,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
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

    res.json({ success: true, spot });
  } catch (error) {
    next(error);
  }
};

export const deleteSpot = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const spot = await StationSpot.findOneAndDelete({
      _id: id,
      owner: ownerId,
    });

    if (!spot) return sendErrorResponse(res, 404, "Station spot not found");

    logger.info(`✅ Station spot deleted: ${spot.spotNumber}`, {
      spotId: id,
      ownerId,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "spot_deleted",
        details: `Deleted station spot ${spot.spotNumber}`,
        isCritical: false,
      });
    }

    res.json({ success: true, message: "Station spot deleted" });
  } catch (error) {
    next(error);
  }
};

// ==================== BOOKINGS ====================
export const getOwnerBookings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const limit = parseInt(req.query.limit) || 300;

    const bookings = await Booking.find({
      spot: {
        $in: await StationSpot.find({ owner: ownerId }).select("_id"),
      },
    })
      .populate("user", "name email")
      .populate("spot", "spotNumber location")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// ==================== SETTINGS ====================
export const getOwnerSettings = async (req, res, next) => {
  try {
    const user = await mongoose
      .model("User")
      .findById(req.user.id)
      .select("settings");

    res.json({ success: true, settings: user?.settings || {} });
  } catch (error) {
    next(error);
  }
};

export const updateOwnerSettings = async (req, res, next) => {
  try {
    const user = await mongoose
      .model("User")
      .findByIdAndUpdate(
        req.user.id,
        { $set: { settings: req.body } },
        { new: true, runValidators: true },
      )
      .select("settings");

    logger.info(`✅ Owner settings updated`, { userId: req.user.id });

    const emitAuditLog = req.app.get("emitAuditLog");
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

// ==================== DEFAULT EXPORT ====================
export default {
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
