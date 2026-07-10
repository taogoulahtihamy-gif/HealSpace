import { prisma } from "../../config/prisma.js";

const sessionUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  avatar: true,
  role: true,
  status: true,
  isVerified: true,
  emailVerified: true,
  emailVerifiedAt: true,
};

export async function createSession(data) {
  return prisma.refreshToken.create({
    data,
  });
}

export async function findSessionByTokenHash(tokenHash) {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: sessionUserSelect,
      },
    },
  });
}

export async function findActiveSessionById(
  sessionId,
  userId,
  now = new Date(),
) {
  return prisma.refreshToken.findFirst({
    where: {
      id: sessionId,
      userId,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    include: {
      user: {
        select: sessionUserSelect,
      },
    },
  });
}

export async function findSessionByIdForUser(sessionId, userId) {
  return prisma.refreshToken.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });
}

export async function findActiveSessionsByUserId(
  userId,
  now = new Date(),
) {
  return prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: [
      {
        lastUsedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function rotateSession({
  currentSessionId,
  nextSessionData,
  now,
  rotationReason,
}) {
  return prisma.$transaction(async (transaction) => {
    const revoked = await transaction.refreshToken.updateMany({
      where: {
        id: currentSessionId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        revokedAt: now,
        lastUsedAt: now,
        revokedReason: rotationReason,
      },
    });

    if (revoked.count !== 1) {
      return null;
    }

    const nextSession = await transaction.refreshToken.create({
      data: nextSessionData,
    });

    await transaction.refreshToken.update({
      where: {
        id: currentSessionId,
      },
      data: {
        replacedByTokenId: nextSession.id,
      },
    });

    return nextSession;
  });
}

export async function revokeSessionById({
  sessionId,
  userId,
  reason,
  now = new Date(),
}) {
  return prisma.refreshToken.updateMany({
    where: {
      id: sessionId,
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: now,
      lastUsedAt: now,
      revokedReason: reason,
    },
  });
}

export async function revokeSessionFamily({
  familyId,
  userId,
  reason,
  now = new Date(),
}) {
  return prisma.refreshToken.updateMany({
    where: {
      familyId,
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: now,
      lastUsedAt: now,
      revokedReason: reason,
    },
  });
}

export async function revokeOtherSessions({
  userId,
  currentSessionId,
  reason,
  now = new Date(),
}) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      id: {
        not: currentSessionId,
      },
      revokedAt: null,
    },
    data: {
      revokedAt: now,
      lastUsedAt: now,
      revokedReason: reason,
    },
  });
}

export async function revokeAllSessions({
  userId,
  reason,
  now = new Date(),
}) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: now,
      lastUsedAt: now,
      revokedReason: reason,
    },
  });
}

export async function touchSessionActivity(
  sessionId,
  lastUsedAt = new Date(),
) {
  return prisma.refreshToken.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: {
      lastUsedAt,
    },
  });
}

export async function deleteStaleSessions(cutoff) {
  return prisma.refreshToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: cutoff,
          },
        },
        {
          revokedAt: {
            lt: cutoff,
          },
        },
      ],
    },
  });
}
