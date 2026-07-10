export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Access token JWT retourné par /auth/login, /auth/register ou /auth/refresh.",
  },
};
