import { prisma } from "../../config/prisma.js";

const privateProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  phone: true,
  avatar: true,
  coverPhoto: true,
  bio: true,
  birthDate: true,
  gender: true,
  country: true,
  city: true,
  language: true,
  timezone: true,
  role: true,
  status: true,
  visibility: true,
  currentMood: true,
  isVerified: true,
  emailVerified: true,
  phoneVerified: true,
  isPrivate: true,
  allowAI: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

const publicProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatar: true,
  coverPhoto: true,
  bio: true,
  country: true,
  city: true,
  role: true,
  status: true,
  visibility: true,
  currentMood: true,
  isVerified: true,
  isPrivate: true,
  createdAt: true,
};

export async function findUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function findPrivateProfileById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: privateProfileSelect,
  });
}

export async function findPublicProfileById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });
}

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });
}

export async function updateUserProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: privateProfileSelect,
  });
}

export async function updateUserPrivacy(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: privateProfileSelect,
  });
}

export async function updatePasswordAndRevokeSessions(userId, password) {
  return prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: userId },
      data: { password },
    });

    await transaction.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });
}

export async function deactivateUserAndRevokeSessions(userId) {
  return prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: userId },
      data: {
        status: "INACTIVE",
      },
    });

    await transaction.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });
}

export async function areUsersFriends(
  firstUserId,
  secondUserId,
) {
  const [userOneId, userTwoId] = [
    firstUserId,
    secondUserId,
  ].sort();

  const friendship =
    await prisma.friendship.findUnique({
      where: {
        userOneId_userTwoId: {
          userOneId,
          userTwoId,
        },
      },
      select: {
        status: true,
      },
    });

  return friendship?.status === "ACCEPTED";
}

