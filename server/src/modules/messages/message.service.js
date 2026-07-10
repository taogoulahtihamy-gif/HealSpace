import { AppError } from "../../../core/errors/AppError.js";

import { createNotification } from "../notifications/notification.service.js";

import {
  publishMessageCreated,
  publishMessageDeleted,
  publishMessageRead,
  publishMessageUpdated,
} from "../../sockets/socket.publisher.js";

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

import {
  MESSAGE_MESSAGES,
  MESSAGE_NOTIFICATION,
} from "./message.constants.js";

async function ensureConversationExistsAndUserIsParticipant(
  conversationId,
  userId,
) {
  const conversation = await findConversationById(conversationId);

  if (!conversation || conversation.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.CONVERSATION_NOT_FOUND, 404);
  }

  const participant = await findConversationParticipant(
    conversationId,
    userId,
  );

  if (!participant) {
    throw new AppError(MESSAGE_MESSAGES.NOT_PARTICIPANT, 403);
  }

  return conversation;
}

function getActiveRecipientIds(conversation, senderId) {
  return conversation.participants
    .filter(
      (participant) =>
        participant.userId !== senderId && participant.leftAt === null,
    )
    .map((participant) => participant.userId);
}

async function notifyConversationParticipants({
  conversation,
  message,
  senderId,
}) {
  const recipientIds = getActiveRecipientIds(conversation, senderId);

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        userId: recipientId,
        actorId: senderId,
        type: "MESSAGE",
        title: MESSAGE_NOTIFICATION.TITLE,
        message: MESSAGE_NOTIFICATION.MESSAGE,
        data: {
          conversationId: conversation.id,
          messageId: message.id,
          conversationType: conversation.type,
        },
      }),
    ),
  );
}

export async function createMessageService(
  userId,
  conversationId,
  payload,
) {
  const conversation =
    await ensureConversationExistsAndUserIsParticipant(
      conversationId,
      userId,
    );

  const message = await createMessage({
    conversationId,
    senderId: userId,
    content: payload.content,
  });

  const response = toMessageResponse(message);

  publishMessageCreated(conversationId, response);

  await notifyConversationParticipants({
    conversation,
    message,
    senderId: userId,
  });

  return response;
}

export async function getConversationMessagesService(
  userId,
  conversationId,
) {
  await ensureConversationExistsAndUserIsParticipant(
    conversationId,
    userId,
  );

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

  const response = toMessageResponse(updatedMessage);

  publishMessageUpdated(message.conversationId, response);

  return response;
}

export async function deleteMessageService(userId, messageId) {
  const message = await findMessageById(messageId);

  if (!message || message.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  if (message.senderId !== userId) {
    throw new AppError(MESSAGE_MESSAGES.FORBIDDEN, 403);
  }

  const deletedMessage = await softDeleteMessage(messageId);

  publishMessageDeleted(message.conversationId, {
    messageId: deletedMessage.id,
    conversationId: deletedMessage.conversationId,
    deletedAt: deletedMessage.deletedAt,
    senderId: deletedMessage.senderId,
  });

  return null;
}

export async function markMessageAsReadService(userId, messageId) {
  const message = await findMessageById(messageId);

  if (!message || message.deletedAt) {
    throw new AppError(MESSAGE_MESSAGES.MESSAGE_NOT_FOUND, 404);
  }

  await ensureConversationExistsAndUserIsParticipant(
    message.conversationId,
    userId,
  );

  const updatedMessage = await markMessageAsRead(messageId);

  const response = toMessageResponse(updatedMessage);

  publishMessageRead(message.conversationId, {
    conversationId: message.conversationId,
    message: response,
    readById: userId,
  });

  return response;
}
