import { z } from "zod";
import {
  NOTIFICATION_LIMITS,
  NOTIFICATION_TYPES,
} from "./notification.constants.js";

const notificationTypeSchema = z.enum(
  Object.values(NOTIFICATION_TYPES),
  {
    errorMap: () => ({
      message: "Le type de notification est invalide.",
    }),
  },
);

const positiveIntegerQuerySchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, {
    message: "La valeur doit être un entier strictement positif.",
  });

export const createNotificationSchema = z
  .object({
    userId: z
      .string({ required_error: "Le destinataire est obligatoire." })
      .trim()
      .min(1, "Le destinataire est obligatoire."),
    actorId: z
      .string()
      .trim()
      .min(1, "L'acteur est invalide.")
      .nullable()
      .optional(),
    type: notificationTypeSchema,
    title: z
      .string({ required_error: "Le titre est obligatoire." })
      .trim()
      .min(1, "Le titre est obligatoire.")
      .max(
        NOTIFICATION_LIMITS.TITLE_MAX,
        `Le titre ne doit pas dépasser ${NOTIFICATION_LIMITS.TITLE_MAX} caractères.`,
      ),
    message: z
      .string({ required_error: "Le message est obligatoire." })
      .trim()
      .min(1, "Le message est obligatoire.")
      .max(
        NOTIFICATION_LIMITS.MESSAGE_MAX,
        `Le message ne doit pas dépasser ${NOTIFICATION_LIMITS.MESSAGE_MAX} caractères.`,
      ),
    data: z.unknown().nullable().optional(),
  })
  .strict();

export const listNotificationsQuerySchema = z
  .object({
    page: positiveIntegerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.optional(),
    isRead: z.enum(["true", "false"]).optional(),
    type: notificationTypeSchema.optional(),
  })
  .passthrough();
