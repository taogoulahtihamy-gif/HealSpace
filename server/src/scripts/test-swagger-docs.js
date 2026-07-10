const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:5000";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  const contentType = response.headers.get("content-type") || "";

  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw {
      status: response.status,
      body,
    };
  }

  return {
    response,
    body,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const jsonResult = await request("/api/docs.json");

  const document = jsonResult.body;

  assert(
    document.openapi === "3.0.3",
    "Le document OpenAPI doit être en version 3.0.3.",
  );

  assert(
    document.info?.title === "HealSpace API",
    "Le titre OpenAPI est invalide.",
  );

  assert(
    document.components?.securitySchemes?.bearerAuth,
    "Le schéma bearerAuth est manquant.",
  );

  const requiredPaths = [
    "/auth/register",
    "/auth/login",
    "/auth/refresh",
    "/auth/sessions",
    "/auth/forgot-password",
    "/auth/email-verification/verify",
    "/users/search",
    "/posts",
    "/posts/{postId}/comments",
    "/conversations/direct",
    "/messages/conversations/{conversationId}",
    "/media/upload",
    "/groups/{groupId}/invitations",
    "/groups/invitations/mine",
    "/journal",
    "/notifications/unread-count",
    "/supports",
    "/friendships",
    "/reports",
    "/moderation/reports",
    "/admin/statistics",
  ];

  for (const path of requiredPaths) {
    assert(document.paths?.[path], `Chemin OpenAPI manquant : ${path}`);
  }

  console.log("✅ OpenAPI JSON document valid");

  const htmlResult = await request("/api/docs");

  assert(
    String(htmlResult.body).includes("SwaggerUIBundle") ||
      String(htmlResult.body).includes("swagger-ui"),
    "La page Swagger UI ne semble pas valide.",
  );

  console.log("✅ Swagger UI served");

  console.log("✅ Swagger / OpenAPI documentation test passed");
}

run().catch((error) => {
  console.error("❌ Swagger / OpenAPI documentation test failed");

  console.error(error);

  process.exitCode = 1;
});
