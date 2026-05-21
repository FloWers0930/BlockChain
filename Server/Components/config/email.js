// backend/src/config/email.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    logger.error("Email transporter verification failed", {
      error: error.message,
    });
  } else {
    logger.info("✅ Email transporter is ready");
  }
});

// ==================== RETRY HELPER ====================
// Implements exponential backoff: 1s, 2s, 4s, 8s, 16s
const sendWithRetry = async (mailOptions, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      if (attempt > 1) {
        logger.info(`📧 Email sent on attempt ${attempt}`);
      }
      return true;
    } catch (error) {
      if (attempt === retries) {
        logger.error(`❌ Email failed after ${retries} attempts`, {
          error: error.message,
          to: mailOptions.to,
        });
        return false;
      }
      const waitTime = delay * Math.pow(2, attempt - 1);
      logger.warn(`📧 Email attempt ${attempt} failed, retrying in ${waitTime}ms`, {
        error: error.message,
      });
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

const sendNewTicketNotification = async (ticket) => {
  const ticketId = (ticket._id || ticket.id).toString();
  const mailOptions = {
    from: `"Statio Nexus Support" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: process.env.SUPPORT_EMAIL,
    subject: `🔔 New Support Ticket #${ticketId.slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">New Support Ticket Received</h2>
        <p><strong>Ticket ID:</strong> ${ticketId.slice(-8)}</p>
        <p><strong>Customer:</strong> ${ticket.customer?.name || "Unknown"} (${ticket.customer?.email || "—"})</p>
        <p><strong>Category:</strong> ${ticket.category || "Other"}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Title:</strong> ${ticket.title || ticket.subject}<br><br>
          <strong>Description:</strong><br>${ticket.description || ticket.message}
        </div>
        <p><a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/support" style="color: #0f766e; font-weight: bold;">View Ticket in Admin Panel →</a></p>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated notification from Statio Nexus.</p>
      </div>
    `,
  };

  return sendWithRetry(mailOptions);
};

const sendSupportReply = async (toEmail, ticket, replyMessage) => {
  const ticketId = (ticket._id || ticket.id).toString();
  const mailOptions = {
    from: `"Statio Nexus Support" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Re: ${ticket.title || ticket.subject} (#${ticketId.slice(-6)})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0f766e;">Statio Nexus Support</h2>
        <p>Hi ${ticket.customer?.name || "Customer"},</p>
        <p>We have replied to your support ticket:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Your Ticket:</strong><br>
          <strong>${ticket.title || ticket.subject}</strong><br>
          ${ticket.description || ticket.message}
        </div>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Our Reply:</strong><br>${replyMessage.replace(/\n/g, "<br>")}
        </div>
        <p>If you have any further questions, feel free to reply to this email.</p>
        <p>Best regards,<br><strong>Statio Nexus Support Team</strong></p>
        <hr>
        <p style="font-size: 12px; color: #666;">Ticket ID: ${ticketId.slice(-8)}</p>
      </div>
    `,
  };

  return sendWithRetry(mailOptions);
};

module.exports = { sendNewTicketNotification, sendSupportReply };
