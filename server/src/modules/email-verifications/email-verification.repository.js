import { prisma } from "../../config/prisma.js";

export async function findUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function findLatestEmailVerificationToken(userId) {
  return prisma.emailVerificationToken.findFirst({
    where: {
      userId,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function invalidateActiveEmailVerificationTokens(
  userId,
  usedAt = new Date(),
) {
  return prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt,
    },
  });
}

export async function createEmailVerificationToken(data) {
  return prisma.emailVerificationToken.create({
    data,
  });
}

export async function findEmailVerificationTokenByHash(tokenHash) {
  return prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

export async function invalidateEmailVerificationToken(
  id,
  usedAt = new Date(),
) {
  return prisma.emailVerificationToken.updateMany({
    where: {
      id,
      usedAt: null,
    },
    data: {
      usedAt,
    },
  });
}

export async function consumeEmailVerificationToken({
  tokenId,
  userId,
  now = new Date(),
}) {
  return prisma.$transaction(async (transaction) => {
    const consumed =
      await transaction.emailVerificationToken.updateMany({
        where: {
          id: tokenId,
          userId,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

    if (consumed.count !== 1) {
      return null;
    }

    const user = await transaction.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
        isVerified: true,
        emailVerifiedAt: now,
      },
    });

    await transaction.emailVerificationToken.updateMany({
      where: {
        userId,
        id: {
          not: tokenId,
        },
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    return user;
  });
}
