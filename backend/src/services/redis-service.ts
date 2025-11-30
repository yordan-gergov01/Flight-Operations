import { redisConfig, cacheConfig } from "../config/redis";
import logger from "../utils/logger";
import AppError from "../utils/appError";
import { createClient, RedisClientType } from "redis";

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  async connect(): Promise<void> {
    if (!cacheConfig.enabled) {
      logger.info("Redis is disabled via config");
      return;
    }

    if (this.isConnected) {
      logger.debug("Redis already connected");
      return;
    }

    try {
      this.client = createClient(redisConfig);

      this.client?.on("connect", () => {
        logger.debug("Redis connecting...");
      });

      this.client?.on("ready", () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        logger.info("Redis connection established");
      });

      this.client?.on("error", (err) => {
        this.isConnected = false;
        logger.error("Redis error:", err);
      });

      this.client?.on("end", () => {
        this.isConnected = false;
        logger.warn("Redis connection closed");
      });

      this.client?.on("reconnecting", () => {
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.MAX_RECONNECT_ATTEMPTS) {
          logger.error("Redis: Exceeded maximum reconnection attempts");
        }
      });

      await this.client?.connect();
    } catch (error) {
      this.isConnected = false;
      const message =
        error instanceof Error ? error.message : "Redis connection error";
      logger.error(`Failed to connect to Redis: ${message}`);

      throw new AppError(`Failed to connect to Redis ${message}`, 503);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info("Redis disconnected gracefully");
      } catch (error) {
        logger.error("Error disconnecting Redis:", error);
      }
    }
  }

  getClient(): RedisClientType {
    if (!cacheConfig.enabled) {
      throw new AppError("Redis is disabled", 503);
    }

    if (!this.client || !this.isConnected) {
      throw new AppError("Redis client is not connected", 503);
    }

    return this.client;
  }

  isReady(): boolean {
    return cacheConfig.enabled && this.isConnected;
  }

  async ping(): Promise<boolean> {
    try {
      if (!cacheConfig.enabled || !this.client || !this.isConnected) {
        return false;
      }
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      return false;
    }
  }
}
