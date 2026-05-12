// backend/routes/adminRoutes.js
import express from "express";
import mongoose from "mongoose";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllSpots,
  getAllBookings,
  getAuditLog,
  getSettings,
  getSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getMyTickets, // ← NEW
} from "../controllers/adminController.js";

const router = express.Router();

// Validate ObjectId
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }
  next();
};

// ====================== PROTECT ROUTES (All logged-in users) ======================
router.use(protect);

// ====================== CUSTOMER ROUTES ======================
router.post("/support/tickets", createSupportTicket);
router.get("/support/my-tickets", getMyTickets); // ← Customers see their own tickets

// ====================== AUDIT LOG (BOTH ADMIN + OWNER) ======================
router.get("/audit", restrictTo("admin", "owner"), getAuditLog);

// ====================== ADMIN ONLY ROUTES ======================
router.use(restrictTo("admin"));

// Dashboard & other admin-only routes
router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", validateObjectId, updateUserStatus);
router.get("/spots", getAllSpots);
router.get("/bookings", getAllBookings);

// Settings & Support Tickets (Admin only)
router.get("/settings", getSettings);
router.get("/support/tickets", getSupportTickets);

// Admin reply to ticket
router.post(
  "/support/tickets/:id/reply",
  validateObjectId,
  replyToSupportTicket,
);

export default router;
