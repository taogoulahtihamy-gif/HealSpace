import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const DEFAULT_DEVELOPMENT_JWT_SECRET =
  "healspace_dev_secret_change_later";

function emptyToUndefined(value) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

function parseBooleanInput(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return value;
}

function booleanFromEnvironment(fallback) {
  return z.preprocess((value) => {
    const normalized = emptyToUndefined(value);

    return normalized === undefined
      ? fallback
      : parseBooleanInput(normalized);
  }, z.boolean());
}

function integerFromEnvironment(
  fallback,
  { minimum = 1, maximum } = {},
) {
  let schema = z.number().int().min(minimum);

  if (maximum !== undefined) {
    schema = schema.max(maximum);
  }

  return z.preprocess((value) => {
    const normalized = emptyToUndefined(value);

    if (normalized === undefined) {
      return fallback;
    }

    return Number(normalized);
  }, schema);
}

const nodeEnv = process.env.NODE_ENV || "development";

const environmentSource = {
  ...process.env,

  MAIL_TRANSPORT:
    process.env.MAIL_TRANSPORT ||
    (nodeEnv === "production" ? "smtp" : "json"),

  GLOBAL_RATE_LIMIT_MAX:
    process.env.GLOBAL_RATE_LIMIT_MAX ||
    (nodeEnv === "production" ? "300" : "2000"),

  EXPOSE_ERROR_DETAILS:
    process.env.EXPOSE_ERROR_DETAILS ||
    (nodeEnv === "production" ? "false" : "true"),
};

const payloadLimitSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(?:\.\d+)?(?:b|kb|mb)$/i,
    "La limite doit utiliser un format tel que 256kb ou 1mb.",
  );

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    PORT: integerFromEnvironment(5000, {
      minimum: 1,
      maximum: 65535,
    }),

    CLIENT_URL: z.string().url().default("http://localhost:5173"),

    CORS_ALLOWED_ORIGINS: z.preprocess(
      emptyToUndefined,
      z.string().optional(),
    ),

    TRUST_PROXY_HOPS: integerFromEnvironment(0, {
      minimum: 0,
      maximum: 10,
    }),

    JWT_SECRET: z
      .string()
      .min(1)
      .default(DEFAULT_DEVELOPMENT_JWT_SECRET),

    JWT_ACCESS_EXPIRES_IN: z.string().trim().min(2).default("15m"),

    JWT_REFRESH_EXPIRES_IN_DAYS: integerFromEnvironment(7),

    SESSION_ACTIVITY_TOUCH_MINUTES: integerFromEnvironment(5),

    SESSION_CLEANUP_RETENTION_DAYS: integerFromEnvironment(30),

    DATABASE_URL: z
      .string()
      .trim()
      .min(1, "DATABASE_URL est obligatoire."),

    CLOUDINARY_CLOUD_NAME: z.preprocess(
      emptyToUndefined,
      z.string().optional(),
    ),

    CLOUDINARY_API_KEY: z.preprocess(
      emptyToUndefined,
      z.string().optional(),
    ),

    CLOUDINARY_API_SECRET: z.preprocess(
      emptyToUndefined,
      z.string().optional(),
    ),

    CLOUDINARY_MEDIA_FOLDER: z
      .string()
      .trim()
      .min(1)
      .default("healspace/media"),

    RUN_CLOUDINARY_TESTS: booleanFromEnvironment(false),

    MAIL_TRANSPORT: z.enum(["json", "smtp"]).default("json"),

    SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),

    SMTP_PORT: integerFromEnvironment(587, {
      minimum: 1,
      maximum: 65535,
    }),

    SMTP_SECURE: booleanFromEnvironment(false),

    SMTP_USER: z.preprocess(emptyToUndefined, z.string().optional()),

    SMTP_PASSWORD: z.preprocess(
      emptyToUndefined,
      z.string().optional(),
    ),

    MAIL_FROM_NAME: z.string().trim().min(1).default("HealSpace"),

    MAIL_FROM_ADDRESS: z
      .string()
      .email()
      .default("no-reply@healspace.local"),

    PASSWORD_RESET_URL: z
      .string()
      .url()
      .default("http://localhost:5173/reset-password"),

    PASSWORD_RESET_TOKEN_TTL_MINUTES: integerFromEnvironment(15),

    EMAIL_VERIFICATION_URL: z
      .string()
      .url()
      .default("http://localhost:5173/verify-email"),

    EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: integerFromEnvironment(1440),

    EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS:
      integerFromEnvironment(60),

    GROUP_INVITATION_TTL_HOURS: integerFromEnvironment(168),

    JSON_BODY_LIMIT: payloadLimitSchema.default("1mb"),

    URLENCODED_BODY_LIMIT: payloadLimitSchema.default("256kb"),

    RATE_LIMIT_ENABLED: booleanFromEnvironment(true),

    GLOBAL_RATE_LIMIT_WINDOW_MINUTES: integerFromEnvironment(15),

    GLOBAL_RATE_LIMIT_MAX: integerFromEnvironment(2000),

    LOGIN_RATE_LIMIT_WINDOW_MINUTES: integerFromEnvironment(15),

    LOGIN_RATE_LIMIT_MAX: integerFromEnvironment(5),

    REGISTER_RATE_LIMIT_WINDOW_MINUTES: integerFromEnvironment(60),

    REGISTER_RATE_LIMIT_MAX: integerFromEnvironment(20),

    REFRESH_RATE_LIMIT_WINDOW_MINUTES: integerFromEnvironment(15),

    REFRESH_RATE_LIMIT_MAX: integerFromEnvironment(30),

    PASSWORD_RESET_RATE_LIMIT_WINDOW_MINUTES:
      integerFromEnvironment(15),

    PASSWORD_RESET_RATE_LIMIT_MAX: integerFromEnvironment(5),

    EMAIL_VERIFICATION_RATE_LIMIT_WINDOW_MINUTES:
      integerFromEnvironment(60),

    EMAIL_VERIFICATION_RATE_LIMIT_MAX: integerFromEnvironment(10),

    MEDIA_UPLOAD_RATE_LIMIT_WINDOW_MINUTES: integerFromEnvironment(60),

    MEDIA_UPLOAD_RATE_LIMIT_MAX: integerFromEnvironment(30),

    EXPOSE_ERROR_DETAILS: booleanFromEnvironment(
      nodeEnv !== "production",
    ),

    LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default(nodeEnv === "production" ? "info" : "debug"),

    SECURITY_TEST_MODE: booleanFromEnvironment(false),
  })
  .superRefine((values, context) => {
    const configuredOrigins = (
      values.CORS_ALLOWED_ORIGINS || values.CLIENT_URL
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    for (const origin of configuredOrigins) {
      try {
        new URL(origin);
      } catch {
        context.addIssue({
          code: "custom",
          path: ["CORS_ALLOWED_ORIGINS"],
          message: `Origine CORS invalide : ${origin}`,
        });
      }
    }

    if (configuredOrigins.includes("*")) {
      context.addIssue({
        code: "custom",
        path: ["CORS_ALLOWED_ORIGINS"],
        message:
          "L'origine * est interdite lorsque les cookies ou credentials sont autorisés.",
      });
    }

    if (
      !values.DATABASE_URL.startsWith("postgresql://") &&
      !values.DATABASE_URL.startsWith("postgres://")
    ) {
      context.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL doit être une URL PostgreSQL.",
      });
    }

    if (values.MAIL_TRANSPORT === "smtp") {
      if (!values.SMTP_HOST) {
        context.addIssue({
          code: "custom",
          path: ["SMTP_HOST"],
          message:
            "SMTP_HOST est obligatoire avec MAIL_TRANSPORT=smtp.",
        });
      }

      const hasUser = Boolean(values.SMTP_USER);
      const hasPassword = Boolean(values.SMTP_PASSWORD);

      if (hasUser !== hasPassword) {
        context.addIssue({
          code: "custom",
          path: ["SMTP_USER"],
          message:
            "SMTP_USER et SMTP_PASSWORD doivent être configurés ensemble.",
        });
      }
    }

    if (values.NODE_ENV === "production") {
      if (
        values.JWT_SECRET === DEFAULT_DEVELOPMENT_JWT_SECRET ||
        values.JWT_SECRET.length < 32
      ) {
        context.addIssue({
          code: "custom",
          path: ["JWT_SECRET"],
          message:
            "JWT_SECRET doit contenir au moins 32 caractères aléatoires en production.",
        });
      }

      for (const [key, configuredValue] of [
        ["CLOUDINARY_CLOUD_NAME", values.CLOUDINARY_CLOUD_NAME],
        ["CLOUDINARY_API_KEY", values.CLOUDINARY_API_KEY],
        ["CLOUDINARY_API_SECRET", values.CLOUDINARY_API_SECRET],
      ]) {
        if (!configuredValue) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: `${key} est obligatoire en production.`,
          });
        }
      }

      for (const urlKey of [
        "CLIENT_URL",
        "PASSWORD_RESET_URL",
        "EMAIL_VERIFICATION_URL",
      ]) {
        const configuredUrl = values[urlKey];

        if (!configuredUrl.startsWith("https://")) {
          context.addIssue({
            code: "custom",
            path: [urlKey],
            message: `${urlKey} doit utiliser HTTPS en production.`,
          });
        }
      }
    }
  });

const parsedEnvironment =
  environmentSchema.safeParse(environmentSource);

if (!parsedEnvironment.success) {
  const issues = parsedEnvironment.error.issues
    .map(
      (issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`,
    )
    .join("\n");

  throw new Error(
    `Configuration d'environnement HealSpace invalide :\n${issues}`,
  );
}

const parsed = parsedEnvironment.data;

const allowedOrigins = (
  parsed.CORS_ALLOWED_ORIGINS || parsed.CLIENT_URL
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = Object.freeze({
  ...parsed,

  IS_PRODUCTION: parsed.NODE_ENV === "production",

  IS_DEVELOPMENT: parsed.NODE_ENV === "development",

  CORS_ALLOWED_ORIGINS: Object.freeze(allowedOrigins),
});
