export const SUPPORT_TYPES = Object.freeze({
  LISTENING: "LISTENING",
  ADVICE: "ADVICE",
  ENCOURAGEMENT: "ENCOURAGEMENT",
  CHECK_IN: "CHECK_IN",
});

export const SUPPORT_STATUSES = Object.freeze({
  OPEN: "OPEN",
  ACCEPTED: "ACCEPTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
});

export const SUPPORT_ROLES = Object.freeze({
  ALL: "all",
  REQUESTER: "requester",
  SUPPORTER: "supporter",
});

export const SUPPORT_LIMITS = Object.freeze({
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 1000,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const SUPPORT_MESSAGES = Object.freeze({
  CREATED: "Demande de soutien créée avec succès.",
  LISTED: "Demandes de soutien récupérées avec succès.",
  RETRIEVED: "Demande de soutien récupérée avec succès.",
  ACCEPTED: "Demande de soutien acceptée avec succès.",
  COMPLETED: "Soutien clôturé avec succès.",
  CANCELLED: "Demande de soutien annulée avec succès.",

  NOT_FOUND: "Demande de soutien introuvable.",
  FORBIDDEN: "Vous n'êtes pas autorisé à effectuer cette action.",
  CANNOT_ACCEPT_OWN_REQUEST:
    "Vous ne pouvez pas accepter votre propre demande de soutien.",
  ALREADY_HANDLED: "Cette demande de soutien n'est plus disponible.",
  INVALID_STATUS:
    "Cette action n'est pas autorisée pour le statut actuel de la demande.",
});

export const SUPPORT_NOTIFICATION = Object.freeze({
  ACCEPTED_TITLE: "Demande de soutien acceptée",
  ACCEPTED_MESSAGE:
    "Une personne a accepté de vous apporter son soutien.",

  COMPLETED_TITLE: "Soutien clôturé",
  COMPLETED_MESSAGE:
    "L'accompagnement lié à votre demande de soutien a été clôturé.",

  CANCELLED_TITLE: "Soutien annulé",
  CANCELLED_MESSAGE:
    "La demande de soutien que vous aviez acceptée a été annulée.",
});
