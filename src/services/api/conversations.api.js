import {
  apiRequest,
  createQueryString,
} from "./httpClient.js";

export function getConversations(params = {}) {
  return apiRequest(
    `/conversations${createQueryString(params)}`,
  );
}

export function getConversationById(conversationId) {
  return apiRequest(`/conversations/${conversationId}`);
}

export function createDirectConversation(participantId) {
  return apiRequest("/conversations/direct", {
    method: "POST",
    body: {
      participantId,
    },
  });
}

export function createGroupConversation(payload) {
  return apiRequest("/conversations/group", {
    method: "POST",
    body: payload,
  });
}

export function leaveConversation(conversationId) {
  return apiRequest(`/conversations/${conversationId}`, {
    method: "DELETE",
  });
}
