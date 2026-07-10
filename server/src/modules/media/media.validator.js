import { z } from "zod";
import {
  ALLOWED_MEDIA_TYPES,
  MAX_MEDIA_SIZE,
  MEDIA_TYPES,
} from "./media.constants.js";

export const createMediaSchema = z
  .object({
    filename: z
      .string()
      .trim()
      .min(1, "Le nom du fichier est obligatoire."),

    originalName: z
      .string()
      .trim()
      .min(1, "Le nom original du fichier est obligatoire."),

    mimeType: z
      .string()
      .refine((value) => ALLOWED_MEDIA_TYPES.includes(value), {
        message: "Type de média invalide.",
      }),

    size: z
      .number()
      .int("La taille doit être un nombre entier.")
      .positive("La taille du fichier est obligatoire.")
      .max(MAX_MEDIA_SIZE, "Le fichier ne doit pas dépasser 10 Mo."),

    url: z.string().url("L'URL du média est invalide."),

    publicId: z.string().trim().min(1).optional(),

    type: z.enum(Object.values(MEDIA_TYPES)).optional(),

    postId: z.string().trim().min(1).optional(),
  })
  .strict();

export const uploadMediaSchema = z
  .object({
    postId: z.string().trim().min(1).optional(),
  })
  .passthrough();
