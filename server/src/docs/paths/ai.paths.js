import {
  jsonRequestBody,
  secured,
  successResponse,
} from "../helpers.js";

export const aiPaths = {
  "/ai/analyze-mood": {
    post: secured({
      tags: ["AI"],
      summary: "Analyser l’humeur d’un texte",
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
        200: successResponse("Humeur analysée."),
      },
    }),
  },

  "/ai/support-message": {
    post: secured({
      tags: ["AI"],
      summary: "Générer un message de soutien",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["content", "mood"],
        properties: {
          content: {
            type: "string",
          },
          mood: {
            $ref: "#/components/schemas/MoodType",
          },
        },
      }),
      responses: {
        200: successResponse("Message de soutien généré."),
      },
    }),
  },
};
