// backend/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import logger from "../config/logger.js";

/**
 * General API rate limiter
 * Applied to all /api routes
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) ||
    (process.env.NODE_ENV === "production" ? 100 : 1000),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") {
      // Skip rate limiting for heavy development endpoints
      const skipPaths = [
        "/api/owner/settings",
        "/api/admin/stats",
        "/api/analytics",
      ];
      return skipPaths.some((path) => req.path.startsWith(path));
    }
    return false;
  },
});

/**
 * Strict limiter for login / auth endpoints
 * (applied inside authRoutes.js)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Auth rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
    });
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later.",
    });
  },
});

/**
 * Very strict limiter for password changes
 */
export const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: "Too many password change attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Password change rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id || "unknown",
    });
    res.status(429).json({
      success: false,
      message: "Too many password change attempts, please try again later.",
    });
  },
});
