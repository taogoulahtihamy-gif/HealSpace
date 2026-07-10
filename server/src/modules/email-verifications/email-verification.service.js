import crypto from "node:crypto";

import { AppError } from "../../../core/errors/AppError.js";
import { env } from "../../config/env.js";
import { sendEmailVerificationEmail } from "../../services/mail.service.js";

import {
  EMAIL_VERIFICATION_CONFIG,
  EMAIL_VERIFICATION_MESSAGES,
} from "./email-verification.constants.js";
import {
  toEmailVerificationEmailPayload,
  toEmailVerificationRequestResult,
  toEmailVerificationResult,
} from "./email-verification.mapper.js";
import {
  consumeEmailVerificationToken,
  createEmailVerificationToken,
  findEmailVerificationTokenByHash,
  findLatestEmailVerificationToken,
  findUserById,
  invalidateActiveEmailVerificationTokens,
  invalidateEmailVerificationToken,
} from "./email-verification.repository.js";

function createRawToken() {
  return crypto
    .randomBytes(EMAIL_VERIFICATION_CONFIG.TOKEN_BYTES)
    .toString("hex");
}

export function hashEmailVerificationToken(token) {
  return crypto
    .createHash(EMAIL_VERIFICATION_CONFIG.HASH_ALGORITHM)
    .update(token)
    .digest("hex");
}

function createExpirationDate() {
  const expiresAt = new Date();

  expiresAt.setMinutes(
    expiresAt.getMinutes() + env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES,
  );

  return expiresAt;
}

function createVerificationUrl(rawToken) {
  const url = new URL(env.EMAIL_VERIFICATION_URL);

  url.searchParams.set("token", rawToken);

  return url.toString();
}

function isInsideResendCooldown(token, now) {
  if (!token || token.usedAt || token.expiresAt <= now) {
    return false;
  }

  const cooldownMilliseconds =
    env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000;

  return (
    now.getTime() - token.createdAt.getTime() < cooldownMilliseconds
  );
}

function shouldInvalidateTokenAfterEmailFailure() {
  return env.MAIL_TRANSPORT === "smtp";
}

async function requestEmailVerificationWithSender(
  userId,
  sendVerificationEmail,
  { bypassCooldown = false } = {},
) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(EMAIL_VERIFICATION_MESSAGES.USER_NOT_FOUND, 404);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(
      EMAIL_VERIFICATION_MESSAGES.ACCOUNT_DISABLED,
      403,
    );
  }

  if (user.emailVerified) {
    return toEmailVerificationRequestResult(user);
  }

  const now = new Date();

  const latestToken = await findLatestEmailVerificationToken(user.id);

  if (!bypassCooldown && isInsideResendCooldown(latestToken, now)) {
    return toEmailVerificationRequestResult(user);
  }

  await invalidateActiveEmailVerificationTokens(user.id, now);

  const rawToken = createRawToken();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const expiresAt = createExpirationDate();

  const storedToken = await createEmailVerificationToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const verificationUrl = createVerificationUrl(rawToken);

  try {
    await sendVerificationEmail(
      toEmailVerificationEmailPayload({
        user,
        verificationUrl,
        expiresInMinutes: env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES,
      }),
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Échec d'envoi email
    |--------------------------------------------------------------------------
    | En production SMTP, un token dont l'email n'a pas pu être envoyé est
    | invalidé pour éviter un token actif impossible à utiliser par l'utilisateur.
    |
    | En développement/test avec MAIL_TRANSPORT=json, le token est conservé.
    | Cela permet aux tests automatisés de vérifier que le jeton haché est bien
    | créé en base, sans dépendre d'un vrai serveur SMTP.
    */
    if (shouldInvalidateTokenAfterEmailFailure()) {
      await invalidateEmailVerificationToken(
        storedToken.id,
        new Date(),
      );
    }

    console.error(
      "Email verification delivery failed:",
      error?.message || "Unknown mail error",
    );
  }

  return toEmailVerificationRequestResult(user);
}

export async function requestEmailVerificationService(userId) {
  return requestEmailVerificationWithSender(
    userId,
    sendEmailVerificationEmail,
  );
}

// Export réservé aux tests d'intégration.
// Le jeton brut reste absent des réponses HTTP et des logs applicatifs.
export async function requestEmailVerificationForTest(
  userId,
  sendVerificationEmail,
) {
  return requestEmailVerificationWithSender(
    userId,
    sendVerificationEmail,
    {
      bypassCooldown: true,
    },
  );
}

export async function verifyEmailService(payload) {
  const tokenHash = hashEmailVerificationToken(payload.token);

  const storedToken = await findEmailVerificationTokenByHash(tokenHash);

  const now = new Date();

  if (
    !storedToken ||
    storedToken.usedAt ||
    storedToken.expiresAt <= now
  ) {
    throw new AppError(
      EMAIL_VERIFICATION_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
      400,
    );
  }

  const verifiedUser = await consumeEmailVerificationToken({
    tokenId: storedToken.id,
    userId: storedToken.userId,
    now,
  });

  if (!verifiedUser) {
    throw new AppError(
      EMAIL_VERIFICATION_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
      400,
    );
  }

  return toEmailVerificationResult(verifiedUser);
}
