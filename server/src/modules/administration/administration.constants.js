export const ADMIN_ALLOWED_ROLE = "ADMIN";

export const ADMIN_USER_ROLES = Object.freeze({
  USER: "USER",
  MODERATOR: "MODERATOR",
  PSYCHOLOGIST: "PSYCHOLOGIST",
  ADMIN: "ADMIN",
});

export const ADMIN_USER_STATUSES = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
});

export const ADMIN_POST_STATUSES = Object.freeze({
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
  DELETED: "DELETED",
});

export const ADMIN_ACTION_TYPES = Object.freeze({
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",
  POST_STATUS_CHANGED: "POST_STATUS_CHANGED",
  GROUP_DELETED: "GROUP_DELETED",
});

export const ADMIN_LIMITS = Object.freeze({
  NOTE_MIN: 10,
  NOTE_MAX: 1000,
  SEARCH_MAX: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const ADMIN_MESSAGES = Object.freeze({
  STATISTICS_FETCHED:
    "Statistiques administratives récupérées avec succès.",

  USERS_LISTED: "Utilisateurs récupérés avec succès.",
  USER_FETCHED: "Utilisateur récupéré avec succès.",
  USER_ROLE_UPDATED: "Rôle utilisateur mis à jour avec succès.",
  USER_STATUS_UPDATED: "Statut utilisateur mis à jour avec succès.",

  POSTS_LISTED: "Publications récupérées avec succès.",
  POST_STATUS_UPDATED:
    "Statut de la publication mis à jour avec succès.",

  GROUPS_LISTED: "Groupes récupérés avec succès.",
  GROUP_DELETED: "Groupe supprimé avec succès.",

  REPORTS_LISTED: "Signalements récupérés avec succès.",
  ACTIONS_LISTED: "Actions administratives récupérées avec succès.",

  FORBIDDEN: "Accès réservé aux administrateurs.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  POST_NOT_FOUND: "Publication introuvable.",
  GROUP_NOT_FOUND: "Groupe introuvable.",
  CANNOT_MODIFY_SELF:
    "Vous ne pouvez pas modifier votre propre rôle ou statut depuis cette route.",
  LAST_ACTIVE_ADMIN:
    "Cette opération laisserait HealSpace sans administrateur actif.",
  INVALID_FILTERS: "Les filtres administratifs sont invalides.",
});
