// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const connectDB = require("./Components/config/db");
const NotificationService = require("./Components/services/notificationService");
const logger = require("./Components/config/logger");
const { initSentry } = require("./Components/config/sentry");
const loggerMiddleware = require("./Components/middlewares/requestLogger");
const { apiLimiter } = require("./Components/middlewares/rateLimiter");
const {
  csrfProtection,
  generateNewCSRFToken,
} = require("./Components/middlewares/csrf");
const errorHandler = require("./Components/middlewares/errorHandler");
const Audit = require("./Components/modules/audit/audit.model");
const authRoutes = require("./Components/modules/auth/auth.routes");
const ownerRoutes = require("./Components/modules/owner/owner.routes");
const stationRoutes = require("./Components/modules/station/station.routes");
const adminRoutes = require("./Components/modules/admin/admin.routes");
const analyticsRoutes = require("./Components/modules/analytics/analytics.routes");
const supportRoutes = require("./Components/modules/support/support.routes");
const auditRoutes = require("./Components/modules/audit/audit.routes");
const transactionRoutes = require("./Components/modules/transaction/transactionRoutes");

const sentry = initSentry();
const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.disable("x-powered-by");
app.set("trust proxy", 1);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);
app.use(compression());
app.use(mongoSanitize());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);
app.use(loggerMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use("/api", apiLimiter);
app.use("/api", csrfProtection);
app.use("/api", generateNewCSRFToken);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/station", stationRoutes);
// Mount support routes before admin routes so customer ticket endpoints
// are not blocked by the admin-only middleware in adminRoutes.
app.use("/api/admin", supportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/api/csrf-token", (req, res) =>
  res.json({ success: true, token: res.locals.csrfToken }),
);
app.get("/api/health", (_req, res) =>
  res.json({ success: true, status: "OK" }),
);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use(errorHandler);

if (sentry) {
  app.use(require("@sentry/node").Handlers.errorHandler());
}

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;

  if (!token || !userId) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET,
    );
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    logger.warn("Invalid Socket.IO token", { error: error.message });
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  logger.info(`🔌 Socket connected: ${socket.id}`, {
    userId: socket.userId,
    role: socket.userRole,
  });

  socket.on("join", (room) => {
    if (typeof room !== "string" || !room.trim()) {
      logger.warn("Invalid room join attempt", { socketId: socket.id, room });
      return;
    }

    const allowJoin = validateRoomAccess(socket, room);
    if (!allowJoin) {
      logger.warn("Unauthorized room join attempt", {
        socketId: socket.id,
        room,
        userId: socket.userId,
      });
      socket.emit("error", { message: "Unauthorized to join this room" });
      return;
    }

    socket.join(room);
    logger.info(`📍 Socket joined room: ${room}`, { socketId: socket.id });
  });

  socket.on("disconnect", () => {
    logger.info(`❌ Socket disconnected: ${socket.id}`);
  });
});

const validateRoomAccess = (socket, room) => {
  if (room.startsWith("public:")) return true;

  if (room.startsWith("user:")) {
    const targetUserId = room.split(":")[1];
    return socket.userId && socket.userId === targetUserId;
  }

  if (room.startsWith("owner:")) {
    const targetOwnerId = room.split(":")[1];
    return (
      socket.userRole &&
      (socket.userRole === "admin" ||
        (socket.userRole === "owner" && socket.userId === targetOwnerId))
    );
  }

  if (room.startsWith("admin:")) {
    return socket.userRole === "admin";
  }

  return false;
};

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  // ✅ UPDATED: Added JWT_REFRESH_SECRET and blockchain vars
  const requiredVars = [
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "MONGO_URI",
    "BESU_RPC_URL",
    "SERVER_WALLET_PRIVATE_KEY",
    "CONTRACT_ADDRESS",
  ];

  const optionalButImportant = [
    "STRIPE_SECRET_KEY",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    logger.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`,
    );
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  // ✅ UPDATED: Check both JWT secrets are strong enough
  if (process.env.JWT_SECRET.length < 32) {
    logger.error(
      "❌ JWT_SECRET must be at least 32 characters long for security",
    );
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    logger.error(
      "❌ JWT_REFRESH_SECRET must be at least 32 characters long for security",
    );
    throw new Error("JWT_REFRESH_SECRET must be at least 32 characters long");
  }

  const missingOptional = optionalButImportant.filter((v) => !process.env[v]);
  if (missingOptional.length > 0) {
    logger.warn(
      `⚠️ Optional environment variables missing: ${missingOptional.join(
        ", ",
      )}. Some features may not work.`,
    );
  }

  logger.info("✅ All required environment variables validated");
};

const start = async () => {
  validateEnvironment();
  await connectDB();

  const notificationService = new NotificationService(io);
  const emitAuditLog = async (entry = {}) => {
    try {
      if (!entry.user || !entry.action || !entry.details) return;

      const audit = await Audit.create({
        user: entry.user,
        userName: entry.userName || "Unknown",
        userRole: entry.userRole || "user",
        action: entry.action,
        details: entry.details,
        oldValue: entry.oldValue ?? null,
        newValue: entry.newValue ?? null,
        isCritical: !!entry.isCritical,
      });

      notificationService.sendAuditNotification({
        id: audit._id,
        action: audit.action,
        details: audit.details,
        userRole: audit.userRole,
        isCritical: audit.isCritical,
        createdAt: audit.createdAt,
      });
    } catch (error) {
      logger.warn(`⚠️ Failed to write audit log: ${error.message}`);
    }
  };

  app.locals.notificationService = notificationService;
  app.locals.emitAuditLog = emitAuditLog;
  app.locals.io = io;

  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error(`❌ Failed to start: ${err.message}`);
  process.exit(1);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
