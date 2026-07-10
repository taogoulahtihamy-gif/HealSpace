import { prisma } from "../../config/prisma.js";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function invalidateActivePasswordResetTokens(
  userId,
  usedAt = new Date(),
) {
  return prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt,
    },
  });
}

export async function createPasswordResetToken(data) {
  return prisma.passwordResetToken.create({
    data,
  });
}

export async function findPasswordResetTokenByHash(tokenHash) {
  return prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

export async function invalidatePasswordResetToken(
  id,
  usedAt = new Date(),
) {
  return prisma.passwordResetToken.updateMany({
    where: {
      id,
      usedAt: null,
    },
    data: {
      usedAt,
    },
  });
}

export async function consumePasswordResetToken({
  tokenId,
  userId,
  passwordHash,
  now = new Date(),
}) {
  return prisma.$transaction(async (transaction) => {
    const consumed = await transaction.passwordResetToken.updateMany({
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
      return false;
    }

    await transaction.user.update({
      where: {
        id: userId,
      },
      data: {
        password: passwordHash,
      },
    });

    await transaction.passwordResetToken.updateMany({
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

    await transaction.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    return true;
  });
}
