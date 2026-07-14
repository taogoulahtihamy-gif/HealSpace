import { apiConfig } from "../../config/api.config.js";
import { ApiError } from "./apiError.js";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./tokenStorage.js";

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBaseUrl = apiConfig.baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function buildHeaders({ headers = {}, body, requiresAuth }) {
  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const accessToken = getAccessToken();

    if (accessToken) {
      finalHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  return finalHeaders;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text ? { message: text } : null;
}

function extractAccessToken(responseBody) {
  return (
    responseBody?.data?.accessToken ||
    responseBody?.accessToken ||
    null
  );
}

function extractRefreshToken(responseBody) {
  return (
    responseBody?.data?.refreshToken ||
    responseBody?.refreshToken ||
    null
  );
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    clearAuthTokens();
    return false;
  }

  const newAccessToken = extractAccessToken(responseBody);
  const newRefreshToken = extractRefreshToken(responseBody);

  if (!newAccessToken) {
    clearAuthTokens();
    return false;
  }

  setAccessToken(newAccessToken);

  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return true;
}

async function executeRequest(
  path,
  {
    method,
    body,
    headers,
    requiresAuth,
    signal,
  },
) {
  const response = await fetch(buildUrl(path), {
    method,
    headers: buildHeaders({
      headers,
      body,
      requiresAuth,
    }),
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    credentials: "include",
    signal,
  });

  const responseBody = await parseResponseBody(response);

  return {
    response,
    responseBody,
  };
}

export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    headers,
    requiresAuth = true,
    signal,
  } = {},
) {
  let { response, responseBody } = await executeRequest(path, {
    method,
    body,
    headers,
    requiresAuth,
    signal,
  });

  const canRetryWithRefresh =
    requiresAuth &&
    response.status === 401 &&
    path !== "/auth/refresh";

  if (canRetryWithRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      ({ response, responseBody } = await executeRequest(path, {
        method,
        body,
        headers,
        requiresAuth,
        signal,
      }));
    }
  }

  if (!response.ok) {
    throw new ApiError({
      message:
        responseBody?.message || `Erreur HTTP ${response.status}`,
      status: response.status,
      body: responseBody,
      requestId: responseBody?.requestId,
    });
  }

  return responseBody;
}

export function createQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}
