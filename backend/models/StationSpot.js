// backend/models/StationSpot.js
import mongoose from "mongoose";

const stationSpotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    spotNumber: {
      type: String,
      required: [true, "Spot number is required"],
      trim: true,
      unique: false,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      index: true,
    },

    address: {
      type: String,
      default: "Metro Manila",
      trim: true,
    },

    zone: {
      type: String,
      required: [true, "Zone is required"],
      trim: true,
      default: "General",
    },

    type: {
      type: String,
      enum: ["compact", "standard", "handicap", "oversized", "ev", "transport", "premium"],
      default: "standard",
    },

    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "maintenance",
        "reserved",
        "pending",
        "rejected",
      ],
      default: "available",
    },

    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [0, "Hourly rate cannot be negative"],
      default: 50,
    },

    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },

    occupiedSince: {
      type: Date,
      default: null,
    },

    hoursOccupied: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ====================== INDEXES ======================
// Prevent duplicate spots in same location/zone/spotNumber
stationSpotSchema.index(
  { location: 1, zone: 1, spotNumber: 1 },
  { unique: true },
);

// Fast query indexes
stationSpotSchema.index({ owner: 1, status: 1 });
stationSpotSchema.index({ location: 1, isActive: 1 });

// ====================== PRE-SAVE HOOK ======================
stationSpotSchema.pre("save", function (next) {
  if (this.isActive === undefined || this.isActive === null) {
    this.isActive = true;
  }
  next();
});

const StationSpot = mongoose.model("StationSpot", stationSpotSchema);

export default StationSpot;
