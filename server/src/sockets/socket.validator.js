import { z } from "zod";

export const conversationSocketPayloadSchema = z
  .object({
    conversationId: z
      .string()
      .trim()
      .min(1, "L'identifiant de la conversation est obligatoire."),
  })
  .strict();
