// backend/routes/analyticsRoutes.js
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { getOwnerAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

// ====================== PROTECTED ROUTES ======================
// Only Owner and Admin can access analytics
router.use(protect, restrictTo("owner", "admin"));

router.get("/", getOwnerAnalytics);

export default router;
