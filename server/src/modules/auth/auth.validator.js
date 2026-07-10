import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Le prénom doit contenir au moins 2 caractères."),
    lastName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères."),
    username: z
      .string()
      .trim()
      .min(
        3,
        "Le nom d'utilisateur doit contenir au moins 3 caractères.",
      ),
    email: z.string().trim().toLowerCase().email("Email invalide."),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email invalide."),
    password: z.string().min(1, "Le mot de passe est obligatoire."),
  })
  .strict();

export const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string()
      .trim()
      .min(1, "Le refresh token est obligatoire."),
  })
  .strict();
