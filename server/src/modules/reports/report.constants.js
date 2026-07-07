export const REPORT_TARGET_TYPES = Object.freeze({
  USER: "USER",
  POST: "POST",
  COMMENT: "COMMENT",
  MESSAGE: "MESSAGE",
  GROUP: "GROUP",
});

export const REPORT_REASONS = Object.freeze({
  HARASSMENT: "HARASSMENT",
  HATE_SPEECH: "HATE_SPEECH",
  SPAM: "SPAM",
  VIOLENCE: "VIOLENCE",
  SELF_HARM: "SELF_HARM",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",
  OTHER: "OTHER",
});

export const REPORT_STATUSES = Object.freeze({
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
});

export const REPORT_LIMITS = Object.freeze({
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 1000,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const REPORT_MESSAGES = Object.freeze({
  CREATED: "Signalement créé avec succès.",
  LISTED: "Signalements récupérés avec succès.",
  RETRIEVED: "Signalement récupéré avec succès.",

  NOT_FOUND: "Signalement introuvable.",
  TARGET_NOT_FOUND: "Le contenu à signaler est introuvable ou inaccessible.",
  SELF_REPORT_FORBIDDEN:
    "Vous ne pouvez pas signaler votre propre compte.",
  DUPLICATE_ACTIVE_REPORT:
    "Vous avez déjà un signalement actif pour ce contenu.",
  DESCRIPTION_REQUIRED:
    "Une description est obligatoire lorsque le motif est OTHER.",
  INVALID_FILTERS: "Les filtres de signalement sont invalides.",
});
