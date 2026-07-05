import { AppError } from "../../../core/errors/AppError.js";
import { findUserById } from "../auth/auth.repository.js";
import {
  createConversation,
  findConversationById,
  findConversationParticipant,
  findConversationsByUserId,
  findDirectConversationBetweenUsers,
  leaveConversation,
} from "./conversation.repository.js";
import {
  toConversationListResponse,
  toConversationResponse,
} from "./conversation.mapper.js";
import { CONVERSATION_MESSAGES } from "./conversation.constants.js";

function ensureParticipant(conversation, userId) {
  const isParticipant = conversation.participants?.some(
    (participant) => participant.user?.id === userId
  );

  if (!isParticipant) {
    throw new AppError(CONVERSATION_MESSAGES.FORBIDDEN, 403);
  }
}

export async function createDirectConversationService(userId, payload) {
  if (userId === payload.participantId) {
    throw new AppError(CONVERSATION_MESSAGES.SELF_CONVERSATION_FORBIDDEN, 400);
  }

  const participant = await findUserById(payload.participantId);

  if (!participant) {
    throw new AppError(CONVERSATION_MESSAGES.USER_NOT_FOUND, 404);
  }

  const existingConversation = await findDirectConversationBetweenUsers(
    userId,
    payload.participantId
  );

  if (existingConversation) {
    return toConversationResponse(existingConversation);
  }

  const conversation = await createConversation({
    type: "DIRECT",
    participants: {
      create: [
        { userId },
        { userId: payload.participantId },
      ],
    },
  });

  return toConversationResponse(conversation);
}

export async function createGroupConversationService(userId, payload) {
  const participantIds = [...new Set([userId, ...payload.participantIds])];

  const users = await Promise.all(participantIds.map((id) => findUserById(id)));

  if (users.some((user) => !user)) {
    throw new AppError(CONVERSATION_MESSAGES.USER_NOT_FOUND, 404);
  }

  const conversation = await createConversation({
    type: "GROUP",
    title: payload.title,
    participants: {
      create: participantIds.map((participantId) => ({
        userId: participantId,
      })),
    },
  });

  return toConversationResponse(conversation);
}

export async function getConversationsService(userId) {
  const conversations = await findConversationsByUserId(userId);

  return toConversationListResponse(conversations);
}

export async function getConversationByIdService(userId, conversationId) {
  const conversation = await findConversationById(conversationId);

  if (!conversation || conversation.deletedAt) {
    throw new AppError(CONVERSATION_MESSAGES.NOT_FOUND, 404);
  }

  ensureParticipant(conversation, userId);

  return toConversationResponse(conversation);
}

export async function leaveConversationService(userId, conversationId) {
  const conversation = await findConversationById(conversationId);

  if (!conversation || conversation.deletedAt) {
    throw new AppError(CONVERSATION_MESSAGES.NOT_FOUND, 404);
  }

  const participant = await findConversationParticipant(conversationId, userId);

  if (!participant || participant.leftAt) {
    throw new AppError(CONVERSATION_MESSAGES.FORBIDDEN, 403);
  }

  await leaveConversation(conversationId, userId);

  return null;
}
