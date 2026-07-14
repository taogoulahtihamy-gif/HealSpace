import {
  apiRequest,
  createQueryString,
} from "./httpClient.js";

export function getConversationMessages(
  conversationId,
  params = {},
) {
  return apiRequest(
    `/messages/conversations/${conversationId}${createQueryString(params)}`,
  );
}

export function createConversationMessage(conversationId, content) {
  return apiRequest(`/messages/conversations/${conversationId}`, {
    method: "POST",
    body: {
      content,
    },
  });
}

export function updateMessage(messageId, content) {
  return apiRequest(`/messages/${messageId}`, {
    method: "PATCH",
    body: {
      content,
    },
  });
}

export function markMessageAsRead(messageId) {
  return apiRequest(`/messages/${messageId}/read`, {
    method: "PATCH",
  });
}

export function deleteMessage(messageId) {
  return apiRequest(`/messages/${messageId}`, {
    method: "DELETE",
  });
}
