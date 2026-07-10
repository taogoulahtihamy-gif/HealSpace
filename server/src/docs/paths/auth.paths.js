import {
  jsonRequestBody,
  secured,
  successResponse,
  pathParam,
} from "../helpers.js";

export const authPaths = {
  "/health": {
    get: {
      tags: ["System"],
      summary: "Vérifier que l’API fonctionne",
      responses: {
        200: successResponse("API opérationnelle."),
      },
    },
  },

  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Créer un compte utilisateur",
      requestBody: jsonRequestBody({
        type: "object",
        required: [
          "firstName",
          "lastName",
          "username",
          "email",
          "password",
        ],
        properties: {
          firstName: {
            type: "string",
            example: "Ezekiel",
          },
          lastName: {
            type: "string",
            example: "Test",
          },
          username: {
            type: "string",
            example: "ezekiel_test",
          },
          email: {
            type: "string",
            format: "email",
            example: "ezekiel@test.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "password123",
          },
        },
      }),
      responses: {
        201: successResponse(
          "Compte créé.",
          "#/components/schemas/ApiSuccess",
        ),
        400: {
          $ref: "#/components/responses/ValidationError",
        },
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    },
  },

  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Connecter un utilisateur",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
            format: "password",
          },
        },
      }),
      responses: {
        200: successResponse(
          "Connexion réussie.",
          "#/components/schemas/ApiSuccess",
        ),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    },
  },

  "/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Renouveler une session avec rotation du refresh token",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Tokens renouvelés."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    },
  },

  "/auth/logout": {
    post: secured({
      tags: ["Auth"],
      summary: "Déconnecter la session courante",
      responses: {
        200: successResponse("Session déconnectée."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    }),
  },

  "/auth/logout-all": {
    post: secured({
      tags: ["Auth"],
      summary: "Déconnecter toutes les sessions",
      responses: {
        200: successResponse("Toutes les sessions ont été révoquées."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    }),
  },

  "/auth/me": {
    get: secured({
      tags: ["Auth"],
      summary: "Retourner l’utilisateur connecté",
      responses: {
        200: successResponse("Utilisateur courant."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    }),
  },

  "/auth/sessions": {
    get: secured({
      tags: ["Sessions"],
      summary: "Lister les sessions actives de l’utilisateur",
      responses: {
        200: successResponse("Sessions actives."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    }),
  },

  "/auth/sessions/others": {
    delete: secured({
      tags: ["Sessions"],
      summary: "Révoquer toutes les autres sessions",
      responses: {
        200: successResponse("Autres sessions révoquées."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    }),
  },

  "/auth/sessions/{sessionId}": {
    delete: secured({
      tags: ["Sessions"],
      summary: "Révoquer une session précise",
      parameters: [
        pathParam("sessionId", "Identifiant de la session."),
      ],
      responses: {
        200: successResponse("Session révoquée."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
        404: {
          $ref: "#/components/responses/NotFoundError",
        },
      },
    }),
  },

  "/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Demander un lien de réinitialisation du mot de passe",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
        },
      }),
      responses: {
        200: successResponse("Demande acceptée."),
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    },
  },

  "/auth/reset-password": {
    post: {
      tags: ["Auth"],
      summary: "Réinitialiser le mot de passe avec un token",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["token", "password", "confirmPassword"],
        properties: {
          token: {
            type: "string",
          },
          password: {
            type: "string",
            format: "password",
          },
          confirmPassword: {
            type: "string",
            format: "password",
          },
        },
      }),
      responses: {
        200: successResponse("Mot de passe réinitialisé."),
        400: {
          $ref: "#/components/responses/ValidationError",
        },
      },
    },
  },

  "/auth/email-verification/send": {
    post: secured({
      tags: ["Auth"],
      summary: "Envoyer ou renvoyer l’email de vérification",
      requestBody: jsonRequestBody(
        {
          type: "object",
          properties: {},
        },
        false,
      ),
      responses: {
        200: successResponse("Email de vérification accepté."),
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    }),
  },

  "/auth/email-verification/verify": {
    post: {
      tags: ["Auth"],
      summary: "Valider l’adresse email avec un token",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["token"],
        properties: {
          token: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Adresse email vérifiée."),
        400: {
          $ref: "#/components/responses/ValidationError",
        },
      },
    },
  },
};
