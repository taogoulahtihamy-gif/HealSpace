import { z } from "zod";
import { JOURNAL_LIMITS, JOURNAL_MOODS } from "./journal.constants.js";

const moodSchema = z.enum(Object.values(JOURNAL_MOODS), {
  errorMap: () => ({ message: "L'humeur est invalide." }),
});

const occurredAtSchema = z
  .string()
  .datetime({ offset: true, message: "La date doit être au format ISO 8601." });

export const createJournalEntrySchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(
        JOURNAL_LIMITS.TITLE_MAX,
        `Le titre ne doit pas dépasser ${JOURNAL_LIMITS.TITLE_MAX} caractères.`,
      )
      .nullable()
      .optional(),
    content: z
      .string({ required_error: "Le contenu est obligatoire." })
      .trim()
      .min(
        JOURNAL_LIMITS.CONTENT_MIN,
        "Le contenu ne peut pas être vide.",
      )
      .max(
        JOURNAL_LIMITS.CONTENT_MAX,
        `Le contenu ne doit pas dépasser ${JOURNAL_LIMITS.CONTENT_MAX} caractères.`,
      ),
    mood: moodSchema,
    intensity: z
      .number()
      .int("L'intensité doit être un nombre entier.")
      .min(
        JOURNAL_LIMITS.INTENSITY_MIN,
        `L'intensité minimale est ${JOURNAL_LIMITS.INTENSITY_MIN}.`,
      )
      .max(
        JOURNAL_LIMITS.INTENSITY_MAX,
        `L'intensité maximale est ${JOURNAL_LIMITS.INTENSITY_MAX}.`,
      )
      .nullable()
      .optional(),
    occurredAt: occurredAtSchema.optional(),
  })
  .strict();

export const updateJournalEntrySchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(
        JOURNAL_LIMITS.TITLE_MAX,
        `Le titre ne doit pas dépasser ${JOURNAL_LIMITS.TITLE_MAX} caractères.`,
      )
      .nullable()
      .optional(),
    content: z
      .string()
      .trim()
      .min(
        JOURNAL_LIMITS.CONTENT_MIN,
        "Le contenu ne peut pas être vide.",
      )
      .max(
        JOURNAL_LIMITS.CONTENT_MAX,
        `Le contenu ne doit pas dépasser ${JOURNAL_LIMITS.CONTENT_MAX} caractères.`,
      )
      .optional(),
    mood: moodSchema.optional(),
    intensity: z
      .number()
      .int("L'intensité doit être un nombre entier.")
      .min(
        JOURNAL_LIMITS.INTENSITY_MIN,
        `L'intensité minimale est ${JOURNAL_LIMITS.INTENSITY_MIN}.`,
      )
      .max(
        JOURNAL_LIMITS.INTENSITY_MAX,
        `L'intensité maximale est ${JOURNAL_LIMITS.INTENSITY_MAX}.`,
      )
      .nullable()
      .optional(),
    occurredAt: occurredAtSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Aucune donnée à modifier.",
  });
