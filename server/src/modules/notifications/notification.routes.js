import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listNotifications);

// Les routes statiques doivent rester avant les routes paramétrées.
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllNotificationsAsRead);

router.patch("/:notificationId/read", markNotificationAsRead);

router.delete("/:notificationId", deleteNotification);

export default router;
