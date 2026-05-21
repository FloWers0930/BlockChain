// backend/src/modules/auth/auth.controller.js
// Authentication controller - login, refresh token, password change, profile

const User = require("../shared/user.model.js");
const jwt = require("jsonwebtoken");
const logger = require("../../config/logger.js");
const tokenBlacklist = require("../../services/tokenBlacklistService.js");

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ====================== LOGIN ======================
const login = async (req, res, next) => {
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

// ====================== CHANGE PASSWORD ======================
const changePassword = async (req, res, next) => {
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

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

// ====================== GET CURRENT USER ======================
const getMe = async (req, res, next) => {
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

// ====================== LOGOUT ======================
const logout = async (req, res, next) => {
  try {
    // Get the current token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      // Decode token to get expiration time
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          // Add token to blacklist so it can't be used again
          tokenBlacklist.add(token, decoded.exp);
        }
      } catch (e) {
        logger.warn("Failed to decode token for blacklist", { error: e.message });
      }
    }

    logger.info("✅ User logged out", {
      userId: req.user.id,
      role: req.user.role,
    });

    const emitAuditLog = req.app.get("emitAuditLog");
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name || req.user.username,
        userRole: req.user.role,
        action: "logged_out",
        details: `User ${req.user.name || req.user.username} logged out`,
        isCritical: false,
      });
    }

    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

// ====================== REFRESH TOKEN ======================
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingRefreshToken } = req.body;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Check if refresh token is blacklisted (revoked)
    if (tokenBlacklist.isBlacklisted(incomingRefreshToken)) {
      logger.warn("Attempted refresh with blacklisted token");
      return res.status(401).json({
        success: false,
        message: "Refresh token has been revoked. Please login again.",
      });
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
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
      refreshToken: incomingRefreshToken,
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

module.exports = {
  login,
  changePassword,
  getMe,
  logout,
  refreshToken,
};

