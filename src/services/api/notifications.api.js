import {
  apiRequest,
  createQueryString,
} from "./httpClient.js";

export function getNotifications(params = {}) {
  return apiRequest(
    `/notifications${createQueryString(params)}`,
  );
}

export function getUnreadNotificationCount() {
  return apiRequest("/notifications/unread-count");
}

export function markNotificationAsRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsAsRead() {
  return apiRequest("/notifications/read-all", {
    method: "PATCH",
  });
}

export function deleteNotification(notificationId) {
  return apiRequest(`/notifications/${notificationId}`, {
    method: "DELETE",
  });
}
