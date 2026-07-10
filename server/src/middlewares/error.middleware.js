import { ZodError } from "zod";

import { AppError } from "../../core/errors/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

function isMalformedJsonError(error) {
  return (
    error instanceof SyntaxError &&
    error.status === 400 &&
    Object.prototype.hasOwnProperty.call(error, "body")
  );
}

function resolveKnownError(error) {
  if (error?.type === "entity.too.large") {
    return {
      statusCode: 413,
      message: "La requête dépasse la taille autorisée.",
    };
  }

  if (isMalformedJsonError(error)) {
    return {
      statusCode: 400,
      message: "Le contenu JSON est invalide.",
    };
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return {
      statusCode: 413,
      message: "Le fichier dépasse la taille autorisée.",
    };
  }

  const prismaErrorMap = {
    P2002: {
      statusCode: 409,
      message: "Une ressource avec ces informations existe déjà.",
    },
    P2003: {
      statusCode: 409,
      message: "Cette opération viole une relation existante.",
    },
    P2025: {
      statusCode: 404,
      message: "La ressource demandée est introuvable.",
    },
  };

  return prismaErrorMap[error?.code] || null;
}

function logApplicationError(error, req, statusCode) {
  const context = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl?.split("?")[0] || req.path,
    statusCode,
    errorName: error?.name || "Error",
    errorCode: error?.code || null,
    errorMessage: error?.message || "Unknown error",
    userId: req.user?.id || null,
    sessionId: req.user?.sessionId || null,
    stack: error?.stack || null,
  };

  if (statusCode >= 500) {
    logger.error("Unhandled application error", context);
    return;
  }

  logger.warn("Handled application error", context);
}

export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    logApplicationError(err, req, 422);

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten(),
      requestId: req.id,
    });
  }

  const knownError = resolveKnownError(err);

  if (knownError) {
    logApplicationError(err, req, knownError.statusCode);

    return res.status(knownError.statusCode).json({
      success: false,
      message: knownError.message,
      requestId: req.id,
    });
  }

  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : Number.isInteger(err?.statusCode)
        ? err.statusCode
        : 500;

  const exposeDetails = env.EXPOSE_ERROR_DETAILS || statusCode < 500;

  const message = exposeDetails
    ? err?.message || "Erreur interne du serveur"
    : "Erreur interne du serveur";

  logApplicationError(err, req, statusCode);

  return res.status(statusCode).json({
    success: false,
    message,
    requestId: req.id,
    ...(exposeDetails &&
      err instanceof AppError &&
      err.details && {
        details: err.details,
      }),
    ...(env.EXPOSE_ERROR_DETAILS &&
      err?.stack && {
        stack: err.stack,
      }),
  });
}
