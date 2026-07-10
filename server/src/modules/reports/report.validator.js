import { z } from "zod";
import {
  REPORT_LIMITS,
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
} from "./report.constants.js";

const positiveIntegerQuerySchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, {
    message: "La valeur doit être un entier strictement positif.",
  });

export const createReportSchema = z
  .object({
    targetType: z.enum(Object.values(REPORT_TARGET_TYPES)),
    targetId: z
      .string({
        required_error: "La cible du signalement est obligatoire.",
      })
      .trim()
      .min(1, "La cible du signalement est obligatoire."),
    reason: z.enum(Object.values(REPORT_REASONS)),
    description: z
      .string()
      .trim()
      .min(
        REPORT_LIMITS.DESCRIPTION_MIN,
        `La description doit contenir au moins ${REPORT_LIMITS.DESCRIPTION_MIN} caractères.`,
      )
      .max(
        REPORT_LIMITS.DESCRIPTION_MAX,
        `La description ne doit pas dépasser ${REPORT_LIMITS.DESCRIPTION_MAX} caractères.`,
      )
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.reason === REPORT_REASONS.OTHER && !data.description) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message:
          "Une description est obligatoire lorsque le motif est OTHER.",
      });
    }
  });

export const listMyReportsQuerySchema = z
  .object({
    page: positiveIntegerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.optional(),
    status: z.enum(Object.values(REPORT_STATUSES)).optional(),
    targetType: z.enum(Object.values(REPORT_TARGET_TYPES)).optional(),
    reason: z.enum(Object.values(REPORT_REASONS)).optional(),
  })
  .passthrough();
