import { useState } from "react";
import { notifications } from "../data/mockData.js";
import PageHeader from "../components/common/PageHeader.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { storageService } from "../services/storageService.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { BellOff, CheckCheck, X } from "lucide-react";

const TABS = ["Toutes", "Non lues"];

export default function NotificationsPage() {
  // Petit état local persisté, sur le même principe que likeService/groupService :
  // un Set d'identifiants déjà lus / effacés, stocké via storageService.
  const [readIds, setReadIds] = useState(
    () => new Set(storageService.get(STORAGE_KEYS.NOTIFICATIONS_READ, []))
  );
  const [deletedIds, setDeletedIds] = useState(
    () => new Set(storageService.get(STORAGE_KEYS.NOTIFICATIONS_DELETED, []))
  );
  const [activeTab, setActiveTab] = useState(TABS[0]);

  function markAsRead(id) {
    if (readIds.has(id)) return;
    const updated = new Set(readIds).add(id);
    setReadIds(updated);
    storageService.set(STORAGE_KEYS.NOTIFICATIONS_READ, Array.from(updated));
  }

  function markAllAsRead() {
    const updated = new Set([...readIds, ...notifications.map((n) => n.id)]);
    setReadIds(updated);
    storageService.set(STORAGE_KEYS.NOTIFICATIONS_READ, Array.from(updated));
  }

  function deleteNotification(id, event) {
    event.stopPropagation();
    const updated = new Set(deletedIds).add(id);
    setDeletedIds(updated);
    storageService.set(STORAGE_KEYS.NOTIFICATIONS_DELETED, Array.from(updated));
  }

  const enrichedNotifications = notifications
    .filter((notification) => !deletedIds.has(notification.id))
    .map((notification) => ({
      ...notification,
      unread: notification.unread && !readIds.has(notification.id),
    }));

  const visibleNotifications =
    activeTab === "Non lues"
      ? enrichedNotifications.filter((notification) => notification.unread)
      : enrichedNotifications;

  const unreadCount = enrichedNotifications.filter((notification) => notification.unread).length;

  return (
    <main className="feed">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} notification(s) non lue(s).` : "Tu es à jour."}
      />

      <div className="notifications-toolbar">
        <section className="filters notifications-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "selected" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </section>

        {unreadCount > 0 && (
          <button className="btn btn-ghost mark-all-read-btn" onClick={markAllAsRead}>
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      <section className="panel">
        {visibleNotifications.length === 0 ? (
          <EmptyState
            icon={<BellOff size={32} />}
            title="Rien à signaler"
            description="Tu n'as aucune notification non lue pour le moment."
          />
        ) : (
          visibleNotifications.map((notification) => (
            <div
              className={`notification-row ${notification.unread ? "unread" : ""}`}
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => markAsRead(notification.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") markAsRead(notification.id);
              }}
            >
              <span className="notification-icon">{notification.icon}</span>
              <div>
                <p>{notification.text}</p>
                <span>{notification.time}</span>
              </div>
              {notification.unread && <span className="notification-dot" aria-hidden="true" />}
              <button
                className="notification-delete"
                aria-label="Effacer la notification"
                onClick={(event) => deleteNotification(notification.id, event)}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
