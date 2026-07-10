import {
  jsonRequestBody,
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const journalPaths = {
  "/journal": {
    get: secured({
      tags: ["Journal"],
      summary: "Lister mes entrées de journal",
      parameters: [
        queryParam("mood", "Filtrer par humeur."),
        queryParam("startDate", "Date de début.", {
          type: "string",
          format: "date-time",
        }),
        queryParam("endDate", "Date de fin.", {
          type: "string",
          format: "date-time",
        }),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Entrées du journal."),
      },
    }),

    post: secured({
      tags: ["Journal"],
      summary: "Créer une entrée de journal émotionnel",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["content", "mood"],
        properties: {
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
          mood: {
            $ref: "#/components/schemas/MoodType",
          },
          intensity: {
            type: "integer",
            minimum: 1,
            maximum: 10,
          },
          occurredAt: {
            type: "string",
            format: "date-time",
          },
        },
      }),
      responses: {
        201: successResponse("Entrée créée."),
      },
    }),
  },

  "/journal/summary": {
    get: secured({
      tags: ["Journal"],
      summary: "Obtenir un résumé émotionnel",
      responses: {
        200: successResponse("Résumé du journal."),
      },
    }),
  },

  "/journal/{entryId}": {
    get: secured({
      tags: ["Journal"],
      summary: "Consulter une entrée de journal",
      parameters: [pathParam("entryId", "Identifiant de l’entrée.")],
      responses: {
        200: successResponse("Entrée."),
      },
    }),

    patch: secured({
      tags: ["Journal"],
      summary: "Modifier une entrée de journal",
      parameters: [pathParam("entryId", "Identifiant de l’entrée.")],
      requestBody: jsonRequestBody({
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
          mood: {
            $ref: "#/components/schemas/MoodType",
          },
          intensity: {
            type: "integer",
            minimum: 1,
            maximum: 10,
          },
        },
      }),
      responses: {
        200: successResponse("Entrée modifiée."),
      },
    }),

    delete: secured({
      tags: ["Journal"],
      summary: "Supprimer une entrée de journal",
      parameters: [pathParam("entryId", "Identifiant de l’entrée.")],
      responses: {
        200: successResponse("Entrée supprimée."),
      },
    }),
  },
};
