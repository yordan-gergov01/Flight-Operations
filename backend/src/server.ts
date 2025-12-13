import dotenv from "dotenv";
import { createServer } from "http";

import app, { initializeRedis } from "./app";

import logger from "./utils/logger";
import socketService from "./services/socket-service";
import { http } from "winston";

dotenv.config({ path: "./.env" });

// triggered when an exception occurs in synchronous code and is not handled by try...catch
process.on("uncaughtException", (err: any) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

const PORT = process.env.APP_PORT || 3005;

const httpServer = createServer(app);

socketService.initialize(httpServer);

const startServer = async () => {
  try {
    await initializeRedis();

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // triggered when there is a raw Promise rejection
    process.on("unhandledRejection", (reason: any) => {
      logger.error("UNHANDLED REJECTION! Shutting down...", reason);

      httpServer.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
