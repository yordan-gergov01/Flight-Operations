import { Server as SocketServer } from "socket.io";
import { Server as HTTPServer } from "http";
import logger from "../utils/logger";

class SocketService {
  private io: SocketServer | null = null;

  initialize(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on("connection", (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on("join:runway", () => {
        socket.join("runway-updates");
        logger.info(`Client ${socket.id} joined runway-updates room`);
      });

      socket.on("join:history", () => {
        socket.join("history-updates");
        logger.info(`Client ${socket.id} joined history-updates room`);
      });

      socket.on("join:aircrafts", () => {
        socket.join("aircraft-updates");
        logger.info(`Client ${socket.id} joined aircraft-updates room`);
      });

      socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      socket.on("error", (error) => {
        logger.error(`Socket error for ${socket.id}: `, error);
      });
    });

    logger.info("Socket server initialized");
  }

  emitNewRunwayRequest(data: any) {
    if (!this.io) return;

    this.io.to("runway-updates").emit("runway:new", data);
    logger.debug("Emitted runway:new event", data);
  }

  emitRunwayRequestUpdate(data: any) {
    if (!this.io) return;

    this.io.to("runway-updates").emit("runway:update", data);
    logger.debug("Emitted runway:update event", data);
  }

  emitRunwayRequestDelete(requestId: string) {
    if (!this.io) return;

    this.io.to("runway-updates").emit("runway:delete", { requestId });
    logger.debug("Emitted runway:delete event", requestId);
  }

  emitNewHistoryEvent(data: any) {
    if (!this.io) return;

    this.io.to("history-updates").emit("history:new", data);
    logger.debug("Emitted history:new event", data);
  }

  emitAircraftUpdate(data: any) {
    if (!this.io) return;

    this.io.to("aircraft-updates").emit("aircraft:update", data);
    logger.debug("Emitted aircraft:update event", data);
  }

  emitAlert(data: {
    type: "warning" | "error" | "info";
    message: string;
    details?: any;
  }) {
    if (!this.io) return;
    this.io.emit("alert", data);
    logger.warn("Emitted alert", data);
  }

  isInitialized(): boolean {
    return this.io !== null;
  }

  getConnectedClientsCount(): number {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }
}

export default new SocketService();
