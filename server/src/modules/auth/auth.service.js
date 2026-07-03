import bcrypt from "bcrypt";
import { AppError } from "../../../core/errors/AppError.js";
import { toSessionUser, toProfileUser } from "./auth.mapper.js";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from "./auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "./auth.token.js";
import { AUTH_MESSAGES } from "./auth.constants.js";

function getRefreshTokenExpirationDate() {
  const days = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || 7);
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + days);

  return expiresAt;
}

export async function registerUser(payload) {
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  await createRefreshToken({
    token: hashedRefreshToken,
    userId: user.id,
    expiresAt: getRefreshTokenExpirationDate(),
  });

  return {
    accessToken,
    refreshToken,
    user: toSessionUser(user),
  };
}

export async function loginUser(payload) {
  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  const passwordMatches = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!passwordMatches) {
    throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(AUTH_MESSAGES.ACCOUNT_DISABLED, 403);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  await createRefreshToken({
    token: hashedRefreshToken,
    userId: user.id,
    expiresAt: getRefreshTokenExpirationDate(),
  });

  return {
    accessToken,
    refreshToken,
    user: toSessionUser(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(AUTH_MESSAGES.ACCOUNT_NOT_FOUND, 404);
  }

  return toProfileUser(user);
}

export async function refreshSession(refreshToken) {
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const storedRefreshToken = await findRefreshToken(hashedRefreshToken);

  if (!storedRefreshToken) {
    throw new AppError("Refresh token invalide.", 401);
  }

  if (storedRefreshToken.revokedAt) {
    throw new AppError("Session déjà révoquée.", 401);
  }

  if (storedRefreshToken.expiresAt < new Date()) {
    throw new AppError("Session expirée.", 401);
  }

  if (storedRefreshToken.user.status !== "ACTIVE") {
    throw new AppError(AUTH_MESSAGES.ACCOUNT_DISABLED, 403);
  }

  const accessToken = generateAccessToken(storedRefreshToken.user);

  return {
    accessToken,
    user: toSessionUser(storedRefreshToken.user),
  };
}

export async function logoutUser(refreshToken) {
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const storedRefreshToken = await findRefreshToken(hashedRefreshToken);

  if (!storedRefreshToken) {
    throw new AppError("Refresh token invalide.", 401);
  }

  if (storedRefreshToken.revokedAt) {
    return;
  }

  await revokeRefreshToken(hashedRefreshToken);
}