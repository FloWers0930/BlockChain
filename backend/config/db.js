// backend/config/db.js
import mongoose from "mongoose";
import logger from "./logger.js";
import { seedDatabase } from "../seed/seedUsers.js";

mongoose.connection.on("error", (err) => {
  logger.error("❌ MongoDB runtime error:", { error: err.message });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("✅ MongoDB reconnected successfully");
});

const connectDB = async (retries = 5, delay = 5000) => {
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 15,
    minPoolSize: 3,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: "majority",
    autoIndex: process.env.NODE_ENV !== "production",
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`🔌 MongoDB connection attempt ${attempt}/${retries}...`);

      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is not defined");
      }

      const conn = await mongoose.connect(process.env.MONGO_URI, options);
      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

      return conn;
    } catch (error) {
      logger.error(`❌ Connection attempt ${attempt} failed:`, {
        error: error.message,
      });

      if (attempt === retries) {
        logger.error("❌ All MongoDB connection attempts failed. Exiting...");
        process.exit(1);
      }

      const backoffDelay = delay * Math.pow(1.5, attempt - 1);
      logger.info(
        `⏳ Retrying in ${Math.round(backoffDelay / 1000)} seconds...`,
      );
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      logger.warn("⚠️ MongoDB already disconnected");
      return;
    }
    await mongoose.connection.close();
    logger.info("✅ MongoDB connection closed gracefully");
  } catch (err) {
    logger.error("❌ Error closing MongoDB connection:", {
      error: err.message,
    });
    throw err;
  }
};

export default connectDB;
