// backend/routes/authRoutes.js
import express from "express";
import {
  login,
  getMe,
  changePassword,
  refreshToken,
} from "../controllers/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ====================== PUBLIC ROUTES ======================
router.post("/login", login);

// ====================== PROTECTED ROUTES ======================
router.get("/me", protect, getMe);

// Refresh access token (used by frontend axios interceptor)
router.post("/refresh", protect, refreshToken);

// Change temporary password (for staff onboarding)
router.post("/change-password", protect, changePassword);

export default router;
