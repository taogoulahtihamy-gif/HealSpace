import { z } from "zod";
import {
  GROUP_LIMITS,
  GROUP_MEMBER_ROLES,
  GROUP_VISIBILITIES,
} from "./group.constants.js";

const optionalHttpUrl = z
  .string()
  .trim()
  .url("L'URL de couverture est invalide.")
  .max(2048, "L'URL de couverture est trop longue.")
  .nullable()
  .optional();

export const createGroupSchema = z
  .object({
    name: z
      .string({ required_error: "Le nom du groupe est obligatoire." })
      .trim()
      .min(
        GROUP_LIMITS.NAME_MIN,
        `Le nom doit contenir au moins ${GROUP_LIMITS.NAME_MIN} caractères.`,
      )
      .max(
        GROUP_LIMITS.NAME_MAX,
        `Le nom ne doit pas dépasser ${GROUP_LIMITS.NAME_MAX} caractères.`,
      ),
    description: z
      .string()
      .trim()
      .max(
        GROUP_LIMITS.DESCRIPTION_MAX,
        `La description ne doit pas dépasser ${GROUP_LIMITS.DESCRIPTION_MAX} caractères.`,
      )
      .nullable()
      .optional(),
    coverUrl: optionalHttpUrl,
    visibility: z
      .enum(Object.values(GROUP_VISIBILITIES), {
        errorMap: () => ({ message: "La visibilité du groupe est invalide." }),
      })
      .optional(),
  })
  .strict();

export const updateGroupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        GROUP_LIMITS.NAME_MIN,
        `Le nom doit contenir au moins ${GROUP_LIMITS.NAME_MIN} caractères.`,
      )
      .max(
        GROUP_LIMITS.NAME_MAX,
        `Le nom ne doit pas dépasser ${GROUP_LIMITS.NAME_MAX} caractères.`,
      )
      .optional(),
    description: z
      .string()
      .trim()
      .max(
        GROUP_LIMITS.DESCRIPTION_MAX,
        `La description ne doit pas dépasser ${GROUP_LIMITS.DESCRIPTION_MAX} caractères.`,
      )
      .nullable()
      .optional(),
    coverUrl: optionalHttpUrl,
    visibility: z
      .enum(Object.values(GROUP_VISIBILITIES), {
        errorMap: () => ({ message: "La visibilité du groupe est invalide." }),
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Aucune donnée à modifier.",
  });

export const updateGroupMemberRoleSchema = z
  .object({
    role: z.enum(
      [GROUP_MEMBER_ROLES.ADMIN, GROUP_MEMBER_ROLES.MEMBER],
      {
        errorMap: () => ({ message: "Le rôle doit être ADMIN ou MEMBER." }),
      },
    ),
  })
  .strict();
