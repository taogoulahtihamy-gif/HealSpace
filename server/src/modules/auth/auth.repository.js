import { prisma } from "../../config/prisma.js";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

export async function createRefreshToken(data) {
  return prisma.refreshToken.create({
    data,
  });
}

export async function findRefreshToken(token) {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });
}

export async function revokeRefreshToken(token) {
  return prisma.refreshToken.update({
    where: { token },
    data: {
      revokedAt: new Date(),
    },
  });
}