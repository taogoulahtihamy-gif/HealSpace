export const commonResponses = {
  UnauthorizedError: {
    description: "Authentification requise ou token invalide.",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          success: false,
          message: "Token manquant ou invalide.",
        },
      },
    },
  },
  ForbiddenError: {
    description: "Accès interdit.",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          success: false,
          message: "Accès interdit.",
        },
      },
    },
  },
  NotFoundError: {
    description: "Ressource introuvable.",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          success: false,
          message: "Ressource introuvable.",
        },
      },
    },
  },
  ValidationError: {
    description: "Données invalides.",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          success: false,
          message: "Données invalides.",
        },
      },
    },
  },
  RateLimitError: {
    description: "Trop de requêtes.",
    headers: {
      "Retry-After": {
        schema: {
          type: "integer",
        },
      },
      RateLimit: {
        schema: {
          type: "string",
        },
      },
    },
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          success: false,
          message: "Trop de requêtes. Réessayez plus tard.",
        },
      },
    },
  },
};
