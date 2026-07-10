import { Server } from "socket.io";
import { env } from "../config/env.js";
import { socketAuthMiddleware } from "./socket.auth.js";
import { registerSocketHandlers } from "./socket.handlers.js";
import { registerSocketServer } from "./socket.publisher.js";

let ioInstance = null;

export function initializeSocketServer(httpServer) {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  ioInstance.use(socketAuthMiddleware);

  ioInstance.on("connection", (socket) => {
    registerSocketHandlers(socket);
  });

  registerSocketServer(ioInstance);

  return ioInstance;
}

export function getInitializedSocketServer() {
  return ioInstance;
}
