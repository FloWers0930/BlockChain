// backend/seed/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedDatabase } from "./seedUsers.js";
import logger from "./config/logger.js";

dotenv.config();

const runSeed = async () => {
  try {
    logger.info("🚀 Starting standalone database seeder...");

    await connectDB();
    await seedDatabase();

    logger.info("🌱 Seeding completed successfully! 🎉");
  } catch (error) {
    logger.error("❌ Seeding error:", { error: error.message });
    process.exit(1);
  }

  // Graceful shutdown
  try {
    await mongoose.connection.close();
    logger.info("🔌 MongoDB connection closed");
  } catch (err) {
    logger.warn("⚠️ Error while closing MongoDB connection", {
      error: err.message,
    });
  }

  process.exit(0);
};

runSeed();
