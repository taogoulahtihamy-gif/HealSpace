import crypto from "node:crypto";

import { AppError } from "../../../core/errors/AppError.js";
import { env } from "../../config/env.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../auth/auth.token.js";

import {
  SESSION_MESSAGES,
  SESSION_REVOCATION_REASONS,
} from "./session.constants.js";
import {
  toPublicIssuedSession,
  toSessionListResponse,
} from "./session.mapper.js";
import {
  createSession,
  deleteStaleSessions,
  findActiveSessionById,
  findActiveSessionsByUserId,
  findSessionByIdForUser,
  findSessionByTokenHash,
  revokeAllSessions,
  revokeOtherSessions,
  revokeSessionById,
  revokeSessionFamily,
  rotateSession,
  touchSessionActivity,
} from "./session.repository.js";

function createRefreshExpirationDate() {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS,
  );

  return expiresAt;
}

function normalizeSessionContext(context = {}, storedSession = null) {
  return {
    deviceId:
      storedSession?.deviceId ||
      context.deviceId ||
      crypto.randomUUID(),
    userAgent: context.userAgent || storedSession?.userAgent || null,
    ipAddress: context.ipAddress || storedSession?.ipAddress || null,
  };
}

async function revokeCompromisedFamily(session) {
  if (session.familyId) {
    await revokeSessionFamily({
      familyId: session.familyId,
      userId: session.userId,
      reason: SESSION_REVOCATION_REASONS.REFRESH_TOKEN_REUSE,
    });
    return;
  }

  await revokeSessionById({
    sessionId: session.id,
    userId: session.userId,
    reason: SESSION_REVOCATION_REASONS.REFRESH_TOKEN_REUSE,
  });
}

export async function cleanupStaleSessionsService() {
  const cutoff = new Date();

  cutoff.setDate(cutoff.getDate() - env.SESSION_CLEANUP_RETENTION_DAYS);

  const result = await deleteStaleSessions(cutoff);

  return {
    deletedCount: result.count,
    cutoff,
  };
}

export async function issueSessionService(user, context) {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const normalizedContext = normalizeSessionContext(context);
  const now = new Date();

  const session = await createSession({
    tokenHash,
    userId: user.id,
    familyId: crypto.randomUUID(),
    deviceId: normalizedContext.deviceId,
    userAgent: normalizedContext.userAgent,
    ipAddress: normalizedContext.ipAddress,
    expiresAt: createRefreshExpirationDate(),
    lastUsedAt: now,
  });

  await cleanupStaleSessionsService();

  return {
    refreshToken,
    session,
    publicSession: toPublicIssuedSession(session),
  };
}

export async function rotateRefreshSessionService(
  rawRefreshToken,
  context,
) {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const storedSession = await findSessionByTokenHash(tokenHash);

  if (!storedSession) {
    throw new AppError(SESSION_MESSAGES.INVALID_REFRESH_TOKEN, 401);
  }

  if (storedSession.revokedAt) {
    await revokeCompromisedFamily(storedSession);

    throw new AppError(SESSION_MESSAGES.REUSED_REFRESH_TOKEN, 401);
  }

  const now = new Date();

  if (storedSession.expiresAt <= now) {
    await revokeSessionById({
      sessionId: storedSession.id,
      userId: storedSession.userId,
      reason: SESSION_REVOCATION_REASONS.EXPIRED,
      now,
    });

    throw new AppError(SESSION_MESSAGES.EXPIRED_REFRESH_TOKEN, 401);
  }

  if (storedSession.user.status !== "ACTIVE") {
    if (storedSession.familyId) {
      await revokeSessionFamily({
        familyId: storedSession.familyId,
        userId: storedSession.userId,
        reason: SESSION_REVOCATION_REASONS.ACCOUNT_DISABLED,
        now,
      });
    }

    throw new AppError("Ce compte n'est pas actif.", 403);
  }

  const nextRefreshToken = generateRefreshToken();
  const nextTokenHash = hashRefreshToken(nextRefreshToken);
  const normalizedContext = normalizeSessionContext(
    context,
    storedSession,
  );

  const nextSession = await rotateSession({
    currentSessionId: storedSession.id,
    now,
    rotationReason: SESSION_REVOCATION_REASONS.ROTATED,
    nextSessionData: {
      tokenHash: nextTokenHash,
      userId: storedSession.userId,
      familyId: storedSession.familyId || crypto.randomUUID(),
      deviceId: normalizedContext.deviceId,
      userAgent: normalizedContext.userAgent,
      ipAddress: normalizedContext.ipAddress,
      expiresAt: createRefreshExpirationDate(),
      lastUsedAt: now,
    },
  });

  if (!nextSession) {
    await revokeCompromisedFamily(storedSession);

    throw new AppError(SESSION_MESSAGES.REUSED_REFRESH_TOKEN, 401);
  }

  await cleanupStaleSessionsService();

  return {
    refreshToken: nextRefreshToken,
    session: nextSession,
    publicSession: toPublicIssuedSession(nextSession),
    user: storedSession.user,
  };
}

export async function validateAccessSessionService(sessionId, userId) {
  if (!sessionId || !userId) {
    throw new AppError(SESSION_MESSAGES.INVALID_ACCESS_SESSION, 401);
  }

  const session = await findActiveSessionById(sessionId, userId);

  if (!session) {
    throw new AppError(SESSION_MESSAGES.INVALID_ACCESS_SESSION, 401);
  }

  if (session.user.status !== "ACTIVE") {
    throw new AppError("Ce compte n'est pas actif.", 403);
  }

  const touchThreshold = new Date(
    Date.now() - env.SESSION_ACTIVITY_TOUCH_MINUTES * 60 * 1000,
  );

  if (!session.lastUsedAt || session.lastUsedAt < touchThreshold) {
    await touchSessionActivity(session.id);
  }

  return session;
}

export async function getSessionsService(userId, currentSessionId) {
  const sessions = await findActiveSessionsByUserId(userId);

  return toSessionListResponse(sessions, currentSessionId);
}

export async function revokeSessionService(
  userId,
  sessionId,
  currentSessionId,
) {
  const session = await findSessionByIdForUser(sessionId, userId);

  if (!session) {
    throw new AppError(SESSION_MESSAGES.SESSION_NOT_FOUND, 404);
  }

  const result = await revokeSessionById({
    sessionId,
    userId,
    reason: SESSION_REVOCATION_REASONS.REVOKED_BY_USER,
  });

  return {
    sessionId,
    revoked: result.count === 1,
    revokedCurrentSession: sessionId === currentSessionId,
  };
}

export async function revokeCurrentSessionService(
  userId,
  currentSessionId,
) {
  const result = await revokeSessionById({
    sessionId: currentSessionId,
    userId,
    reason: SESSION_REVOCATION_REASONS.LOGOUT,
  });

  return {
    sessionId: currentSessionId,
    revoked: result.count === 1,
  };
}

export async function revokeOtherSessionsService(
  userId,
  currentSessionId,
) {
  const result = await revokeOtherSessions({
    userId,
    currentSessionId,
    reason: SESSION_REVOCATION_REASONS.OTHER_SESSIONS_REVOKED,
  });

  return {
    revokedCount: result.count,
    currentSessionId,
  };
}

export async function revokeAllSessionsService(userId) {
  const result = await revokeAllSessions({
    userId,
    reason: SESSION_REVOCATION_REASONS.LOGOUT_ALL,
  });

  return {
    revokedCount: result.count,
  };
}
