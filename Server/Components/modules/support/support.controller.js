// backend/src/modules/support/support.controller.js
// Support ticket controller

const { z } = require("../../middlewares/validate.js");
const SupportTicket = require("./supportTicket.model.js");
const emailService = require("../../config/email.js");
const logger = require("../../config/logger.js");

const getSupportTickets = async (req, res, next) => {
  try {
    // Only allow admins or support staff to view all tickets
    if (req.user.role !== "admin" && req.user.role !== "support") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view support tickets",
      });
    }

    const tickets = await SupportTicket.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

const createSupportTicket = async (req, res, next) => {
  try {
    const { title, description, category = "other" } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const ticket = await SupportTicket.create({
      customer: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      status: "open",
    });

    await ticket.populate("customer", "name email");

    let emailSent = false;
    try {
      emailSent = await emailService.sendNewTicketNotification(ticket);
    } catch (emailErr) {
      logger.warn("Failed to send support ticket email", {
        ticketId: ticket._id,
        error: emailErr.message,
      });
      // Don't fail the ticket creation if email fails - still create the ticket
    }

    const io = req.app.locals.io;
    if (io) io.emit("newSupportTicket", ticket);

    logger.info("✅ Support ticket created", {
      ticketId: ticket._id,
      customer: ticket.customer?.email,
      emailSent,
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
      emailSent,
    });
  } catch (error) {
    next(error);
  }
};

const replyToSupportTicketSchema = z.object({
  message: z.string().trim().min(1),
  status: z.string().optional(),
  sendEmail: z.coerce.boolean().optional(),
});

const replyToSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, status, sendEmail = true } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Reply message is required" });
    }

    const ticket = await SupportTicket.findById(id).populate(
      "customer",
      "name email",
    );

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Support ticket not found" });
    }

    if (!ticket.replies) ticket.replies = [];
    ticket.replies.push({
      message: message.trim(),
      repliedBy: req.user._id,
      repliedByName: req.user.name || req.user.username || "Admin",
      repliedAt: new Date(),
    });

    if (status) ticket.status = status;
    ticket.lastUpdated = new Date();
    await ticket.save();

    let emailSent = false;
    if (sendEmail && ticket.customer?.email) {
      emailSent = await emailService.sendSupportReply(
        ticket.customer.email,
        ticket,
        message.trim(),
      );
    }

    logger.info("✅ Reply sent to ticket", {
      ticketId: ticket._id,
      repliedBy: req.user.id,
      emailSent,
    });

    const emitAuditLog = req.app.locals.emitAuditLog;
    if (emitAuditLog) {
      emitAuditLog({
        user: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "support_reply_sent",
        details: `Replied to ticket #${ticket._id.toString().slice(-6)}`,
        targetId: ticket._id,
        targetType: "support_ticket",
      });
    }

    res.json({
      success: true,
      message: "Reply sent successfully",
      ticket,
      emailSent,
    });
  } catch (error) {
    logger.error("Error replying to ticket", { error: error.message });
    next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("replies.repliedBy", "name username")
      .lean();

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getMyTickets,
  replyToSupportTicketSchema,
};
