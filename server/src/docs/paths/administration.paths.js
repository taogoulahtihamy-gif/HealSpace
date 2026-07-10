import {
  jsonRequestBody,
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const administrationPaths = {
  "/admin/statistics": {
    get: secured({
      tags: ["Administration"],
      summary: "Consulter les statistiques administratives",
      responses: {
        200: successResponse("Statistiques."),
        403: {
          $ref: "#/components/responses/ForbiddenError",
        },
      },
    }),
  },

  "/admin/users": {
    get: secured({
      tags: ["Administration"],
      summary: "Lister les utilisateurs",
      parameters: [
        queryParam("search", "Recherche utilisateur."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Utilisateurs."),
      },
    }),
  },

  "/admin/users/{userId}": {
    get: secured({
      tags: ["Administration"],
      summary: "Consulter un utilisateur",
      parameters: [pathParam("userId", "Identifiant utilisateur.")],
      responses: {
        200: successResponse("Utilisateur."),
      },
    }),
  },

  "/admin/users/{userId}/role": {
    patch: secured({
      tags: ["Administration"],
      summary: "Modifier le rôle d’un utilisateur",
      parameters: [pathParam("userId", "Identifiant utilisateur.")],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["role"],
        properties: {
          role: {
            $ref: "#/components/schemas/UserRole",
          },
          note: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Rôle modifié."),
      },
    }),
  },

  "/admin/users/{userId}/status": {
    patch: secured({
      tags: ["Administration"],
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

  "/admin/posts": {
    get: secured({
      tags: ["Administration"],
      summary: "Lister les publications en administration",
      parameters: [
        queryParam("authorId", "Filtrer par auteur."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Publications."),
      },
    }),
  },

  "/admin/posts/{postId}/status": {
    patch: secured({
      tags: ["Administration"],
      summary: "Modifier le statut d’une publication",
      parameters: [pathParam("postId", "Identifiant publication.")],
      requestBody: jsonRequestBody({
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["PUBLISHED", "DRAFT", "ARCHIVED", "DELETED"],
          },
          note: {
            type: "string",
          },
        },
      }),
      responses: {
        200: successResponse("Statut de publication modifié."),
      },
    }),
  },

  "/admin/groups": {
    get: secured({
      tags: ["Administration"],
      summary: "Lister les groupes en administration",
      parameters: [
        queryParam("ownerId", "Filtrer par propriétaire."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Groupes."),
      },
    }),
  },

  "/admin/groups/{groupId}": {
    delete: secured({
      tags: ["Administration"],
      summary: "Supprimer un groupe en administration",
      parameters: [pathParam("groupId", "Identifiant du groupe.")],
      responses: {
        200: successResponse("Groupe supprimé."),
      },
    }),
  },

  "/admin/reports": {
    get: secured({
      tags: ["Administration"],
      summary: "Lister les signalements en administration",
      parameters: [...paginatedQueryParameters()],
      responses: {
        200: successResponse("Signalements."),
      },
    }),
  },

  "/admin/moderation-actions": {
    get: secured({
      tags: ["Administration"],
      summary: "Lister les actions de modération et d’administration",
      parameters: [
        queryParam("action", "Filtrer par action."),
        queryParam("moderatorId", "Filtrer par modérateur."),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Actions."),
      },
    }),
  },
};
