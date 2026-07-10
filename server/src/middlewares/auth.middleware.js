import { AppError } from "../../core/errors/AppError.js";
import { verifyAccessToken } from "../modules/auth/auth.token.js";
import { validateAccessSessionService } from "../modules/sessions/session.service.js";

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token manquant ou invalide.",
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = verifyAccessToken(token);

    const session = await validateAccessSessionService(
      decoded.sessionId,
      decoded.id,
    );

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return res.status(401).json({
      success: false,
      message: "Token expiré ou invalide.",
    });
  }
}
