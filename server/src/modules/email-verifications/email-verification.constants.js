export const EMAIL_VERIFICATION_MESSAGES = Object.freeze({
  REQUEST_ACCEPTED:
    "Un email de vérification a été envoyé si nécessaire.",
  VERIFY_SUCCESS: "Votre adresse email a été vérifiée avec succès.",
  INVALID_OR_EXPIRED_TOKEN:
    "Le lien de vérification est invalide ou expiré.",
  USER_NOT_FOUND: "Compte introuvable.",
  ACCOUNT_DISABLED: "Ce compte n'est pas actif.",
});

export const EMAIL_VERIFICATION_CONFIG = Object.freeze({
  HASH_ALGORITHM: "sha256",
  TOKEN_BYTES: 32,
});
