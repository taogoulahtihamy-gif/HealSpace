export const MEDIA_MESSAGES = {
  CREATED: "Média enregistré avec succès.",
  LIST_FETCHED: "Médias récupérés avec succès.",
  FETCHED: "Média récupéré avec succès.",
  DELETED: "Média supprimé avec succès.",
  NOT_FOUND: "Média introuvable.",
  FORBIDDEN: "Action non autorisée sur ce média.",
  INVALID_TYPE: "Type de média invalide.",
};

export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
];

export const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
