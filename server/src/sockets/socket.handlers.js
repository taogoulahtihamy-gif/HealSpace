import {
  getConversationRoom,
  getUserRoom,
  SOCKET_ERROR_CODES,
  SOCKET_EVENTS,
  SOCKET_MESSAGES,
} from "./socket.constants.js";
import {
  ensureSocketConversationAccess,
  parseConversationSocketPayload,
  SocketDomainError,
} from "./socket.conversation.service.js";

function createSocketErrorPayload(error) {
  if (error instanceof SocketDomainError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  return {
    success: false,
    error: {
      code: SOCKET_ERROR_CODES.INTERNAL_ERROR,
      message: SOCKET_MESSAGES.INTERNAL_ERROR,
      statusCode: 500,
    },
  };
}

function acknowledge(callback, payload) {
  if (typeof callback === "function") {
    callback(payload);
  }
}

function handleSocketFailure(socket, callback, error) {
  const payload = createSocketErrorPayload(error);

  acknowledge(callback, payload);

  socket.emit(SOCKET_EVENTS.SOCKET_ERROR, payload.error);
}

function ensureJoinedConversationRoom(socket, conversationId) {
  const room = getConversationRoom(conversationId);

  if (!socket.rooms.has(room)) {
    throw new SocketDomainError(
      SOCKET_MESSAGES.CONVERSATION_NOT_JOINED,
      SOCKET_ERROR_CODES.CONVERSATION_NOT_JOINED,
      403,
    );
  }

  return room;
}

function createPresencePayload(socket, conversationId) {
  return {
    conversationId,
    user: socket.user,
    emittedAt: new Date().toISOString(),
  };
}

export function registerSocketHandlers(socket) {
  const userRoom = getUserRoom(socket.user.id);

  socket.join(userRoom);

  socket.emit(SOCKET_EVENTS.CONNECTION_READY, {
    socketId: socket.id,
    user: socket.user,
    connectedAt: new Date().toISOString(),
  });

  socket.on(
    SOCKET_EVENTS.CONVERSATION_JOIN,
    async (payload, callback) => {
      try {
        const { conversationId } =
          parseConversationSocketPayload(payload);

        await ensureSocketConversationAccess(
          conversationId,
          socket.user.id,
        );

        const room = getConversationRoom(conversationId);

        await socket.join(room);

        const response = {
          conversationId,
          room,
          joinedAt: new Date().toISOString(),
        };

        socket.emit(SOCKET_EVENTS.CONVERSATION_JOINED, response);

        acknowledge(callback, {
          success: true,
          data: response,
        });
      } catch (error) {
        handleSocketFailure(socket, callback, error);
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.CONVERSATION_LEAVE,
    async (payload, callback) => {
      try {
        const { conversationId } =
          parseConversationSocketPayload(payload);

        const room = getConversationRoom(conversationId);

        await socket.leave(room);

        const response = {
          conversationId,
          room,
          leftAt: new Date().toISOString(),
        };

        socket.emit(SOCKET_EVENTS.CONVERSATION_LEFT, response);

        acknowledge(callback, {
          success: true,
          data: response,
        });
      } catch (error) {
        handleSocketFailure(socket, callback, error);
      }
    },
  );

  socket.on(SOCKET_EVENTS.CONVERSATION_TYPING, (payload, callback) => {
    try {
      const { conversationId } =
        parseConversationSocketPayload(payload);

      const room = ensureJoinedConversationRoom(socket, conversationId);

      socket
        .to(room)
        .emit(
          SOCKET_EVENTS.CONVERSATION_TYPING,
          createPresencePayload(socket, conversationId),
        );

      acknowledge(callback, {
        success: true,
        data: {
          conversationId,
        },
      });
    } catch (error) {
      handleSocketFailure(socket, callback, error);
    }
  });

  socket.on(
    SOCKET_EVENTS.CONVERSATION_STOP_TYPING,
    (payload, callback) => {
      try {
        const { conversationId } =
          parseConversationSocketPayload(payload);

        const room = ensureJoinedConversationRoom(
          socket,
          conversationId,
        );

        socket
          .to(room)
          .emit(
            SOCKET_EVENTS.CONVERSATION_STOP_TYPING,
            createPresencePayload(socket, conversationId),
          );

        acknowledge(callback, {
          success: true,
          data: {
            conversationId,
          },
        });
      } catch (error) {
        handleSocketFailure(socket, callback, error);
      }
    },
  );
}
