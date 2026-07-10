import { z } from "zod";

export const sendEmailVerificationSchema = z.object({}).strict();

export const verifyEmailSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(32, "Le jeton de vérification est invalide.")
      .max(256, "Le jeton de vérification est invalide."),
  })
  .strict();
