import { z } from "zod";

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Email invalide.")
      .transform((value) => value.toLowerCase()),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(32, "Le jeton de réinitialisation est invalide.")
      .max(256, "Le jeton de réinitialisation est invalide."),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
