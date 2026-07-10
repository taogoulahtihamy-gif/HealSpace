import "dotenv/config";

import { prisma } from "../src/config/prisma.js";
import { requestPasswordResetForTest } from "../src/modules/password-resets/password-reset.service.js";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const seed = Date.now();
const user = {
  firstName: "Password",
  lastName: "Reset",
  username: `password_reset_${seed}`,
  email: `password_reset_${seed}@test.com`,
  password: "password123",
};

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      body: payload,
    };
  }

  return payload;
}

async function run() {
  let userId = null;
  let rawToken = null;

  try {
    const registration = await request("/auth/register", {
      method: "POST",
      body: user,
    });

    userId = registration.data.user.id;

    await request("/auth/forgot-password", {
      method: "POST",
      body: {
        email: user.email,
      },
    });

    console.log("✅ Password reset request accepted");

    await requestPasswordResetForTest(
      user.email,
      async ({ resetUrl }) => {
        rawToken = new URL(resetUrl).searchParams.get("token");
      },
    );

    await request("/auth/reset-password", {
      method: "POST",
      body: {
        token: rawToken,
        password: "password456",
        confirmPassword: "password456",
      },
    });

    console.log("✅ Password reset completed");

    await request("/auth/login", {
      method: "POST",
      body: {
        email: user.email,
        password: "password456",
      },
    });

    console.log("✅ Login with new password succeeded");
  } finally {
    if (userId) {
      await prisma.user.delete({
        where: {
          id: userId,
        },
      });
    }

    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error("❌ Password reset test failed");
  console.error(error);
  process.exitCode = 1;
});
