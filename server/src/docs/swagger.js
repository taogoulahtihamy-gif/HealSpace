import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./openapi.js";

const swaggerOptions = {
  explorer: true,
  customSiteTitle: "HealSpace API Docs",
  customCss:
    ".swagger-ui .topbar { display: none } " +
    ".swagger-ui .info { margin: 32px 0 }",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
  },
};

export function setupSwagger(app) {
  app.get("/api/docs.json", (req, res) => {
    res.status(200).json(openApiDocument);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, swaggerOptions),
  );
}
