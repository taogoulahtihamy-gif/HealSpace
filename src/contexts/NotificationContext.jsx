import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth.js";
import { getAccessToken } from "../services/api/tokenStorage.js";
import {
  deleteNotification as deleteNotificationRequest,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead as markAllNotificationsAsReadRequest,
  markNotificationAsRead as markNotificationAsReadRequest,
} from "../services/api/notifications.api.js";
import {
  connectSocket,
  disconnectSocket,
} from "../services/socket/socket.client.js";
import "../styles/notifications.css";

export const NotificationContext = createContext(null);

function getResponseData(response) {
  return response?.data || response || null;
}

function extractItems(response) {
  const data = getResponseData(response);
  if (Array.isArray(data)) return data;
  return data?.items || [];
}

function extractUnreadCount(response) {
  const data = getResponseData(response);
  if (typeof data === "number") return data;
  return data?.count ?? data?.unreadCount ?? 0;
}

function extractSocketUnreadCount(payload) {
  if (typeof payload === "number") return payload;
  return payload?.count ?? payload?.unreadCount ?? 0;
}

function createToast(message, type = "info") {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message,
    type,
  };
}

function getNotificationToastMessage(notification) {
  return notification?.message || notification?.title || "Nouvelle notification";
}

export function NotificationProvider({ children }) {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [toasts, setToasts] = useState([]);

  const canUseNotifications =
    !isAuthLoading && (isLoggedIn || Boolean(getAccessToken()));

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      const toast = createToast(message, type);
      setToasts((current) => [toast, ...current].slice(0, 5));

      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 4200);

      return toast.id;
    },
    [dismissToast],
  );

  const loadNotifications = useCallback(async (params = {}) => {
    if (!getAccessToken()) {
      setNotifications([]);
      return [];
    }

    try {
      setIsLoadingNotifications(true);
      setNotificationsError(null);

      const response = await getNotifications({ page: 1, limit: 30, ...params });
      const items = extractItems(response);

      setNotifications(items);
      return items;
    } catch (error) {
      setNotificationsError(error);
      return [];
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    if (!getAccessToken()) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const response = await getUnreadNotificationCount();
      const count = extractUnreadCount(response);
      setUnreadCount(count);
      return count;
    } catch {
      setUnreadCount(0);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    const response = await markNotificationAsReadRequest(notificationId);
    const updatedNotification = getResponseData(response);

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, ...updatedNotification, isRead: true }
          : notification,
      ),
    );

    setUnreadCount((current) => Math.max(0, current - 1));
    return updatedNotification;
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsReadRequest();

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );

    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback(
    async (notificationId) => {
      const target = notifications.find(
        (notification) => notification.id === notificationId,
      );

      await deleteNotificationRequest(notificationId);

      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId),
      );

      if (target && !target.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    },
    [notifications],
  );

  useEffect(() => {
    if (isAuthLoading) return undefined;

    if (!canUseNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      disconnectSocket();
      setSocketStatus("disconnected");
      return undefined;
    }

    let isActive = true;

    loadNotifications();
    loadUnreadCount();

    const socket = connectSocket();

    if (!socket) {
      setSocketStatus("disconnected");
      return undefined;
    }

    function handleConnect() {
      if (isActive) setSocketStatus("connected");
    }

    function handleDisconnect() {
      if (isActive) setSocketStatus("disconnected");
    }

    function handleReady() {
      if (isActive) setSocketStatus("connected");
    }

    function handleNotification(notification) {
      if (!isActive) return;

      setNotifications((current) => {
        const alreadyExists = current.some((item) => item.id === notification.id);
        if (alreadyExists) return current;
        return [notification, ...current];
      });

      if (!notification?.isRead) {
        setUnreadCount((current) => current + 1);
      }

      notify(getNotificationToastMessage(notification), "info");
    }

    function handleUnreadCount(payload) {
      if (isActive) setUnreadCount(extractSocketUnreadCount(payload));
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connection:ready", handleReady);
    socket.on("notification:new", handleNotification);
    socket.on("notification:unread-count", handleUnreadCount);

    if (socket.connected) handleConnect();

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connection:ready", handleReady);
      socket.off("notification:new", handleNotification);
      socket.off("notification:unread-count", handleUnreadCount);
      disconnectSocket();
      setSocketStatus("disconnected");
    };
  }, [
    isAuthLoading,
    canUseNotifications,
    user?.id,
    loadNotifications,
    loadUnreadCount,
    notify,
  ]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoadingNotifications,
      notificationsError,
      socketStatus,
      toasts,
      notify,
      addToast: notify,
      dismissToast,
      removeToast: dismissToast,
      loadNotifications,
      loadUnreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }),
    [
      notifications,
      unreadCount,
      isLoadingNotifications,
      notificationsError,
      socketStatus,
      toasts,
      notify,
      dismissToast,
      loadNotifications,
      loadUnreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
