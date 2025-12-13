import { Server as SocketServer } from "socket.io";
import { Server as HTTPServer } from "http";
import logger from "../utils/logger";

/**
 * SocketService is responsible for initializing and managing the Socket.IO server.
 * It handles client connections, room subscriptions, and emitting real-time events
 * to connected clients.
 */
class SocketService {
  /**
   * Socket.IO server instance.
   * It is initialized once the HTTP server is provided.
   */
  private io: SocketServer | null = null;

  /**
   * Initializes the Socket.IO server with the given HTTP server.
   * Sets up CORS configuration, ping settings, and all socket event listeners.
   *
   * @param {HTTPServer} httpServer - The HTTP server instance used by Socket.IO.
   */
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

  /**
   * Emits a new runway request event to all clients subscribed
   * to the "runway-updates" room.
   *
   * @param {*} data - The runway request data to emit.
   */
  emitNewRunwayRequest(data: any) {
    if (!this.io) return;

    this.io.to("runway-updates").emit("runway:new", data);
    logger.debug("Emitted runway:new event", data);
  }

  /**
   * Emits an update event for an existing runway request
   * to all clients in the "runway-updates" room.
   *
   * @param {*} data - The updated runway request data.
   */
  emitRunwayRequestUpdate(data: any) {
    if (!this.io) return;

    this.io.to("runway-updates").emit("runway:update", data);
    logger.debug("Emitted runway:update event", data);
  }

  /**
   * Emits a new history event to all clients subscribed
   * to the "history-updates" room.
   *
   * @param {*} data - The history event data.
   */
  emitNewHistoryEvent(data: any) {
    if (!this.io) return;

    this.io.to("history-updates").emit("history:new", data);
    logger.debug("Emitted history:new event", data);
  }

  /**
   * Emits an aircraft update event to all clients
   * subscribed to the "aircraft-updates" room.
   *
   * @param {*} data - The updated aircraft data.
   */
  emitAircraftUpdate(data: any) {
    if (!this.io) return;

    this.io.to("aircraft-updates").emit("aircraft:update", data);
    logger.debug("Emitted aircraft:update event", data);
  }

  /**
   * Emits a global alert event to all connected clients.
   * Used for warnings, errors, or informational messages.
   *
   * @param {Object} data - Alert payload.
   * @param {"warning" | "error" | "info"} data.type - The alert type.
   * @param {string} data.message - The alert message.
   * @param {*} [data.details] - Optional additional details.
   */
  emitAlert(data: {
    type: "warning" | "error" | "info";
    message: string;
    details?: any;
  }) {
    if (!this.io) return;
    this.io.emit("alert", data);
    logger.warn("Emitted alert", data);
  }

  /**
   * Checks whether the Socket.IO server has been initialized.
   *
   * @returns {boolean} True if initialized, otherwise false.
   */
  isInitialized(): boolean {
    return this.io !== null;
  }

  /**
   * Returns the current number of connected socket clients.
   *
   * @returns {number} The number of connected clients.
   */
  getConnectedClientsCount(): number {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }
}

const socketService = new SocketService();

export default socketService;
