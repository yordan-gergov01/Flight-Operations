import { Request, Response, NextFunction } from "express";

import cacheService from "../services/cache-service";

import { cacheConfig } from "../config/redis";
import logger from "../utils/logger";

/**
 * Middleware for automatic caching of GET requests
 */
export const cacheMiddleware = (
  prefix: string = cacheConfig.prefixes.api,
  ttl: number = cacheConfig.ttl.medium
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    try {
      // unique cache key based on URL and query params
      const cacheKey = `${prefix}${req.originalUrl || req.url}`;

      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        logger.debug(`Serving from cache: ${cacheKey}`);
        return res.status(200).json(cachedResponse);
      }

      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttl).catch((err) => {
            logger.error("Failed to cache response:", err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error:", error);
      next();
    }
  };
};

/**
 * Middleware to invalidate cache after POST/PUT/DELETE operations
 */
export const invalidateCacheMiddleware = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.deletePattern(pattern).catch((err) => {
          logger.error("Failed to invalidate cache:", err);
        });
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Custom cache middleware for specific use cases
 * Use this when you need more control over caching logic
 */
export const customCache = (options: {
  keyGenerator: (req: Request) => string;
  ttl?: number;
  condition?: (req: Request) => boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.condition && !options.condition(req)) {
        return next();
      }

      const cacheKey = options.keyGenerator(req);
      const ttl = options.ttl || cacheConfig.ttl.medium;

      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        logger.debug(`Custom cache HIT: ${cacheKey}`);
        return res.status(200).json(cachedResponse);
      }

      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttl).catch((err) => {
            logger.error("Failed to cache response:", err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error("Custom cache middleware error:", error);
      next();
    }
  };
};
