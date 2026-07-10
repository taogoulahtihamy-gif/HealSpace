import {
  jsonRequestBody,
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const groupsPaths = {
  "/groups": {
    get: secured({
      tags: ["Groups"],
      summary: "Lister ou rechercher les groupes",
      parameters: [
        queryParam("search", "Recherche par nom ou description."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Groupes."),
      },
    }),

    post: secured({
      tags: ["Groups"],
      summary: "Créer un groupe",
      requestBody: jsonRequestBody({
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          visibility: {
            type: "string",
            enum: ["PUBLIC", "PRIVATE"],
          },
        },
      }),
      responses: {
        201: successResponse("Groupe créé."),
      },
    }),
  },

  "/groups/mine": {
    get: secured({
      tags: ["Groups"],
      summary: "Lister mes groupes",
      responses: {
        200: successResponse("Mes groupes."),
      },
    }),
  },

  "/groups/{groupId}": {
    get: secured({
      tags: ["Groups"],
      summary: "Consulter un groupe",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      responses: {
        200: successResponse("Groupe."),
      },
    }),

    patch: secured({
      tags: ["Groups"],
      summary: "Modifier un groupe",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      requestBody: jsonRequestBody({
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          visibility: {
            type: "string",
            enum: ["PUBLIC", "PRIVATE"],
          },
        },
      }),
      responses: {
        200: successResponse("Groupe modifié."),
      },
    }),

    delete: secured({
      tags: ["Groups"],
      summary: "Supprimer un groupe",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      responses: {
        200: successResponse("Groupe supprimé."),
      },
    }),
  },

  "/groups/{groupId}/join": {
    post: secured({
      tags: ["Groups"],
      summary: "Rejoindre un groupe public",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      responses: {
        200: successResponse("Groupe rejoint."),
      },
    }),
  },

  "/groups/{groupId}/leave": {
    delete: secured({
      tags: ["Groups"],
      summary: "Quitter un groupe",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      responses: {
        200: successResponse("Groupe quitté."),
      },
    }),
  },

  "/groups/{groupId}/members": {
    get: secured({
      tags: ["Groups"],
      summary: "Lister les membres d’un groupe",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      responses: {
        200: successResponse("Membres du groupe."),
      },
    }),
  },

  "/groups/{groupId}/members/{memberId}/role": {
    patch: secured({
      tags: ["Groups"],
      summary: "Modifier le rôle d’un membre",
      parameters: [
        pathParam("groupId", "Identifiant du groupe."),
        pathParam("memberId", "Identifiant du membre."),
      ],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["role"],
        properties: {
          role: {
            type: "string",
            enum: ["OWNER", "ADMIN", "MEMBER"],
          },
        },
      }),
      responses: {
        200: successResponse("Rôle modifié."),
      },
    }),
  },

  "/groups/{groupId}/members/{memberId}": {
    delete: secured({
      tags: ["Groups"],
      summary: "Retirer un membre",
      parameters: [
        pathParam("groupId", "Identifiant du groupe."),
        pathParam("memberId", "Identifiant du membre."),
      ],
      responses: {
        200: successResponse("Membre retiré."),
      },
    }),
  },

  "/groups/invitations/mine": {
    get: secured({
      tags: ["Group Invitations"],
      summary: "Lister mes invitations de groupes privés",
      parameters: [
        queryParam("status", "Filtrer par statut.", {
          type: "string",
          enum: [
            "PENDING",
            "ACCEPTED",
            "REJECTED",
            "CANCELLED",
            "EXPIRED",
          ],
        }),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Invitations reçues."),
      },
    }),
  },

  "/groups/invitations/{invitationId}/accept": {
    patch: secured({
      tags: ["Group Invitations"],
      summary: "Accepter une invitation",
      parameters: [
        pathParam("invitationId", "Identifiant de l’invitation."),
      ],
      responses: {
        200: successResponse("Invitation acceptée."),
      },
    }),
  },

  "/groups/invitations/{invitationId}/reject": {
    patch: secured({
      tags: ["Group Invitations"],
      summary: "Refuser une invitation",
      parameters: [
        pathParam("invitationId", "Identifiant de l’invitation."),
      ],
      responses: {
        200: successResponse("Invitation refusée."),
      },
    }),
  },

  "/groups/{groupId}/invitations": {
    post: secured({
      tags: ["Group Invitations"],
      summary: "Inviter un utilisateur dans un groupe privé",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["inviteeId"],
        properties: {
          inviteeId: {
            type: "string",
          },
        },
      }),
      responses: {
        201: successResponse("Invitation créée."),
      },
    }),
  },

  "/groups/{groupId}/invitations/{invitationId}": {
    delete: secured({
      tags: ["Group Invitations"],
      summary: "Annuler une invitation",
      parameters: [
        pathParam("groupId", "Identifiant du groupe."),
        pathParam("invitationId", "Identifiant de l’invitation."),
      ],
      responses: {
        200: successResponse("Invitation annulée."),
      },
    }),
  },
};
