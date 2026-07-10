import {
  jsonRequestBody,
  pathParam,
  secured,
  successResponse,
} from "../helpers.js";

export const messagesPaths = {
  "/conversations/direct": {
    post: secured({
      tags: ["Conversations"],
      summary: "Créer ou retrouver une conversation directe",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["participantId"],
        properties: {
          participantId: {
            type: "string",
          },
        },
      }),
      responses: {
        201: successResponse("Conversation directe."),
      },
    }),
  },

  "/conversations/group": {
    post: secured({
      tags: ["Conversations"],
      summary: "Créer une conversation de groupe",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["title", "participantIds"],
        properties: {
          title: {
            type: "string",
          },
          participantIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      }),
      responses: {
        201: successResponse("Conversation de groupe."),
      },
    }),
  },

  "/conversations": {
    get: secured({
      tags: ["Conversations"],
      summary: "Lister mes conversations",
      responses: {
        200: successResponse("Conversations."),
      },
    }),
  },

  "/conversations/{id}": {
    get: secured({
      tags: ["Conversations"],
      summary: "Consulter une conversation",
      parameters: [pathParam("id", "Identifiant de la conversation.")],
      responses: {
        200: successResponse("Conversation."),
      },
    }),

    delete: secured({
      tags: ["Conversations"],
      summary: "Quitter une conversation",
      parameters: [pathParam("id", "Identifiant de la conversation.")],
      responses: {
        200: successResponse("Conversation quittée."),
      },
    }),
  },

  "/messages/conversations/{conversationId}": {
    get: secured({
      tags: ["Messages"],
      summary: "Lister les messages d’une conversation",
      parameters: [
        pathParam("conversationId", "Identifiant de la conversation."),
      ],
      responses: {
        200: successResponse("Messages."),
      },
    }),

    post: secured({
      tags: ["Messages"],
      summary: "Envoyer un message",
      parameters: [
        pathParam("conversationId", "Identifiant de la conversation."),
      ],
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
        201: successResponse("Message créé."),
      },
    }),
  },

  "/messages/{id}": {
    patch: secured({
      tags: ["Messages"],
      summary: "Modifier un message",
      parameters: [pathParam("id", "Identifiant du message.")],
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
        200: successResponse("Message modifié."),
      },
    }),

    delete: secured({
      tags: ["Messages"],
      summary: "Supprimer un message",
      parameters: [pathParam("id", "Identifiant du message.")],
      responses: {
        200: successResponse("Message supprimé."),
      },
    }),
  },

  "/messages/{id}/read": {
    patch: secured({
      tags: ["Messages"],
      summary: "Marquer un message comme lu",
      parameters: [pathParam("id", "Identifiant du message.")],
      responses: {
        200: successResponse("Message marqué comme lu."),
      },
    }),
  },
};
