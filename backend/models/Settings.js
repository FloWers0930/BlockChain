// backend/models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  appName: {
    type: String,
    default: "Statio Nexus",
  },
  supportEmail: {
    type: String,
    default: "support@stationexus.com",
  },
  currency: {
    type: String,
    default: "PHP (₱)",
  },
  autoCancel: {
    type: Boolean,
    default: true,
  },
  waitlist: {
    type: Boolean,
    default: true,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

settingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
