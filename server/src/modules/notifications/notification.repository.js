import { prisma } from "../../config/prisma.js";

const notificationSelect = {
  id: true,
  userId: true,
  actorId: true,
  type: true,
  title: true,
  message: true,
  data: true,
  isRead: true,
  readAt: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
};

function buildNotificationWhere({ userId, isRead, type }) {
  return {
    userId,
    ...(typeof isRead === "boolean" && { isRead }),
    ...(type && { type }),
  };
}

export async function createNotification(data) {
  return prisma.notification.create({
    data,
    select: notificationSelect,
  });
}

export async function findNotificationById(notificationId, userId) {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: notificationSelect,
  });
}

export async function listNotifications({
  userId,
  skip,
  take,
  isRead,
  type,
}) {
  const where = buildNotificationWhere({
    userId,
    isRead,
    type,
  });

  const [items, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      select: notificationSelect,
    }),
    prisma.notification.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function countUnreadNotifications(userId) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(notificationId, readAt) {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
      readAt,
    },
    select: notificationSelect,
  });
}

export async function markAllNotificationsAsRead(userId, readAt) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt,
    },
  });
}

export async function deleteNotification(notificationId) {
  return prisma.notification.delete({
    where: {
      id: notificationId,
    },
    select: {
      id: true,
    },
  });
}
