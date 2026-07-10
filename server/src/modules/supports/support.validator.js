import { z } from "zod";
import {
  SUPPORT_LIMITS,
  SUPPORT_ROLES,
  SUPPORT_STATUSES,
  SUPPORT_TYPES,
} from "./support.constants.js";

const positiveIntegerQuerySchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, {
    message: "La valeur doit être un entier strictement positif.",
  });

export const createSupportSchema = z
  .object({
    type: z.enum(Object.values(SUPPORT_TYPES)),
    message: z
      .string({ required_error: "Le message est obligatoire." })
      .trim()
      .min(
        SUPPORT_LIMITS.MESSAGE_MIN,
        `Le message doit contenir au moins ${SUPPORT_LIMITS.MESSAGE_MIN} caractères.`,
      )
      .max(
        SUPPORT_LIMITS.MESSAGE_MAX,
        `Le message ne doit pas dépasser ${SUPPORT_LIMITS.MESSAGE_MAX} caractères.`,
      ),
    isAnonymous: z.boolean().optional(),
  })
  .strict();

export const listAvailableSupportsQuerySchema = z
  .object({
    page: positiveIntegerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.optional(),
    type: z.enum(Object.values(SUPPORT_TYPES)).optional(),
  })
  .passthrough();

export const listMySupportsQuerySchema = z
  .object({
    page: positiveIntegerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.optional(),
    type: z.enum(Object.values(SUPPORT_TYPES)).optional(),
    status: z.enum(Object.values(SUPPORT_STATUSES)).optional(),
    role: z.enum(Object.values(SUPPORT_ROLES)).optional(),
  })
  .passthrough();
