// backend/src/modules/admin/admin.routes.js

const express = require("express");
const mongoose = require("mongoose");
const { Authenticate, restrictTo } = require("../../middlewares/auth.js");
const { validateBody } = require("../../middlewares/validate.js");
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllSpots,
  getAllBookings,
  getAuditLog,
  getSettings,
  updateSettings,
  updateUserStatusSchema,
  updateSettingsSchema,
} = require("./admin.controller.js");

const router = express.Router();

const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }
  next();
};

// All routes require authentication
router.use(Authenticate);

// ─── Owner + Admin routes ─────────────────────────────────────────────────────
// ⚠️ WARNING: Routes defined BEFORE router.use(restrictTo("admin")) below are
// accessible to owners as well. Do NOT add admin-only routes here.
const auditRouter = express.Router();
auditRouter.get("/audit", restrictTo("admin", "owner"), getAuditLog);
router.use(auditRouter);

// ─── Admin-only routes ────────────────────────────────────────────────────────
// ⚠️ WARNING: All routes below are admin-only. Do NOT move routes above
// this middleware unless they are intentionally accessible to owners.
router.use(restrictTo("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch(
  "/users/:id/status",
  validateObjectId,
  validateBody(updateUserStatusSchema),
  updateUserStatus,
);
router.get("/spots", getAllSpots);
router.get("/bookings", getAllBookings);
router.get("/settings", getSettings);
router.put("/settings", validateBody(updateSettingsSchema), updateSettings);

module.exports = router;
