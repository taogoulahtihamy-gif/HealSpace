export const MEDIA_MESSAGES = Object.freeze({
  CREATED: "Média enregistré avec succès.",
  UPLOADED: "Média téléversé avec succès.",
  LIST_FETCHED: "Médias récupérés avec succès.",
  FETCHED: "Média récupéré avec succès.",
  DELETED: "Média supprimé avec succès.",

  NOT_FOUND: "Média introuvable.",
  POST_NOT_FOUND: "Publication introuvable.",
  FORBIDDEN: "Action non autorisée sur ce média.",
  POST_FORBIDDEN:
    "Vous ne pouvez pas rattacher un média à cette publication.",
  INVALID_TYPE: "Type de média invalide.",
  FILE_REQUIRED: "Le fichier à téléverser est obligatoire.",
  FILE_TOO_LARGE: "Le fichier ne doit pas dépasser 10 Mo.",
  UPLOAD_FAILED: "Le téléversement du média vers Cloudinary a échoué.",
  CLOUD_DELETE_FAILED: "La suppression du média distant a échoué.",
});

export const ALLOWED_MEDIA_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "video/mp4",
]);

export const MAX_MEDIA_SIZE = 10 * 1024 * 1024;

export const MEDIA_UPLOAD_FIELD = "file";

export const MEDIA_TYPES = Object.freeze({
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  FILE: "FILE",
});

export const CLOUDINARY_RESOURCE_TYPES = Object.freeze({
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "video",
  FILE: "raw",
});

export const CLOUDINARY_DELETE_RESULTS = Object.freeze([
  "ok",
  "not found",
]);

export const DEFAULT_CLOUDINARY_FOLDER = "healspace/media";
