import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { NOTIFICATION_MESSAGES } from "./notification.constants.js";
import * as notificationService from "./notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(
    req.user.id,
    req.query,
  );

  return ApiResponse.success(res, result, NOTIFICATION_MESSAGES.LISTED);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);

  return ApiResponse.success(
    res,
    result,
    NOTIFICATION_MESSAGES.UNREAD_COUNT_RETRIEVED,
  );
});

export const markAllNotificationsAsRead = asyncHandler(
  async (req, res) => {
    const result = await notificationService.markAllNotificationsAsRead(
      req.user.id,
    );

    return ApiResponse.success(
      res,
      result,
      NOTIFICATION_MESSAGES.ALL_MARKED_AS_READ,
    );
  },
);

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(
    req.user.id,
    req.params.notificationId,
  );

  return ApiResponse.success(
    res,
    notification,
    NOTIFICATION_MESSAGES.MARKED_AS_READ,
  );
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(
    req.user.id,
    req.params.notificationId,
  );

  return ApiResponse.success(res, null, NOTIFICATION_MESSAGES.DELETED);
});
