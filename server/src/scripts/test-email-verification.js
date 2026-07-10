import "dotenv/config";

import { prisma } from "../src/config/prisma.js";
import { requestEmailVerificationForTest } from "../src/modules/email-verifications/email-verification.service.js";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const seed = Date.now();
const user = {
  firstName: "Email",
  lastName: "Verification",
  username: `email_verification_${seed}`,
  email: `email_verification_${seed}@test.com`,
  password: "password123",
};

async function request(
  path,
  { token = null, method = "GET", body } = {},
) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...(body !== undefined && {
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

async function run() {
  let userId = null;
  let accessToken = null;
  let rawToken = null;

  try {
    const registration = await request("/auth/register", {
      method: "POST",
      body: user,
    });

    userId = registration.data.user.id;
    accessToken = registration.data.accessToken;

    if (!userId || !accessToken) {
      throw new Error("La création de l'utilisateur de test a échoué.");
    }

    console.log("✅ Email verification user created");

    const initialProfile = await request("/auth/me", {
      token: accessToken,
    });

    if (
      initialProfile.data?.emailVerified !== false ||
      initialProfile.data?.isVerified !== false
    ) {
      throw new Error(
        "Le nouvel utilisateur devrait être non vérifié.",
      );
    }

    await request("/auth/email-verification/send", {
      method: "POST",
      token: accessToken,
      body: {},
    });

    const firstActiveToken =
      await prisma.emailVerificationToken.findFirst({
        where: {
          userId,
          usedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!firstActiveToken || firstActiveToken.tokenHash.length !== 64) {
      throw new Error(
        "Le jeton haché de vérification n'a pas été créé.",
      );
    }

    console.log("✅ Verification email request accepted");

    let capturedVerificationUrl = null;

    await requestEmailVerificationForTest(
      userId,
      async ({ verificationUrl }) => {
        capturedVerificationUrl = verificationUrl;
      },
    );

    rawToken = new URL(capturedVerificationUrl).searchParams.get(
      "token",
    );

    if (!rawToken || rawToken.length !== 64) {
      throw new Error("Le jeton brut de vérification est invalide.");
    }

    const activeTokenCount = await prisma.emailVerificationToken.count({
      where: {
        userId,
        usedAt: null,
      },
    });

    if (activeTokenCount !== 1) {
      throw new Error("Un seul jeton de vérification doit être actif.");
    }

    console.log("✅ Verification link captured securely");

    const verification = await request(
      "/auth/email-verification/verify",
      {
        method: "POST",
        body: {
          token: rawToken,
        },
      },
    );

    if (
      verification.data?.emailVerified !== true ||
      verification.data?.isVerified !== true
    ) {
      throw new Error("La vérification de l'adresse email a échoué.");
    }

    console.log("✅ Email address verified");

    const verifiedProfile = await request("/auth/me", {
      token: accessToken,
    });

    if (
      verifiedProfile.data?.emailVerified !== true ||
      verifiedProfile.data?.isVerified !== true ||
      !verifiedProfile.data?.emailVerifiedAt
    ) {
      throw new Error(
        "Le profil ne reflète pas la vérification de l'email.",
      );
    }

    console.log("✅ Verified status returned by profile");

    try {
      await request("/auth/email-verification/verify", {
        method: "POST",
        body: {
          token: rawToken,
        },
      });
    } catch (error) {
      if (error.status === 400) {
        console.log("✅ Verification token reuse rejected");
      } else {
        throw error;
      }
    }

    const resendResult = await request(
      "/auth/email-verification/send",
      {
        method: "POST",
        token: accessToken,
        body: {},
      },
    );

    if (resendResult.data?.emailVerified !== true) {
      throw new Error(
        "Le renvoi pour un compte vérifié doit rester idempotent.",
      );
    }

    const remainingActiveTokens =
      await prisma.emailVerificationToken.count({
        where: {
          userId,
          usedAt: null,
        },
      });

    if (remainingActiveTokens !== 0) {
      throw new Error(
        "Aucun jeton actif ne doit subsister après vérification.",
      );
    }

    console.log("✅ Verified account resend is idempotent");

    console.log("✅ Email verification test passed");
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
  console.error("❌ Email verification test failed");
  console.error(error);
  process.exitCode = 1;
});
