import { z } from "zod";
import {
  USER_GENDERS,
  USER_LIMITS,
  USER_MOODS,
  USER_VISIBILITIES,
} from "./user.constants.js";

const trimmedOptionalString = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} ne doit pas dépasser ${max} caractères.`)
    .nullable()
    .optional();

const passwordSchema = z
  .string()
  .min(
    USER_LIMITS.PASSWORD_MIN,
    `Le mot de passe doit contenir au moins ${USER_LIMITS.PASSWORD_MIN} caractères.`,
  )
  .max(
    USER_LIMITS.PASSWORD_MAX,
    `Le mot de passe ne doit pas dépasser ${USER_LIMITS.PASSWORD_MAX} caractères.`,
  );

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(
        USER_LIMITS.FIRST_NAME_MIN,
        `Le prénom doit contenir au moins ${USER_LIMITS.FIRST_NAME_MIN} caractères.`,
      )
      .max(
        USER_LIMITS.FIRST_NAME_MAX,
        `Le prénom ne doit pas dépasser ${USER_LIMITS.FIRST_NAME_MAX} caractères.`,
      )
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(
        USER_LIMITS.LAST_NAME_MIN,
        `Le nom doit contenir au moins ${USER_LIMITS.LAST_NAME_MIN} caractères.`,
      )
      .max(
        USER_LIMITS.LAST_NAME_MAX,
        `Le nom ne doit pas dépasser ${USER_LIMITS.LAST_NAME_MAX} caractères.`,
      )
      .optional(),

    username: z
      .string()
      .trim()
      .min(
        USER_LIMITS.USERNAME_MIN,
        `Le nom d'utilisateur doit contenir au moins ${USER_LIMITS.USERNAME_MIN} caractères.`,
      )
      .max(
        USER_LIMITS.USERNAME_MAX,
        `Le nom d'utilisateur ne doit pas dépasser ${USER_LIMITS.USERNAME_MAX} caractères.`,
      )
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Le nom d'utilisateur contient des caractères invalides.",
      )
      .optional(),

    phone: trimmedOptionalString(USER_LIMITS.PHONE_MAX, "Le téléphone"),
    avatar: z
      .string()
      .trim()
      .url("L'URL de l'avatar est invalide.")
      .max(USER_LIMITS.URL_MAX)
      .nullable()
      .optional(),
    coverPhoto: z
      .string()
      .trim()
      .url("L'URL de couverture est invalide.")
      .max(USER_LIMITS.URL_MAX)
      .nullable()
      .optional(),
    bio: trimmedOptionalString(USER_LIMITS.BIO_MAX, "La biographie"),
    birthDate: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional(),
    gender: z.enum(Object.values(USER_GENDERS)).nullable().optional(),
    country: trimmedOptionalString(USER_LIMITS.COUNTRY_MAX, "Le pays"),
    city: trimmedOptionalString(USER_LIMITS.CITY_MAX, "La ville"),
    language: z
      .string()
      .trim()
      .min(2, "La langue est invalide.")
      .max(USER_LIMITS.LANGUAGE_MAX)
      .optional(),
    timezone: trimmedOptionalString(USER_LIMITS.TIMEZONE_MAX, "Le fuseau horaire"),
    currentMood: z.enum(Object.values(USER_MOODS)).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni.",
  });

export const updatePrivacySchema = z
  .object({
    visibility: z.enum(Object.values(USER_VISIBILITIES)).optional(),
    isPrivate: z.boolean().optional(),
    allowAI: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un paramètre doit être fourni.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "La confirmation du mot de passe ne correspond pas.",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "Le nouveau mot de passe doit être différent de l'ancien.",
  });

export const deactivateAccountSchema = z
  .object({
    password: passwordSchema,
  })
  .strict();
