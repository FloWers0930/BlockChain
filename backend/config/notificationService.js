// backend/config/notificationService.js
import redis from "./redis.js";
import logger from "./logger.js";

class NotificationService {
  constructor(io) {
    this.io = io;
    this.subscriber = redis.duplicate();
    this.isPubSubEnabled = false;

    // Initialize immediately (server.js already ensures Redis is ready)
    this.initializeSubscriber();
  }

  async initializeSubscriber() {
    try {
      if (this.subscriber.status !== "ready") {
        await this.subscriber.connect();
      }

      logger.info("✅ Redis Pub/Sub subscriber connected");

      await this.subscriber.subscribe(
        "notifications:global",
        "notifications:audit",
        "notifications:booking",
        "notifications:spot",
        "notifications:staff",
      );

      this.subscriber.on("message", (channel, message) => {
        try {
          const payload = JSON.parse(message);
          this.handleIncomingNotification(channel, payload);
          this.broadcastFallback(channel, payload);
        } catch (err) {
          logger.error(`Failed to parse notification from ${channel}`, {
            module: "notification",
            error: err.message,
          });
        }
      });

      this.isPubSubEnabled = true;
      logger.info(
        "✅ Pub/Sub channels subscribed successfully (Redis mode active)",
      );
    } catch (error) {
      this.isPubSubEnabled = false;
      logger.warn(
        "Redis Pub/Sub initialization failed → using In-Memory fallback",
        {
          error: error.message,
        },
      );
      logger.info("NotificationService running in In-Memory Socket.IO mode");
    }
  }

  handleIncomingNotification(channel, payload) {
    const type = payload.type || "unknown";
    logger.info(`📨 RECEIVED ${type} notification`, {
      module: "notification",
      channel,
      type,
      userId: payload.userId || payload.ownerId || "global",
    });
  }

  // ====================== PUBLISH WITH SMART FALLBACK ======================
  async publish(channel, payload) {
    if (this.isPubSubEnabled) {
      try {
        await redis.publish(channel, JSON.stringify(payload));
        logger.info(`📤 PUBLISHED → ${channel}`, { module: "notification" });
        return true;
      } catch (error) {
        logger.warn(`Redis publish failed on ${channel} → falling back`, {
          module: "notification",
          error: error.message,
        });
        this.isPubSubEnabled = false;
      }
    }

    // In-Memory fallback
    logger.info(`📤 FALLBACK → ${channel} (In-Memory Socket.IO)`, {
      module: "notification",
    });
    this.broadcastFallback(channel, payload);
    return false;
  }

  broadcastFallback(channel, payload) {
    switch (channel) {
      case "notifications:global":
        this.io.emit("notification", payload);
        break;

      case "notifications:audit":
        this.io.to("audit-room").emit("auditLogUpdated", payload);
        break;

      case "notifications:booking":
        if (payload.userId)
          this.io.to(`user:${payload.userId}`).emit("bookingUpdated", payload);
        if (payload.ownerId)
          this.io
            .to(`owner:${payload.ownerId}`)
            .emit("bookingUpdated", payload);
        break;

      case "notifications:spot":
        if (payload.ownerId)
          this.io.to(`owner:${payload.ownerId}`).emit("spotUpdated", payload);
        break;

      case "notifications:staff":
        if (payload.ownerId)
          this.io.to(`owner:${payload.ownerId}`).emit("staffUpdated", payload);
        break;

      default:
        this.io.emit("notification", payload);
    }
  }

  // ====================== PUBLIC CONVENIENCE METHODS ======================
  async sendGlobalNotification(notification) {
    return this.publish("notifications:global", {
      type: "global",
      timestamp: new Date(),
      ...notification,
    });
  }

  async sendAuditNotification(auditData) {
    return this.publish("notifications:audit", auditData);
  }

  async sendBookingNotification(data) {
    return this.publish("notifications:booking", {
      type: "booking",
      timestamp: new Date(),
      ...data,
    });
  }

  async sendSpotNotification(data) {
    return this.publish("notifications:spot", {
      type: "spot",
      timestamp: new Date(),
      ...data,
    });
  }

  async sendStaffNotification(data) {
    return this.publish("notifications:staff", {
      type: "staff",
      timestamp: new Date(),
      ...data,
    });
  }

  getStatus() {
    return {
      pubSubEnabled: this.isPubSubEnabled,
      mode: this.isPubSubEnabled ? "Redis Pub/Sub" : "In-Memory Fallback",
    };
  }
}

export default NotificationService;
