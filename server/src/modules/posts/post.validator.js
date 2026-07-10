import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu est obligatoire.")
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

  visibility: z.enum(["PUBLIC", "GROUP", "PRIVATE"]).optional(),

  isAnonymous: z.boolean().optional(),
});
