export const JOURNAL_MOODS = Object.freeze({
  HAPPY: "HAPPY",
  CALM: "CALM",
  STRESSED: "STRESSED",
  SAD: "SAD",
  ANXIOUS: "ANXIOUS",
  ANGRY: "ANGRY",
  MOTIVATED: "MOTIVATED",
  EXHAUSTED: "EXHAUSTED",
});

export const JOURNAL_LIMITS = Object.freeze({
  TITLE_MAX: 120,
  CONTENT_MIN: 1,
  CONTENT_MAX: 10000,
  INTENSITY_MIN: 1,
  INTENSITY_MAX: 10,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const JOURNAL_MESSAGES = Object.freeze({
  CREATED: "Entrée de journal créée avec succès.",
  LISTED: "Entrées de journal récupérées avec succès.",
  RETRIEVED: "Entrée de journal récupérée avec succès.",
  UPDATED: "Entrée de journal modifiée avec succès.",
  DELETED: "Entrée de journal supprimée avec succès.",
  SUMMARY_RETRIEVED: "Résumé émotionnel récupéré avec succès.",
  NOT_FOUND: "Entrée de journal introuvable.",
  INVALID_MOOD: "L'humeur fournie est invalide.",
  INVALID_DATE: "La date fournie est invalide.",
  INVALID_DATE_RANGE:
    "La date de début doit être antérieure ou égale à la date de fin.",
});
