import { logger } from "../config/logger.js";

function getDurationMilliseconds(startedAt) {
  const elapsed = process.hrtime.bigint() - startedAt;

  return Number(elapsed) / 1_000_000;
}

function getSafePath(req) {
  return req.originalUrl?.split("?")[0] || req.path || "/";
}

export function requestLoggerMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const statusCode = res.statusCode;

    const context = {
      requestId: req.id,
      method: req.method,
      path: getSafePath(req),
      statusCode,
      durationMs: Number(getDurationMilliseconds(startedAt).toFixed(2)),
      ipAddress: req.ip || req.socket?.remoteAddress || null,
      userId: req.user?.id || null,
      sessionId: req.user?.sessionId || null,
      userAgent: req.get("user-agent") || null,
    };

    if (statusCode >= 500) {
      logger.error("HTTP request completed", context);
      return;
    }

    if (statusCode >= 400) {
      logger.warn("HTTP request completed", context);
      return;
    }

    logger.info("HTTP request completed", context);
  });

  next();
}
