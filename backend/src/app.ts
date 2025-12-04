import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import AppError from "./utils/appError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import logger from "./utils/logger";
import redisService from "./services/redis-service";

import userRouter from "./routes/userRoutes";
import runwayRequestsRouter from "./routes/runwayRequestsRoutes";
import historyEventsRouter from "./routes/historyEventsRoutes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(helmet());
app.use(cookieParser());
// TODO: add here the client url (for ex. https://localhost:5173 for vite)
app.use(cors());
app.use(morgan("combined"));

if (process.env.NODE_ENV === "production") {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
} else {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);
app.use("/api/users", userRouter);
app.use("/api/runway-requests", runwayRequestsRouter);
app.use("/api/history", historyEventsRouter);

app.get("/health", async (req: Request, res: Response) => {
  const redisHealthy = await redisService.ping();

  const health = {
    status: redisHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services: {
      api: "healthy",
      redis: redisHealthy ? "healthy" : "unavailable",
    },
  };

  res.status(redisHealthy ? 200 : 503).json(health);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

export const initializeRedis = async () => {
  try {
    await redisService.connect();
    logger.info("Redis initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Redis:", error);
    logger.warn("Application will continue without Redis caching");
  }
};

export const gracefulShutdown = async () => {
  logger.info("Shutting down gracefully...");

  await redisService.disconnect();

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
