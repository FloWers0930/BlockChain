// backend/routes/ownerRoutes.js
import express from "express";
import mongoose from "mongoose";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
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
  enableTwoFactor, // ← NEW
  verifyTwoFactor, // ← NEW
  disableTwoFactor, // ← NEW
} from "../controllers/ownerController.js";

const router = express.Router();

// ====================== HELPER: VALIDATE MONGO ID ======================
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }
  next();
};

// ====================== PROTECT ALL OWNER ROUTES ======================
// Admin can also access owner routes (full management access)
router.use(protect, restrictTo("owner", "admin"));

// ====================== STAFF MANAGEMENT ROUTES ======================
router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", validateObjectId, updateStaff);
router.delete("/staff/:id", validateObjectId, deleteStaff);

// ====================== NEW: OCR DOCUMENT SCANNING ======================
router.post("/documents/ocr", performOCR);

// ====================== STATION SPOTS ROUTES ======================
router.get("/spots", getOwnerSpots);
router.post("/spots", createSpot);
router.patch("/spots/:id", validateObjectId, updateSpot);
router.delete("/spots/:id", validateObjectId, deleteSpot);

// ====================== BOOKINGS ROUTES ======================
router.get("/bookings", getOwnerBookings);

// ====================== SETTINGS ROUTES ======================
router.get("/settings", getOwnerSettings);
router.put("/settings", updateOwnerSettings);

// ====================== SECURITY ROUTES ======================
router.post("/change-password", changePassword);
router.post("/enable-2fa", enableTwoFactor);
router.post("/verify-2fa", verifyTwoFactor);
router.post("/disable-2fa", disableTwoFactor);

export default router;
