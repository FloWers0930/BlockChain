// backend/src/modules/auth/auth.routes.js
// Authentication routes

const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  login,
  getMe,
  logout,
  changePassword,
  refreshToken,
} = require("./auth.controller.js");
const { Authenticate } = require("../../middlewares/auth.js");

const router = express.Router();

// Rate limiter for login endpoint - prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 5 attempts per 15 minutes per IP
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for refresh token endpoint - prevent token refresh spam
const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute
  message: {
    success: false,
    message: "Too many token refresh attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ====================== PUBLIC ROUTES ======================
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshLimiter, refreshToken);

// ====================== PROTECTED ROUTES ======================
router.get("/me", Authenticate, getMe);
router.post("/logout", Authenticate, logout);

// Change temporary password (for staff onboarding)
router.post("/change-password", Authenticate, changePassword);

module.exports = router;

