import express from "express";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import {
  corsMiddleware,
  helmetMiddleware,
} from "./config/security.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import {
  emailVerificationRateLimiter,
  globalApiRateLimiter,
  loginRateLimiter,
  mediaUploadRateLimiter,
  passwordResetRateLimiter,
  refreshRateLimiter,
  registerRateLimiter,
} from "./middlewares/rate-limit.middleware.js";
import { requestContextMiddleware } from "./middlewares/request-context.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware.js";
import apiRoutes from "./routes/index.js";
import { setupSwagger } from "./docs/swagger.js";

const app = express();

app.disable("x-powered-by");

if (env.TRUST_PROXY_HOPS > 0) {
  app.set("trust proxy", env.TRUST_PROXY_HOPS);
}

app.use(requestContextMiddleware);

app.use(requestLoggerMiddleware);

/*
|--------------------------------------------------------------------------
| Route racine publique
|--------------------------------------------------------------------------
| Évite le 404 quand Render ouvre :
| https://healspace-523w.onrender.com/
*/
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealSpace API is live",
    health: "/api/health",
    docs: "/api/docs",
  });
});

/*
|--------------------------------------------------------------------------
| Sécurité spécifique Swagger
|--------------------------------------------------------------------------
| Swagger UI utilise ses propres fichiers JS/CSS.
| En production, une Content Security Policy trop stricte peut afficher
| une page blanche. Cette règle ne s'applique qu'à /api/docs.
*/
function swaggerDocsSecurityMiddleware(req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
    ].join("; "),
  );

  res.setHeader(
    "Cross-Origin-Resource-Policy",
    "same-origin",
  );

  next();
}

app.use(
  "/api/docs",
  swaggerDocsSecurityMiddleware,
);

/*
|--------------------------------------------------------------------------
| Documentation Swagger
|--------------------------------------------------------------------------
| Swagger est monté avant Helmet pour éviter que Helmet bloque Swagger UI.
*/
setupSwagger(app);

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.use(
  express.json({
    limit: env.JSON_BODY_LIMIT,
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: env.URLENCODED_BODY_LIMIT,
    parameterLimit: 100,
  }),
);

app.use(cookieParser());

app.use("/api", globalApiRateLimiter);

app.use("/api/auth/login", loginRateLimiter);

app.use("/api/auth/register", registerRateLimiter);

app.use("/api/auth/refresh", refreshRateLimiter);

app.use(
  "/api/auth/forgot-password",
  passwordResetRateLimiter,
);

app.use(
  "/api/auth/email-verification/send",
  emailVerificationRateLimiter,
);

app.use(
  "/api/media/upload",
  mediaUploadRateLimiter,
);

if (env.SECURITY_TEST_MODE) {
  app.get("/api/__security-test/error", () => {
    throw new Error(
      "SENSITIVE_INTERNAL_SECURITY_TEST_MESSAGE",
    );
  });
}

app.use("/api", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;