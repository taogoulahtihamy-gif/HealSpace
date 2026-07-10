import { ipKeyGenerator, rateLimit } from "express-rate-limit";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

function toWindowMilliseconds(minutes) {
  return minutes * 60 * 1000;
}

function normalizeIpAddress(req) {
  const rawIpAddress = req.ip || req.socket?.remoteAddress || "unknown";

  try {
    return ipKeyGenerator(rawIpAddress, 56);
  } catch {
    return String(rawIpAddress).slice(0, 128);
  }
}

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return "unknown";
  }

  return value.trim().toLowerCase().slice(0, 254);
}

function buildIpAndEmailKey(req) {
  return [
    normalizeIpAddress(req),
    normalizeEmail(req.body?.email),
  ].join(":");
}

function shouldSkipRequest(req, { methods, skipHealth = false } = {}) {
  if (!env.RATE_LIMIT_ENABLED) {
    return true;
  }

  if (req.method === "OPTIONS") {
    return true;
  }

  if (methods && !methods.includes(req.method)) {
    return true;
  }

  if (skipHealth && req.path === "/health") {
    return true;
  }

  return false;
}

function createRateLimitHandler({ identifier, message }) {
  return (req, res) => {
    const resetTime = req.rateLimit?.resetTime;

    const retryAfterSeconds =
      resetTime instanceof Date
        ? Math.max(
            1,
            Math.ceil((resetTime.getTime() - Date.now()) / 1000),
          )
        : null;

    logger.warn("Rate limit exceeded", {
      requestId: req.id,
      identifier,
      method: req.method,
      path: req.originalUrl?.split("?")[0] || req.path,
      ipAddress: req.ip || req.socket?.remoteAddress || null,
      retryAfterSeconds,
    });

    return res.status(429).json({
      success: false,
      message,
      requestId: req.id,
      ...(retryAfterSeconds && {
        retryAfterSeconds,
      }),
    });
  };
}

function createLimiter({
  identifier,
  windowMinutes,
  limit,
  message,
  methods,
  keyGenerator,
  skipSuccessfulRequests = false,
  skipHealth = false,
}) {
  const options = {
    identifier,
    windowMs: toWindowMilliseconds(windowMinutes),
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    passOnStoreError: false,
    skipSuccessfulRequests,
    skip: (req) =>
      shouldSkipRequest(req, {
        methods,
        skipHealth,
      }),
    handler: createRateLimitHandler({
      identifier,
      message,
    }),
  };

  if (keyGenerator) {
    options.keyGenerator = (req, res) =>
      `${identifier}:${keyGenerator(req, res)}`;
  } else {
    options.ipv6Subnet = 56;
  }

  return rateLimit(options);
}

export const globalApiRateLimiter = createLimiter({
  identifier: "global-api",
  windowMinutes: env.GLOBAL_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.GLOBAL_RATE_LIMIT_MAX,
  message: "Trop de requêtes. Réessayez plus tard.",
  skipHealth: true,
});

export const loginRateLimiter = createLimiter({
  identifier: "auth-login",
  windowMinutes: env.LOGIN_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  message: "Trop de tentatives de connexion. Réessayez plus tard.",
  methods: ["POST"],
  keyGenerator: buildIpAndEmailKey,
  skipSuccessfulRequests: true,
});

export const registerRateLimiter = createLimiter({
  identifier: "auth-register",
  windowMinutes: env.REGISTER_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.REGISTER_RATE_LIMIT_MAX,
  message:
    "Trop de créations de compte depuis cette adresse. Réessayez plus tard.",
  methods: ["POST"],
  keyGenerator: normalizeIpAddress,
});

export const refreshRateLimiter = createLimiter({
  identifier: "auth-refresh",
  windowMinutes: env.REFRESH_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.REFRESH_RATE_LIMIT_MAX,
  message: "Trop de renouvellements de session. Réessayez plus tard.",
  methods: ["POST"],
  keyGenerator: normalizeIpAddress,
});

export const passwordResetRateLimiter = createLimiter({
  identifier: "auth-password-reset",
  windowMinutes: env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.PASSWORD_RESET_RATE_LIMIT_MAX,
  message: "Trop de demandes de réinitialisation. Réessayez plus tard.",
  methods: ["POST"],
  keyGenerator: buildIpAndEmailKey,
});

export const emailVerificationRateLimiter = createLimiter({
  identifier: "auth-email-verification",
  windowMinutes: env.EMAIL_VERIFICATION_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.EMAIL_VERIFICATION_RATE_LIMIT_MAX,
  message: "Trop de demandes de vérification. Réessayez plus tard.",
  methods: ["POST"],
  keyGenerator: normalizeIpAddress,
});

export const mediaUploadRateLimiter = createLimiter({
  identifier: "media-upload",
  windowMinutes: env.MEDIA_UPLOAD_RATE_LIMIT_WINDOW_MINUTES,
  limit: env.MEDIA_UPLOAD_RATE_LIMIT_MAX,
  message: "Trop de téléversements. Réessayez plus tard.",
  methods: ["POST"],
  keyGenerator: normalizeIpAddress,
});
