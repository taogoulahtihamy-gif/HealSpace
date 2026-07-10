export const SESSION_MESSAGES = Object.freeze({
  INVALID_REFRESH_TOKEN: "Refresh token invalide.",
  EXPIRED_REFRESH_TOKEN: "La session a expiré.",
  REUSED_REFRESH_TOKEN:
    "Une réutilisation de session a été détectée. Les sessions associées ont été révoquées.",
  INVALID_ACCESS_SESSION:
    "La session associée à ce token est invalide ou révoquée.",
  SESSION_NOT_FOUND: "Session introuvable.",
  SESSIONS_RETRIEVED: "Sessions récupérées avec succès.",
  SESSION_REVOKED: "Session révoquée avec succès.",
  OTHER_SESSIONS_REVOKED: "Les autres sessions ont été révoquées.",
});

export const SESSION_REVOCATION_REASONS = Object.freeze({
  ROTATED: "ROTATED",
  LOGOUT: "LOGOUT",
  LOGOUT_ALL: "LOGOUT_ALL",
  REVOKED_BY_USER: "REVOKED_BY_USER",
  OTHER_SESSIONS_REVOKED: "OTHER_SESSIONS_REVOKED",
  REFRESH_TOKEN_REUSE: "REFRESH_TOKEN_REUSE",
  EXPIRED: "EXPIRED",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  PASSWORD_RESET: "PASSWORD_RESET",
});
