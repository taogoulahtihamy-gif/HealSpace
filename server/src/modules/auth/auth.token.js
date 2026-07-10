import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

export function generateAccessToken(user, sessionId) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  );
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  if (!token || typeof token !== "string") {
    const error = new Error("Refresh token invalide.");

    error.statusCode = 401;
    throw error;
  }

  return token;
}
