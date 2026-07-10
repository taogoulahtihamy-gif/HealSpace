export const GROUP_INVITATION_STATUSES = Object.freeze({
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

export const GROUP_INVITATION_LIMITS = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
});

export const GROUP_INVITATION_MESSAGES = Object.freeze({
  CREATED: "Invitation au groupe envoyée avec succès.",
  LISTED: "Invitations aux groupes récupérées avec succès.",
  ACCEPTED: "Invitation au groupe acceptée avec succès.",
  REJECTED: "Invitation au groupe refusée avec succès.",
  CANCELLED: "Invitation au groupe annulée avec succès.",

  NOT_FOUND: "Invitation au groupe introuvable.",
  GROUP_NOT_FOUND: "Groupe introuvable.",
  USER_NOT_FOUND: "Utilisateur à inviter introuvable.",
  PRIVATE_GROUP_REQUIRED:
    "Les invitations sont réservées aux groupes privés.",
  FORBIDDEN:
    "Vous n'êtes pas autorisé à gérer les invitations de ce groupe.",
  NOT_RECIPIENT: "Cette invitation ne vous est pas destinée.",
  ALREADY_MEMBER: "Cet utilisateur est déjà membre du groupe.",
  DUPLICATE_ACTIVE:
    "Une invitation active existe déjà pour cet utilisateur.",
  INVALID_STATUS: "Le statut de l'invitation est invalide.",
  INVITATION_NOT_PENDING: "Cette invitation n'est plus en attente.",
  INVITATION_EXPIRED: "Cette invitation a expiré.",
  INVITEE_UNAVAILABLE:
    "Cet utilisateur ne peut pas être invité actuellement.",
});

export const GROUP_INVITATION_NOTIFICATIONS = Object.freeze({
  INVITATION_TITLE: "Invitation à rejoindre un groupe",
  INVITATION_MESSAGE:
    "Vous avez reçu une invitation à rejoindre un groupe privé.",
  ACCEPTED_TITLE: "Invitation au groupe acceptée",
  ACCEPTED_MESSAGE:
    "Votre invitation à rejoindre le groupe a été acceptée.",
});
