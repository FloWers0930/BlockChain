// backend/config/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    logger.error("Email transporter verification failed", {
      error: error.message,
    });
  } else {
    logger.info("✅ Email transporter is ready");
  }
});

// Send email when customer creates a new support ticket
export const sendNewTicketNotification = async (ticket) => {
  const mailOptions = {
    from: `"Statio Nexus Support" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: process.env.SUPPORT_EMAIL,
    subject: `🔔 New Support Ticket #${(ticket._id || ticket.id).toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">New Support Ticket Received</h2>
        
        <p><strong>Ticket ID:</strong> ${(ticket._id || ticket.id).toString().slice(-8)}</p>
        <p><strong>Customer:</strong> ${ticket.customer?.name || "Unknown"} (${ticket.customer?.email || "—"})</p>
        <p><strong>Category:</strong> ${ticket.category || "Other"}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Title:</strong> ${ticket.title || ticket.subject}<br><br>
          <strong>Description:</strong><br>
          ${ticket.description || ticket.message}
        </div>
        
        <p><a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/support" style="color: #0f766e; font-weight: bold;">View Ticket in Admin Panel →</a></p>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          This is an automated notification from Statio Nexus.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(
      `📧 New ticket notification sent for ticket ${ticket._id || ticket.id}`,
    );
    return true;
  } catch (error) {
    logger.error("❌ Failed to send new ticket email", {
      error: error.message,
    });
    return false;
  }
};

// Send reply email to customer
export const sendSupportReply = async (toEmail, ticket, replyMessage) => {
  const mailOptions = {
    from: `"Statio Nexus Support" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Re: ${ticket.title || ticket.subject} (#${(ticket._id || ticket.id).toString().slice(-6)})`,
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
          <strong>Our Reply:</strong><br>
          ${replyMessage.replace(/\n/g, "<br>")}
        </div>
        
        <p>If you have any further questions, feel free to reply to this email.</p>
        
        <p>Best regards,<br>
        <strong>Statio Nexus Support Team</strong></p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          Ticket ID: ${(ticket._id || ticket.id).toString().slice(-8)}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`📧 Reply email sent to ${toEmail}`);
    return true;
  } catch (error) {
    logger.error("❌ Failed to send reply email", { error: error.message });
    return false;
  }
};

export default { sendNewTicketNotification, sendSupportReply };
