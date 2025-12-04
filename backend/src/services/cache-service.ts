import redisService from "./redis-service";
import { cacheConfig } from "../config/redis";
import logger from "../utils/logger";

class CacheService {
  async set(
    key: string,
    value: any,
    ttl: number = cacheConfig.ttl.medium
  ): Promise<boolean> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        const serialized = JSON.stringify(value);

        await client.setEx(key, ttl, serialized);

        logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
        return true;
      },
      false,
      `set(${key})`
    );
  }

  /**
   * Get value from cache
   * Returns null if not found or on error
   */
  async get<T>(key: string): Promise<T | null> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        const data = await client.get(key);

        if (!data) {
          logger.debug(`Cache MISS: ${key}`);
          return null;
        }

        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(data) as T;
      },
      null,
      `get(${key})`
    );
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        await client.del(key);
        logger.debug(`Cache DELETE: ${key}`);
        return true;
      },
      false,
      `delete(${key})`
    );
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        const keys = await client.keys(pattern);

        if (keys.length > 0) {
          await client.del(keys);
          logger.debug(
            `Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`
          );
          return keys.length;
        }
        return 0;
      },
      0,
      `deletePattern(${pattern})`
    );
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        const result = await client.exists(key);
        return result === 1;
      },
      false,
      `exists(${key})`
    );
  }

  /**
   * Cache-aside pattern
   * Try to get from cache, if not found execute fetchFn
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = cacheConfig.ttl.medium
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();

    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Increment counter (for rate limiting)
   * Returns 0 if Redis is not available
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    if (!redisService.isReady()) {
      logger.warn("Redis not ready, skipping increment operation");
      return 0;
    }

    try {
      const client = redisService.getClient();
      const result = await client.incrBy(key, amount);
      logger.debug(`Cache INCREMENT: ${key} by ${amount} = ${result}`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to increment ${key}: ${message}`);
      return 0;
    }
  }

  /**
   * Set TTL on existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        await client.expire(key, ttl);
        logger.debug(`Cache EXPIRE: ${key} (TTL: ${ttl}s)`);
        return true;
      },
      false,
      `expire(${key})`
    );
  }

  /**
   * Clear all cache (use with caution!)
   */
  async flushAll(): Promise<boolean> {
    return redisService.safeExecute(
      async () => {
        const client = redisService.getClient();
        await client.flushDb();
        logger.warn("Cache FLUSH ALL");
        return true;
      },
      false,
      "flushAll()"
    );
  }
}

const cacheService = new CacheService();

export default cacheService;
