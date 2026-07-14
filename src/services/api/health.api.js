import { apiRequest } from "./httpClient.js";

export function getApiHealth() {
  return apiRequest("/health", {
    requiresAuth: false,
  });
}
