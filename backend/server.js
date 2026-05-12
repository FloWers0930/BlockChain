// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import connectDB from "./config/db.js";
import redis from "./config/redis.js";
import NotificationService from "./config/notificationService.js";
import logger from "./config/logger.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/authRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();

// ====================== SECURITY & PERFORMANCE ======================
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(loggerMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", apiLimiter);

// ====================== ROUTES ======================
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/station", stationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (req, res) => res.json({ success: true, status: "OK" }));

// ====================== HTTP + SOCKET.IO ======================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

let isRedisConnected = false;
const subClient = redis.duplicate();

// Robust Redis + Adapter initialization
const initializeRedis = async () => {
  try {
    logger.info("🔄 Initializing Redis Adapter...");

    // Only connect if not already connecting/ready
    if (!["ready", "connecting"].includes(redis.status)) {
      logger.info("Connecting main Redis client...");
      await redis.connect();
    } else {
      logger.info(`Main Redis client already ${redis.status}`);
    }

    if (!["ready", "connecting"].includes(subClient.status)) {
      logger.info("Connecting Redis subscriber...");
      await subClient.connect();
    } else {
      logger.info(`Subscriber already ${subClient.status}`);
    }

    io.adapter(createAdapter(redis, subClient));
    isRedisConnected = true;

    logger.info("✅ Redis Adapter connected successfully (Full Pub/Sub mode)");
    return true;
  } catch (err) {
    logger.error("❌ Redis Adapter failed to initialize:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    isRedisConnected = false;
    return false;
  }
};

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;

Promise.all([connectDB(), initializeRedis()])
  .then(() => {
    const notificationService = new NotificationService(io);
    app.set("notificationService", notificationService);
    app.set("io", io);

    server.listen(PORT, () => {
      logger.info(
        `🚀 Statio Nexus server started successfully on port ${PORT}`,
      );
      logger.info(
        `🔄 WebSocket Mode: ${isRedisConnected ? "✅ Redis Pub/Sub (Full Features)" : "⚠️ In-Memory Fallback"}`,
      );
    });
  })
  .catch((err) => {
    logger.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  });

// Simple graceful shutdown
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
