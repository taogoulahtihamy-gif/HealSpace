import {
  jsonRequestBody,
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const reportsPaths = {
  "/reports": {
    post: secured({
      tags: ["Reports"],
      summary: "Créer un signalement",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["targetType", "targetId", "reason"],
        properties: {
          targetType: {
            type: "string",
            enum: ["USER", "POST", "COMMENT", "MESSAGE", "GROUP"],
          },
          targetId: {
            type: "string",
          },
          reason: {
            type: "string",
            enum: [
              "HARASSMENT",
              "HATE_SPEECH",
              "SPAM",
              "VIOLENCE",
              "SELF_HARM",
              "INAPPROPRIATE_CONTENT",
              "OTHER",
            ],
          },
          description: {
            type: "string",
          },
        },
      }),
      responses: {
        201: successResponse("Signalement créé."),
      },
    }),
  },

  "/reports/mine": {
    get: secured({
      tags: ["Reports"],
      summary: "Lister mes signalements",
      parameters: [
        queryParam("targetType", "Filtrer par cible."),
        queryParam("status", "Filtrer par statut."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Mes signalements."),
      },
    }),
  },

  "/reports/{reportId}": {
    get: secured({
      tags: ["Reports"],
      summary: "Consulter mon signalement",
      parameters: [
        pathParam("reportId", "Identifiant du signalement."),
      ],
      responses: {
        200: successResponse("Signalement."),
      },
    }),
  },

  "/moderation/reports": {
    get: secured({
      tags: ["Moderation"],
      summary: "Lister les signalements à modérer",
      parameters: [
        queryParam("status", "Filtrer par statut."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Signalements de modération."),
        403: {
          $ref: "#/components/responses/ForbiddenError",
        },
      },
    }),
  },

  "/moderation/reports/{reportId}": {
    get: secured({
      tags: ["Moderation"],
      summary: "Consulter un signalement à modérer",
      parameters: [
        pathParam("reportId", "Identifiant du signalement."),
      ],
      responses: {
        200: successResponse("Signalement."),
      },
    }),
  },

  "/moderation/reports/{reportId}/review": {
    patch: secured({
      tags: ["Moderation"],
      summary: "Prendre un signalement en revue",
      parameters: [
        pathParam("reportId", "Identifiant du signalement."),
      ],
      responses: {
        200: successResponse("Signalement en revue."),
      },
    }),
  },

  "/moderation/reports/{reportId}/resolve": {
    patch: secured({
      tags: ["Moderation"],
      summary: "Résoudre un signalement",
      parameters: [
        pathParam("reportId", "Identifiant du signalement."),
      ],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["resolutionNote"],
        properties: {
          resolutionNote: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Signalement résolu."),
      },
    }),
  },

  "/moderation/reports/{reportId}/reject": {
    patch: secured({
      tags: ["Moderation"],
      summary: "Rejeter un signalement",
      parameters: [
        pathParam("reportId", "Identifiant du signalement."),
      ],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["resolutionNote"],
        properties: {
          resolutionNote: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Signalement rejeté."),
      },
    }),
  },

  "/moderation/users/{userId}/status": {
    patch: secured({
      tags: ["Moderation"],
      summary: "Modifier le statut d’un utilisateur",
      parameters: [pathParam("userId", "Identifiant utilisateur.")],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["status"],
        properties: {
          status: {
            $ref: "#/components/schemas/UserStatus",
          },
          note: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Statut modifié."),
      },
    }),
  },
};
