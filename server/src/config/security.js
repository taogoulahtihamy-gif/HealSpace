import cors from "cors";
import helmet from "helmet";

import { AppError } from "../../core/errors/AppError.js";
import { env } from "./env.js";

function isAllowedOrigin(origin) {
  return !origin || env.CORS_ALLOWED_ORIGINS.includes(origin);
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Origine non autorisée.", 403));
  },

  credentials: true,

  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "X-Request-Id",
    "X-Device-Id",
  ],

  exposedHeaders: [
    "X-Request-Id",
    "RateLimit",
    "RateLimit-Policy",
    "Retry-After",
  ],

  maxAge: 86400,
  optionsSuccessStatus: 204,
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.IS_PRODUCTION ? [] : null,
    },
  },

  crossOriginEmbedderPolicy: false,

  crossOriginOpenerPolicy: {
    policy: "same-origin",
  },

  crossOriginResourcePolicy: {
    policy: "same-site",
  },

  referrerPolicy: {
    policy: "no-referrer",
  },

  strictTransportSecurity: env.IS_PRODUCTION
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
});
