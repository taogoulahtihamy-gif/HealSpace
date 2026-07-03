import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire est obligatoire.")
    .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères."),

  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire est obligatoire.")
    .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères."),
});
