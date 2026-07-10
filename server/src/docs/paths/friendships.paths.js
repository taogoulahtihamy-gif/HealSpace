import {
  paginatedQueryParameters,
  pathParam,
  secured,
  successResponse,
} from "../helpers.js";

export const friendshipsPaths = {
  "/friendships/requests/{userId}": {
    post: secured({
      tags: ["Friendships"],
      summary: "Envoyer ou rouvrir une demande d’amitié",
      parameters: [pathParam("userId", "Utilisateur destinataire.")],
      responses: {
        201: successResponse("Demande d’amitié envoyée."),
      },
    }),
  },

  "/friendships/requests/incoming": {
    get: secured({
      tags: ["Friendships"],
      summary: "Lister les demandes reçues",
      parameters: [...paginatedQueryParameters()],
      responses: {
        200: successResponse("Demandes reçues."),
      },
    }),
  },

  "/friendships/requests/outgoing": {
    get: secured({
      tags: ["Friendships"],
      summary: "Lister les demandes envoyées",
      parameters: [...paginatedQueryParameters()],
      responses: {
        200: successResponse("Demandes envoyées."),
      },
    }),
  },

  "/friendships/requests/{friendshipId}/accept": {
    patch: secured({
      tags: ["Friendships"],
      summary: "Accepter une demande d’amitié",
      parameters: [
        pathParam("friendshipId", "Identifiant de la relation."),
      ],
      responses: {
        200: successResponse("Demande acceptée."),
      },
    }),
  },

  "/friendships/requests/{friendshipId}/reject": {
    patch: secured({
      tags: ["Friendships"],
      summary: "Refuser une demande d’amitié",
      parameters: [
        pathParam("friendshipId", "Identifiant de la relation."),
      ],
      responses: {
        200: successResponse("Demande refusée."),
      },
    }),
  },

  "/friendships/requests/{friendshipId}": {
    delete: secured({
      tags: ["Friendships"],
      summary: "Annuler une demande d’amitié",
      parameters: [
        pathParam("friendshipId", "Identifiant de la relation."),
      ],
      responses: {
        200: successResponse("Demande annulée."),
      },
    }),
  },

  "/friendships": {
    get: secured({
      tags: ["Friendships"],
      summary: "Lister mes amis",
      parameters: [...paginatedQueryParameters()],
      responses: {
        200: successResponse("Amis."),
      },
    }),
  },

  "/friendships/{friendshipId}": {
    delete: secured({
      tags: ["Friendships"],
      summary: "Supprimer une amitié",
      parameters: [
        pathParam("friendshipId", "Identifiant de la relation."),
      ],
      responses: {
        200: successResponse("Amitié supprimée."),
      },
    }),
  },
};
