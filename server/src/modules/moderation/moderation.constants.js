export const MODERATION_ALLOWED_ROLES = Object.freeze({
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
});

export const MODERATION_ACTION_TYPES = Object.freeze({
  REPORT_REVIEW_STARTED: "REPORT_REVIEW_STARTED",
  REPORT_RESOLVED: "REPORT_RESOLVED",
  REPORT_REJECTED: "REPORT_REJECTED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",
});

export const MODERATION_USER_STATUSES = Object.freeze({
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
});

export const MODERATION_LIMITS = Object.freeze({
  NOTE_MIN: 10,
  NOTE_MAX: 1000,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const MODERATION_MESSAGES = Object.freeze({
  REPORTS_LISTED: "Signalements de modération récupérés avec succès.",
  REPORT_RETRIEVED: "Signalement de modération récupéré avec succès.",
  REPORT_REVIEW_STARTED: "Signalement pris en charge avec succès.",
  REPORT_RESOLVED: "Signalement résolu avec succès.",
  REPORT_REJECTED: "Signalement rejeté avec succès.",
  USER_STATUS_UPDATED: "Statut utilisateur mis à jour avec succès.",

  FORBIDDEN: "Accès réservé aux modérateurs et administrateurs.",
  REPORT_NOT_FOUND: "Signalement introuvable.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  REPORT_ALREADY_ASSIGNED:
    "Ce signalement est déjà pris en charge par un autre modérateur.",
  REPORT_ALREADY_CLOSED: "Ce signalement a déjà été clôturé.",
  CANNOT_MODERATE_SELF:
    "Vous ne pouvez pas modifier votre propre statut.",
  MODERATOR_CANNOT_MODERATE_PRIVILEGED_USER:
    "Un modérateur ne peut pas modifier le statut d'un modérateur ou d'un administrateur.",
  INVALID_FILTERS: "Les filtres de modération sont invalides.",
});
