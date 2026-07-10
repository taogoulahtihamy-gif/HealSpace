import bcrypt from "bcrypt";

import { AppError } from "../../../core/errors/AppError.js";
import {
  issueSessionService,
  revokeAllSessionsService,
  revokeCurrentSessionService,
  rotateRefreshSessionService,
} from "../sessions/session.service.js";

import { AUTH_MESSAGES } from "./auth.constants.js";
import { toProfileUser, toSessionUser } from "./auth.mapper.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateLastLogin,
} from "./auth.repository.js";
import { generateAccessToken } from "./auth.token.js";

function toAuthenticationResult(user, issuedSession) {
  return {
    accessToken: generateAccessToken(user, issuedSession.session.id),
    refreshToken: issuedSession.refreshToken,
    session: issuedSession.publicSession,
    user: toSessionUser(user),
  };
}

export async function registerUser(payload, sessionContext) {
  const existingEmail = await findUserByEmail(payload.email);

  if (existingEmail) {
    throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
  }

  const existingUsername = await findUserByUsername(payload.username);

  if (existingUsername) {
    throw new AppError(AUTH_MESSAGES.USERNAME_ALREADY_EXISTS, 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const user = await createUser({
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    password: hashedPassword,
  });

  const issuedSession = await issueSessionService(user, sessionContext);

  return toAuthenticationResult(user, issuedSession);
}

export async function loginUser(payload, sessionContext) {
  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  const passwordMatches = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!passwordMatches) {
    throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(AUTH_MESSAGES.ACCOUNT_DISABLED, 403);
  }

  const issuedSession = await issueSessionService(user, sessionContext);

  await updateLastLogin(user.id);

  return toAuthenticationResult(user, issuedSession);
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(AUTH_MESSAGES.ACCOUNT_NOT_FOUND, 404);
  }

  return toProfileUser(user);
}

export async function refreshSession(refreshToken, sessionContext) {
  const rotatedSession = await rotateRefreshSessionService(
    refreshToken,
    sessionContext,
  );

  return {
    accessToken: generateAccessToken(
      rotatedSession.user,
      rotatedSession.session.id,
    ),
    refreshToken: rotatedSession.refreshToken,
    session: rotatedSession.publicSession,
    user: toSessionUser(rotatedSession.user),
  };
}

export async function logoutUser(userId, sessionId) {
  return revokeCurrentSessionService(userId, sessionId);
}

export async function logoutAllUser(userId) {
  return revokeAllSessionsService(userId);
}
