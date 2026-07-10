import { prisma } from "../config/prisma.js";

export async function findActiveConversationParticipant(
  conversationId,
  userId,
) {
  return prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
      leftAt: null,
      conversation: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      conversationId: true,
      userId: true,
      joinedAt: true,
      conversation: {
        select: {
          id: true,
          type: true,
          title: true,
          deletedAt: true,
        },
      },
    },
  });
}
