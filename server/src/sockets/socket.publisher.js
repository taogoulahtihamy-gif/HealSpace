import {
  getConversationRoom,
  getUserRoom,
  SOCKET_EVENTS,
} from "./socket.constants.js";

let socketServer = null;

export function registerSocketServer(io) {
  socketServer = io;
}

export function getSocketServer() {
  return socketServer;
}

function publishToConversation(conversationId, eventName, payload) {
  if (!socketServer || !conversationId || !eventName) {
    return false;
  }

  socketServer
    .to(getConversationRoom(conversationId))
    .emit(eventName, payload);

  return true;
}

export function publishNotificationToUser(userId, notification) {
  if (!socketServer || !userId || !notification) {
    return false;
  }

  socketServer
    .to(getUserRoom(userId))
    .emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);

  return true;
}

export function publishUnreadCountToUser(userId, count) {
  if (!socketServer || !userId) {
    return false;
  }

  socketServer
    .to(getUserRoom(userId))
    .emit(SOCKET_EVENTS.NOTIFICATION_UNREAD_COUNT, {
      count,
    });

  return true;
}

export function publishMessageCreated(conversationId, message) {
  return publishToConversation(
    conversationId,
    SOCKET_EVENTS.MESSAGE_NEW,
    message,
  );
}

export function publishMessageUpdated(conversationId, message) {
  return publishToConversation(
    conversationId,
    SOCKET_EVENTS.MESSAGE_UPDATED,
    message,
  );
}

export function publishMessageDeleted(conversationId, payload) {
  return publishToConversation(
    conversationId,
    SOCKET_EVENTS.MESSAGE_DELETED,
    payload,
  );
}

export function publishMessageRead(conversationId, payload) {
  return publishToConversation(
    conversationId,
    SOCKET_EVENTS.MESSAGE_READ,
    payload,
  );
}
