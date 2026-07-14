import { apiRequest } from "./httpClient.js";

export function reactToPost(postId, type = "SUPPORT") {
  return apiRequest(`/posts/${postId}/reactions`, {
    method: "POST",
    body: { type },
  });
}

export function getPostReactions(postId) {
  return apiRequest(`/posts/${postId}/reactions`);
}

export function getPostReactionSummary(postId) {
  return apiRequest(`/posts/${postId}/reactions/summary`);
}

export function removePostReaction(postId) {
  return apiRequest(`/posts/${postId}/reactions`, {
    method: "DELETE",
  });
}
