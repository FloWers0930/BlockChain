// backend/src/modules/owner/owner.routes.js
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { Authenticate, restrictTo } = require("../../middlewares/auth.js");
const {
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
  getDashboardAnalytics, // ✅ Added Dashboard Analytics
} = require("./owner.controller.js");

const router = express.Router();

// Rate limiter for OCR endpoint - prevent resource exhaustion
const ocrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour per IP
  message: {
    success: false,
    message: "Too many OCR requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }
  next();
};

// ── Protect all routes below ─────────────────────────────────────────────────
router.use(Authenticate, restrictTo("owner", "admin"));

// ── Dashboard Analytics ──────────────────────────────────────────────────────
router.get("/analytics", getDashboardAnalytics);

// ── Staff Management ─────────────────────────────────────────────────────────
router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", validateObjectId, updateStaff);
router.delete("/staff/:id", validateObjectId, deleteStaff);

// ── Document OCR ─────────────────────────────────────────────────────────────
router.post("/documents/ocr", ocrLimiter, performOCR);

// ── Station Spots ────────────────────────────────────────────────────────────
router.get("/spots", getOwnerSpots);
router.post("/spots", createSpot);
router.patch("/spots/:id", validateObjectId, updateSpot);
router.delete("/spots/:id", validateObjectId, deleteSpot);

// ── Bookings ─────────────────────────────────────────────────────────────────
router.get("/bookings", getOwnerBookings);

// ── Settings ─────────────────────────────────────────────────────────────────
router.get("/settings", getOwnerSettings);
router.put("/settings", updateOwnerSettings);

// ── Security & 2FA ───────────────────────────────────────────────────────────
router.post("/change-password", changePassword);
router.post("/enable-2fa", enableTwoFactor);
router.post("/verify-2fa", verifyTwoFactor);
router.post("/disable-2fa", disableTwoFactor);

module.exports = router;
