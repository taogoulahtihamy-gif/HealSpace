import { z } from "zod";

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide.")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères."),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide.")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères."),
});
