export function mapNotification(notification) {
  if (!notification) {
    return null;
  }

  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    actor: notification.actor
      ? {
          id: notification.actor.id,
          firstName: notification.actor.firstName,
          lastName: notification.actor.lastName,
          username: notification.actor.username,
          avatar: notification.actor.avatar,
        }
      : null,
  };
}

export function mapNotificationList(items) {
  return items.map(mapNotification);
}
