// backend/controllers/AuthController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ==================== LOGIN ====================
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password are required",
      });
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    }).select("+password");

    if (!user) {
      logger.warn("Failed login attempt — user not found", {
        identifier: normalizedIdentifier,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      logger.warn("Login attempt on disabled account", {
        userId: user._id,
        email: user.email,
      });
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn("Failed login attempt — wrong password", {
        userId: user._id,
        email: user.email,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info("✅ User logged in successfully", {
      userId: user._id,
      role: user.role,
      email: user.email,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: user._id,
        userName: user.name || user.username,
        userRole: user.role,
        action: "logged_in",
        details: `User ${user.name || user.username} logged in successfully`,
        isCritical: false,
      });
    }

    res.json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        role: user.role,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        mustChangePassword: !!user.mustChangePassword,
      },
      message: user.mustChangePassword
        ? "Please change your temporary password on the next screen"
        : "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      logger.warn("Failed password change — wrong current password", {
        userId: user._id,
      });
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    logger.info("✅ Password changed successfully", {
      userId: user._id,
      role: user.role,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: user._id,
        userName: user.name || user.username,
        userRole: user.role,
        action: "password_changed",
        details: `User ${user.name || user.username} changed their password`,
        isCritical: false,
      });
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET CURRENT USER ====================
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        mustChangePassword: !!user.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REFRESH TOKEN ====================
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    const user = await User.findById(userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const newToken = generateToken(user);

    logger.info("✅ Token refreshed successfully", {
      userId: user._id,
      role: user.role,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: user._id,
        userName: user.name || user.username,
        userRole: user.role,
        action: "token_refreshed",
        details: `User ${user.username} refreshed access token`,
        isCritical: false,
      });
    }

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        role: user.role,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      logger.warn("Refresh token failed", { error: error.message });
      return res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid",
      });
    }
    next(error);
  }
};
