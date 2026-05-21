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

router.use(Authenticate, restrictTo("owner", "admin"));

router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", validateObjectId, updateStaff);
router.delete("/staff/:id", validateObjectId, deleteStaff);

router.post("/documents/ocr", ocrLimiter, performOCR);

router.get("/spots", getOwnerSpots);
router.post("/spots", createSpot);
router.patch("/spots/:id", validateObjectId, updateSpot);
router.delete("/spots/:id", validateObjectId, deleteSpot);

router.get("/bookings", getOwnerBookings);

router.get("/settings", getOwnerSettings);
router.put("/settings", updateOwnerSettings);

router.post("/change-password", changePassword);
router.post("/enable-2fa", enableTwoFactor);
router.post("/verify-2fa", verifyTwoFactor);
router.post("/disable-2fa", disableTwoFactor);

module.exports = router;

