// backend/routes/stationRoutes.js
import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSpots,
  getSpot,
  createBooking,
  getMyBookings,
  completeBooking,
} from "../controllers/stationController.js";

const router = express.Router();

// Helper to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }
  next();
};

// ====================== PUBLIC ROUTES (No login required) ======================
router.get("/spots", getSpots);
router.get("/spots/:id", validateObjectId, getSpot);

// ====================== PROTECTED ROUTES (Login required) ======================
router.use(protect); // All routes below this line require authentication

router.post("/bookings", createBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/bookings/:id/complete", validateObjectId, completeBooking);

export default router;
