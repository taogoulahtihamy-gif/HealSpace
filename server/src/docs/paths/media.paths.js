import {
  jsonRequestBody,
  pathParam,
  secured,
  successResponse,
} from "../helpers.js";

export const mediaPaths = {
  "/media/upload": {
    post: secured({
      tags: ["Media"],
      summary: "Téléverser un média vers Cloudinary",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
                postId: {
                  type: "string",
                  nullable: true,
                },
                conversationId: {
                  type: "string",
                  nullable: true,
                },
              },
            },
          },
        },
      },
      responses: {
        201: successResponse("Média téléversé."),
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    }),
  },

  "/media": {
    get: secured({
      tags: ["Media"],
      summary: "Lister mes médias",
      responses: {
        200: successResponse("Médias."),
      },
    }),

    post: secured({
      tags: ["Media"],
      summary: "Créer un média historique sans upload Cloudinary",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["url", "filename"],
        properties: {
          url: {
            type: "string",
            format: "uri",
          },
          filename: {
            type: "string",
          },
          postId: {
            type: "string",
            nullable: true,
          },
          type: {
            type: "string",
            enum: ["IMAGE", "VIDEO", "AUDIO", "FILE"],
          },
        },
      }),
      responses: {
        201: successResponse("Média créé."),
      },
    }),
  },

  "/media/{id}": {
    get: secured({
      tags: ["Media"],
      summary: "Consulter un média",
      parameters: [pathParam("id", "Identifiant du média.")],
      responses: {
        200: successResponse("Média."),
      },
    }),

    delete: secured({
      tags: ["Media"],
      summary: "Supprimer un média",
      parameters: [pathParam("id", "Identifiant du média.")],
      responses: {
        200: successResponse("Média supprimé."),
      },
    }),
  },
};
