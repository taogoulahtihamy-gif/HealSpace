import { AppError } from "../../../core/errors/AppError.js";
import {
  publishNotificationToUser,
  publishUnreadCountToUser,
} from "../../sockets/socket.publisher.js";
import {
  NOTIFICATION_LIMITS,
  NOTIFICATION_MESSAGES,
} from "./notification.constants.js";
import {
  mapNotification,
  mapNotificationList,
} from "./notification.mapper.js";
import * as notificationRepository from "./notification.repository.js";
import {
  createNotificationSchema,
  listNotificationsQuerySchema,
} from "./notification.validator.js";

function parseOrThrow(schema, input, fallbackMessage) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message || fallbackMessage;

    throw new AppError(message, 400);
  }

  return result.data;
}

function normalizePagination(query) {
  const parsedPage = Number.parseInt(query.page, 10);

  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : NOTIFICATION_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : NOTIFICATION_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(requestedLimit, NOTIFICATION_LIMITS.MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function createPaginatedResult(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getRequiredNotification(notificationId, userId) {
  const notification =
    await notificationRepository.findNotificationById(
      notificationId,
      userId,
    );

  if (!notification) {
    throw new AppError(NOTIFICATION_MESSAGES.NOT_FOUND, 404);
  }

  return notification;
}

async function publishCurrentUnreadCount(userId) {
  const count =
    await notificationRepository.countUnreadNotifications(userId);

  publishUnreadCountToUser(userId, count);

  return count;
}

/**
 * Création interne utilisée par les autres services.
 * Aucune route HTTP publique de création n'est exposée.
 */
export async function createNotification(input) {
  const data = parseOrThrow(
    createNotificationSchema,
    input,
    NOTIFICATION_MESSAGES.INVALID_PAYLOAD,
  );

  if (data.actorId && data.actorId === data.userId) {
    return null;
  }

  const notification = await notificationRepository.createNotification({
    userId: data.userId,
    actorId: data.actorId ?? null,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data ?? null,
  });

  const mappedNotification = mapNotification(notification);

  publishNotificationToUser(data.userId, mappedNotification);

  await publishCurrentUnreadCount(data.userId);

  return mappedNotification;
}

export async function listNotifications(userId, query = {}) {
  const filters = parseOrThrow(
    listNotificationsQuerySchema,
    query,
    NOTIFICATION_MESSAGES.INVALID_FILTER,
  );

  const { page, limit, skip } = normalizePagination(filters);

  const isRead =
    filters.isRead === undefined
      ? undefined
      : filters.isRead === "true";

  const { items, total } =
    await notificationRepository.listNotifications({
      userId,
      skip,
      take: limit,
      isRead,
      type: filters.type,
    });

  return createPaginatedResult(
    mapNotificationList(items),
    total,
    page,
    limit,
  );
}

export async function getUnreadCount(userId) {
  const count =
    await notificationRepository.countUnreadNotifications(userId);

  return {
    count,
  };
}

export async function markNotificationAsRead(userId, notificationId) {
  const notification = await getRequiredNotification(
    notificationId,
    userId,
  );

  if (notification.isRead) {
    return mapNotification(notification);
  }

  const updatedNotification =
    await notificationRepository.markNotificationAsRead(
      notificationId,
      new Date(),
    );

  await publishCurrentUnreadCount(userId);

  return mapNotification(updatedNotification);
}

export async function markAllNotificationsAsRead(userId) {
  const result =
    await notificationRepository.markAllNotificationsAsRead(
      userId,
      new Date(),
    );

  publishUnreadCountToUser(userId, 0);

  return {
    updatedCount: result.count,
    unreadCount: 0,
  };
}

export async function deleteNotification(userId, notificationId) {
  await getRequiredNotification(notificationId, userId);

  await notificationRepository.deleteNotification(notificationId);

  await publishCurrentUnreadCount(userId);

  return null;
}
