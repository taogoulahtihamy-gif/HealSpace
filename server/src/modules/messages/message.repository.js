import { prisma } from "../../config/prisma.js";

const messageInclude = {
  sender: true,
};

export async function findConversationById(id) {
  return prisma.conversation.findUnique({
    where: {
      id,
    },
    include: {
      participants: true,
    },
  });
}

export async function findConversationParticipant(
  conversationId,
  userId,
) {
  return prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
      leftAt: null,
    },
  });
}

export async function createMessage(data) {
  return prisma.$transaction(async (transaction) => {
    const message = await transaction.message.create({
      data,
      include: messageInclude,
    });

    await transaction.conversation.update({
      where: {
        id: data.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  });
}

export async function findMessagesByConversationId(conversationId) {
  return prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
    },
    include: messageInclude,
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findMessageById(id) {
  return prisma.message.findUnique({
    where: {
      id,
    },
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
    where: {
      id,
    },
    data,
    include: messageInclude,
  });
}

export async function softDeleteMessage(id) {
  return prisma.message.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
    include: messageInclude,
  });
}

export async function markMessageAsRead(id) {
  return prisma.message.update({
    where: {
      id,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    include: messageInclude,
  });
}
