import { env } from "./env.js";

const LOG_LEVEL_PRIORITY = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
});

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|authorization|cookie|api[-_]?key|database[-_]?url/i;

function redactSensitiveValues(value, seen = new WeakSet()) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValues(item, seen));
  }

  const sanitized = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? "[REDACTED]"
      : redactSensitiveValues(nestedValue, seen);
  }

  return sanitized;
}

function shouldWrite(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[env.LOG_LEVEL];
}

function writeLog(level, message, context = {}) {
  if (!shouldWrite(level)) {
    return;
  }

  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: "healspace-api",
    environment: env.NODE_ENV,
    message,
    ...redactSensitiveValues(context),
  };

  const serialized = JSON.stringify(record);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

export const logger = Object.freeze({
  debug(message, context) {
    writeLog("debug", message, context);
  },

  info(message, context) {
    writeLog("info", message, context);
  },

  warn(message, context) {
    writeLog("warn", message, context);
  },

  error(message, context) {
    writeLog("error", message, context);
  },
});
