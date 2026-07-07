import { z } from "zod";
import {
  MODERATION_LIMITS,
  MODERATION_USER_STATUSES,
} from "./moderation.constants.js";

const positiveIntegerQuerySchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, {
    message: "La valeur doit être un entier strictement positif.",
  });

const moderationNoteSchema = z
  .string({ required_error: "La note de décision est obligatoire." })
  .trim()
  .min(
    MODERATION_LIMITS.NOTE_MIN,
    `La note doit contenir au moins ${MODERATION_LIMITS.NOTE_MIN} caractères.`,
  )
  .max(
    MODERATION_LIMITS.NOTE_MAX,
    `La note ne doit pas dépasser ${MODERATION_LIMITS.NOTE_MAX} caractères.`,
  );

export const listModerationReportsQuerySchema = z
  .object({
    page: positiveIntegerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.optional(),
    status: z
      .enum([
        "PENDING",
        "UNDER_REVIEW",
        "RESOLVED",
        "REJECTED",
      ])
      .optional(),
    targetType: z
      .enum([
        "USER",
        "POST",
        "COMMENT",
        "MESSAGE",
        "GROUP",
      ])
      .optional(),
    reason: z
      .enum([
        "HARASSMENT",
        "HATE_SPEECH",
        "SPAM",
        "VIOLENCE",
        "SELF_HARM",
        "INAPPROPRIATE_CONTENT",
        "OTHER",
      ])
      .optional(),
    reviewerId: z.string().trim().min(1).optional(),
  })
  .passthrough();

export const resolveReportSchema = z
  .object({
    resolutionNote: moderationNoteSchema,
  })
  .strict();

export const rejectReportSchema = z
  .object({
    resolutionNote: moderationNoteSchema,
  })
  .strict();

export const updateUserStatusSchema = z
  .object({
    status: z.enum(
      Object.values(MODERATION_USER_STATUSES),
    ),
    note: moderationNoteSchema,
  })
  .strict();
