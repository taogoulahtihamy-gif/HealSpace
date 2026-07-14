import { apiRequest, createQueryString } from "./httpClient.js";

export function getMyProfile() {
  return apiRequest("/users/me");
}

export function updateMyProfile(payload) {
  return apiRequest("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function updateMyPrivacy(payload) {
  return apiRequest("/users/me/privacy", {
    method: "PATCH",
    body: payload,
  });
}

export function searchUsers(params) {
  return apiRequest(`/users/search${createQueryString(params)}`);
}

export function getPublicUserProfile(userId) {
  return apiRequest(`/users/${userId}`);
}
