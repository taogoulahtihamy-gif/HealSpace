import { apiRequest } from "./httpClient.js";
import {
  clearAuthTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./tokenStorage.js";

function persistAuthTokens(response) {
  const accessToken = response?.data?.accessToken || response?.accessToken;
  const refreshToken = response?.data?.refreshToken || response?.refreshToken;

  if (accessToken) {
    setAccessToken(accessToken);
  }

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }

  return response;
}

export async function registerUser(payload) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: payload,
    requiresAuth: false,
  });

  return persistAuthTokens(response);
}

export async function loginUser(payload) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: payload,
    requiresAuth: false,
  });

  return persistAuthTokens(response);
}

export async function refreshSession() {
  const refreshToken = getRefreshToken();

  const response = await apiRequest("/auth/refresh", {
    method: "POST",
    body: refreshToken ? { refreshToken } : undefined,
    requiresAuth: false,
  });

  return persistAuthTokens(response);
}

export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAuthTokens();
  }
}

export function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
    requiresAuth: false,
  });
}

export function resetPassword(payload) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: payload,
    requiresAuth: false,
  });
}

export function sendEmailVerification() {
  return apiRequest("/auth/email-verification/send", {
    method: "POST",
  });
}

export function verifyEmail(token) {
  return apiRequest("/auth/email-verification/verify", {
    method: "POST",
    body: { token },
    requiresAuth: false,
  });
}
