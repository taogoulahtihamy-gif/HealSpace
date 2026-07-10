export const SOCKET_EVENTS = Object.freeze({
  CONNECTION_READY: "connection:ready",
  SOCKET_ERROR: "socket:error",

  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_UNREAD_COUNT: "notification:unread-count",

  CONVERSATION_JOIN: "conversation:join",
  CONVERSATION_JOINED: "conversation:joined",
  CONVERSATION_LEAVE: "conversation:leave",
  CONVERSATION_LEFT: "conversation:left",
  CONVERSATION_TYPING: "conversation:typing",
  CONVERSATION_STOP_TYPING: "conversation:stop-typing",

  MESSAGE_NEW: "message:new",
  MESSAGE_UPDATED: "message:updated",
  MESSAGE_DELETED: "message:deleted",
  MESSAGE_READ: "message:read",
});

export const SOCKET_MESSAGES = Object.freeze({
  AUTH_REQUIRED: "Authentification Socket.IO obligatoire.",
  AUTH_INVALID: "Jeton Socket.IO invalide ou expiré.",
  INVALID_PAYLOAD: "Les données Socket.IO sont invalides.",
  CONVERSATION_NOT_FOUND: "Conversation introuvable.",
  CONVERSATION_FORBIDDEN:
    "Vous ne faites pas partie de cette conversation.",
  CONVERSATION_NOT_JOINED:
    "Vous devez rejoindre la conversation avant cette action.",
  INTERNAL_ERROR: "Une erreur Socket.IO interne est survenue.",
});

export const SOCKET_ERROR_CODES = Object.freeze({
  AUTH_REQUIRED: "SOCKET_AUTH_REQUIRED",
  AUTH_INVALID: "SOCKET_AUTH_INVALID",
  INVALID_PAYLOAD: "SOCKET_INVALID_PAYLOAD",
  CONVERSATION_NOT_FOUND: "SOCKET_CONVERSATION_NOT_FOUND",
  CONVERSATION_FORBIDDEN: "SOCKET_CONVERSATION_FORBIDDEN",
  CONVERSATION_NOT_JOINED: "SOCKET_CONVERSATION_NOT_JOINED",
  INTERNAL_ERROR: "SOCKET_INTERNAL_ERROR",
});

export function getUserRoom(userId) {
  return `user:${userId}`;
}

export function getConversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}
