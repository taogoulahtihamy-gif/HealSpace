import { ZodError } from "zod";
import { AppError } from "../../core/errors/AppError.js";

export function errorMiddleware(err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV === "development";

  console.error(err);

  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten(),
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: isDevelopment
      ? err.message || "Erreur interne du serveur"
      : "Erreur interne du serveur",
    ...(isDevelopment && { stack: err.stack }),
  });
}