import { io } from "socket.io-client";

import { apiConfig } from "../../config/api.config.js";
import { getAccessToken } from "../api/tokenStorage.js";

let socketInstance = null;

export function getSocketInstance() {
  return socketInstance;
}

export function connectSocket() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  if (socketInstance?.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(apiConfig.socketUrl, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1200,
    timeout: 10000,
  });

  socketInstance.connect();

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
