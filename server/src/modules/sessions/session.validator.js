import { z } from "zod";

export const sessionIdParamSchema = z
  .object({
    sessionId: z
      .string()
      .trim()
      .min(10, "L'identifiant de session est invalide.")
      .max(64, "L'identifiant de session est invalide."),
  })
  .strict();

export function validateSessionIdParam(req, res, next) {
  const result = sessionIdParamSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  req.params = result.data;
  return next();
}
