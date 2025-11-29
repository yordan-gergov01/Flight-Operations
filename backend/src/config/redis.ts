import { RedisClientOptions } from "redis";
import logger from "../utils/logger";

export const RedisConfig: RedisClientOptions = {
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error("Redis: Too many unsuccessful attempts for connect");
        return new Error("Too much attemts.");
      }

      const delay = Math.min(retries * 100, 3000);
      logger.warn(`Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    },
  },
  password: process.env.REDIS_PASSWORD,
  database: Number(process.env.REDIS_DB || "0"),
  pingInterval: 1000,
};

export const cacheConfig = {
  ttl: {
    short: 5 * 60,
    medium: 30 * 60,
    long: 60 * 60,
    veryLong: 24 * 60 * 60,
  },

  prefixes: {
    user: "user:",
    session: "session:",
    api: "api:",
    data: "data:",
  },

  enabled: process.env.REDIS_ENABLED,
};
