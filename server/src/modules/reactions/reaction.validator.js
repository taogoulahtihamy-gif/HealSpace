import { z } from "zod";

export const reactionSchema = z.object({
  type: z
    .enum([
      "LIKE",
      "LOVE",
      "HUG",
      "SUPPORT",
      "THANKS",
      "INSIGHTFUL",
    ], {
      message: "Type de réaction invalide.",
    }),
});