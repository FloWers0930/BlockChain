// backend/config/redis.js
import Redis from "ioredis";
import zlib from "zlib";
import { promisify } from "util";
import logger from "./logger.js";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class StatioNexusRedis extends Redis {
  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST || "localhost";
    const port = parseInt(process.env.REDIS_PORT) || 6379;
    const password = process.env.REDIS_PASSWORD;

    // Prefer REDIS_URL when available (perfect for Docker)
    super(
      redisUrl || {
        host,
        port,
        password,
        db: 0,
      },
    );

    // Production-ready connection settings
    this.options.maxRetriesPerRequest = 3;
    this.options.enableReadyCheck = true;
    this.options.lazyConnect = true;
    this.options.connectTimeout = 10000;
    this.options.commandTimeout = 5000;

    // Safe logging (never logs password)
    this.on("connect", () => {
      logger.info("✅ Redis connected successfully");
    });

    this.on("error", (err) => {
      // Ignore common harmless startup messages
      if (
        err.message.includes("already connecting/connected") ||
        err.message.includes("Connection is closed")
      ) {
        return;
      }
      logger.error("❌ Redis connection error:", { error: err.message });
    });

    this.on("reconnecting", () => {
      logger.warn("⚠️ Redis is reconnecting...");
    });
  }

  /**
   * Set data with Gzip compression (Best for large base64 images, OCR, PDFs)
   */
  async setCompressed(key, value, ttlSeconds = 86400) {
    try {
      const json = JSON.stringify(value);
      const compressed = await gzip(json);
      await this.set(key, compressed, "EX", ttlSeconds);
      return true;
    } catch (error) {
      logger.error("Redis setCompressed error:", { error: error.message });
      return false;
    }
  }

  /**
   * Get and decompress data
   */
  async getCompressed(key) {
    try {
      const data = await this.getBuffer(key);
      if (!data) return null;

      const decompressed = await gunzip(data);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      logger.error("Redis getCompressed error:", { error: error.message });
      return null;
    }
  }

  /**
   * Standard set with TTL
   */
  async setWithTTL(key, value, ttlSeconds = 3600) {
    try {
      await this.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch (error) {
      logger.error("Redis setWithTTL error:", { error: error.message });
      return false;
    }
  }

  /**
   * Standard JSON get
   */
  async getJson(key) {
    try {
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error("Redis getJson error:", { error: error.message });
      return null;
    }
  }
}

// Single instance
const redis = new StatioNexusRedis();

export default redis;
