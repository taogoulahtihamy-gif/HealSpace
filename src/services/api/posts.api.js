import {
  apiRequest,
  createQueryString,
} from "./httpClient.js";

export function getPosts(params = {}) {
  return apiRequest(`/posts${createQueryString(params)}`);
}

export function getPostById(postId) {
  return apiRequest(`/posts/${postId}`);
}

export function createPost(payload) {
  return apiRequest("/posts", {
    method: "POST",
    body: payload,
  });
}

export function updatePost(postId, payload) {
  return apiRequest(`/posts/${postId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deletePost(postId) {
  return apiRequest(`/posts/${postId}`, {
    method: "DELETE",
  });
}
