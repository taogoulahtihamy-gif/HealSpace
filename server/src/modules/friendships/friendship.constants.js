export const FRIENDSHIP_STATUSES = Object.freeze({
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
});

export const FRIENDSHIP_LIMITS = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const FRIENDSHIP_MESSAGES = Object.freeze({
  REQUEST_SENT: "Demande d'amitié envoyée avec succès.",
  REQUESTS_LISTED: "Demandes d'amitié récupérées avec succès.",
  REQUEST_ACCEPTED: "Demande d'amitié acceptée avec succès.",
  REQUEST_REJECTED: "Demande d'amitié refusée avec succès.",
  REQUEST_CANCELLED: "Demande d'amitié annulée avec succès.",
  FRIENDS_LISTED: "Liste d'amis récupérée avec succès.",
  FRIENDSHIP_REMOVED: "Relation d'amitié supprimée avec succès.",

  USER_NOT_FOUND: "Utilisateur introuvable.",
  REQUEST_NOT_FOUND: "Demande d'amitié introuvable.",
  FRIENDSHIP_NOT_FOUND: "Relation d'amitié introuvable.",
  SELF_REQUEST_FORBIDDEN:
    "Vous ne pouvez pas vous envoyer une demande d'amitié.",
  ALREADY_FRIENDS: "Vous êtes déjà amis.",
  REQUEST_ALREADY_PENDING:
    "Une demande d'amitié est déjà en attente entre ces utilisateurs.",
  FORBIDDEN:
    "Vous n'êtes pas autorisé à effectuer cette action.",
  INVALID_FILTERS:
    "Les paramètres de pagination sont invalides.",
});

export const FRIENDSHIP_NOTIFICATION = Object.freeze({
  REQUEST_TITLE: "Nouvelle demande d'amitié",
  REQUEST_MESSAGE:
    "Une personne souhaite vous ajouter à ses amis.",
  ACCEPTED_TITLE: "Demande d'amitié acceptée",
  ACCEPTED_MESSAGE:
    "Votre demande d'amitié a été acceptée.",
});
