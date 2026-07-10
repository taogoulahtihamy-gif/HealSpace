import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./openapi.js";

function getPublicBaseUrl(req) {
  const protocol = req.protocol;
  const host = req.get("host");

  return `${protocol}://${host}`;
}

function buildOpenApiDocument(req) {
  const publicBaseUrl = getPublicBaseUrl(req);

  return {
    ...openApiDocument,
    servers: [
      {
        url: `${publicBaseUrl}/api`,
        description: "Production / environnement courant",
      },
      {
        url: "http://localhost:5000/api",
        description: "Développement local",
      },
    ],
  };
}

const swaggerOptions = {
  explorer: true,
  customSiteTitle: "HealSpace API Docs",
  customCss:
    ".swagger-ui .topbar { display: none } " +
    ".swagger-ui .info { margin: 32px 0 }",
  swaggerOptions: {
    url: "/api/docs.json",
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
    res.status(200).json(buildOpenApiDocument(req));
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(null, swaggerOptions),
  );
}