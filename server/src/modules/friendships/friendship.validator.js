import { z } from "zod";

const positiveIntegerQuerySchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, {
    message: "La valeur doit être un entier strictement positif.",
  });

export const listFriendshipsQuerySchema = z
  .object({
    page: positiveIntegerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.optional(),
  })
  .passthrough();
