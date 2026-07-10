import "dotenv/config";

import { prisma } from "../src/config/prisma.js";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const seed = Date.now();
const user = {
  firstName: "Advanced",
  lastName: "Sessions",
  username: `advanced_sessions_${seed}`,
  email: `advanced_sessions_${seed}@test.com`,
  password: "password123",
};

const DEVICE_A = "healspace-test-device-a";
const DEVICE_B = "healspace-test-device-b";
const DEVICE_C = "healspace-test-device-c";

async function request(
  path,
  { method = "GET", token = null, body, deviceId, userAgent } = {},
) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...(deviceId && {
        "X-Device-Id": deviceId,
      }),
      ...(userAgent && {
        "User-Agent": userAgent,
      }),
    },
    ...(body && {
      body: JSON.stringify(body),
    }),
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      body: payload,
    };
  }

  return payload;
}

async function expectStatus(expectedStatus, operation) {
  try {
    await operation();
  } catch (error) {
    if (error.status === expectedStatus) {
      return;
    }

    throw error;
  }

  throw new Error(`Le statut ${expectedStatus} était attendu.`);
}

async function login(deviceId, userAgent) {
  const result = await request("/auth/login", {
    method: "POST",
    body: {
      email: user.email,
      password: user.password,
    },
    deviceId,
    userAgent,
  });

  return result.data;
}

async function run() {
  let userId = null;

  try {
    const registration = await request("/auth/register", {
      method: "POST",
      body: user,
      deviceId: DEVICE_A,
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/152.0",
    });

    userId = registration.data.user.id;
    const sessionA = registration.data;

    if (
      !sessionA.accessToken ||
      !sessionA.refreshToken ||
      !sessionA.session?.id
    ) {
      throw new Error("La session A est invalide.");
    }

    console.log("✅ First device session created");

    const sessionB = await login(
      DEVICE_B,
      "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0",
    );

    console.log("✅ Second device session created");

    const sessionsResult = await request("/auth/sessions", {
      token: sessionA.accessToken,
    });

    const sessions = sessionsResult.data?.items || [];

    if (
      sessions.length !== 2 ||
      !sessions.some(
        (session) =>
          session.current === true &&
          session.id === sessionA.session.id,
      ) ||
      !sessions.some((session) => session.deviceId === DEVICE_B)
    ) {
      throw new Error("La liste des sessions est invalide.");
    }

    console.log("✅ Active sessions listed");

    const oldRefreshTokenB = sessionB.refreshToken;

    const rotationResult = await request("/auth/refresh", {
      method: "POST",
      body: {
        refreshToken: oldRefreshTokenB,
      },
      deviceId: DEVICE_B,
      userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0",
    });

    const rotatedSessionB = rotationResult.data;

    if (
      !rotatedSessionB.refreshToken ||
      rotatedSessionB.refreshToken === oldRefreshTokenB ||
      rotatedSessionB.session.id === sessionB.session.id
    ) {
      throw new Error("La rotation du refresh token a échoué.");
    }

    console.log("✅ Refresh token rotated");

    await expectStatus(401, () =>
      request("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: oldRefreshTokenB,
        },
        deviceId: DEVICE_B,
      }),
    );

    await expectStatus(401, () =>
      request("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: rotatedSessionB.refreshToken,
        },
        deviceId: DEVICE_B,
      }),
    );

    console.log("✅ Refresh token reuse detected and family revoked");

    const replacementB = await login(
      DEVICE_B,
      "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0",
    );

    const revokeResult = await request(
      `/auth/sessions/${replacementB.session.id}`,
      {
        method: "DELETE",
        token: sessionA.accessToken,
      },
    );

    if (revokeResult.data?.revoked !== true) {
      throw new Error("La révocation ciblée a échoué.");
    }

    await expectStatus(401, () =>
      request("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: replacementB.refreshToken,
        },
        deviceId: DEVICE_B,
      }),
    );

    console.log("✅ Specific session revoked");

    const sessionB2 = await login(
      DEVICE_B,
      "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0",
    );
    const sessionC = await login(
      DEVICE_C,
      "Mozilla/5.0 (Linux; Android 14) Chrome/126.0 Mobile",
    );

    const revokeOthers = await request("/auth/sessions/others", {
      method: "DELETE",
      token: sessionA.accessToken,
    });

    if (revokeOthers.data?.revokedCount < 2) {
      throw new Error("La révocation des autres sessions a échoué.");
    }

    await expectStatus(401, () =>
      request("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: sessionB2.refreshToken,
        },
      }),
    );

    await expectStatus(401, () =>
      request("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: sessionC.refreshToken,
        },
      }),
    );

    const currentSessionCheck = await request("/auth/sessions", {
      token: sessionA.accessToken,
    });

    if (currentSessionCheck.data?.total !== 1) {
      throw new Error("La session courante aurait dû rester active.");
    }

    console.log("✅ Other sessions revoked");

    await request("/auth/logout", {
      method: "POST",
      token: sessionA.accessToken,
    });

    await expectStatus(401, () =>
      request("/auth/sessions", {
        token: sessionA.accessToken,
      }),
    );

    console.log("✅ Current session logged out");

    const logoutAllA = await login(
      DEVICE_A,
      "Mozilla/5.0 (X11; Linux x86_64) Firefox/152.0",
    );
    const logoutAllB = await login(
      DEVICE_B,
      "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0",
    );

    const logoutAllResult = await request("/auth/logout-all", {
      method: "POST",
      token: logoutAllA.accessToken,
    });

    if (logoutAllResult.data?.revokedCount < 2) {
      throw new Error("La déconnexion globale a échoué.");
    }

    await expectStatus(401, () =>
      request("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: logoutAllB.refreshToken,
        },
      }),
    );

    console.log("✅ All sessions logged out");
    console.log("✅ Advanced sessions test passed");
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
  console.error("❌ Advanced sessions test failed");
  console.error(error);
  process.exitCode = 1;
});
