import {
  paginatedQueryParameters,
  pathParam,
  queryParam,
  secured,
  successResponse,
} from "../helpers.js";

export const notificationsPaths = {
  "/notifications": {
    get: secured({
      tags: ["Notifications"],
      summary: "Lister mes notifications",
      parameters: [
        queryParam("type", "Filtrer par type de notification."),
        queryParam("isRead", "Filtrer par lecture.", {
          type: "boolean",
        }),
        ...paginatedQueryParameters(),
      ],
      responses: {
        200: successResponse("Notifications."),
      },
    }),
  },

  "/notifications/unread-count": {
    get: secured({
      tags: ["Notifications"],
      summary: "Compter mes notifications non lues",
      responses: {
        200: successResponse("Compteur non lu."),
      },
    }),
  },

  "/notifications/read-all": {
    patch: secured({
      tags: ["Notifications"],
      summary: "Marquer toutes les notifications comme lues",
      responses: {
        200: successResponse("Notifications lues."),
      },
    }),
  },

  "/notifications/{notificationId}/read": {
    patch: secured({
      tags: ["Notifications"],
      summary: "Marquer une notification comme lue",
      parameters: [
        pathParam("notificationId", "Identifiant de la notification."),
      ],
      responses: {
        200: successResponse("Notification lue."),
      },
    }),
  },

  "/notifications/{notificationId}": {
    delete: secured({
      tags: ["Notifications"],
      summary: "Supprimer une notification",
      parameters: [
        pathParam("notificationId", "Identifiant de la notification."),
      ],
      responses: {
        200: successResponse("Notification supprimée."),
      },
    }),
  },
};
