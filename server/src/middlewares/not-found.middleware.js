import { AppError } from "../../core/errors/AppError.js";

export function notFoundMiddleware(req, res, next) {
  next(
    new AppError("Route introuvable.", 404, {
      method: req.method,
      path: req.originalUrl?.split("?")[0] || req.path,
    }),
  );
}
