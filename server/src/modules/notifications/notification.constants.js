export const NOTIFICATION_TYPES = Object.freeze({
  REACTION: "REACTION",
  COMMENT: "COMMENT",
  MESSAGE: "MESSAGE",
  GROUP_INVITATION: "GROUP_INVITATION",
  GROUP_INVITATION_ACCEPTED: "GROUP_INVITATION_ACCEPTED",
  GROUP_JOIN: "GROUP_JOIN",
  SYSTEM: "SYSTEM",
  SUPPORT_ACCEPTED: "SUPPORT_ACCEPTED",
  SUPPORT_COMPLETED: "SUPPORT_COMPLETED",
  SUPPORT_CANCELLED: "SUPPORT_CANCELLED",
  FRIEND_REQUEST: "FRIEND_REQUEST",
  FRIEND_ACCEPTED: "FRIEND_ACCEPTED",
});

export const NOTIFICATION_LIMITS = Object.freeze({
  TITLE_MAX: 160,
  MESSAGE_MAX: 1000,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const NOTIFICATION_MESSAGES = Object.freeze({
  LISTED: "Notifications récupérées avec succès.",
  UNREAD_COUNT_RETRIEVED:
    "Nombre de notifications non lues récupéré avec succès.",
  MARKED_AS_READ: "Notification marquée comme lue.",
  ALL_MARKED_AS_READ:
    "Toutes les notifications ont été marquées comme lues.",
  DELETED: "Notification supprimée avec succès.",
  NOT_FOUND: "Notification introuvable.",
  INVALID_FILTER: "Les filtres de notifications sont invalides.",
  INVALID_PAYLOAD: "Les données de la notification sont invalides.",
});
