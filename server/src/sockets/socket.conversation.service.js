import {
  SOCKET_ERROR_CODES,
  SOCKET_MESSAGES,
} from "./socket.constants.js";
import { findActiveConversationParticipant } from "./socket.repository.js";
import { conversationSocketPayloadSchema } from "./socket.validator.js";

export class SocketDomainError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = "SocketDomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function parseConversationSocketPayload(payload) {
  const result = conversationSocketPayloadSchema.safeParse(payload);

  if (!result.success) {
    throw new SocketDomainError(
      result.error.issues?.[0]?.message ||
        SOCKET_MESSAGES.INVALID_PAYLOAD,
      SOCKET_ERROR_CODES.INVALID_PAYLOAD,
      400,
    );
  }

  return result.data;
}

export async function ensureSocketConversationAccess(
  conversationId,
  userId,
) {
  const participant = await findActiveConversationParticipant(
    conversationId,
    userId,
  );

  if (!participant) {
    throw new SocketDomainError(
      SOCKET_MESSAGES.CONVERSATION_FORBIDDEN,
      SOCKET_ERROR_CODES.CONVERSATION_FORBIDDEN,
      403,
    );
  }

  return participant;
}
