// backend/src/modules/audit/audit.model.js
// Audit log model - tracks all important actions in the system

const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ["admin", "owner", "user", "staff"],
    },

    action: {
      type: String,
      required: true,
      enum: [
        "registered",
        "logged_in",
        "logged_out",
        "token_refreshed",
        "password_changed",
        "user_status_changed",
        "spot_created",
        "spot_updated",
        "spot_deleted",
        "booking_created",
        "booking_completed",
        "booking_updated",
        "booking_cancelled",
        "payment_processed",
        "system_config_changed",
        "settings_updated",
        "staff_created",
        "staff_updated",
        "staff_deleted",
        "support_reply_sent",
      ],
    },

    details: {
      type: String,
      required: true,
      trim: true,
    },

    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    ipAddress: String,
    userAgent: String,

    isCritical: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Make audit records immutable
auditSchema.pre("save", function (next) {
  if (this.isNew) return next();
  next(new Error("Audit records are immutable and cannot be modified"));
});

auditSchema.pre("findOneAndUpdate", function (next) {
  next(new Error("Audit records cannot be updated"));
});

auditSchema.pre("updateOne", function (next) {
  next(new Error("Audit records cannot be updated"));
});

auditSchema.pre("deleteOne", function (next) {
  next(new Error("Audit records cannot be deleted"));
});

// Indexes for fast queries
auditSchema.index({ createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ isCritical: 1 });
auditSchema.index({ user: 1, createdAt: -1 });

const Audit = mongoose.model("Audit", auditSchema);

module.exports = Audit;
