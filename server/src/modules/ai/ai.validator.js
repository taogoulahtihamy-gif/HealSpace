import { z } from "zod";

export const analyzeMoodSchema = z.object({
  content: z
    .string()
    .min(3, "Le contenu doit contenir au moins 3 caractères.")
    .max(5000, "Le contenu ne peut pas dépasser 5000 caractères."),
});

export const generateSupportSchema = z.object({
  content: z
    .string()
    .min(3, "Le contenu doit contenir au moins 3 caractères.")
    .max(5000, "Le contenu ne peut pas dépasser 5000 caractères."),

  mood: z
    .enum([
      "HAPPY",
      "CALM",
      "STRESSED",
      "SAD",
      "ANXIOUS",
      "ANGRY",
      "MOTIVATED",
      "EXHAUSTED",
    ])
    .optional(),

  intention: z
    .enum(["BE_LISTENED", "RECEIVE_ADVICE", "FIND_SIMILAR_PEOPLE"])
    .optional(),
});
