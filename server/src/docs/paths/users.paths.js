import {
  jsonRequestBody,
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const usersPaths = {
  "/users/me": {
    get: secured({
      tags: ["Users"],
      summary: "Consulter mon profil",
      responses: {
        200: successResponse("Profil courant."),
      },
    }),

    patch: secured({
      tags: ["Users"],
      summary: "Modifier mon profil",
      requestBody: jsonRequestBody({
        type: "object",
        properties: {
          bio: {
            type: "string",
          },
          country: {
            type: "string",
          },
          city: {
            type: "string",
          },
          language: {
            type: "string",
          },
          currentMood: {
            $ref: "#/components/schemas/MoodType",
          },
        },
      }),
      responses: {
        200: successResponse("Profil modifié."),
      },
    }),

    delete: secured({
      tags: ["Users"],
      summary: "Désactiver mon compte",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["password"],
        properties: {
          password: {
            type: "string",
            format: "password",
          },
        },
      }),
      responses: {
        200: successResponse("Compte désactivé."),
      },
    }),
  },

  "/users/me/password": {
    patch: secured({
      tags: ["Users"],
      summary: "Changer mon mot de passe",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["currentPassword", "newPassword", "confirmPassword"],
        properties: {
          currentPassword: {
            type: "string",
            format: "password",
          },
          newPassword: {
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
        200: successResponse("Mot de passe modifié."),
      },
    }),
  },

  "/users/me/privacy": {
    patch: secured({
      tags: ["Users"],
      summary: "Modifier ma confidentialité",
      requestBody: jsonRequestBody({
        type: "object",
        properties: {
          visibility: {
            $ref: "#/components/schemas/Visibility",
          },
          isPrivate: {
            type: "boolean",
          },
          allowAI: {
            type: "boolean",
          },
        },
      }),
      responses: {
        200: successResponse("Confidentialité modifiée."),
      },
    }),
  },

  "/users/search": {
    get: secured({
      tags: ["Users"],
      summary: "Rechercher des utilisateurs",
      parameters: [
        queryParam(
          "q",
          "Recherche par username, prénom, nom ou nom complet.",
        ),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Résultats de recherche."),
      },
    }),
  },

  "/users/{userId}": {
    get: secured({
      tags: ["Users"],
      summary: "Consulter un profil public ou accessible",
      parameters: [pathParam("userId", "Identifiant utilisateur.")],
      responses: {
        200: successResponse("Profil utilisateur."),
        403: {
          $ref: "#/components/responses/ForbiddenError",
        },
        404: {
          $ref: "#/components/responses/NotFoundError",
        },
      },
    }),
  },
};
