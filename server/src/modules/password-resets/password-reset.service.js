import crypto from "node:crypto";
import bcrypt from "bcrypt";

import { AppError } from "../../../core/errors/AppError.js";
import { env } from "../../config/env.js";
import { sendPasswordResetEmail } from "../../services/mail.service.js";

import {
  PASSWORD_RESET_CONFIG,
  PASSWORD_RESET_MESSAGES,
} from "./password-reset.constants.js";
import {
  toPasswordResetEmailPayload,
  toPasswordResetResult,
} from "./password-reset.mapper.js";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  findPasswordResetTokenByHash,
  findUserByEmail,
  invalidateActivePasswordResetTokens,
  invalidatePasswordResetToken,
} from "./password-reset.repository.js";

function createRawToken() {
  return crypto
    .randomBytes(PASSWORD_RESET_CONFIG.TOKEN_BYTES)
    .toString("hex");
}

export function hashPasswordResetToken(token) {
  return crypto
    .createHash(PASSWORD_RESET_CONFIG.HASH_ALGORITHM)
    .update(token)
    .digest("hex");
}

function createExpirationDate() {
  const expiresAt = new Date();

  expiresAt.setMinutes(
    expiresAt.getMinutes() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
  );

  return expiresAt;
}

function createResetUrl(rawToken) {
  const url = new URL(env.PASSWORD_RESET_URL);

  url.searchParams.set("token", rawToken);

  return url.toString();
}

async function requestPasswordResetWithSender(email, sendResetEmail) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  // La réponse publique reste volontairement identique afin de ne pas
  // révéler l'existence ou l'absence d'un compte.
  if (!user) {
    return toPasswordResetResult();
  }

  const now = new Date();

  await invalidateActivePasswordResetTokens(user.id, now);

  const rawToken = createRawToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = createExpirationDate();

  const storedToken = await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = createResetUrl(rawToken);

  try {
    await sendResetEmail(
      toPasswordResetEmailPayload({
        user,
        resetUrl,
        expiresInMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
      }),
    );
  } catch (error) {
    await invalidatePasswordResetToken(storedToken.id, new Date());

    // Aucun jeton, lien ou email n'est écrit dans les logs.
    console.error(
      "Password reset email delivery failed:",
      error?.message || "Unknown mail error",
    );
  }

  return toPasswordResetResult();
}

export async function requestPasswordResetService(email) {
  return requestPasswordResetWithSender(email, sendPasswordResetEmail);
}

// Export dédié aux tests d'intégration afin de capturer le lien sans
// exposer le jeton dans la réponse HTTP ni dans les logs.
export async function requestPasswordResetForTest(
  email,
  sendResetEmail,
) {
  return requestPasswordResetWithSender(email, sendResetEmail);
}

export async function resetPasswordService(payload) {
  const tokenHash = hashPasswordResetToken(payload.token);

  const storedToken = await findPasswordResetTokenByHash(tokenHash);

  const now = new Date();

  if (
    !storedToken ||
    storedToken.usedAt ||
    storedToken.expiresAt <= now
  ) {
    throw new AppError(
      PASSWORD_RESET_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
      400,
    );
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    PASSWORD_RESET_CONFIG.BCRYPT_ROUNDS,
  );

  const consumed = await consumePasswordResetToken({
    tokenId: storedToken.id,
    userId: storedToken.userId,
    passwordHash,
    now,
  });

  if (!consumed) {
    throw new AppError(
      PASSWORD_RESET_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
      400,
    );
  }

  return toPasswordResetResult();
}
