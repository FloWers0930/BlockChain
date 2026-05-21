// backend/src/services/notificationService.js
// Real-time notification service using Socket.IO (In-Memory mode)

const logger = require("../config/logger.js");

class NotificationService {
  constructor(io) {
    this.io = io;
    logger.info("✅ NotificationService running in In-Memory Socket.IO mode");
  }

  // ====================== EMIT DIRECTLY VIA SOCKET.IO ======================
  publish(channel, payload) {
    logger.info(`📤 EMIT → ${channel}`, { module: "notification" });

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
      pubSubEnabled: false,
      mode: "In-Memory Socket.IO",
    };
  }
}

module.exports = NotificationService;

