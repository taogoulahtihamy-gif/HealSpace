import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères."),
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Le refresh token est obligatoire."),
});
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Le refresh token est obligatoire."),
});