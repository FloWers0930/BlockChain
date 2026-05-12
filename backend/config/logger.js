// backend/config/logger.js
import winston from "winston";
import "winston-daily-rotate-file";
import { MongoDB } from "winston-mongodb";
import dotenv from "dotenv";

dotenv.config();

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

const transports = [
  // Console (always)
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format,
  }),

  // Daily rotating file logs
  new winston.transports.DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "info",
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json(),
    ),
  }),

  // Error logs only
  new winston.transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json(),
    ),
  }),
];

// MongoDB audit & error logging (if MONGO_URI exists)
if (process.env.MONGO_URI) {
  transports.push(
    new MongoDB({
      db: process.env.MONGO_URI,
      collection: "logs",
      level: "info",
      options: { useUnifiedTopology: true },
      metaKey: "meta",
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format: winston.format.json(),
  transports,
  exitOnError: false,
});

export default logger;
