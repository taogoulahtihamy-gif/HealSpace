export const USER_MESSAGES = Object.freeze({
  PROFILE_FETCHED: "Profil récupéré avec succès.",
  PROFILE_UPDATED: "Profil mis à jour avec succès.",
  PUBLIC_PROFILE_FETCHED: "Profil public récupéré avec succès.",
  USERS_SEARCHED: "Utilisateurs recherchés avec succès.",
  PASSWORD_UPDATED: "Mot de passe modifié avec succès.",
  PRIVACY_UPDATED:
    "Paramètres de confidentialité mis à jour avec succès.",
  ACCOUNT_DEACTIVATED: "Compte désactivé avec succès.",

  NOT_FOUND: "Utilisateur introuvable.",
  PRIVATE_PROFILE: "Ce profil n'est pas accessible.",
  USERNAME_ALREADY_EXISTS: "Ce nom d'utilisateur est déjà utilisé.",
  CURRENT_PASSWORD_INVALID: "Le mot de passe actuel est incorrect.",
  INVALID_SEARCH: "Les paramètres de recherche sont invalides.",
});

export const USER_LIMITS = Object.freeze({
  FIRST_NAME_MIN: 2,
  FIRST_NAME_MAX: 50,
  LAST_NAME_MIN: 2,
  LAST_NAME_MAX: 50,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  PHONE_MAX: 30,
  BIO_MAX: 500,
  COUNTRY_MAX: 80,
  CITY_MAX: 80,
  LANGUAGE_MAX: 10,
  TIMEZONE_MAX: 100,
  URL_MAX: 2048,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,

  SEARCH_MIN: 2,
  SEARCH_MAX: 80,
  SEARCH_DEFAULT_PAGE: 1,
  SEARCH_DEFAULT_LIMIT: 20,
  SEARCH_MAX_LIMIT: 50,
});

export const USER_VISIBILITIES = Object.freeze({
  PUBLIC: "PUBLIC",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
});

export const USER_GENDERS = Object.freeze({
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
});

export const USER_MOODS = Object.freeze({
  HAPPY: "HAPPY",
  CALM: "CALM",
  STRESSED: "STRESSED",
  SAD: "SAD",
  ANXIOUS: "ANXIOUS",
  ANGRY: "ANGRY",
  MOTIVATED: "MOTIVATED",
  EXHAUSTED: "EXHAUSTED",
});
