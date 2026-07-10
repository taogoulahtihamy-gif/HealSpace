import crypto from "node:crypto";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,64}$/;

function resolveRequestId(req) {
  const incomingRequestId = req.get("x-request-id");

  if (incomingRequestId && SAFE_REQUEST_ID.test(incomingRequestId)) {
    return incomingRequestId;
  }

  return crypto.randomUUID();
}

export function requestContextMiddleware(req, res, next) {
  const requestId = resolveRequestId(req);

  req.id = requestId;

  res.setHeader("X-Request-Id", requestId);

  next();
}
