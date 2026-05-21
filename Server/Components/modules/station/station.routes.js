// backend/src/modules/station/station.routes.js
const express = require("express");
const mongoose = require("mongoose");
const { Authenticate } = require("../../middlewares/auth.js");
const {
  getSpots,
  getSpot,
  createBooking,
  getMyBookings,
  completeBooking,
} = require("./station.controller.js");

const router = express.Router();

const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }
  next();
};

router.get("/spots", getSpots);
router.get("/spots/:id", validateObjectId, getSpot);

router.use(Authenticate);

router.post("/bookings", createBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/bookings/:id/complete", validateObjectId, completeBooking);

module.exports = router;

