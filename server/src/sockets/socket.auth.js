import { verifyAccessToken } from "../modules/auth/auth.token.js";
import { SOCKET_MESSAGES } from "./socket.constants.js";

function extractSocketToken(socket) {
  const authToken = socket.handshake.auth?.token;

  const authorizationHeader = socket.handshake.headers?.authorization;

  const rawToken = authToken || authorizationHeader;

  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  return rawToken.startsWith("Bearer ")
    ? rawToken.slice(7).trim()
    : rawToken.trim();
}

export function socketAuthMiddleware(socket, next) {
  const token = extractSocketToken(socket);

  if (!token) {
    const error = new Error(SOCKET_MESSAGES.AUTH_REQUIRED);

    error.data = {
      code: "SOCKET_AUTH_REQUIRED",
    };

    next(error);
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    socket.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    const error = new Error(SOCKET_MESSAGES.AUTH_INVALID);

    error.data = {
      code: "SOCKET_AUTH_INVALID",
    };

    next(error);
  }
}
