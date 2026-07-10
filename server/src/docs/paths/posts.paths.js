import {
  jsonRequestBody,
  pathParam,
  secured,
  successResponse,
} from "../helpers.js";

const postBody = {
  type: "object",
  required: ["content"],
  properties: {
    content: {
      type: "string",
      example: "Je veux être écouté aujourd’hui.",
    },
    mood: {
      $ref: "#/components/schemas/MoodType",
    },
    intention: {
      type: "string",
      enum: ["BE_LISTENED", "RECEIVE_ADVICE", "FIND_SIMILAR_PEOPLE"],
    },
    visibility: {
      type: "string",
      enum: ["PUBLIC", "GROUP", "PRIVATE"],
      default: "PUBLIC",
    },
    isAnonymous: {
      type: "boolean",
      default: false,
    },
  },
};

export const postsPaths = {
  "/posts": {
    get: secured({
      tags: ["Posts"],
      summary: "Lister les publications",
      responses: {
        200: successResponse("Publications."),
      },
    }),

    post: secured({
      tags: ["Posts"],
      summary: "Créer une publication",
      requestBody: jsonRequestBody(postBody),
      responses: {
        201: successResponse("Publication créée."),
      },
    }),
  },

  "/posts/{id}": {
    get: secured({
      tags: ["Posts"],
      summary: "Consulter une publication",
      parameters: [pathParam("id", "Identifiant de la publication.")],
      responses: {
        200: successResponse("Publication."),
        404: {
          $ref: "#/components/responses/NotFoundError",
        },
      },
    }),

    patch: secured({
      tags: ["Posts"],
      summary: "Modifier une publication",
      parameters: [pathParam("id", "Identifiant de la publication.")],
      requestBody: jsonRequestBody(postBody),
      responses: {
        200: successResponse("Publication modifiée."),
      },
    }),

    delete: secured({
      tags: ["Posts"],
      summary: "Supprimer une publication",
      parameters: [pathParam("id", "Identifiant de la publication.")],
      responses: {
        200: successResponse("Publication supprimée."),
      },
    }),
  },

  "/posts/{postId}/comments": {
    get: secured({
      tags: ["Comments"],
      summary: "Lister les commentaires d’une publication",
      parameters: [
        pathParam("postId", "Identifiant de la publication."),
      ],
      responses: {
        200: successResponse("Commentaires."),
      },
    }),

    post: secured({
      tags: ["Comments"],
      summary: "Commenter une publication",
      parameters: [
        pathParam("postId", "Identifiant de la publication."),
      ],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
          },
          parentId: {
            type: "string",
            nullable: true,
          },
        },
      }),
      responses: {
        201: successResponse("Commentaire créé."),
      },
    }),
  },

  "/comments/{id}": {
    patch: secured({
      tags: ["Comments"],
      summary: "Modifier un commentaire",
      parameters: [pathParam("id", "Identifiant du commentaire.")],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Commentaire modifié."),
      },
    }),

    delete: secured({
      tags: ["Comments"],
      summary: "Supprimer un commentaire",
      parameters: [pathParam("id", "Identifiant du commentaire.")],
      responses: {
        200: successResponse("Commentaire supprimé."),
      },
    }),
  },

  "/posts/{postId}/reactions": {
    get: secured({
      tags: ["Reactions"],
      summary: "Lister les réactions d’une publication",
      parameters: [
        pathParam("postId", "Identifiant de la publication."),
      ],
      responses: {
        200: successResponse("Réactions."),
      },
    }),

    post: secured({
      tags: ["Reactions"],
      summary: "Créer ou modifier ma réaction",
      parameters: [
        pathParam("postId", "Identifiant de la publication."),
      ],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["type"],
        properties: {
          type: {
            type: "string",
            enum: [
              "LIKE",
              "LOVE",
              "HUG",
              "SUPPORT",
              "THANKS",
              "INSIGHTFUL",
            ],
          },
        },
      }),
      responses: {
        200: successResponse("Réaction enregistrée."),
      },
    }),

    delete: secured({
      tags: ["Reactions"],
      summary: "Supprimer ma réaction",
      parameters: [
        pathParam("postId", "Identifiant de la publication."),
      ],
      responses: {
        200: successResponse("Réaction supprimée."),
      },
    }),
  },

  "/posts/{postId}/reactions/summary": {
    get: secured({
      tags: ["Reactions"],
      summary: "Obtenir le résumé des réactions",
      parameters: [
        pathParam("postId", "Identifiant de la publication."),
      ],
      responses: {
        200: successResponse("Résumé des réactions."),
      },
    }),
  },
};
