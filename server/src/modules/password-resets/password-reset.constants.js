export const PASSWORD_RESET_MESSAGES = Object.freeze({
  REQUEST_ACCEPTED:
    "Si un compte correspond à cet email, un lien de réinitialisation a été envoyé.",
  RESET_SUCCESS:
    "Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.",
  INVALID_OR_EXPIRED_TOKEN:
    "Le lien de réinitialisation est invalide ou expiré.",
  EMAIL_SUBJECT: "Réinitialisation de votre mot de passe HealSpace",
});

export const PASSWORD_RESET_CONFIG = Object.freeze({
  HASH_ALGORITHM: "sha256",
  TOKEN_BYTES: 32,
  BCRYPT_ROUNDS: 12,
});
