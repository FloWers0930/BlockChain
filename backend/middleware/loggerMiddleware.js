// backend/middleware/loggerMiddleware.js
import logger from "../config/logger.js";

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const logData = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip: ip || req.socket.remoteAddress,
      userAgent: headers["user-agent"],
      userId: req.user ? req.user.id : null,
      username: req.user ? req.user.username : null,
      role: req.user ? req.user.role : null,
    };

    // Choose log level based on status code
    if (statusCode >= 500) {
      logger.error(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        logData,
      );
    } else if (statusCode >= 400) {
      logger.warn(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        logData,
      );
    } else if (statusCode >= 300) {
      logger.info(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        logData,
      );
    } else {
      logger.http(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        logData,
      );
    }
  });

  next();
};

export default loggerMiddleware;
