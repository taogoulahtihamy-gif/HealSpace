import { prisma } from "../../config/prisma.js";

const conversationInclude = {
  participants: {
    where: {
      leftAt: null,
    },
    include: {
      user: true,
    },
  },
};

export async function findDirectConversationBetweenUsers(
  userId,
  participantId,
) {
  return prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      deletedAt: null,
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
      AND: [
        {
          participants: {
            some: {
              userId: participantId,
              leftAt: null,
            },
          },
        },
      ],
    },
    include: conversationInclude,
  });
}

export async function createConversation(data) {
  return prisma.conversation.create({
    data,
    include: conversationInclude,
  });
}

export async function findConversationsByUserId(userId) {
  return prisma.conversation.findMany({
    where: {
      deletedAt: null,
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
    },
    include: conversationInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function findConversationById(id) {
  return prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  });
}

export async function findConversationParticipant(
  conversationId,
  userId,
) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
}

export async function leaveConversation(conversationId, userId) {
  return prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: {
      leftAt: new Date(),
    },
  });
}
