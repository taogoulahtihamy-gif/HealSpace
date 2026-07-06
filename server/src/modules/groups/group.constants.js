export const GROUP_VISIBILITIES = Object.freeze({
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
});

export const GROUP_MEMBER_ROLES = Object.freeze({
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
});

export const GROUP_LIMITS = Object.freeze({
  NAME_MIN: 3,
  NAME_MAX: 80,
  DESCRIPTION_MAX: 500,
  COVER_URL_MAX: 2048,
  SEARCH_MAX: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
});

export const GROUP_MESSAGES = Object.freeze({
  CREATED: "Groupe créé avec succès.",
  LISTED: "Groupes récupérés avec succès.",
  RETRIEVED: "Groupe récupéré avec succès.",
  UPDATED: "Groupe modifié avec succès.",
  DELETED: "Groupe supprimé avec succès.",

  JOINED: "Vous avez rejoint le groupe avec succès.",
  LEFT: "Vous avez quitté le groupe avec succès.",

  MEMBERS_LISTED:
    "Membres du groupe récupérés avec succès.",

  MEMBER_ROLE_UPDATED:
    "Rôle du membre modifié avec succès.",

  MEMBER_REMOVED:
    "Membre retiré du groupe avec succès.",

  NOT_FOUND: "Groupe introuvable.",

  MEMBER_NOT_FOUND:
    "Membre introuvable dans ce groupe.",

  ALREADY_MEMBER:
    "Vous êtes déjà membre de ce groupe.",

  PRIVATE_GROUP:
    "Ce groupe est privé et ne peut pas être rejoint directement.",

  NOT_MEMBER:
    "Vous n'êtes pas membre de ce groupe.",

  FORBIDDEN:
    "Vous n'êtes pas autorisé à effectuer cette action.",

  OWNER_CANNOT_LEAVE:
    "Le propriétaire ne peut pas quitter le groupe sans transférer la propriété.",

  OWNER_CANNOT_BE_REMOVED:
    "Le propriétaire du groupe ne peut pas être retiré.",

  OWNER_ROLE_IMMUTABLE:
    "Le rôle du propriétaire ne peut pas être modifié.",

  CANNOT_PROMOTE_OWNER:
    "Le rôle OWNER ne peut pas être attribué avec cette opération.",
});

export const GROUP_NOTIFICATION = Object.freeze({
  JOIN_TITLE: "Nouveau membre",
  JOIN_MESSAGE:
    "Une personne a rejoint votre groupe.",
});