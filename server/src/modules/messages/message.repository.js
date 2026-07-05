import { prisma } from "../../config/prisma.js";

export async function findConversationById(id) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });
}

export async function findConversationParticipant(conversationId, userId) {
  return prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
      leftAt: null,
    },
  });
}

export async function createMessage(data) {
  return prisma.message.create({
    data,
    include: {
      sender: true,
    },
  });
}

export async function findMessagesByConversationId(conversationId) {
  return prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
    },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findMessageById(id) {
  return prisma.message.findUnique({
    where: { id },
    include: {
      sender: true,
      conversation: {
        include: {
          participants: true,
        },
      },
    },
  });
}

export async function updateMessage(id, data) {
  return prisma.message.update({
    where: { id },
    data,
    include: {
      sender: true,
    },
  });
}

export async function softDeleteMessage(id) {
  return prisma.message.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function markMessageAsRead(id) {
  return prisma.message.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    include: {
      sender: true,
    },
  });
}
