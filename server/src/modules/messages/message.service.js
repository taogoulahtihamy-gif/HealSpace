import { AppError } from "../../../core/errors/AppError.js";
import {
  createMessage,
  findConversationById,
  findConversationParticipant,
  findMessageById,
  findMessagesByConversationId,
  markMessageAsRead,
  softDeleteMessage,
  updateMessage,
} from "./message.repository.js";
import {
  toMessageListResponse,
  toMessageResponse,
} from "./message.mapper.js";
import { MESSAGE_MESSAGES } from "./message.constants.js";

async function ensureConversationExistsAndUserIsParticipant(conversationId, userId) {
  const conversation = await findConversationById(conversationId);

  if (!conversation || conversation.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.CONVERSATION_NOT_FOUND, 404);
  }

  const participant = await findConversationParticipant(conversationId, userId);

  if (!participant) {
    throw new AppError(MESSAGE_MESSAGES.NOT_PARTICIPANT, 403);
  }

  return conversation;
}

export async function createMessageService(userId, conversationId, payload) {
  await ensureConversationExistsAndUserIsParticipant(conversationId, userId);

  const message = await createMessage({
    conversationId,
    senderId: userId,
    content: payload.content,
  });

  return toMessageResponse(message);
}

export async function getConversationMessagesService(userId, conversationId) {
  await ensureConversationExistsAndUserIsParticipant(conversationId, userId);

  const messages = await findMessagesByConversationId(conversationId);

  return toMessageListResponse(messages);
}

export async function updateMessageService(userId, messageId, payload) {
  const message = await findMessageById(messageId);

  if (!message || message.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  if (message.senderId !== userId) {
    throw new AppError(MESSAGE_MESSAGES.FORBIDDEN, 403);
  }

  const updatedMessage = await updateMessage(messageId, {
    content: payload.content,
  });

  return toMessageResponse(updatedMessage);
}

export async function deleteMessageService(userId, messageId) {
  const message = await findMessageById(messageId);

  if (!message || message.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  if (message.senderId !== userId) {
    throw new AppError(MESSAGE_MESSAGES.FORBIDDEN, 403);
  }

  await softDeleteMessage(messageId);

  return null;
}

export async function markMessageAsReadService(userId, messageId) {
  const message = await findMessageById(messageId);

  if (!message || message.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  await ensureConversationExistsAndUserIsParticipant(
    message.conversationId,
    userId
  );

  const updatedMessage = await markMessageAsRead(messageId);

  return toMessageResponse(updatedMessage);
}
