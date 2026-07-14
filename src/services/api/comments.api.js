import { apiRequest } from "./httpClient.js";

export function getPostComments(postId) {
  return apiRequest(`/posts/${postId}/comments`);
}

export function createPostComment(postId, payload) {
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: payload,
  });
}

export function updatePostComment(commentId, payload) {
  return apiRequest(`/comments/${commentId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deletePostComment(commentId) {
  return apiRequest(`/comments/${commentId}`, {
    method: "DELETE",
  });
}
