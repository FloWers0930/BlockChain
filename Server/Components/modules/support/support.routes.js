// backend/src/modules/support/support.routes.js
// Support ticket routes

const express = require("express");
const mongoose = require("mongoose");
const { Authenticate, restrictTo } = require("../../middlewares/auth.js");
const { validateBody } = require("../../middlewares/validate.js");
const {
  getSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getMyTickets,
  replyToSupportTicketSchema,
} = require("./support.controller.js");

const router = express.Router();

const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }
  next();
};

router.use(Authenticate);

// Authenticated users
router.post("/support/tickets", createSupportTicket);
router.get("/support/my-tickets", getMyTickets);

// Admin-only support management
router.use(restrictTo("admin"));
router.get("/support/tickets", getSupportTickets);
router.post(
  "/support/tickets/:id/reply",
  validateObjectId,
  validateBody(replyToSupportTicketSchema),
  replyToSupportTicket,
);

module.exports = router;
