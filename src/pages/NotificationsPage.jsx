import {
  Bell,
  CheckCheck,
  Loader2,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect } from "react";

import { useNotifications } from "../hooks/useNotifications.js";
import "../styles/notifications.css";

function formatNotificationDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActorName(actor) {
  if (!actor) {
    return null;
  }

  const fullName = [actor.firstName, actor.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || actor.username || null;
}

function getNotificationTypeLabel(type) {
  const labels = {
    REACTION: "Soutien",
    COMMENT: "Commentaire",
    MESSAGE: "Message",
    GROUP_INVITATION: "Invitation",
    GROUP_INVITATION_ACCEPTED: "Invitation acceptée",
    GROUP_JOIN: "Groupe",
    SYSTEM: "Système",
    SUPPORT_ACCEPTED: "Soutien accepté",
    SUPPORT_COMPLETED: "Soutien terminé",
    SUPPORT_CANCELLED: "Soutien annulé",
    FRIEND_REQUEST: "Demande d’ami",
    FRIEND_ACCEPTED: "Ami accepté",
  };

  return labels[type] || type || "Notification";
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    notificationsError,
    socketStatus,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <main className="feed notifications-page">
      <section className="notifications-header-card">
        <div>
          <span className="notifications-kicker">
            Centre de notifications
          </span>
          <h2>Notifications</h2>
          <p>
            Suivez les soutiens, commentaires, messages et invitations
            liés à votre espace.
          </p>
        </div>

        <div className="notifications-header-actions">
          <span
            className={`socket-status socket-status-${socketStatus}`}
          >
            {socketStatus === "connected" ? (
              <Wifi size={15} />
            ) : (
              <WifiOff size={15} />
            )}
            {socketStatus === "connected"
              ? "Temps réel actif"
              : "Temps réel inactif"}
          </span>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={!unreadCount}
          >
            <CheckCheck size={16} />
            Tout marquer comme lu
          </button>
        </div>
      </section>

      <section className="panel notifications-list-panel">
        <div className="panel-title">
          <h3>
            {unreadCount > 0
              ? `${unreadCount} non lue(s)`
              : "Toutes les notifications"}
          </h3>
        </div>

        {isLoadingNotifications && (
          <div className="notifications-state">
            <Loader2 className="spin" size={22} />
            Chargement des notifications...
          </div>
        )}

        {notificationsError && (
          <div className="notifications-state error">
            Impossible de charger les notifications.
          </div>
        )}

        {!isLoadingNotifications &&
          !notificationsError &&
          notifications.length === 0 && (
            <div className="notifications-empty">
              <Bell size={34} />
              <strong>Aucune notification pour le moment</strong>
              <span>
                Les nouveaux soutiens, messages et commentaires
                apparaîtront ici.
              </span>
            </div>
          )}

        <div className="notifications-list">
          {notifications.map((notification) => {
            const actorName = getActorName(notification.actor);

            return (
              <article
                key={notification.id}
                className={`notification-item ${
                  notification.isRead ? "is-read" : "is-unread"
                }`}
              >
                <button
                  type="button"
                  className="notification-main"
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <span className="notification-icon">
                    <Bell size={18} />
                  </span>

                  <span className="notification-content">
                    <span className="notification-type">
                      {getNotificationTypeLabel(notification.type)}
                    </span>

                    <strong>
                      {notification.title || "Nouvelle notification"}
                    </strong>

                    <span>{notification.message}</span>

                    <small>
                      {actorName && `${actorName} · `}
                      {formatNotificationDate(notification.createdAt)}
                    </small>
                  </span>
                </button>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      title="Marquer comme lue"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removeNotification(notification.id)
                    }
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
