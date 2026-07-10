import {
  jsonRequestBody,
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const supportPaths = {
  "/supports": {
    get: secured({
      tags: ["Supports"],
      summary: "Lister les demandes de soutien disponibles",
      parameters: [
        queryParam("type", "Type de soutien."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Demandes disponibles."),
      },
    }),

    post: secured({
      tags: ["Supports"],
      summary: "Créer une demande de soutien",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["type", "message"],
        properties: {
          type: {
            type: "string",
            enum: ["LISTENING", "ADVICE", "ENCOURAGEMENT", "CHECK_IN"],
          },
          message: {
            type: "string",
          },
          isAnonymous: {
            type: "boolean",
          },
        },
      }),
      responses: {
        201: successResponse("Demande créée."),
      },
    }),
  },

  "/supports/mine": {
    get: secured({
      tags: ["Supports"],
      summary: "Lister mes demandes ou accompagnements",
      parameters: [
        queryParam("role", "requester ou supporter."),
        queryParam("status", "Statut de la demande."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Mes demandes de soutien."),
      },
    }),
  },

  "/supports/{supportRequestId}": {
    get: secured({
      tags: ["Supports"],
      summary: "Consulter une demande de soutien",
      parameters: [
        pathParam("supportRequestId", "Identifiant de la demande."),
      ],
      responses: {
        200: successResponse("Demande de soutien."),
      },
    }),
  },

  "/supports/{supportRequestId}/accept": {
    patch: secured({
      tags: ["Supports"],
      summary: "Accepter une demande de soutien",
      parameters: [
        pathParam("supportRequestId", "Identifiant de la demande."),
      ],
      responses: {
        200: successResponse("Demande acceptée."),
      },
    }),
  },

  "/supports/{supportRequestId}/complete": {
    patch: secured({
      tags: ["Supports"],
      summary: "Terminer une demande de soutien",
      parameters: [
        pathParam("supportRequestId", "Identifiant de la demande."),
      ],
      responses: {
        200: successResponse("Demande terminée."),
      },
    }),
  },

  "/supports/{supportRequestId}/cancel": {
    patch: secured({
      tags: ["Supports"],
      summary: "Annuler une demande de soutien",
      parameters: [
        pathParam("supportRequestId", "Identifiant de la demande."),
      ],
      responses: {
        200: successResponse("Demande annulée."),
      },
    }),
  },
};
