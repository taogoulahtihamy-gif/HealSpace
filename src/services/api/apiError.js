export class ApiError extends Error {
  constructor({ message, status, body, requestId }) {
    super(message || "Erreur API");

    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.requestId = requestId;
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}
